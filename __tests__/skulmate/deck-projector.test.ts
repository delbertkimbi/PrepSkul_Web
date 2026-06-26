import { projectDeckToGameItems } from '@/lib/skulmate/deck-projector'
import type { RevisionDeck, RevisionDeckCard } from '@/lib/skulmate/revision-deck'

function sampleDeck(): RevisionDeck {
  return {
    id: 'deck-1',
    title: 'Biology',
    topicLabel: 'Biology',
    sourceType: 'text',
    notes: 'Notes',
    knowledgeUnits: [{ id: 'core-1', name: 'Core', priority: 'high' }],
    gameType: 'quiz',
    linkedGameId: 'game-1',
    conceptCheckCardIds: [],
    cards: [
      {
        id: 'c1',
        knowledgeUnitId: 'core-1',
        cardType: 'term_def',
        prompt: 'Mitochondria',
        answer: 'Powerhouse of the cell',
        difficulty: 'easy',
        tags: [],
      },
      {
        id: 'c2',
        knowledgeUnitId: 'core-1',
        cardType: 'mcq',
        prompt: 'What gas do plants absorb?',
        answer: 'Carbon dioxide',
        distractors: ['Oxygen', 'Nitrogen'],
        difficulty: 'medium',
        tags: [],
      },
      {
        id: 'c3',
        knowledgeUnitId: 'core-1',
        cardType: 'pair',
        prompt: 'H2O',
        answer: 'Water',
        difficulty: 'easy',
        tags: [],
      },
      {
        id: 'c4',
        knowledgeUnitId: 'core-1',
        cardType: 'cloze',
        prompt: 'Photosynthesis happens in the ____.',
        answer: 'chloroplast',
        difficulty: 'medium',
        tags: [],
      },
    ],
  }
}

describe('deck-projector', () => {
  it('projects quiz items with index correctAnswer', () => {
    const items = projectDeckToGameItems(sampleDeck(), 'quiz')
    expect(items.length).toBeGreaterThanOrEqual(2)
    const mcq = items.find((item) =>
      String(item.question).includes('gas do plants absorb')
    )
    expect(mcq).toBeTruthy()
    expect(Array.isArray(mcq?.options)).toBe(true)
    expect(typeof mcq?.correctAnswer).toBe('number')
  })

  it('projects flashcards from mixed deck cards', () => {
    const items = projectDeckToGameItems(sampleDeck(), 'flashcards')
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          term: 'Mitochondria',
          definition: 'Powerhouse of the cell',
        }),
      ])
    )
  })

  it('projects matching pairs', () => {
    const items = projectDeckToGameItems(sampleDeck(), 'matching')
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ leftItem: 'H2O', rightItem: 'Water' }),
      ])
    )
  })

  it('projects fill blank items', () => {
    const items = projectDeckToGameItems(sampleDeck(), 'fill_blank')
    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          blankText: 'Photosynthesis happens in the ____.',
          correctAnswer: 'chloroplast',
        }),
      ])
    )
  })
})

describe('mergeDeckCards', () => {
  it('dedupes by card id', async () => {
    const { mergeDeckCards } = await import('@/lib/skulmate/deck-projector')
    const deck = sampleDeck()
    const extra: RevisionDeckCard = {
      ...deck.cards[0],
      id: 'c1',
    }
    const newCard: RevisionDeckCard = {
      ...deck.cards[0],
      id: 'c-new',
      prompt: 'Ribosomes',
      answer: 'Protein synthesis',
    }
    const merged = mergeDeckCards(deck, [extra, newCard])
    expect(merged.cards).toHaveLength(deck.cards.length + 1)
  })
})
