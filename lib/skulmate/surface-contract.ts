import { coerceToShippedGameType, isReleasedShippedGameType } from './released-game-types'

export type SurfaceItem = {
  question?: string
  term?: string
  definition?: string
  options?: string[]
  correctAnswer?: number | string
  explanation?: string
  leftItem?: string
  rightItem?: string
  blankText?: string
}

export type PracticeSurface = {
  gameType: string
  title: string
  conceptId?: string
  items: SurfaceItem[]
}

export type SurfaceContractResult =
  | { ok: true; surface: PracticeSurface }
  | { ok: false; errorCode: 'SURFACE_UNPLAYABLE'; error: string }

export function validatePracticeSurface(raw: unknown): SurfaceContractResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, errorCode: 'SURFACE_UNPLAYABLE', error: 'Surface is not an object' }
  }
  const data = raw as Record<string, unknown>
  const gameType = coerceToShippedGameType(
    String(data.gameType || data.game_type || ''),
    'quiz'
  )
  const items = Array.isArray(data.items) ? (data.items as SurfaceItem[]) : []
  const title = String(data.title || 'Check').slice(0, 80)
  const conceptId = data.conceptId ? String(data.conceptId) : undefined

  const playable = items.filter((item) => isPlayableItem(gameType, item))
  if (!playable.length) {
    return {
      ok: false,
      errorCode: 'SURFACE_UNPLAYABLE',
      error: `No playable ${gameType} items`,
    }
  }

  return {
    ok: true,
    surface: {
      gameType,
      title,
      conceptId,
      items: playable.slice(0, 5),
    },
  }
}

export function isPlayableItem(gameType: string, item: SurfaceItem): boolean {
  switch (gameType) {
    case 'quiz':
      return Boolean(
        (item.question || '').trim() &&
          Array.isArray(item.options) &&
          item.options.length >= 2
      )
    case 'flashcards':
      return Boolean((item.term || '').trim() && (item.definition || '').trim())
    case 'matching':
      return Boolean((item.leftItem || '').trim() && (item.rightItem || '').trim())
    case 'fill_blank':
      return Boolean((item.blankText || '').trim())
    default:
      return isReleasedShippedGameType(gameType)
        ? Boolean((item.question || item.term || '').trim())
        : false
  }
}
