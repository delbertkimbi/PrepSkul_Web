import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSupabaseForApi } from '@/lib/services/group-classes/api-auth'
import { jsonWithCors, buildCorsHeaders } from '@/lib/services/group-classes/cors'

function groupClassesEnabled(): boolean {
  const v = (process.env.GROUP_CLASSES_ENABLED || 'true').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    if (!groupClassesEnabled()) {
      return jsonWithCors(request, { error: 'Group classes are disabled.' }, { status: 503 })
    }
    const { token } = await params
    const { supabase, user } = await getAuthenticatedSupabaseForApi(request)
    if (!supabase || !user) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 })
    }

    const { data: listing, error: listingError } = await supabase
      .from('group_class_listings')
      .select('id, tutor_id, individual_session_id, status, title, starts_at')
      .eq('share_token', token)
      .maybeSingle()

    if (listingError || !listing) {
      return jsonWithCors(request, { error: 'Invalid or expired class link.' }, { status: 404 })
    }

    if (listing.tutor_id === user.id) {
      return jsonWithCors(request, {
        allowed: true,
        role: 'tutor',
        listingId: listing.id,
        sessionId: listing.individual_session_id,
        title: listing.title,
      })
    }

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('group_class_enrollments')
      .select('id, status')
      .eq('listing_id', listing.id)
      .eq('user_id', user.id)
      .eq('status', 'paid')
      .maybeSingle()

    if (enrollmentError || !enrollment) {
      return jsonWithCors(
        request,
        {
          allowed: false,
          listingId: listing.id,
          title: listing.title,
          reason: 'not_enrolled_or_unpaid',
        },
        { status: 403 },
      )
    }

    return jsonWithCors(request, {
      allowed: true,
      role: 'learner',
      listingId: listing.id,
      sessionId: listing.individual_session_id,
      title: listing.title,
    })
  } catch (error: any) {
    return jsonWithCors(
      request,
      { error: error?.message || 'Failed to validate class link.' },
      { status: 500 },
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: buildCorsHeaders(request) })
}

