type SupabaseLike = {
  from: (table: string) => any
}

export type GroupClassListingInput = {
  title: string
  description: string
  flyerImageUrl?: string | null
  subject?: string | null
  startsAt: string
  durationMinutes: number
  capacity: number
  pricePerSeat: number
  currencyCode?: string
}

export async function isTutorVerified(userId: string, supabase: SupabaseLike): Promise<boolean> {
  const { data, error } = await supabase
    .from('tutor_profiles')
    .select('status, is_verified')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return false
  return data.status === 'approved' || data.is_verified === true
}

export async function createGroupClassListing(
  userId: string,
  input: GroupClassListingInput,
  supabase: SupabaseLike,
) {
  const verified = await isTutorVerified(userId, supabase)
  if (!verified) {
    throw new Error('Only verified tutors can create group classes.')
  }

  const startsAt = new Date(input.startsAt)
  if (Number.isNaN(startsAt.getTime())) {
    throw new Error('Invalid startsAt timestamp.')
  }

  const payload = {
    tutor_id: userId,
    title: input.title.trim(),
    description: input.description.trim(),
    flyer_image_url: input.flyerImageUrl ?? null,
    subject: input.subject ?? null,
    starts_at: startsAt.toISOString(),
    duration_minutes: input.durationMinutes,
    capacity: input.capacity,
    price_per_seat: input.pricePerSeat,
    currency_code: (input.currencyCode ?? 'XAF').toUpperCase(),
    status: 'draft',
  }

  const { data, error } = await supabase
    .from('group_class_listings')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message || 'Failed to create group listing.')
  }
  console.info('[group-class] listing_created', {
    listing_id: data?.id,
    tutor_id: userId,
    starts_at: payload.starts_at,
    capacity: payload.capacity,
    price_per_seat: payload.price_per_seat,
  })
  return data
}

export async function updateGroupClassListing(
  listingId: string,
  userId: string,
  patch: Partial<GroupClassListingInput>,
  supabase: SupabaseLike,
) {
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (typeof patch.title === 'string') updates.title = patch.title.trim()
  if (typeof patch.description === 'string') updates.description = patch.description.trim()
  if (patch.flyerImageUrl !== undefined) updates.flyer_image_url = patch.flyerImageUrl
  if (patch.subject !== undefined) updates.subject = patch.subject
  if (patch.startsAt !== undefined) {
    const startsAt = new Date(patch.startsAt)
    if (Number.isNaN(startsAt.getTime())) throw new Error('Invalid startsAt timestamp.')
    updates.starts_at = startsAt.toISOString()
  }
  if (patch.durationMinutes !== undefined) updates.duration_minutes = patch.durationMinutes
  if (patch.capacity !== undefined) updates.capacity = patch.capacity
  if (patch.pricePerSeat !== undefined) updates.price_per_seat = patch.pricePerSeat
  if (patch.currencyCode !== undefined) updates.currency_code = patch.currencyCode.toUpperCase()

  const { data, error } = await supabase
    .from('group_class_listings')
    .update(updates)
    .eq('id', listingId)
    .eq('tutor_id', userId)
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message || 'Failed to update group listing.')
  if (!data) throw new Error('Listing not found or not owned by tutor.')
  console.info('[group-class] listing_updated', {
    listing_id: listingId,
    tutor_id: userId,
  })
  return data
}

export async function publishGroupClassListing(
  listingId: string,
  userId: string,
  supabase: SupabaseLike,
) {
  const verified = await isTutorVerified(userId, supabase)
  if (!verified) {
    throw new Error('Only verified tutors can publish group classes.')
  }

  const { data, error } = await supabase
    .from('group_class_listings')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('tutor_id', userId)
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message || 'Failed to publish listing.')
  if (!data) throw new Error('Listing not found or not owned by tutor.')
  console.info('[group-class] listing_published', {
    listing_id: listingId,
    tutor_id: userId,
  })
  return data
}

export async function reserveGroupClassSeat(
  listingId: string,
  userId: string,
  supabase: SupabaseLike,
) {
  const { data: listing, error: listingError } = await supabase
    .from('group_class_listings')
    .select('id, tutor_id, capacity, status, starts_at')
    .eq('id', listingId)
    .maybeSingle()

  if (listingError || !listing) throw new Error('Group class listing not found.')
  if (listing.tutor_id === userId) throw new Error('Tutor cannot enroll in own listing.')
  if (!['published', 'full'].includes(listing.status)) {
    throw new Error('Listing is not open for enrollment.')
  }

  const startsAt = new Date(listing.starts_at)
  if (!Number.isNaN(startsAt.getTime()) && startsAt.getTime() <= Date.now()) {
    throw new Error('Class has already started.')
  }

  const { data: existingEnrollment, error: existingError } = await supabase
    .from('group_class_enrollments')
    .select('*')
    .eq('listing_id', listingId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message || 'Failed to check enrollment.')
  if (existingEnrollment) {
    console.info('[group-class] enrollment_idempotent', {
      listing_id: listingId,
      user_id: userId,
      enrollment_id: existingEnrollment.id,
      status: existingEnrollment.status,
    })
    return {
      enrollment: existingEnrollment,
      alreadyEnrolled: true,
      requiresPayment: existingEnrollment.status !== 'paid',
    }
  }

  const { data: occupiedRows, error: capacityError } = await supabase
    .from('group_class_enrollments')
    .select('id')
    .eq('listing_id', listingId)
    .in('status', ['reserved', 'paid'])

  if (capacityError) throw new Error(capacityError.message || 'Failed to check class capacity.')
  const occupied = occupiedRows?.length ?? 0
  if (occupied >= listing.capacity) {
    throw new Error('Class is full.')
  }

  const { data: enrollment, error: enrollError } = await supabase
    .from('group_class_enrollments')
    .insert({
      listing_id: listingId,
      user_id: userId,
      status: 'reserved',
      metadata: { source: 'api' },
    })
    .select('*')
    .single()

  if (enrollError) throw new Error(enrollError.message || 'Failed to reserve seat.')

  console.info('[group-class] enrollment_reserved', {
    listing_id: listingId,
    user_id: userId,
    enrollment_id: enrollment?.id,
    occupied_after_reserve: occupied + 1,
    capacity: listing.capacity,
  })

  return {
    enrollment,
    alreadyEnrolled: false,
    requiresPayment: true,
  }
}

export async function listPublishedGroupClasses(
  supabase: SupabaseLike,
  options?: { subject?: string; startsAfter?: string; limit?: number },
) {
  const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100)
  let query = supabase
    .from('group_class_listings')
    .select(
      'id, tutor_id, title, description, flyer_image_url, subject, starts_at, duration_minutes, capacity, price_per_seat, currency_code, status, published_at',
    )
    .eq('status', 'published')
    .order('starts_at', { ascending: true })
    .limit(limit)

  if (options?.subject) {
    query = query.eq('subject', options.subject)
  }
  if (options?.startsAfter) {
    query = query.gte('starts_at', options.startsAfter)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message || 'Failed to fetch published group classes.')
  return data ?? []
}

