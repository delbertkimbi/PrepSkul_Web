import {
  computeSm2Update,
  conceptKeyFromTerm,
  isDue,
  qualityFromFlashcardKnown,
  qualityFromQuizAnswer,
} from '@/lib/skulmate/spaced-repetition'

describe('spaced-repetition D4', () => {
  const now = new Date('2026-06-10T12:00:00Z')

  it('maps flashcard knew to quality 4 and unknown to 1', () => {
    expect(qualityFromFlashcardKnown(true)).toBe(4)
    expect(qualityFromFlashcardKnown(false)).toBe(1)
  })

  it('maps quiz outcomes to quality bands', () => {
    expect(qualityFromQuizAnswer(true, false)).toBe(4)
    expect(qualityFromQuizAnswer(true, true)).toBe(3)
    expect(qualityFromQuizAnswer(false)).toBe(1)
  })

  it('first successful review schedules 1 day interval', () => {
    const result = computeSm2Update(null, 4, now)
    expect(result.repetitions).toBe(1)
    expect(result.intervalDays).toBe(1)
    expect(result.nextReviewAt.toISOString().slice(0, 10)).toBe('2026-06-11')
  })

  it('second successful review schedules 3 day interval', () => {
    const first = computeSm2Update(null, 4, now)
    const second = computeSm2Update(first, 4, now)
    expect(second.repetitions).toBe(2)
    expect(second.intervalDays).toBe(3)
  })

  it('failed review resets repetitions and retries in 10 minutes', () => {
    const established = computeSm2Update(
      { easeFactor: 2.5, intervalDays: 3, repetitions: 2 },
      1,
      now
    )
    expect(established.repetitions).toBe(0)
    expect(established.intervalDays).toBe(0)
    const retry = established.nextReviewAt.getTime() - now.getTime()
    expect(retry).toBe(10 * 60 * 1000)
  })

  it('grows interval after third success using ease factor', () => {
    const second = computeSm2Update(
      { easeFactor: 2.5, intervalDays: 3, repetitions: 2 },
      4,
      now
    )
    expect(second.repetitions).toBe(3)
    expect(second.intervalDays).toBeGreaterThanOrEqual(7)
  })

  it('clamps ease factor floor at 1.3', () => {
    let state = { easeFactor: 1.35, intervalDays: 6, repetitions: 3 }
    for (let i = 0; i < 5; i++) {
      state = computeSm2Update(state, 1, now)
    }
    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('isDue returns true when next_review_at is in the past', () => {
    expect(isDue('2026-06-09T00:00:00Z', now)).toBe(true)
    expect(isDue('2026-06-11T00:00:00Z', now)).toBe(false)
  })

  it('conceptKeyFromTerm slugifies terms', () => {
    expect(conceptKeyFromTerm('Chemical Bonding')).toBe('chemical-bonding')
    expect(conceptKeyFromTerm('')).toBe('item')
  })
})
