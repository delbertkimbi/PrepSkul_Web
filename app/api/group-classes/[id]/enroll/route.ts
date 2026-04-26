import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedSupabaseForApi } from '@/lib/services/group-classes/api-auth'
import { reserveGroupClassSeat } from '@/lib/services/group-classes/group-class-service'

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
      return NextResponse.json({ error: 'Group classes are disabled.' }, { status: 503 })
    }
    const { id } = await params
    const { supabase, user } = await getAuthenticatedSupabaseForApi(request)
    if (!supabase || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await reserveGroupClassSeat(id, user.id, supabase)
    console.info('[group-class-api] seat_enroll', {
      listing_id: id,
      user_id: user.id,
      already_enrolled: result.alreadyEnrolled === true,
      requires_payment: result.requiresPayment === true,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    const message = error?.message || 'Failed to enroll in class.'
    const lower = message.toLowerCase()
    const status = lower.includes('full') || lower.includes('already started')
      ? 409
      : lower.includes('not found')
        ? 404
        : lower.includes('listing is not open') || lower.includes('cannot enroll')
          ? 400
          : 500
    return NextResponse.json({ error: message }, { status })
  }
}

