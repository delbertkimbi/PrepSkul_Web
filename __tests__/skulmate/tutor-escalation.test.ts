import { isTutorEscalationEligible } from '@/lib/skulmate/tutor-escalation'

describe('tutor escalation eligibility', () => {
  it('does not offer after a decent session', () => {
    expect(
      isTutorEscalationEligible({
        topicId: 'gce_ol_chem_electrolysis',
        previousAttempts: 4,
        previousScore: 0.4,
        previousWeakStreak: 2,
        sessionCorrect: 7,
        sessionTotal: 10,
      })
    ).toBe(false)
  })

  it('offers after rough session and projected sustained struggle', () => {
    expect(
      isTutorEscalationEligible({
        topicId: 'gce_ol_chem_electrolysis',
        previousAttempts: 2,
        previousScore: 0.45,
        previousWeakStreak: 1,
        sessionCorrect: 2,
        sessionTotal: 10,
      })
    ).toBe(true)
  })
})
