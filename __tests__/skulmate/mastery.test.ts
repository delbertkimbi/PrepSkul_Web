import {
  computeMasteryUpdate,
  isRerouteEligible,
  resolveTopicIdsFromGenerationContext,
} from '@/lib/skulmate/mastery'

describe('mastery scoring', () => {
  it('sets first session score to session accuracy', () => {
    const result = computeMasteryUpdate({
      previousScore: 0,
      previousAttempts: 0,
      previousWeakStreak: 0,
      correctAnswers: 8,
      totalQuestions: 10,
    })
    expect(result.masteryScore).toBe(0.8)
    expect(result.attempts).toBe(1)
    expect(result.isWeak).toBe(false)
  })

  it('marks weak after consecutive poor sessions', () => {
    const first = computeMasteryUpdate({
      previousScore: 0.5,
      previousAttempts: 1,
      previousWeakStreak: 1,
      correctAnswers: 3,
      totalQuestions: 10,
    })
    expect(first.weakStreak).toBe(2)
    expect(first.isWeak).toBe(true)
  })

  it('resolves curriculum topic ids from generation context', () => {
    const resolved = resolveTopicIdsFromGenerationContext({
      curriculumAlignment: {
        frameworkId: 'cm_gce_ol',
        matchedTopicIds: ['gce_ol_chem_electrolysis'],
      },
    })
    expect(resolved.topicIds).toEqual(['gce_ol_chem_electrolysis'])
    expect(resolved.frameworkId).toBe('cm_gce_ol')
  })

  it('falls back to open topic slug', () => {
    const resolved = resolveTopicIdsFromGenerationContext({
      topic: 'Machine Learning Basics',
    })
    expect(resolved.topicIds[0]).toBe('open:machine-learning-basics')
  })

  it('reroute nudge requires sustained struggle not one bad session', () => {
    expect(
      isRerouteEligible({
        topicId: 'gce_ol_chem_electrolysis',
        attempts: 2,
        weakStreak: 2,
        masteryScore: 0.4,
        hoursSinceLastSeen: 30,
      })
    ).toBe(false)

    expect(
      isRerouteEligible({
        topicId: 'gce_ol_chem_electrolysis',
        attempts: 3,
        weakStreak: 2,
        masteryScore: 0.48,
        hoursSinceLastSeen: 30,
      })
    ).toBe(true)

    expect(
      isRerouteEligible({
        topicId: 'open:general',
        attempts: 5,
        weakStreak: 3,
        masteryScore: 0.3,
        hoursSinceLastSeen: 48,
      })
    ).toBe(false)
  })
})
