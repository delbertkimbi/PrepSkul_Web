/**
 * Phase D4 — SM-2 lite spaced repetition (shared policy for Web + tests).
 * Answers Maps question: "What's next?" via next_review_at scheduling.
 */

export type ReviewState = {
  easeFactor: number
  intervalDays: number
  repetitions: number
}

export type Sm2UpdateResult = ReviewState & {
  nextReviewAt: Date
  lastQuality: number
}

const MIN_EASE = 1.3
const DEFAULT_EASE = 2.5
const FAILED_RETRY_MINUTES = 10

function roundEase(n: number): number {
  return Math.round(n * 100) / 100
}

/** SM-2 lite: quality 0–5 (0=complete blackout, 5=perfect). */
export function computeSm2Update(
  previous: ReviewState | null | undefined,
  quality: number,
  now: Date = new Date()
): Sm2UpdateResult {
  const q = Math.min(5, Math.max(0, Math.round(quality)))
  let ease = previous?.easeFactor ?? DEFAULT_EASE
  let reps = previous?.repetitions ?? 0
  let interval = previous?.intervalDays ?? 0

  if (q < 3) {
    reps = 0
    interval = 0
    ease = Math.max(MIN_EASE, ease - 0.2)
  } else {
    if (reps === 0) {
      interval = 1
    } else if (reps === 1) {
      interval = 3
    } else {
      interval = Math.max(1, Math.round(interval * ease))
    }
    reps += 1
    ease =
      ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ease = Math.max(MIN_EASE, ease)
  }

  const nextReviewAt = new Date(now)
  if (interval === 0) {
    nextReviewAt.setMinutes(nextReviewAt.getMinutes() + FAILED_RETRY_MINUTES)
  } else {
    nextReviewAt.setDate(nextReviewAt.getDate() + interval)
  }

  return {
    easeFactor: roundEase(ease),
    intervalDays: interval,
    repetitions: reps,
    nextReviewAt,
    lastQuality: q,
  }
}

export function qualityFromFlashcardKnown(known: boolean): number {
  return known ? 4 : 1
}

export function qualityFromQuizAnswer(
  isCorrect: boolean,
  usedHint = false
): number {
  if (isCorrect && !usedHint) return 4
  if (isCorrect && usedHint) return 3
  return 1
}

export function isDue(nextReviewAt: string | Date, now: Date = new Date()): boolean {
  const due = nextReviewAt instanceof Date ? nextReviewAt : new Date(nextReviewAt)
  return due.getTime() <= now.getTime()
}

export function conceptKeyFromTerm(term: string | null | undefined): string {
  if (!term || !term.trim()) return 'item'
  const slug = term
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return slug || 'item'
}
