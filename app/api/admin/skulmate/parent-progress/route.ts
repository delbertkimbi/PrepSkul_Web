import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/require-admin'
import { getServiceSupabaseAdmin } from '@/lib/supabase-service'
import {
  buildParentProgressSummary,
  type MasteryRow,
  type SessionRow,
} from '@/lib/skulmate/parent-progress'
import {
  profileFromParentLearnerRow,
  type LearnerPathProfile,
} from '@/lib/skulmate/learner-path-context'
import type { CurriculumLocale } from '@/lib/skulmate/curriculum-labels'

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
  const userId = searchParams.get('userId')
  const childId = searchParams.get('childId')
  const locale = (searchParams.get('locale') === 'fr' ? 'fr' : 'en') as CurriculumLocale

  if (!userId) {
    const { data: learners, error } = await admin
      .from('parent_learners')
      .select('id, parent_id, name, class_level, exam_type')
      .order('updated_at', { ascending: false })
      .limit(40)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = []
    for (const learner of learners || []) {
      const summary = await loadProgressForChild(
        admin,
        learner.parent_id as string,
        learner.id as string,
        locale,
        profileFromParentLearnerRow(learner as Record<string, unknown>)
      )
      rows.push({
        parentId: learner.parent_id,
        childId: learner.id,
        childName: learner.name,
        classLevel: learner.class_level,
        examType: learner.exam_type,
        ...summary,
      })
    }

    return NextResponse.json({
      rows: rows.filter((r) => r.totalSessions > 0 || r.weakTopics.length > 0),
      locale,
    })
  }

  let childName: string | null = null
  let learnerProfile: LearnerPathProfile | null = null
  if (childId) {
    const { data: learnerRow } = await admin
      .from('parent_learners')
      .select(
        'name, class_level, education_level, exam_type, specific_exam, learning_path'
      )
      .eq('id', childId)
      .eq('parent_id', userId)
      .maybeSingle()
    childName = (learnerRow?.name as string) ?? null
    learnerProfile = profileFromParentLearnerRow(
      learnerRow as Record<string, unknown> | null
    )
  }

  const summary = await loadProgressForChild(
    admin,
    userId,
    childId,
    locale,
    learnerProfile
  )

  return NextResponse.json({
    userId,
    childId,
    childName,
    locale,
    ...summary,
  })
}

async function loadProgressForChild(
  admin: NonNullable<ReturnType<typeof getServiceSupabaseAdmin>>,
  userId: string,
  childId: string | null,
  locale: CurriculumLocale,
  learnerProfile?: LearnerPathProfile | null
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

  const summary = buildParentProgressSummary({
    masteryRows,
    sessions,
    locale,
    learnerProfile: learnerProfile ?? null,
  })

  const recentGames = sessions.slice(0, 6).map((s) => ({
    gameId: s.gameId,
    title: gameTitles.get(s.gameId) ?? 'Revision game',
    completedAt: s.completedAt,
    accuracy:
      s.totalQuestions > 0
        ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
        : 0,
  }))

  return { ...summary, recentGames }
}
