/**
 * Weekly due-review push — SkulMate spaced repetition (Phase C2b).
 * GET with Authorization: Bearer CRON_SECRET (e.g. Tuesday 6pm local / daily is fine).
 *
 * Rules:
 * - Only users with due skulmate_review_items (next_review_at <= now)
 * - Max 1 push per user per 7 days (notification_campaign_log)
 * - Respects engagement_push_enabled preference
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth'
import { sendPushNotification } from '@/lib/services/firebase-admin'

export const runtime = 'nodejs'

const JOB_NAME = 'skulmate-due-review-push'
const CAMPAIGN_ID = 'skulmate_due_review'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

type DueUserRow = { user_id: string; due_count: number }

export async function GET(request: NextRequest) {
  const authError = verifyExternalCron(request)
  if (authError) return authError

  const supabase = getSupabaseAdmin()
  let sent = 0
  let skipped = 0
  let failed = 0
  const errors: string[] = []

  try {
    const now = new Date().toISOString()
    const weekAgo = new Date(Date.now() - WEEK_MS).toISOString()

    const { data: dueRows, error: dueError } = await supabase
      .from('skulmate_review_items')
      .select('user_id')
      .lte('next_review_at', now)
      .limit(2000)

    if (dueError) {
      throw new Error(dueError.message)
    }

    const counts = new Map<string, number>()
    for (const row of dueRows || []) {
      const uid = row.user_id as string
      counts.set(uid, (counts.get(uid) || 0) + 1)
    }

    const dueUsers: DueUserRow[] = [...counts.entries()]
      .map(([user_id, due_count]) => ({ user_id, due_count }))
      .slice(0, 150)

    for (const { user_id: userId, due_count: dueCount } of dueUsers) {
      if (dueCount < 1) {
        skipped += 1
        continue
      }

      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('engagement_push_enabled')
        .eq('user_id', userId)
        .maybeSingle()

      if (prefs?.engagement_push_enabled === false) {
        skipped += 1
        continue
      }

      const { data: recent } = await supabase
        .from('notification_campaign_log')
        .select('id')
        .eq('user_id', userId)
        .eq('campaign_id', CAMPAIGN_ID)
        .gte('sent_at', weekAgo)
        .limit(1)

      if (recent && recent.length > 0) {
        skipped += 1
        continue
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', userId)
        .maybeSingle()

      const fr =
        String(profile?.preferred_language || '')
          .toLowerCase()
          .startsWith('fr')

      const title = fr ? 'Révisions à faire' : 'Reviews due'
      const body = fr
        ? `Tu as ${dueCount} carte${dueCount > 1 ? 's' : ''} à réviser. Ouvre SkulMate pour continuer.`
        : `You have ${dueCount} card${dueCount === 1 ? '' : 's'} to review. Open SkulMate to continue.`

      try {
        const result = await sendPushNotification({
          userId,
          title,
          body,
          data: {
            type: 'skulmate_due_review',
            actionUrl: '/skulmate',
            due_count: String(dueCount),
          },
          priority: 'normal',
        })

        if (result.sent > 0) {
          await supabase.from('notification_campaign_log').insert({
            user_id: userId,
            campaign_id: CAMPAIGN_ID,
            notification_type: 'skulmate_due_review',
            channel: 'push',
            metadata: { due_count: dueCount },
          })
          sent += 1
        } else {
          skipped += 1
        }
      } catch (pushErr) {
        failed += 1
        errors.push(
          `push ${userId}: ${pushErr instanceof Error ? pushErr.message : 'failed'}`
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
      candidates: dueUsers.length,
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
