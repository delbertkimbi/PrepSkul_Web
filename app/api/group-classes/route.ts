import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSupabaseForApi } from '@/lib/services/group-classes/api-auth'
import { createGroupClassListing, listPublishedGroupClasses } from '@/lib/services/group-classes/group-class-service'
import { jsonWithCors, buildCorsHeaders } from '@/lib/services/group-classes/cors'

function groupClassesEnabled(): boolean {
  const v = (process.env.GROUP_CLASSES_ENABLED || 'true').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export async function GET(request: NextRequest) {
  try {
    if (!groupClassesEnabled()) {
      return jsonWithCors(request, { error: 'Group classes are disabled.' }, { status: 503 })
    }
    const { searchParams } = new URL(request.url)
    const mine = searchParams.get('mine') == 'true'
    const subject = searchParams.get('subject') || undefined
    const classType = searchParams.get('class_type') || undefined
    const startsAfter = searchParams.get('starts_after') || new Date().toISOString()
    const limitParam = Number(searchParams.get('limit') || '20')

    const { supabase, user } = await getAuthenticatedSupabaseForApi(request)
    if (!supabase) {
      return jsonWithCors(request, { error: 'Unable to initialize Supabase client.' }, { status: 500 })
    }

    if (mine) {
      if (!user) {
        return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 })
      }
      const { data, error } = await supabase
        .from('group_class_listings')
        .select('*')
        .eq('tutor_id', user.id)
        .order('starts_at', { ascending: true })
        .limit(Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20)
      if (error) {
        return jsonWithCors(request, { error: error.message || 'Failed to fetch tutor group classes.' }, { status: 500 })
      }
      return jsonWithCors(request, { listings: data ?? [] }, { status: 200 })
    }

    const listings = await listPublishedGroupClasses(supabase, {
      subject,
      classType: classType as any,
      startsAfter,
      limit: Number.isFinite(limitParam) ? limitParam : 20,
    })
    console.info('[group-class-api] listings_read', {
      mine: false,
      subject: subject ?? null,
      class_type: classType ?? null,
      count: listings.length,
    })

    return jsonWithCors(request, { listings }, { status: 200 })
  } catch (error: any) {
    return jsonWithCors(request, { error: error?.message || 'Failed to fetch group classes.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!groupClassesEnabled()) {
      return jsonWithCors(request, { error: 'Group classes are disabled.' }, { status: 503 })
    }
    const { supabase, user } = await getAuthenticatedSupabaseForApi(request)
    if (!supabase || !user) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      flyerImageUrl,
      subject,
      classType,
      learningFocus,
      startsAt,
      durationMinutes,
      capacity,
      pricePerSeat,
      currencyCode,
    } = body ?? {}

    if (!title || !description || !startsAt || !durationMinutes || !capacity || pricePerSeat == null) {
      return jsonWithCors(
        request,
        { error: 'Missing required fields: title, description, startsAt, durationMinutes, capacity, pricePerSeat' },
        { status: 400 },
      )
    }

    const listing = await createGroupClassListing(
      user.id,
      {
        title,
        description,
        flyerImageUrl,
        subject,
        classType,
        learningFocus,
        startsAt,
        durationMinutes: Number(durationMinutes),
        capacity: Number(capacity),
        pricePerSeat: Number(pricePerSeat),
        currencyCode,
      },
      supabase,
    )
    console.info('[group-class-api] listing_create', {
      tutor_id: user.id,
      listing_id: listing.id,
    })

    return jsonWithCors(request, { listing }, { status: 201 })
  } catch (error: any) {
    const message = error?.message || 'Failed to create group class listing.'
    const status = message.toLowerCase().includes('verified tutors') ? 403 : 500
    return jsonWithCors(request, { error: message }, { status })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: buildCorsHeaders(request) })
}

