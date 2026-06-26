import { buildRevisionDeckFromGame } from '@/lib/skulmate/revision-deck'
import { projectDeckToGameItems } from '@/lib/skulmate/deck-projector'
import { deckAppendCreditsRequired } from '@/lib/skulmate/billing'

describe('Path B — deck-first flow (web)', () => {
  const gameData = {
    title: 'Photosynthesis',
    gameType: 'quiz',
    items: [
      {
        question: 'What pigment absorbs light?',
        options: ['Chlorophyll', 'Hemoglobin', 'Melanin', 'Keratin'],
        correctAnswer: 0,
        explanation: 'Chlorophyll captures light energy.',
      },
      {
        question: 'Where does photosynthesis occur?',
        options: ['Chloroplast', 'Mitochondria', 'Nucleus', 'Golgi'],
        correctAnswer: 0,
      },
    ],
    metadata: {
      source: 'text',
      generatedAt: new Date().toISOString(),
      difficulty: 'medium',
      totalItems: 2,
      topic: 'Photosynthesis',
    },
  }

  it('builds revision deck then projects to each core play mode', () => {
    const deck = buildRevisionDeckFromGame({
      gameData,
      extractedText:
        'Photosynthesis converts light into chemical energy in chloroplasts using chlorophyll.',
      topic: 'Photosynthesis',
      sourceType: 'text',
    })

    expect(deck.cards.length).toBeGreaterThanOrEqual(2)
    expect(deck.conceptCheckCardIds.length).toBeGreaterThanOrEqual(1)

    for (const mode of ['quiz', 'flashcards', 'matching', 'fill_blank']) {
      const items = projectDeckToGameItems(deck, mode)
      expect(items.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('projected quiz items use numeric correctAnswer indices', () => {
    const deck = buildRevisionDeckFromGame({
      gameData,
      extractedText: 'Chlorophyll and chloroplast notes for photosynthesis study.',
      topic: 'Photosynthesis',
      sourceType: 'text',
    })
    const items = projectDeckToGameItems(deck, 'quiz')
    expect(items.every((item) => typeof item.correctAnswer === 'number')).toBe(
      true
    )
  })

  it('append-cards billing uses manual-text tier', () => {
    expect(
      deckAppendCreditsRequired({
        creditsPerManualTextGame: 2,
        creditsPerDocTextGame: 5,
        creditsPerImageGameBase: 10,
        freeDocTextGamesPerDay: 2,
        freeImageGamesPerDay: 4,
        maxImagesPerPromptFree: 3,
        maxImagesPerPromptPaid: 5,
      })
    ).toBe(2)
  })
})
