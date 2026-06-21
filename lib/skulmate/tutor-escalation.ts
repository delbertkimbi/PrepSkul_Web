import { computeMasteryUpdate, isRerouteEligible } from '@/lib/skulmate/mastery'

export function isTutorEscalationEligible(input: {
  topicId: string
  previousAttempts: number
  previousScore: number
  previousWeakStreak: number
  sessionCorrect: number
  sessionTotal: number
}): boolean {
  const sessionTotal = Math.max(1, input.sessionTotal)
  const sessionAccuracy = input.sessionCorrect / sessionTotal
  if (sessionAccuracy >= 0.55) return false

  const projected = computeMasteryUpdate({
    previousScore: input.previousScore,
    previousAttempts: input.previousAttempts,
    previousWeakStreak: input.previousWeakStreak,
    correctAnswers: input.sessionCorrect,
    totalQuestions: input.sessionTotal,
  })

  return isRerouteEligible({
    topicId: input.topicId,
    attempts: projected.attempts,
    weakStreak: projected.weakStreak,
    masteryScore: projected.masteryScore,
    hoursSinceLastSeen: 48,
  })
}
