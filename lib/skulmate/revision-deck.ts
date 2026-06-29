/**
 * Revision deck — canonical study artifact built from generated game content.
 * Games become play-mode projections of deck cards.
 */

export type DeckCardType =
  | 'term_def'
  | 'mcq'
  | 'cloze'
  | 'multi_select'
  | 'pair'
  | 'order'

export type DeckCardDifficulty = 'easy' | 'medium' | 'hard'

export type KnowledgeUnit = {
  id: string
  name: string
  priority: 'high' | 'medium' | 'low'
}

export type RevisionDeckCard = {
  id: string
  knowledgeUnitId: string
  cardType: DeckCardType
  prompt: string
  answer: string
  distractors?: string[]
  explanation?: string
  sourceQuote?: string
  difficulty: DeckCardDifficulty
  tags?: string[]
  /** Index in the source game items array when projected from generation. */
  gameItemIndex?: number
}

export type RevisionDeck = {
  id?: string
  title: string
  topicLabel: string
  sourceType: string
  notes: string
  knowledgeUnits: KnowledgeUnit[]
  cards: RevisionDeckCard[]
  conceptCheckCardIds: string[]
  linkedGameId?: string
  gameType: string
  /** True only when the learner explicitly saved this upload as a deck library item. */
  librarySaved?: boolean
}

type BuildDeckInput = {
  gameData: {
    title?: string
    gameType?: string
    items?: unknown[]
    metadata?: Record<string, unknown>
  }
  extractedText: string
  topic?: string
  sourceType: string
  linkedGameId?: string
  entityLabels?: string[]
}

function asDeckItemRecord(item: unknown): Record<string, unknown> {
  if (item && typeof item === 'object') {
    return item as Record<string, unknown>
  }
  return {}
}

function slugId(value: string, index: number): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return `${base || 'card'}-${index + 1}`
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => asString(entry))
    .filter((entry) => entry.length > 0)
}

function buildNotes(extractedText: string, topic?: string): string {
  const trimmed = extractedText.trim()
  if (trimmed.length >= 120) {
    const sentences = trimmed.match(/[^.!?]+[.!?]+/g) ?? [trimmed]
    const summary = sentences.slice(0, 4).join(' ').trim()
    if (summary.length >= 80) return summary.slice(0, 900)
  }
  if (topic?.trim()) {
    return `Revision deck for ${topic.trim()}. Study the cards below, then pick a play mode when you are ready.`
  }
  return 'Review these cards from your upload, then choose how you want to practice.'
}

function buildKnowledgeUnits(
  _topicLabel: string,
  _entityLabels?: string[]
): KnowledgeUnit[] {
  // Subdecks are created by the learner — not auto-generated at intake.
  return []
}

function unitIdForIndex(units: KnowledgeUnit[], index: number): string {
  if (units.length === 0) return 'core-1'
  return units[index % units.length].id
}

function cardFromQuizItem(
  item: Record<string, unknown>,
  index: number,
  unitId: string
): RevisionDeckCard | null {
  const question = asString(item.question)
  const options = asStringArray(item.options)
  if (!question || options.length < 2) return null

  const correct =
    asString(item.correctAnswer) ||
    options.find((opt) => opt === asString(item.answer)) ||
    options[0]

  const distractors = options.filter((opt) => opt !== correct).slice(0, 3)

  return {
    id: slugId(question, index),
    knowledgeUnitId: unitId,
    cardType: 'mcq',
    prompt: question,
    answer: correct,
    distractors,
    explanation: asString(item.explanation) || undefined,
    difficulty: distractors.length >= 3 ? 'medium' : 'easy',
    tags: ['quiz'],
    gameItemIndex: index,
  }
}

function cardFromFlashcardItem(
  item: Record<string, unknown>,
  index: number,
  unitId: string
): RevisionDeckCard | null {
  const statement = asString(item.statement)
  const term = asString(item.term) || statement
  const definition = asString(item.definition) || asString(item.answer)
  if (!term || !definition) return null

  const tags = ['flashcard']
  if (statement && (definition.toLowerCase() === 'true' || definition.toLowerCase() === 'false')) {
    tags.push('true_false')
  }

  return {
    id: slugId(term, index),
    knowledgeUnitId: unitId,
    cardType: 'term_def',
    prompt: statement || term,
    answer: definition,
    explanation: asString(item.explanation) || undefined,
    difficulty: term.length <= 18 ? 'easy' : 'medium',
    tags,
    gameItemIndex: index,
  }
}

function cardFromMatchingItem(
  item: Record<string, unknown>,
  index: number,
  unitId: string
): RevisionDeckCard | null {
  const left = asString(item.leftItem)
  const right = asString(item.rightItem)
  if (!left || !right) return null

  return {
    id: slugId(left, index),
    knowledgeUnitId: unitId,
    cardType: 'pair',
    prompt: left,
    answer: right,
    difficulty: 'medium',
    tags: ['matching'],
    gameItemIndex: index,
  }
}

function cardFromFillBlankItem(
  item: Record<string, unknown>,
  index: number,
  unitId: string
): RevisionDeckCard | null {
  const blankText = asString(item.blankText)
  const answer = asString(item.answer) || asString(item.correctAnswer)
  if (!blankText) return null

  return {
    id: slugId(blankText, index),
    knowledgeUnitId: unitId,
    cardType: 'cloze',
    prompt: blankText,
    answer: answer || blankText,
    difficulty: 'medium',
    tags: ['fill_blank'],
    gameItemIndex: index,
  }
}

function cardFromGenericItem(
  item: Record<string, unknown>,
  index: number,
  unitId: string
): RevisionDeckCard | null {
  const question = asString(item.question)
  const answer =
    asString(item.answer) ||
    asString(item.correctAnswer) ||
    asString(item.definition) ||
    asString(item.solution)
  if (!question || !answer) return null

  return {
    id: slugId(question, index),
    knowledgeUnitId: unitId,
    cardType: 'mcq',
    prompt: question,
    answer,
    distractors: asStringArray(item.options).filter((opt) => opt !== answer),
    difficulty: 'medium',
    gameItemIndex: index,
  }
}

function cardsFromGameItems(
  gameType: string,
  items: Array<Record<string, unknown>>,
  units: KnowledgeUnit[]
): RevisionDeckCard[] {
  const cards: RevisionDeckCard[] = []

  items.forEach((item, index) => {
    const unitId = unitIdForIndex(units, index)
    let card: RevisionDeckCard | null = null

    switch (gameType) {
      case 'flashcards':
        card = cardFromFlashcardItem(item, index, unitId)
        break
      case 'matching':
        card = cardFromMatchingItem(item, index, unitId)
        break
      case 'fill_blank':
        card = cardFromFillBlankItem(item, index, unitId)
        break
      case 'quiz':
        card = cardFromQuizItem(item, index, unitId)
        break
      default:
        card =
          cardFromQuizItem(item, index, unitId) ??
          cardFromFlashcardItem(item, index, unitId) ??
          cardFromMatchingItem(item, index, unitId) ??
          cardFromFillBlankItem(item, index, unitId) ??
          cardFromGenericItem(item, index, unitId)
    }

    if (card) cards.push(card)
  })

  return cards
}

function snippetFromExtractedText(extractedText: string, term: string): string | undefined {
  const trimmed = extractedText.trim()
  if (trimmed.length < 40) return undefined
  const lower = trimmed.toLowerCase()
  const needle = term.toLowerCase()
  const index = lower.indexOf(needle)
  if (index < 0) return undefined
  const start = Math.max(0, index - 40)
  const end = Math.min(trimmed.length, index + needle.length + 80)
  return trimmed.slice(start, end).trim()
}

/** Inject synthesized MCQ and true/false variety into flashcard-only decks. */
export function enrichFlashcardDeck(
  cards: RevisionDeckCard[],
  extractedText = ''
): RevisionDeckCard[] {
  if (cards.length < 4) return cards

  const termCards = cards.filter((c) => c.cardType === 'term_def')
  if (termCards.length < 4) return cards

  const answerPool = termCards
    .map((c) => c.answer)
    .filter((a, i, arr) => arr.findIndex((x) => x.toLowerCase() === a.toLowerCase()) === i)

  const enriched: RevisionDeckCard[] = []
  let synthMcq = 0

  cards.forEach((card, index) => {
    let next: RevisionDeckCard = { ...card }
    if (
      card.cardType === 'term_def' &&
      !card.sourceQuote &&
      extractedText.trim().length > 0
    ) {
      const quote = snippetFromExtractedText(extractedText, card.prompt)
      if (quote) next = { ...next, sourceQuote: quote }
    }
    enriched.push(next)

    if (card.cardType !== 'term_def') return

    if ((index + 1) % 3 === 0) {
      const distractors = answerPool
        .filter((a) => a.toLowerCase() !== card.answer.toLowerCase())
        .slice(0, 3)
      if (distractors.length >= 2) {
        enriched.push({
          id: `${card.id}-mcq-${synthMcq++}`,
          knowledgeUnitId: card.knowledgeUnitId,
          cardType: 'mcq',
          prompt: `What is the definition of "${card.prompt}"?`,
          answer: card.answer,
          distractors,
          explanation: card.explanation,
          difficulty: 'medium',
          tags: ['synthesized_mcq'],
          gameItemIndex: card.gameItemIndex,
        })
      }
    }

    if ((index + 1) % 5 === 0 && !card.tags?.includes('true_false')) {
      enriched.push({
        id: `${card.id}-tf-${index}`,
        knowledgeUnitId: card.knowledgeUnitId,
        cardType: 'term_def',
        prompt: `${card.prompt} is defined as: "${card.answer.slice(0, 72)}${card.answer.length > 72 ? '…' : ''}"`,
        answer: 'True',
        explanation: card.explanation,
        difficulty: 'easy',
        tags: ['true_false', 'flashcard'],
        gameItemIndex: card.gameItemIndex,
      })
    }
  })

  return enriched
}

export function pickConceptCheckCardIds(cards: RevisionDeckCard[]): string[] {
  if (cards.length === 0) return []

  const byType = {
    mcq: cards.filter((card) => card.cardType === 'mcq'),
    term: cards.filter((card) => card.cardType === 'term_def'),
    other: cards.filter(
      (card) => card.cardType !== 'mcq' && card.cardType !== 'term_def'
    ),
  }

  const pool = [
    byType.mcq.find((card) => card.difficulty === 'easy') ?? byType.mcq[0],
    byType.term[0] ?? byType.other[0],
    byType.mcq.find((card) => card.difficulty === 'medium') ??
      byType.mcq[1] ??
      byType.other[1],
  ].filter((card): card is RevisionDeckCard => Boolean(card))

  const unique: RevisionDeckCard[] = []
  for (const card of pool) {
    if (!unique.some((existing) => existing.id === card.id)) {
      unique.push(card)
    }
    if (unique.length >= 3) break
  }

  if (unique.length < 3) {
    for (const card of cards) {
      if (unique.length >= 3) break
      if (!unique.some((existing) => existing.id === card.id)) {
        unique.push(card)
      }
    }
  }

  return unique.slice(0, 3).map((card) => card.id)
}

export function buildRevisionDeckFromGame(input: BuildDeckInput): RevisionDeck {
  const gameType = input.gameData.gameType || 'quiz'
  const title = input.gameData.title?.trim() || 'Study Deck'
  const topicLabel =
    input.topic?.trim() ||
    asString(input.gameData.metadata?.topic) ||
    title
  const items = (Array.isArray(input.gameData.items) ? input.gameData.items : [])
    .map(asDeckItemRecord)
  const knowledgeUnits = buildKnowledgeUnits(
    topicLabel,
    input.entityLabels
  )
  const rawCards = cardsFromGameItems(gameType, items, knowledgeUnits)
  const cards =
    gameType === 'flashcards'
      ? enrichFlashcardDeck(rawCards, input.extractedText)
      : rawCards

  return {
    title,
    topicLabel,
    sourceType: input.sourceType,
    notes: buildNotes(input.extractedText, topicLabel),
    knowledgeUnits,
    cards,
    conceptCheckCardIds: pickConceptCheckCardIds(cards),
    linkedGameId: input.linkedGameId,
    gameType,
    librarySaved: false,
  }
}
