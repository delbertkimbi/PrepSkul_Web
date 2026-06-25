import {
  RELEASED_SHIPPED_GAME_TYPES,
  assertShippedGameTypeRequest,
  coerceToShippedGameType,
  isReleasedShippedGameType,
} from '@/lib/skulmate/released-game-types'

describe('released-game-types', () => {
  it('lists exactly six shipped types', () => {
    expect(RELEASED_SHIPPED_GAME_TYPES).toEqual([
      'quiz',
      'flashcards',
      'matching',
      'fill_blank',
      'drag_drop',
      'puzzle_pieces',
    ])
  })

  it('accepts auto and each shipped type', () => {
    expect(assertShippedGameTypeRequest('auto').ok).toBe(true)
    for (const t of RELEASED_SHIPPED_GAME_TYPES) {
      const result = assertShippedGameTypeRequest(t)
      expect(result.ok).toBe(true)
      if (result.ok) expect(result.gameType).toBe(t)
    }
  })

  it('rejects unreleased types with GAME_TYPE_NOT_SHIPPED', () => {
    for (const t of ['word_search', 'match3', 'diagram_label', 'crossword']) {
      const result = assertShippedGameTypeRequest(t)
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errorCode).toBe('GAME_TYPE_NOT_SHIPPED')
        expect(result.error).toContain(t)
      }
    }
  })

  it('isReleasedShippedGameType narrows correctly', () => {
    expect(isReleasedShippedGameType('quiz')).toBe(true)
    expect(isReleasedShippedGameType('word_search')).toBe(false)
  })

  it('coerceToShippedGameType keeps released output', () => {
    expect(coerceToShippedGameType('quiz', 'flashcards')).toBe('quiz')
  })

  it('coerceToShippedGameType falls back to recommended when AI emits unreleased', () => {
    expect(coerceToShippedGameType('word_search', 'matching')).toBe('matching')
  })

  it('coerceToShippedGameType falls back to flashcards when both unreleased', () => {
    expect(coerceToShippedGameType('word_search', 'match3')).toBe('flashcards')
  })
})
