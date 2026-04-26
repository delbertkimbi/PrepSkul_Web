import {
  createGroupClassListing,
  isTutorVerified,
  reserveGroupClassSeat,
} from '@/lib/services/group-classes/group-class-service'

type Row = Record<string, any>

function createMockClient(data: {
  tutorProfile?: Row | null
  listing?: Row | null
  existingEnrollment?: Row | null
  occupiedRows?: Row[]
  insertedEnrollment?: Row
  insertedListing?: Row
}) {
  return {
    from(table: string) {
      const state: { table: string; eqs: Record<string, any> } = {
        table,
        eqs: {},
      }

      const builder = {
        select: () => builder,
        eq: (field: string, value: any) => {
          state.eqs[field] = value
          return builder
        },
        in: () => builder,
        order: () => builder,
        limit: () => builder,
        gte: () => builder,
        insert: (_payload: any) => ({
          select: () => ({
            single: async () => {
              if (state.table === 'group_class_listings') {
                return {
                  data: data.insertedListing ?? { id: 'l1', title: 'Math class' },
                  error: null,
                }
              }
              return {
                data: data.insertedEnrollment ?? { id: 'e1', status: 'reserved' },
                error: null,
              }
            },
          }),
        }),
        maybeSingle: async () => {
          if (state.table === 'tutor_profiles') {
            return { data: data.tutorProfile ?? null, error: null }
          }
          if (state.table === 'group_class_listings') {
            return { data: data.listing ?? null, error: null }
          }
          if (state.table === 'group_class_enrollments') {
            return { data: data.existingEnrollment ?? null, error: null }
          }
          return { data: null, error: null }
        },
        then: async (resolve: any) => {
          if (state.table === 'group_class_enrollments') {
            resolve({ data: data.occupiedRows ?? [], error: null })
            return
          }
          resolve({ data: [], error: null })
        },
      }
      return builder
    },
  }
}

describe('Group class service', () => {
  it('allows verified tutor to create listing', async () => {
    const client = createMockClient({
      tutorProfile: { status: 'approved', is_verified: true },
      insertedListing: { id: 'l123', title: 'Physics 101' },
    }) as any

    const listing = await createGroupClassListing(
      'u1',
      {
        title: 'Physics 101',
        description: 'Intro class',
        startsAt: new Date(Date.now() + 3600_000).toISOString(),
        durationMinutes: 60,
        capacity: 10,
        pricePerSeat: 2500,
      },
      client,
    )
    expect(listing.id).toBe('l123')
  })

  it('rejects unverified tutor listing create', async () => {
    const client = createMockClient({
      tutorProfile: { status: 'pending', is_verified: false },
    }) as any

    await expect(
      createGroupClassListing(
        'u2',
        {
          title: 'Chemistry',
          description: 'Basics',
          startsAt: new Date(Date.now() + 3600_000).toISOString(),
          durationMinutes: 60,
          capacity: 10,
          pricePerSeat: 3000,
        },
        client,
      ),
    ).rejects.toThrow('Only verified tutors')
  })

  it('returns idempotent enroll when user already enrolled', async () => {
    const client = createMockClient({
      listing: {
        id: 'l1',
        tutor_id: 't1',
        capacity: 5,
        status: 'published',
        starts_at: new Date(Date.now() + 3600_000).toISOString(),
      },
      existingEnrollment: { id: 'e-existing', status: 'reserved' },
    }) as any

    const result = await reserveGroupClassSeat('l1', 'u3', client)
    expect(result.alreadyEnrolled).toBe(true)
    expect(result.enrollment.id).toBe('e-existing')
  })

  it('rejects enroll when class is full', async () => {
    const client = createMockClient({
      listing: {
        id: 'l1',
        tutor_id: 't1',
        capacity: 2,
        status: 'published',
        starts_at: new Date(Date.now() + 3600_000).toISOString(),
      },
      occupiedRows: [{ id: 'e1' }, { id: 'e2' }],
    }) as any

    await expect(reserveGroupClassSeat('l1', 'u9', client)).rejects.toThrow('Class is full.')
  })

  it('isTutorVerified returns true for approved profile', async () => {
    const client = createMockClient({
      tutorProfile: { status: 'approved', is_verified: false },
    }) as any
    const ok = await isTutorVerified('u1', client)
    expect(ok).toBe(true)
  })
})

