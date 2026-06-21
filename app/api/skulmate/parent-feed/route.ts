/**
 * Parent in-app feed — recent digests + live session summaries.
 * GET /api/skulmate/parent-feed?childId=
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getServiceSupabaseAdmin } from '@/lib/supabase-service'
import {
  buildParentDigestForChild,
  profileFromLearnerRow,
} from '@/lib/skulmate/parent-digest-builder'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')

    const admin = getServiceSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers }
      )
    }

    let childName: string | null = null
    let learnerProfile = null

    if (childId) {
      const { data: learner } = await admin
        .from('parent_learners')
        .select(
          'id, name, class_level, education_level, exam_type, specific_exam, learning_path'
        )
        .eq('id', childId)
        .eq('parent_id', user.id)
        .maybeSingle()

      if (!learner) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404, headers })
      }
      childName = learner.name as string
      learnerProfile = profileFromLearnerRow(learner as Record<string, unknown>)
    }

    const live = await buildParentDigestForChild({
      admin,
      parentId: user.id,
      childId,
      childName,
      learnerProfile,
      locale: 'en',
    })

    let stored: unknown[] = []
    try {
      let digestQuery = admin
        .from('parent_skulmate_digests')
        .select('id, digest_type, digest_json, sent_email_at, created_at')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8)

      if (childId) {
        digestQuery = digestQuery.eq('child_id', childId)
      }

      const { data } = await digestQuery
      stored = data ?? []
    } catch {
      // Table may not exist until migration 102
    }

    return NextResponse.json(
      {
        live,
        storedDigests: stored,
      },
      { headers }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}
