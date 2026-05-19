import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSupabaseForApi } from '@/lib/services/group-classes/api-auth'
import { publishGroupClassListing } from '@/lib/services/group-classes/group-class-service'
import { jsonWithCors, buildCorsHeaders } from '@/lib/services/group-classes/cors'

function groupClassesEnabled(): boolean {
  const v = (process.env.GROUP_CLASSES_ENABLED || 'true').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!groupClassesEnabled()) {
      return jsonWithCors(request, { error: 'Group classes are disabled.' }, { status: 503 })
    }
    const { id } = await params
    const { supabase, user } = await getAuthenticatedSupabaseForApi(request)
    if (!supabase || !user) {
      return jsonWithCors(request, { error: 'Unauthorized' }, { status: 401 })
    }

    const listing = await publishGroupClassListing(id, user.id, supabase)
    console.info('[group-class-api] listing_publish', {
      tutor_id: user.id,
      listing_id: id,
    })
    return jsonWithCors(request, { listing }, { status: 200 })
  } catch (error: any) {
    const message = error?.message || 'Failed to publish listing.'
    const lower = message.toLowerCase()
    const status = lower.includes('verified tutors')
      ? 403
      : lower.includes('not found') || lower.includes('not owned')
        ? 404
        : 500
    return jsonWithCors(request, { error: message }, { status })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 200, headers: buildCorsHeaders(request) })
}

