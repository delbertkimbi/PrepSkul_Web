/**
 * Adaptive lesson display. The board is one tool, never the only surface.
 * play | image | board | diagram | timeline | call | conversation
 */

import { compileLessonVisual, type LessonVisual } from './lesson-visual'
import type { PracticeSurface } from './surface-contract'
import { hashSeed, uniqueVisualDataUri } from './unique-visual'
import type { WhiteboardPayload } from './whiteboard-contract'

export type DisplayKind =
  | 'play'
  | 'image'
  | 'board'
  | 'diagram'
  | 'timeline'
  | 'call'
  | 'conversation'

export type AdaptiveDisplay = {
  kind: DisplayKind
  title: string
  caption?: string
  reason: string
  visual: LessonVisual
  uniqueSeed: string
  uniqueImage: string
  imagePrompt: string
  events?: string[]
  nodes?: string[]
}

export type CompileDisplayInput = {
  board?: WhiteboardPayload | null
  surface?: PracticeSurface | null
  message?: string
  move?: string | null
  language?: string
  notes?: string
  subjectId?: string | null
  conceptId?: string | null
  turnId?: string | null
  listening?: boolean
  wantsImage?: boolean
  displayHint?: DisplayKind | string | null
}

const VISUALIZE =
  /visual|picture|image|diagram|draw|see it|can't see|cannot see|don't understand|dont understand|confus|montre|image|schéma|schema|je vois pas|comprends pas/i

export function wantsVisualization(text?: string | null): boolean {
  return Boolean(text && VISUALIZE.test(text))
}

export function compileAdaptiveDisplay(input: CompileDisplayInput): AdaptiveDisplay {
  const visual = compileLessonVisual({
    board: input.board,
    notes: input.notes,
    language: input.language,
    move: input.move,
    message: input.message,
  })
  const uniqueSeed = hashSeed([
    input.turnId,
    input.conceptId,
    input.move,
    visual.kind,
    'beat' in visual ? visual.beat : '',
    (input.message || '').slice(0, 80),
  ])
  const uniqueImage = uniqueVisualDataUri(uniqueSeed, input.subjectId || input.conceptId || '')
  const imagePrompt = visual.imagePrompt
  const title = visual.title
  const caption =
    visual.kind === 'balance' || visual.kind === 'lines' || visual.kind === 'prompt'
      ? visual.kind === 'prompt'
        ? visual.prompt
        : visual.caption
      : undefined

  if (input.listening) {
    return pack('call', 'They are in a live turn. Show the live transcript, not a poster board.', {
      title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
    })
  }

  if (input.surface?.items?.length) {
    return pack('play', 'A playable check is the work this turn.', {
      title: input.surface.title || title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
    })
  }

  if (input.wantsImage || wantsVisualization(input.message)) {
    return pack('image', 'They need a picture of the idea, not more prose.', {
      title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
    })
  }

  const hint = (input.displayHint || '').toLowerCase()
  if (hint === 'timeline' || visual.kind === 'notes' && /hist|geo/.test(input.subjectId || '')) {
    return pack('timeline', 'A sequence is clearer than a board.', {
      title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
      events: eventsFrom(visual, input.board),
    })
  }
  if (hint === 'diagram' || (visual.kind !== 'balance' && /bio|chem|phys|svt/.test(input.subjectId || ''))) {
    return pack('diagram', 'A process diagram, not an algebra board.', {
      title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
      nodes: nodesFrom(visual, input.board),
    })
  }
  if (visual.kind === 'balance' || visual.kind === 'lines' || hint === 'board') {
    return pack('board', 'The board explains this relationship.', {
      title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
    })
  }
  if (hint === 'image') {
    return pack('image', 'Show a unique picture of the idea.', {
      title,
      caption,
      visual,
      uniqueSeed,
      uniqueImage,
      imagePrompt,
    })
  }

  return pack('conversation', 'Talk first. Keep a unique picture so the stage is not empty.', {
    title,
    caption,
    visual,
    uniqueSeed,
    uniqueImage,
    imagePrompt,
  })
}

function pack(
  kind: DisplayKind,
  reason: string,
  rest: Omit<AdaptiveDisplay, 'kind' | 'reason'>
): AdaptiveDisplay {
  return { kind, reason, ...rest }
}

function eventsFrom(visual: LessonVisual, board?: WhiteboardPayload | null): string[] {
  if (visual.kind === 'notes') return visual.cards.slice(0, 4)
  const notes = (board?.steps || [])
    .filter((s) => s.kind === 'note' || s.kind === 'heading')
    .map((s) => s.text)
  return notes.slice(0, 4)
}

function nodesFrom(visual: LessonVisual, board?: WhiteboardPayload | null): string[] {
  if (visual.kind === 'notes') return visual.cards.slice(0, 4)
  return (board?.steps || [])
    .filter((s) => s.kind !== 'prompt')
    .map((s) => s.text)
    .slice(0, 4)
}
