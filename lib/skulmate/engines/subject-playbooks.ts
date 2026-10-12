/**
 * Subject playbooks for the local focusing tutor.
 * Curriculum-first. Notes are optional extra context, never a requirement.
 */

import type { CorpusUnit } from '../curriculum-corpus'
import type { DisplayKind } from '../display-contract'
import type { PracticeSurface } from '../surface-contract'
import type { WhiteboardPayload } from '../whiteboard-contract'
import type { AssistanceLevel, PedagogyMove } from '../pedagogy'

export type PlaybookTurn = {
  message: string
  move: PedagogyMove
  assistance: AssistanceLevel
  misconception: string | null
  conceptId: string
  board?: WhiteboardPayload | null
  surface?: PracticeSurface | null
  displayHint: DisplayKind
  imagePrompt: string
}

export function planSubjectPlaybook(input: {
  unit: CorpusUnit
  message: string
  userCount: number
  lastAssistant: string
  fr: boolean
  wantsImage?: boolean
}): PlaybookTurn {
  const { unit, message, userCount, lastAssistant, fr, wantsImage } = input
  const last = lastAssistant.toLowerCase()
  const pick = parsePick(message)
  const afterCheck = /tap|appuie|which|quelle|first|premier/i.test(last)
  const afterTransfer = /same idea|même idée|new problem|nouveau/i.test(last)

  if (wantsImage && userCount <= 2) {
    return seeTurn(unit, fr)
  }
  if (userCount <= 1 && !pick) {
    return focusTurn(unit, fr)
  }
  if (afterCheck || pick) {
    if (isCorrectPick(unit, message, pick, fr)) {
      return transferTurn(unit, fr)
    }
    return bridgeTurn(unit, fr)
  }
  if (afterTransfer) {
    return focusTurn(unit, fr)
  }
  return checkTurn(unit, fr)
}

function focusTurn(unit: CorpusUnit, fr: boolean): PlaybookTurn {
  const message = fr ? unit.focusing.fr : unit.focusing.en
  return {
    message,
    move: 'focus',
    assistance: 'none',
    misconception: null,
    conceptId: unit.conceptId,
    displayHint: unit.displayHint === 'board' ? 'board' : unit.displayHint === 'timeline' ? 'timeline' : 'diagram',
    imagePrompt: unit.imagePrompt,
    board: {
      title: unit.title,
      steps: [
        { kind: 'heading', text: unit.title },
        { kind: unit.displayHint === 'board' ? 'diagram' : 'note', text: clip(unit.content, 140) },
        { kind: 'prompt', text: message },
      ],
    },
  }
}

function seeTurn(unit: CorpusUnit, fr: boolean): PlaybookTurn {
  const message = fr
    ? `Voici l’idée en image. ${unit.focusing.fr}`
    : `Here is the idea as a picture. ${unit.focusing.en}`
  return {
    message,
    move: 'scaffold',
    assistance: 'hint',
    misconception: null,
    conceptId: unit.conceptId,
    displayHint: 'image',
    imagePrompt: unit.imagePrompt,
    board: {
      title: unit.title,
      steps: [
        { kind: 'diagram', text: clip(unit.content, 120) },
        { kind: 'prompt', text: message },
      ],
    },
  }
}

function checkTurn(unit: CorpusUnit, fr: boolean): PlaybookTurn {
  const q = fr ? unit.check.question.fr : unit.check.question.en
  const options = fr ? unit.check.options.fr : unit.check.options.en
  const surface: PracticeSurface = {
    gameType: 'quiz',
    title: fr ? 'À toi' : 'Your move',
    conceptId: unit.conceptId,
    items: [{ question: q, options, correctAnswer: unit.check.correct }],
  }
  const message = fr
    ? `${q} Appuie, puis dis pourquoi.`
    : `${q} Tap, then say why.`
  return {
    message,
    move: 'check',
    assistance: 'hint',
    misconception: null,
    conceptId: unit.conceptId,
    displayHint: 'play',
    imagePrompt: unit.imagePrompt,
    board: {
      title: unit.title,
      steps: [
        { kind: 'heading', text: unit.title },
        { kind: 'prompt', text: message },
      ],
    },
    surface,
  }
}

function bridgeTurn(unit: CorpusUnit, fr: boolean): PlaybookTurn {
  const misconception = fr ? unit.misconception.fr : unit.misconception.en
  const message = fr
    ? `Cette idée bloque souvent ici: ${misconception.toLowerCase()}. ${unit.focusing.fr}`
    : `This idea often sticks here: ${misconception.toLowerCase()}. ${unit.focusing.en}`
  return {
    message,
    move: 'scaffold',
    assistance: 'hint',
    misconception,
    conceptId: unit.conceptId,
    displayHint: unit.displayHint === 'play' ? 'diagram' : unit.displayHint,
    imagePrompt: unit.imagePrompt,
    board: {
      title: unit.title,
      steps: [
        { kind: 'note', text: misconception },
        { kind: 'prompt', text: message },
      ],
    },
  }
}

function transferTurn(unit: CorpusUnit, fr: boolean): PlaybookTurn {
  const message = fr ? unit.transfer.fr : unit.transfer.en
  return {
    message,
    move: 'independent',
    assistance: 'none',
    misconception: null,
    conceptId: unit.conceptId,
    displayHint: unit.displayHint,
    imagePrompt: unit.imagePrompt,
    board: {
      title: fr ? 'Même idée' : 'Same idea',
      steps: [{ kind: 'prompt', text: message }],
    },
  }
}

function parsePick(message: string): string {
  const match = message.match(/(?:picked|choisi)\s*:\s*(.+)/i)
  return (match?.[1] || '').trim()
}

function isCorrectPick(unit: CorpusUnit, said: string, pick: string, fr: boolean): boolean {
  const options = fr ? unit.check.options.fr : unit.check.options.en
  const correct = options[unit.check.correct] || ''
  const blob = `${said} ${pick}`.toLowerCase()
  if (correct && blob.includes(correct.toLowerCase().slice(0, 18))) return true
  return false
}

function clip(text: string, n: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= n ? clean : `${clean.slice(0, n - 1)}…`
}
