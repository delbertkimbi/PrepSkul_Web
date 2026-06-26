/**
 * Project revision deck cards into playable game items for a target mode.
 */

import type { RevisionDeck, RevisionDeckCard } from './revision-deck'

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
  }
  return out
}

function distractorsForCard(
  card: RevisionDeckCard,
  allCards: RevisionDeckCard[],
  count = 3
): string[] {
  const pool = allCards
    .filter((other) => other.id !== card.id)
    .map((other) => other.answer)
  return uniqueStrings(pool).filter((a) => a !== card.answer).slice(0, count)
}

function cardToQuizItem(
  card: RevisionDeckCard,
  allCards: RevisionDeckCard[]
): Record<string, unknown> | null {
  const question =
    card.cardType === 'term_def'
      ? `What is the definition of "${card.prompt}"?`
      : card.cardType === 'pair'
        ? card.prompt
        : card.prompt
  if (!question || !card.answer) return null

  const options = uniqueStrings([
    card.answer,
    ...(card.distractors ?? []),
    ...distractorsForCard(card, allCards),
  ]).slice(0, 4)

  if (options.length < 2) return null

  const correctIndex = options.findIndex(
    (option) => option.toLowerCase() === card.answer.toLowerCase()
  )

  return {
    question,
    options,
    correctAnswer: correctIndex >= 0 ? correctIndex : 0,
    explanation: card.explanation ?? undefined,
  }
}

function cardToFlashcardItem(card: RevisionDeckCard): Record<string, unknown> | null {
  if (card.cardType === 'pair') {
    return { term: card.prompt, definition: card.answer }
  }
  if (card.cardType === 'term_def') {
    return { term: card.prompt, definition: card.answer }
  }
  if (card.cardType === 'mcq') {
    return { term: card.prompt, definition: card.answer }
  }
  if (card.cardType === 'cloze') {
    return { term: 'Complete the sentence', definition: card.answer }
  }
  return null
}

function cardToMatchingItem(card: RevisionDeckCard): Record<string, unknown> | null {
  if (card.cardType === 'pair') {
    return { leftItem: card.prompt, rightItem: card.answer }
  }
  if (card.cardType === 'term_def') {
    return { leftItem: card.prompt, rightItem: card.answer }
  }
  if (card.cardType === 'mcq') {
    return { leftItem: card.prompt, rightItem: card.answer }
  }
  return null
}

function cardToFillBlankItem(card: RevisionDeckCard): Record<string, unknown> | null {
  if (card.cardType === 'cloze') {
    return { blankText: card.prompt, correctAnswer: card.answer }
  }
  if (card.cardType === 'mcq' || card.cardType === 'term_def') {
    const blank = card.prompt.includes('____')
      ? card.prompt
      : `${card.prompt}: ____`
    return { blankText: blank, correctAnswer: card.answer }
  }
  return null
}

export function projectDeckToGameItems(
  deck: RevisionDeck,
  targetGameType: string
): Array<Record<string, unknown>> {
  const cards = deck.cards ?? []
  const items: Array<Record<string, unknown>> = []

  for (const card of cards) {
    let item: Record<string, unknown> | null = null
    switch (targetGameType) {
      case 'quiz':
        item = cardToQuizItem(card, cards)
        break
      case 'flashcards':
        item = cardToFlashcardItem(card)
        break
      case 'matching':
        item = cardToMatchingItem(card)
        break
      case 'fill_blank':
        item = cardToFillBlankItem(card)
        break
      default:
        item =
          cardToQuizItem(card, cards) ??
          cardToFlashcardItem(card) ??
          cardToMatchingItem(card)
    }
    if (item) items.push(item)
  }

  return items
}

export function mergeDeckCards(
  deck: RevisionDeck,
  newCards: RevisionDeck['cards']
): RevisionDeck {
  const existingIds = new Set(deck.cards.map((card) => card.id))
  const merged = [...deck.cards]
  for (const card of newCards) {
    if (existingIds.has(card.id)) continue
    merged.push(card)
    existingIds.add(card.id)
  }
  return {
    ...deck,
    cards: merged,
    conceptCheckCardIds:
      deck.conceptCheckCardIds.length > 0
        ? deck.conceptCheckCardIds
        : merged.slice(0, 3).map((card) => card.id),
  }
}
