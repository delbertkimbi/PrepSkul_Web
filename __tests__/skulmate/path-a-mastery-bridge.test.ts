import {
  computeMasteryUpdate,
  isRerouteEligible,
  resolveTopicIdsFromGenerationContext,
} from '@/lib/skulmate/mastery'
import { buildRevisionDeckFromGame } from '@/lib/skulmate/revision-deck'

describe('Path A — mastery bridge with decks', () => {
  it('deck generation context topic maps to mastery topic ids', () => {
    const deck = buildRevisionDeckFromGame({
      gameData: {
        title: 'Electrolysis',
        gameType: 'quiz',
        items: [
          {
            question: 'What moves at the anode?',
            options: ['Anions', 'Cations', 'Neutrons', 'Photons'],
            correctAnswer: 0,
          },
        ],
        metadata: { topic: 'Electrolysis' },
      },
      extractedText: 'Electrolysis moves ions at electrodes in solution.',
      topic: 'Electrolysis',
      sourceType: 'text',
    })

    const resolved = resolveTopicIdsFromGenerationContext({
      topic: deck.topicLabel,
      revisionDeck: deck,
    })

    expect(resolved.topicIds[0]).toBe('open:electrolysis')
    expect(resolved.frameworkId).toBe('open_learning')
  })

  it('weak sessions update mastery and trigger reroute only after sustained struggle', () => {
    const poor = computeMasteryUpdate({
      previousScore: 0.55,
      previousAttempts: 1,
      previousWeakStreak: 1,
      correctAnswers: 2,
      totalQuestions: 10,
    })
    expect(poor.isWeak).toBe(true)
    expect(poor.weakStreak).toBe(2)

    expect(
      isRerouteEligible({
        topicId: 'open:electrolysis',
        attempts: 2,
        weakStreak: 2,
        masteryScore: poor.masteryScore,
        hoursSinceLastSeen: 30,
      })
    ).toBe(false)

    expect(
      isRerouteEligible({
        topicId: 'open:electrolysis',
        attempts: 4,
        weakStreak: 3,
        masteryScore: 0.35,
        hoursSinceLastSeen: 80,
      })
    ).toBe(true)
  })
})
