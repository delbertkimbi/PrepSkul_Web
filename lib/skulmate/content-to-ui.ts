/**
 * Content-to-UI: turn a teaching source into a board + playable check.
 * Curriculum is primary. Optional uploads are extra context.
 */

import type { PracticeSurface } from './surface-contract'
import type { WhiteboardPayload } from './whiteboard-contract'

export type AdaptiveUi = {
  message: string
  board: WhiteboardPayload
  surface: PracticeSurface
}

export function sentencesFromNotes(notes: string): string[] {
  return notes
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
}

export function compileAdaptiveSurface(input: {
  notes: string
  language?: string
}): AdaptiveUi | null {
  const fr = (input.language || '').toLowerCase().startsWith('fr')
  const sentences = sentencesFromNotes(input.notes)
  if (sentences.length < 2) return null
  const known = clip(sentences[0], 90)
  const stuck = clip(sentences[1], 90)
  const question = fr
    ? 'Quelle idée on unpack en premier ?'
    : 'Which idea should we unpack first?'
  const surface: PracticeSurface = {
    gameType: 'quiz',
    title: fr ? 'À déballer' : 'Unpack this',
    conceptId: 'open:stuck-line',
    items: [
      {
        question,
        options: [
          stuck,
          known,
          fr ? 'Sauter à la réponse' : 'Skip to the answer',
          fr ? 'Ce n’est pas ça' : 'That is not it',
        ],
        correctAnswer: 0,
      },
    ],
  }
  const message = fr
    ? 'Appuie sur l’idée qui bloque. Parle si tu préfères.'
    : 'Tap the idea that is stuck. Talk if you would rather.'
  return {
    message,
    board: {
      title: fr ? 'À déballer' : 'Unpack this',
      steps: [
        { kind: 'note', text: known },
        { kind: 'note', text: stuck },
        {
          kind: 'prompt',
          text: fr ? 'Montre l’idée bloquée. Ne récite pas.' : 'Show the stuck idea. Do not recite.',
        },
      ],
    },
    surface,
  }
}

function clip(text: string, n: number): string {
  return text.length <= n ? text : `${text.slice(0, n - 1)}…`
}
