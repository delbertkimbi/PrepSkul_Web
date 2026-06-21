/**
 * Weekly parent digest cron — SkulMate + sessions + tutor-aware copy.
 * GET with Authorization: Bearer CRON_SECRET (e.g. weekly Monday 7am).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth'
import {
  buildParentDigestForChild,
  profileFromLearnerRow,
} from '@/lib/skulmate/parent-digest-builder'
import { sendParentDigestEmail } from '@/lib/skulmate/parent-digest-email'

export const runtime = 'nodejs'

const JOB_NAME = 'parent-weekly-digest'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  const authError = verifyExternalCron(request)
  if (authError) return authError

  const supabase = getSupabaseAdmin()
  let sent = 0
  let skipped = 0
  let failed = 0
  const errors: string[] = []

  try {
    const weekAgo = new Date(Date.now() - WEEK_MS).toISOString()

    const { data: learners, error } = await supabase
      .from('parent_learners')
      .select(
        'id, parent_id, name, class_level, education_level, exam_type, specific_exam, learning_path'
      )
      .order('updated_at', { ascending: false })
      .limit(200)

    if (error) {
      throw new Error(error.message)
    }

    const parentCache = new Map<
      string,
      { email: string | null; name: string | null }
    >()

    for (const learner of learners || []) {
      const parentId = learner.parent_id as string
      const childId = learner.id as string

      if (!parentCache.has(parentId)) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, preferred_language')
          .eq('id', parentId)
          .maybeSingle()
        parentCache.set(parentId, {
          email: (profile?.email as string) ?? null,
          name: (profile?.full_name as string) ?? null,
        })
      }

      const parent = parentCache.get(parentId)!
      if (!parent.email) {
        skipped += 1
        continue
      }

      const { data: recentDigest } = await supabase
        .from('parent_skulmate_digests')
        .select('id')
        .eq('parent_id', parentId)
        .eq('child_id', childId)
        .eq('digest_type', 'weekly')
        .gte('created_at', weekAgo)
        .limit(1)

      if (recentDigest && recentDigest.length > 0) {
        skipped += 1
        continue
      }

      const digest = await buildParentDigestForChild({
        admin: supabase,
        parentId,
        childId,
        childName: learner.name as string,
        learnerProfile: profileFromLearnerRow(
          learner as Record<string, unknown>
        ),
        parentEmail: parent.email,
        locale: 'en',
      })

      if (!digest.hasActivity) {
        skipped += 1
        continue
      }

      const emailResult = await sendParentDigestEmail({
        to: parent.email,
        digest,
        locale: 'en',
      })

      const { error: insertError } = await supabase
        .from('parent_skulmate_digests')
        .insert({
          parent_id: parentId,
          child_id: childId,
          digest_type: 'weekly',
          digest_json: digest,
          sent_email_at: emailResult.ok ? new Date().toISOString() : null,
        })

      if (insertError) {
        errors.push(`insert ${childId}: ${insertError.message}`)
      }

      if (emailResult.ok) {
        sent += 1
      } else {
        failed += 1
        errors.push(
          `email ${parent.email}: ${emailResult.error ?? 'send failed'}`
        )
      }
    }

    await persistCronHeartbeat(supabase, {
      jobName: JOB_NAME,
      status: 'success',
      processedCount: sent,
      failedCount: failed,
      metadata: { skipped, errors: errors.slice(0, 10) },
    })

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      failed,
      errors: errors.slice(0, 10),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    await persistCronHeartbeat(supabase, {
      jobName: JOB_NAME,
      status: 'failed',
      error: message,
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
