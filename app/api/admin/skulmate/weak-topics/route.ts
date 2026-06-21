import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/require-admin'
import { getServiceSupabaseAdmin } from '@/lib/supabase-service'
import {
  formatMatchedTopicsForOps,
  getFrameworkLabel,
  getTopicTitle,
  type CurriculumLocale,
} from '@/lib/skulmate/curriculum-labels'
import { isRerouteEligible } from '@/lib/skulmate/mastery'

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const admin = getServiceSupabaseAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server missing Supabase service role configuration' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(200, Math.max(10, Number(searchParams.get('limit') || 50)))
  const locale = (searchParams.get('locale') === 'fr' ? 'fr' : 'en') as CurriculumLocale

  const { data, error } = await admin
    .from('skulmate_concept_mastery')
    .select(
      'user_id, child_id, topic_id, framework_id, mastery_score, weak_streak, attempts, last_seen_at'
    )
    .or('weak_streak.gte.2,mastery_score.lt.0.55')
    .order('weak_streak', { ascending: false })
    .order('mastery_score', { ascending: true })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data || []).map((row) => {
    const lastSeen = row.last_seen_at
      ? (Date.now() - new Date(row.last_seen_at as string).getTime()) /
        (1000 * 60 * 60)
      : undefined
    const rerouteEligible = isRerouteEligible({
      topicId: row.topic_id as string,
      attempts: Number(row.attempts ?? 0),
      weakStreak: Number(row.weak_streak ?? 0),
      masteryScore: Number(row.mastery_score ?? 1),
      hoursSinceLastSeen: lastSeen,
    })
    return {
      userId: row.user_id,
      childId: row.child_id,
      topicId: row.topic_id,
      topicLabel: getTopicTitle(row.topic_id, locale) ?? row.topic_id,
      frameworkId: row.framework_id,
      frameworkLabel: row.framework_id
        ? getFrameworkLabel(row.framework_id, locale)
        : null,
      masteryScore: row.mastery_score,
      weakStreak: row.weak_streak,
      attempts: row.attempts,
      lastSeenAt: row.last_seen_at,
      rerouteEligible,
      matchedTopicsDisplay: formatMatchedTopicsForOps([row.topic_id], locale),
    }
  })

  return NextResponse.json({
    rows,
    totals: { weakTopics: rows.length },
    locale,
  })
}
