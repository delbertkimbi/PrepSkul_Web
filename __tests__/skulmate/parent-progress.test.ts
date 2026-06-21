import {
  buildParentProgressSummary,
  computeExamReadiness,
  computeStreakFromSessions,
} from '@/lib/skulmate/parent-progress'

describe('parent-progress C4', () => {
  it('computes streak from session dates', () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const streak = computeStreakFromSessions([
      {
        gameId: 'g1',
        correctAnswers: 4,
        totalQuestions: 5,
        completedAt: today.toISOString(),
      },
      {
        gameId: 'g2',
        correctAnswers: 3,
        totalQuestions: 5,
        completedAt: yesterday.toISOString(),
      },
    ])
    expect(streak).toBeGreaterThanOrEqual(2)
  })

  it('low mastery yields needs_support readiness', () => {
    const { score, band } = computeExamReadiness([
      {
        topicId: 'gce_ol_chem_electrolysis',
        frameworkId: 'cm_gce_ol',
        masteryScore: 0.35,
        weakStreak: 3,
        attempts: 5,
      },
    ])
    expect(score).toBeLessThan(50)
    expect(band).toBe('needs_support')
  })

  it('builds parent summary with weak topics', () => {
    const summary = buildParentProgressSummary({
      masteryRows: [
        {
          topicId: 'gce_ol_chem_electrolysis',
          frameworkId: 'cm_gce_ol',
          masteryScore: 0.4,
          weakStreak: 2,
          attempts: 4,
          lastSeenAt: new Date().toISOString(),
        },
      ],
      sessions: [
        {
          gameId: 'g1',
          correctAnswers: 2,
          totalQuestions: 5,
          timeTakenSeconds: 300,
          completedAt: new Date().toISOString(),
        },
      ],
      locale: 'en',
    })
    expect(summary.weakTopics.length).toBeGreaterThan(0)
    expect(summary.revisionMinutesLast7Days).toBe(5)
    expect(summary.readinessLabel).toBeTruthy()
  })
})
