/**
 * Phase C4 — parent progress aggregation (exam labels OK here; not learner UI).
 */

import { isRerouteEligible } from './mastery'
import { getFrameworkLabel, getTopicTitle, type CurriculumLocale } from './curriculum-labels'
import {
  learnerContextLine,
  parentFrameworkLabel,
  readinessDisclaimer,
  readinessTitle,
  type LearnerPathProfile,
} from './learner-path-context'

export type MasteryRow = {
  topicId: string
  frameworkId?: string | null
  masteryScore: number
  weakStreak: number
  attempts: number
  lastSeenAt?: string | null
  lastGameId?: string | null
}

export type SessionRow = {
  gameId: string
  correctAnswers: number
  totalQuestions: number
  timeTakenSeconds?: number | null
  completedAt: string
}

export type ReadinessBand = 'needs_support' | 'building' | 'on_track' | 'strong'

export type ParentProgressSummary = {
  streakDays: number
  sessionsLast7Days: number
  revisionMinutesLast7Days: number
  accuracyLast7Days: number | null
  totalSessions: number
  examReadiness: number
  readinessBand: ReadinessBand
  readinessLabel: string
  readinessTitle: string
  readinessDisclaimer: string
  learnerContextLine: string | null
  weakTopics: Array<{
    topicId: string
    topicLabel: string
    frameworkLabel: string | null
    masteryScore: number
    weakStreak: number
    attempts: number
    needsAttention: boolean
  }>
}

const READINESS_LABELS: Record<
  CurriculumLocale,
  Record<ReadinessBand, string>
> = {
  en: {
    needs_support: 'Needs support',
    building: 'Building foundation',
    on_track: 'On track',
    strong: 'Strong',
  },
  fr: {
    needs_support: 'Besoin de soutien',
    building: 'En construction',
    on_track: 'Sur la bonne voie',
    strong: 'Solide',
  },
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function computeStreakFromSessions(sessions: SessionRow[]): number {
  if (sessions.length === 0) return 0

  const days = new Set<string>()
  for (const s of sessions) {
    const d = startOfDay(new Date(s.completedAt))
    days.add(d.toISOString().slice(0, 10))
  }

  const sorted = [...days].sort().reverse()
  const today = startOfDay(new Date())
  const todayKey = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  if (!days.has(todayKey) && !days.has(yesterdayKey)) {
    return 0
  }

  let streak = 0
  let cursor =
    days.has(todayKey) ? today : yesterday

  while (true) {
    const key = cursor.toISOString().slice(0, 10)
    if (!days.has(key)) break
    streak += 1
    cursor = new Date(cursor)
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export function computeSessionStats(
  sessions: SessionRow[],
  windowDays = 7
): {
  sessionsLast7Days: number
  revisionMinutesLast7Days: number
  accuracyLast7Days: number | null
  totalSessions: number
} {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000
  const recent = sessions.filter(
    (s) => new Date(s.completedAt).getTime() >= cutoff
  )

  let correct = 0
  let total = 0
  let seconds = 0

  for (const s of recent) {
    correct += s.correctAnswers
    total += s.totalQuestions
    seconds += s.timeTakenSeconds ?? 0
  }

  return {
    sessionsLast7Days: recent.length,
    revisionMinutesLast7Days: Math.round(seconds / 60),
    accuracyLast7Days: total > 0 ? Math.round((correct / total) * 100) : null,
    totalSessions: sessions.length,
  }
}

export function computeExamReadiness(
  masteryRows: MasteryRow[]
): { score: number; band: ReadinessBand } {
  const eligible = masteryRows.filter((r) => r.attempts >= 2)
  if (eligible.length === 0) {
    return { score: 0, band: 'building' }
  }

  const school = eligible.filter(
    (r) =>
      r.frameworkId &&
      r.frameworkId !== 'open_learning' &&
      r.topicId !== 'open:general'
  )
  const pool = school.length > 0 ? school : eligible

  const avg =
    pool.reduce((sum, r) => sum + r.masteryScore, 0) / pool.length

  const weakCount = pool.filter((r) => {
    const hours = r.lastSeenAt
      ? (Date.now() - new Date(r.lastSeenAt).getTime()) / (1000 * 60 * 60)
      : undefined
    return (
      isRerouteEligible({
        topicId: r.topicId,
        attempts: r.attempts,
        weakStreak: r.weakStreak,
        masteryScore: r.masteryScore,
        hoursSinceLastSeen: hours,
      }) || r.masteryScore < 0.55
    )
  }).length

  const raw = Math.round(avg * 100) - weakCount * 6
  const score = Math.max(0, Math.min(100, raw))

  let band: ReadinessBand
  if (score < 40) band = 'needs_support'
  else if (score < 60) band = 'building'
  else if (score < 78) band = 'on_track'
  else band = 'strong'

  return { score, band }
}

export function buildParentProgressSummary(params: {
  masteryRows: MasteryRow[]
  sessions: SessionRow[]
  locale?: CurriculumLocale
  learnerProfile?: LearnerPathProfile | null
}): ParentProgressSummary {
  const locale = params.locale ?? 'en'
  const sessionStats = computeSessionStats(params.sessions)
  const readiness = computeExamReadiness(params.masteryRows)
  const profile = params.learnerProfile ?? null

  const weakTopics = params.masteryRows
    .filter((r) => r.attempts >= 2 && r.topicId !== 'open:general')
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 8)
    .map((r) => {
      const hours = r.lastSeenAt
        ? (Date.now() - new Date(r.lastSeenAt).getTime()) / (1000 * 60 * 60)
        : undefined
      const needsAttention =
        isRerouteEligible({
          topicId: r.topicId,
          attempts: r.attempts,
          weakStreak: r.weakStreak,
          masteryScore: r.masteryScore,
          hoursSinceLastSeen: hours,
        }) || r.masteryScore < 0.5

      return {
        topicId: r.topicId,
        topicLabel: getTopicTitle(r.topicId, locale) ?? humanizeTopicId(r.topicId),
        frameworkLabel: parentFrameworkLabel({
          frameworkId: r.frameworkId,
          profile,
          locale,
          getFrameworkLabel,
        }),
        masteryScore: r.masteryScore,
        weakStreak: r.weakStreak,
        attempts: r.attempts,
        needsAttention,
      }
    })
    .filter((r) => r.needsAttention)

  return {
    streakDays: computeStreakFromSessions(params.sessions),
    ...sessionStats,
    examReadiness: readiness.score,
    readinessBand: readiness.band,
    readinessLabel: READINESS_LABELS[locale][readiness.band],
    readinessTitle: readinessTitle(profile, locale),
    readinessDisclaimer: readinessDisclaimer(profile, locale),
    learnerContextLine: learnerContextLine(profile, locale),
    weakTopics,
  }
}

function humanizeTopicId(topicId: string): string {
  const raw = topicId.replace(/^open:/, '').replace(/_/g, ' ').trim()
  if (!raw) return 'General revision'
  return raw
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
