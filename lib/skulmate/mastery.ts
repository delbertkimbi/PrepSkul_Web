/**
 * Mastery scoring for SkulMate concept graph (Phase C).
 */

export type MasteryUpdateInput = {
  previousScore: number
  previousAttempts: number
  previousWeakStreak: number
  correctAnswers: number
  totalQuestions: number
}

export type MasteryUpdateResult = {
  masteryScore: number
  attempts: number
  weakStreak: number
  sessionAccuracy: number
  isWeak: boolean
}

const WEAK_SESSION_THRESHOLD = 0.6
const WEAK_SCORE_THRESHOLD = 0.55
const EMA_ALPHA = 0.3

export function computeMasteryUpdate(
  input: MasteryUpdateInput
): MasteryUpdateResult {
  const total = Math.max(1, input.totalQuestions)
  const sessionAccuracy = Math.min(
    1,
    Math.max(0, input.correctAnswers / total)
  )

  const masteryScore =
    input.previousAttempts <= 0
      ? sessionAccuracy
      : (1 - EMA_ALPHA) * input.previousScore + EMA_ALPHA * sessionAccuracy

  const weakStreak =
    sessionAccuracy < WEAK_SESSION_THRESHOLD
      ? input.previousWeakStreak + 1
      : 0

  const isWeak =
    weakStreak >= 2 ||
    (input.previousAttempts + 1 >= 2 && masteryScore < WEAK_SCORE_THRESHOLD)

  return {
    masteryScore: Math.round(masteryScore * 10000) / 10000,
    attempts: input.previousAttempts + 1,
    weakStreak,
    sessionAccuracy: Math.round(sessionAccuracy * 10000) / 10000,
    isWeak,
  }
}

/** Stricter than [isWeak] — learner nudge only after sustained struggle. */
export function isRerouteEligible(input: {
  topicId: string
  attempts: number
  weakStreak: number
  masteryScore: number
  hoursSinceLastSeen?: number
}): boolean {
  if (!input.topicId || input.topicId === 'open:general') return false
  if (input.attempts < 3) return false
  if (input.hoursSinceLastSeen != null && input.hoursSinceLastSeen < 24) {
    return false
  }

  const sustainedStruggle =
    input.weakStreak >= 2 ||
    (input.attempts >= 4 && input.masteryScore < 0.42)

  return sustainedStruggle
}

export function resolveTopicIdsFromGenerationContext(
  generationContext: Record<string, unknown> | null | undefined
): { topicIds: string[]; frameworkId: string | null } {
  if (!generationContext) {
    return { topicIds: ['open:general'], frameworkId: 'open_learning' }
  }

  const alignment = generationContext.curriculumAlignment as
    | {
        matchedTopicIds?: string[]
        frameworkId?: string
      }
    | undefined

  const matched = alignment?.matchedTopicIds?.filter(Boolean) ?? []
  if (matched.length > 0) {
    return {
      topicIds: matched,
      frameworkId: alignment?.frameworkId ?? null,
    }
  }

  const topic = generationContext.topic
  if (typeof topic === 'string' && topic.trim().length > 0) {
    const slug = topic
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
    return {
      topicIds: [`open:${slug || 'topic'}`],
      frameworkId: 'open_learning',
    }
  }

  return { topicIds: ['open:general'], frameworkId: 'open_learning' }
}
