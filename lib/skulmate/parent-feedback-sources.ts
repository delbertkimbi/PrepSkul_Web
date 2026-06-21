/**
 * Parent feedback sources — what feeds structured parent updates (email/SMS/in-app).
 * Today: SkulMate only. Sessions/tutor reports are staged for aggregation.
 */

export type ParentFeedbackSource =
  | 'skulmate_games'
  | 'live_online_session'
  | 'onsite_session'
  | 'tutor_session_report'
  | 'class_teaching'

export type ParentFeedbackDigest = {
  generatedAt: string
  childId?: string | null
  childName?: string | null
  learnerContextLine: string | null
  isExamTrack: boolean
  hasActiveTutor: boolean
  activeTutorNames: string[]
  sourcesIncluded: ParentFeedbackSource[]
  skulmate?: {
    streakDays: number
    revisionMinutesLast7Days: number
    accuracyLast7Days: number | null
    readinessScore: number
    readinessLabel: string
    weakTopicLabels: string[]
  }
  sessions?: {
    upcomingCount: number
    recentCompletedCount: number
  }
  messageTone: 'revision_only' | 'revision_and_tutor' | 'tutor_primary'
}

/** Which sources are wired in production today. */
export const PARENT_FEEDBACK_SOURCE_STATUS: Record<
  ParentFeedbackSource,
  'live' | 'planned'
> = {
  skulmate_games: 'live',
  live_online_session: 'live',
  onsite_session: 'planned',
  tutor_session_report: 'live',
  class_teaching: 'planned',
}

export function resolveParentMessageTone(input: {
  hasActiveTutor: boolean
  skulmateWeakTopics: number
}): ParentFeedbackDigest['messageTone'] {
  if (input.hasActiveTutor && input.skulmateWeakTopics > 0) {
    return 'tutor_primary'
  }
  if (input.hasActiveTutor) return 'revision_and_tutor'
  return 'revision_only'
}
