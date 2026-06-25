/**
 * Canonical list of game types shipped in the Flutter client.
 * Keep in sync with prepskul_app skulmate_client_game_policy.dart releasedApiTypes.
 */

export const RELEASED_SHIPPED_GAME_TYPES = [
  'quiz',
  'flashcards',
  'matching',
  'fill_blank',
  'drag_drop',
  'puzzle_pieces',
] as const

export type ReleasedShippedGameType = (typeof RELEASED_SHIPPED_GAME_TYPES)[number]

export function isReleasedShippedGameType(t: string): t is ReleasedShippedGameType {
  return (RELEASED_SHIPPED_GAME_TYPES as readonly string[]).includes(t)
}

export function assertShippedGameTypeRequest(
  gameType: string
):
  | { ok: true; gameType: string }
  | { ok: false; errorCode: 'GAME_TYPE_NOT_SHIPPED'; error: string } {
  if (gameType === 'auto') return { ok: true, gameType }
  if (isReleasedShippedGameType(gameType)) return { ok: true, gameType }
  return {
    ok: false,
    errorCode: 'GAME_TYPE_NOT_SHIPPED',
    error: `Game type "${gameType}" is not available yet. Choose auto or one of: ${RELEASED_SHIPPED_GAME_TYPES.join(', ')}.`,
  }
}

/**
 * Coerce AI output to a shipped type — never persist unreleased game types.
 */
export function coerceToShippedGameType(
  emitted: string,
  recommendedGameType: string
): ReleasedShippedGameType {
  if (isReleasedShippedGameType(emitted)) return emitted
  if (isReleasedShippedGameType(recommendedGameType)) return recommendedGameType
  return 'flashcards'
}
