import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSupabaseForApi } from '@/lib/services/group-classes/api-auth'
import { updateGroupClassListing } from '@/lib/services/group-classes/group-class-service'

function groupClassesEnabled(): boolean {
  const v = (process.env.GROUP_CLASSES_ENABLED || 'true').toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!groupClassesEnabled()) {
      return NextResponse.json({ error: 'Group classes are disabled.' }, { status: 503 })
    }
    const { id } = await params
    const { supabase, user } = await getAuthenticatedSupabaseForApi(request)
    if (!supabase || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const listing = await updateGroupClassListing(
      id,
      user.id,
      {
        title: body?.title,
        description: body?.description,
        flyerImageUrl: body?.flyerImageUrl,
        subject: body?.subject,
        startsAt: body?.startsAt,
        durationMinutes:
          body?.durationMinutes == null ? undefined : Number(body.durationMinutes),
        capacity: body?.capacity == null ? undefined : Number(body.capacity),
        pricePerSeat:
          body?.pricePerSeat == null ? undefined : Number(body.pricePerSeat),
        currencyCode: body?.currencyCode,
      },
      supabase,
    )

    return NextResponse.json({ listing }, { status: 200 })
  } catch (error: any) {
    const message = error?.message || 'Failed to update listing.'
    const status =
      message.toLowerCase().includes('not found') ||
      message.toLowerCase().includes('not owned')
        ? 404
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}

