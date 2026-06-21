/**
 * Builds structured parent digests from SkulMate + sessions + tutor context.
 */

import {
  buildParentProgressSummary,
  type MasteryRow,
  type SessionRow,
} from './parent-progress'
import {
  profileFromParentLearnerRow,
  type LearnerPathProfile,
} from './learner-path-context'
import {
  resolveParentMessageTone,
  type ParentFeedbackDigest,
} from './parent-feedback-sources'

export type ParentSessionHighlight = {
  sessionId: string
  tutorName: string | null
  completedAt: string
  summaryPreview: string
  subjectHint: string | null
}

export type ParentUpcomingSession = {
  sessionId: string
  tutorName: string | null
  scheduledAt: string
  mode: string | null
}

export type BuiltParentDigest = ParentFeedbackDigest & {
  parentId: string
  childId: string | null
  childName: string | null
  parentEmail: string | null
  readinessTitle: string
  readinessDisclaimer: string
  hasActivity: boolean
  sessionHighlights: ParentSessionHighlight[]
  upcomingSessions: ParentUpcomingSession[]
}

export async function buildParentDigestForChild(params: {
  admin: {
    from: (table: string) => ReturnType<
      import('@supabase/supabase-js').SupabaseClient['from']
    >
  }
  parentId: string
  childId: string | null
  childName: string | null
  learnerProfile: LearnerPathProfile | null
  parentEmail?: string | null
  locale?: 'en' | 'fr'
}): Promise<BuiltParentDigest> {
  const locale = params.locale ?? 'en'
  const { masteryRows, sessions, gameTitles } = await loadSkulMateData(
    params.admin,
    params.parentId,
    params.childId
  )

  const summary = buildParentProgressSummary({
    masteryRows,
    sessions,
    locale,
    learnerProfile: params.learnerProfile,
  })

  const tutorNames = await loadActiveTutorNames(
    params.admin,
    params.parentId,
    params.childId
  )
  const hasActiveTutor = tutorNames.length > 0

  const sessionHighlights = await loadRecentSessionSummaries(
    params.admin,
    params.parentId,
    params.childId
  )
  const upcomingSessions = await loadUpcomingSessions(
    params.admin,
    params.parentId,
    params.childId
  )

  const weakLabels = summary.weakTopics.map((t) => t.topicLabel)
  const messageTone = resolveParentMessageTone({
    hasActiveTutor,
    skulmateWeakTopics: weakLabels.length,
  })

  const hasActivity =
    summary.totalSessions > 0 ||
    weakLabels.length > 0 ||
    sessionHighlights.length > 0 ||
    upcomingSessions.length > 0

  return {
    generatedAt: new Date().toISOString(),
    parentId: params.parentId,
    childId: params.childId,
    childName: params.childName,
    parentEmail: params.parentEmail ?? null,
    learnerContextLine: summary.learnerContextLine,
    isExamTrack: summary.readinessTitle.toLowerCase().includes('exam'),
    hasActiveTutor,
    activeTutorNames: tutorNames,
    sourcesIncluded: [
      'skulmate_games',
      ...(sessionHighlights.length > 0 ? (['live_online_session'] as const) : []),
      ...(hasActiveTutor ? (['tutor_session_report'] as const) : []),
    ],
    skulmate: {
      streakDays: summary.streakDays,
      revisionMinutesLast7Days: summary.revisionMinutesLast7Days,
      accuracyLast7Days: summary.accuracyLast7Days,
      readinessScore: summary.examReadiness,
      readinessLabel: summary.readinessLabel,
      weakTopicLabels: weakLabels,
    },
    sessions: {
      upcomingCount: upcomingSessions.length,
      recentCompletedCount: sessionHighlights.length,
    },
    messageTone,
    readinessTitle: summary.readinessTitle,
    readinessDisclaimer: summary.readinessDisclaimer,
    sessionHighlights,
    upcomingSessions,
    hasActivity,
  }
}

async function loadSkulMateData(
  admin: Parameters<typeof buildParentDigestForChild>[0]['admin'],
  userId: string,
  childId: string | null
) {
  let masteryQuery = admin
    .from('skulmate_concept_mastery')
    .select(
      'topic_id, framework_id, mastery_score, weak_streak, attempts, last_seen_at, last_game_id'
    )
    .eq('user_id', userId)

  if (childId) {
    masteryQuery = masteryQuery.eq('child_id', childId)
  } else {
    masteryQuery = masteryQuery.is('child_id', null)
  }

  const { data: masteryData } = await masteryQuery
    .order('mastery_score', { ascending: true })
    .limit(50)

  const masteryRows: MasteryRow[] = (masteryData || []).map((row) => ({
    topicId: row.topic_id as string,
    frameworkId: row.framework_id as string | null,
    masteryScore: Number(row.mastery_score ?? 0),
    weakStreak: Number(row.weak_streak ?? 0),
    attempts: Number(row.attempts ?? 0),
    lastSeenAt: row.last_seen_at as string | null,
    lastGameId: row.last_game_id as string | null,
  }))

  let gamesQuery = admin
    .from('skulmate_games')
    .select('id, title')
    .eq('user_id', userId)

  if (childId) {
    gamesQuery = gamesQuery.eq('child_id', childId)
  } else {
    gamesQuery = gamesQuery.is('child_id', null)
  }

  const { data: games } = await gamesQuery.limit(200)
  const gameIds = (games || []).map((g) => g.id as string)
  const gameTitles = new Map(
    (games || []).map((g) => [g.id as string, g.title as string])
  )

  let sessions: SessionRow[] = []
  if (gameIds.length > 0) {
    const { data: sessionData } = await admin
      .from('skulmate_game_sessions')
      .select(
        'game_id, correct_answers, total_questions, time_taken_seconds, completed_at'
      )
      .eq('user_id', userId)
      .in('game_id', gameIds)
      .order('completed_at', { ascending: false })
      .limit(120)

    sessions = (sessionData || []).map((s) => ({
      gameId: s.game_id as string,
      correctAnswers: Number(s.correct_answers ?? 0),
      totalQuestions: Number(s.total_questions ?? 0),
      timeTakenSeconds: s.time_taken_seconds as number | null,
      completedAt: s.completed_at as string,
    }))
  }

  return { masteryRows, sessions, gameTitles }
}

async function loadActiveTutorNames(
  admin: Parameters<typeof buildParentDigestForChild>[0]['admin'],
  parentId: string,
  _childId: string | null
): Promise<string[]> {
  const names = new Set<string>()

  const { data: bookings } = await admin
    .from('booking_requests')
    .select('tutor_name, status')
    .eq('student_id', parentId)
    .in('status', ['pending', 'approved'])
    .limit(10)

  for (const row of bookings || []) {
    const name = row.tutor_name as string | null
    if (name) names.add(name)
  }

  const { data: recurring } = await admin
    .from('recurring_sessions')
    .select('tutor_name, status')
    .eq('learner_id', parentId)
    .eq('status', 'active')
    .limit(10)

  for (const row of recurring || []) {
    const name = row.tutor_name as string | null
    if (name) names.add(name)
  }

  return [...names]
}

async function loadRecentSessionSummaries(
  admin: Parameters<typeof buildParentDigestForChild>[0]['admin'],
  parentId: string,
  _childId: string | null
): Promise<ParentSessionHighlight[]> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)

  let query = admin
    .from('individual_sessions')
    .select(
      'id, session_summary, completed_at, scheduled_date, tutor_name, subject, parent_id, learner_id'
    )
    .not('session_summary', 'is', null)
    .gte('completed_at', cutoff.toISOString())
    .or(`parent_id.eq.${parentId},learner_id.eq.${parentId}`)
    .order('completed_at', { ascending: false })
    .limit(5)

  const { data } = await query

  return (data || [])
    .filter((row) => {
      const summary = (row.session_summary as string | null) ?? ''
      return summary.trim().length > 20
    })
    .map((row) => {
      const raw = (row.session_summary as string).trim()
      const preview =
        raw.length > 180 ? `${raw.slice(0, 177).trim()}…` : raw
      return {
        sessionId: row.id as string,
        tutorName: (row.tutor_name as string | null) ?? null,
        completedAt:
          (row.completed_at as string | null) ??
          (row.scheduled_date as string),
        summaryPreview: preview,
        subjectHint: (row.subject as string | null) ?? null,
      }
    })
}

async function loadUpcomingSessions(
  admin: Parameters<typeof buildParentDigestForChild>[0]['admin'],
  parentId: string,
  _childId: string | null
): Promise<ParentUpcomingSession[]> {
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await admin
    .from('individual_sessions')
    .select('id, scheduled_date, scheduled_time, tutor_name, session_mode, status')
    .or(`parent_id.eq.${parentId},learner_id.eq.${parentId}`)
    .gte('scheduled_date', today)
    .in('status', ['scheduled', 'approved', 'pending'])
    .order('scheduled_date', { ascending: true })
    .limit(5)

  return (data || []).map((row) => ({
    sessionId: row.id as string,
    tutorName: (row.tutor_name as string | null) ?? null,
    scheduledAt: `${row.scheduled_date as string} ${(row.scheduled_time as string | null) ?? ''}`.trim(),
    mode: (row.session_mode as string | null) ?? null,
  }))
}

export function profileFromLearnerRow(
  row?: Record<string, unknown> | null
): LearnerPathProfile | null {
  return profileFromParentLearnerRow(row)
}
