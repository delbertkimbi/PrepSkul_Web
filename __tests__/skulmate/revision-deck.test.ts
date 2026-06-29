import {
  buildRevisionDeckFromGame,
  enrichFlashcardDeck,
  pickConceptCheckCardIds,
} from '@/lib/skulmate/revision-deck'

describe('revision-deck', () => {
  it('builds mcq cards from quiz items', () => {
    const deck = buildRevisionDeckFromGame({
      gameData: {
        title: 'Bio Blitz',
        gameType: 'quiz',
        items: [
          {
            question: 'What absorbs light in photosynthesis?',
            options: ['Chlorophyll', 'Oxygen', 'Glucose', 'Water'],
            correctAnswer: 'Chlorophyll',
          },
        ],
      },
      extractedText: 'Chlorophyll absorbs light energy during photosynthesis in plant leaves.',
      topic: 'Photosynthesis',
      sourceType: 'text',
    })

    expect(deck.cards).toHaveLength(1)
    expect(deck.cards[0].cardType).toBe('mcq')
    expect(deck.cards[0].answer).toBe('Chlorophyll')
    expect(deck.conceptCheckCardIds.length).toBeGreaterThan(0)
  })

  it('builds term cards from flashcards', () => {
    const deck = buildRevisionDeckFromGame({
      gameData: {
        title: 'Term Deck',
        gameType: 'flashcards',
        items: [{ term: 'Chlorophyll', definition: 'Green pigment that absorbs light' }],
      },
      extractedText: 'Plants use chlorophyll to capture sunlight.',
      sourceType: 'text',
    })

    expect(deck.cards[0].cardType).toBe('term_def')
    expect(deck.cards[0].prompt).toBe('Chlorophyll')
  })

  it('enriches flashcard decks with synthesized mcq cards', () => {
    const base = Array.from({ length: 6 }, (_, i) => ({
      id: `t${i}`,
      knowledgeUnitId: 'core-1',
      cardType: 'term_def' as const,
      prompt: `Term ${i}`,
      answer: `Definition ${i}`,
      difficulty: 'easy' as const,
      tags: ['flashcard'],
    }))

    const enriched = enrichFlashcardDeck(
      base,
      'Term 2 appears in the extracted notes about photosynthesis and plants.'
    )

    expect(enriched.length).toBeGreaterThan(base.length)
    expect(enriched.some((c) => c.cardType === 'mcq')).toBe(true)
    expect(enriched.some((c) => c.tags?.includes('true_false'))).toBe(true)
  })

  it('builds flashcard deck with enrichment applied', () => {
    const deck = buildRevisionDeckFromGame({
      gameData: {
        title: 'Big Deck',
        gameType: 'flashcards',
        items: Array.from({ length: 6 }, (_, i) => ({
          term: `Term ${i}`,
          definition: `Definition ${i}`,
        })),
      },
      extractedText:
        'Term 0 and Term 1 are key ideas. Term 2 relates to energy. Term 3 covers cells. Term 4 is about DNA. Term 5 wraps up.',
      sourceType: 'text',
    })

    expect(deck.cards.length).toBeGreaterThan(6)
  })

  it('picks up to three concept-check cards', () => {
    const ids = pickConceptCheckCardIds([
      {
        id: 'a',
        knowledgeUnitId: 'u1',
        cardType: 'mcq',
        prompt: 'Q1',
        answer: 'A',
        difficulty: 'easy',
      },
      {
        id: 'b',
        knowledgeUnitId: 'u1',
        cardType: 'term_def',
        prompt: 'Term',
        answer: 'Def',
        difficulty: 'medium',
      },
      {
        id: 'c',
        knowledgeUnitId: 'u1',
        cardType: 'mcq',
        prompt: 'Q2',
        answer: 'B',
        difficulty: 'medium',
      },
      {
        id: 'd',
        knowledgeUnitId: 'u1',
        cardType: 'pair',
        prompt: 'Left',
        answer: 'Right',
        difficulty: 'hard',
      },
    ])

    expect(ids).toHaveLength(3)
    expect(ids).toContain('a')
  })
})
