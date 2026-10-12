/**
 * Turn the current board into something a learner can see, not only read.
 * The picture follows the tutoring beat so the board is not a static poster.
 */

import type { PedagogyMove } from './pedagogy'
import type { WhiteboardPayload } from './whiteboard-contract'

const LINEAR = /(-?\d*)\s*[xX]\s*([+-]\s*\d+)?\s*=\s*(-?\d+(?:\.\d+)?)/

export type VisualBeat =
  | 'open'
  | 'isolate'
  | 'first-move'
  | 'glued'
  | 'flip'
  | 'next-line'
  | 'transfer'
  | 'notes'
  | 'prompt'

export type BalanceVisual = {
  kind: 'balance'
  beat: VisualBeat
  title: string
  raw: string
  left: string[]
  right: string[]
  highlight?: string
  caption?: string
  imagePrompt: string
}

export type LinesVisual = {
  kind: 'lines'
  beat: 'next-line'
  title: string
  lines: Array<{ text: string; faded?: boolean }>
  caption?: string
  imagePrompt: string
}

export type NotesVisual = {
  kind: 'notes'
  beat: 'notes'
  title: string
  cards: string[]
  imagePrompt: string
}

export type PromptVisual = {
  kind: 'prompt'
  beat: 'open' | 'prompt'
  title: string
  prompt: string
  imagePrompt: string
}

export type LessonVisual = BalanceVisual | LinesVisual | NotesVisual | PromptVisual

export function parseBalanceEquation(text: string): { raw: string; left: string[]; right: string[] } | null {
  const source = (text || '').replace(/\s+/g, ' ').trim()
  if (!source) return null
  const match = source.match(LINEAR)
  if (match) {
    const coefRaw = match[1]
    const coef =
      coefRaw === '' || coefRaw === '+' ? 'x' : coefRaw === '-' ? '-x' : `${coefRaw}x`
    const left = [coef]
    if (match[2]) left.push(match[2].replace(/\s+/g, ''))
    return {
      raw: match[0].replace(/\s+/g, ' ').trim(),
      left,
      right: [match[3]],
    }
  }
  const generic = source.match(/^(.+?)\s*=\s*(.+)$/)
  if (!generic) return null
  return {
    raw: source,
    left: splitTerms(generic[1]),
    right: splitTerms(generic[2]),
  }
}

/** Shape of the next line after undoing a constant. Never the value of x. */
export function nextLineShape(raw: string): string {
  const parsed = parseBalanceEquation(raw)
  if (!parsed) return '? = ?'
  const xTerm = parsed.left.find((t) => /x/i.test(t)) || 'x'
  return `${xTerm} = ?`
}

export function constantTile(raw: string): string | null {
  const parsed = parseBalanceEquation(raw)
  if (!parsed) return null
  return parsed.left.find((t) => !/x/i.test(t)) || null
}

export function compileLessonVisual(input: {
  board?: WhiteboardPayload | null
  notes?: string
  language?: string
  move?: PedagogyMove | string | null
  message?: string
}): LessonVisual {
  const fr = (input.language || '').toLowerCase().startsWith('fr')
  const board = input.board
  const equations = (board?.steps || []).filter((step) => step.kind === 'equation')
  const diagram = (board?.steps || []).find((step) => step.kind === 'diagram')?.text || ''
  const prompt =
    board?.steps.find((step) => step.kind === 'prompt')?.text ||
    board?.title ||
    (fr ? 'Ton tableau est ici.' : 'Your board is here.')
  const beat = resolveBeat({
    diagram,
    move: input.move,
    message: `${input.message || ''} ${prompt}`,
    equationCount: equations.length,
  })

  if (beat === 'next-line' && equations.length) {
    const first = equations[0].text
    const second = equations[1]?.text || nextLineShape(first)
    return {
      kind: 'lines',
      beat: 'next-line',
      title: board?.title || first,
      lines: [
        { text: first, faded: true },
        { text: second, faded: false },
      ],
      caption: prompt,
      imagePrompt: nextLineImagePrompt(first, second),
    }
  }

  const eqStep = equations[0]
  if (eqStep) {
    const parsed = parseBalanceEquation(eqStep.text) || {
      raw: eqStep.text,
      left: [eqStep.text],
      right: ['?'],
    }
    const highlight =
      beat === 'isolate'
        ? parsed.left.find((t) => /x/i.test(t))
        : beat === 'first-move' || beat === 'glued'
          ? constantTile(parsed.raw) || undefined
          : undefined
    return {
      kind: 'balance',
      beat,
      title: board?.title || parsed.raw,
      raw: parsed.raw,
      left: parsed.left,
      right: parsed.right,
      highlight,
      caption: prompt,
      imagePrompt: balanceImagePrompt(parsed, beat),
    }
  }

  const noteSteps = (board?.steps || []).filter((step) => step.kind === 'note')
  const fromNotes = sentencesFromNotes(input.notes || '')
  const cards = noteSteps.map((step) => step.text)
  if (!cards.length && fromNotes.length) cards.push(...fromNotes.slice(0, 3))
  if (cards.length) {
    return {
      kind: 'notes',
      beat: 'notes',
      title: board?.title || (fr ? 'Tes notes' : 'Your notes'),
      cards: cards.slice(0, 4),
      imagePrompt: notesImagePrompt(cards, fr),
    }
  }

  return {
    kind: 'prompt',
    beat: beat === 'open' ? 'open' : 'prompt',
    title: board?.title || (fr ? 'Tableau' : 'Board'),
    prompt,
    imagePrompt: promptImagePrompt(prompt, fr),
  }
}

function resolveBeat(input: {
  diagram: string
  move?: PedagogyMove | string | null
  message: string
  equationCount: number
}): VisualBeat {
  const diagram = input.diagram.toLowerCase()
  if (diagram.startsWith('next-line') || diagram.includes('next-line')) return 'next-line'
  if (diagram.startsWith('glued') || diagram.includes('glued')) return 'glued'
  if (diagram.startsWith('flip') || diagram.includes('flip')) return 'flip'
  if (diagram.startsWith('transfer') || diagram.includes('transfer')) return 'transfer'
  if (diagram.startsWith('highlight') || diagram.includes('first-move')) return 'first-move'
  if (diagram.startsWith('isolate')) return 'isolate'

  const msg = input.message.toLowerCase()
  if (input.equationCount > 1 || /next line|prochaine ligne/.test(msg)) return 'next-line'
  if (/sitting with x|collé|glued/.test(msg)) return 'glued'
  if (/swap|flip|échanger|invers/.test(msg) && /equal/.test(msg)) return 'flip'
  if (input.move === 'independent' || /same idea|même idée|new problem|nouveau problème/.test(msg)) {
    return 'transfer'
  }
  if (input.move === 'check' || /first move|premier geste|tap one|appuie/.test(msg)) return 'first-move'
  if (input.move === 'focus' || /isolate|isoler|standing alone/.test(msg)) return 'isolate'
  return input.equationCount ? 'isolate' : 'open'
}

function splitTerms(side: string): string[] {
  const text = side.replace(/\s+/g, '')
  const parts = text.match(/[+-]?[^+-]+/g)
  if (!parts || !parts.length) return [side.trim()]
  return parts.map((part, i) => {
    if (i === 0) return part
    return part.startsWith('+') || part.startsWith('-') ? part : `+${part}`
  })
}

function sentencesFromNotes(notes: string): string[] {
  return notes
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
}

function balanceImagePrompt(
  parsed: { raw: string; left: string[]; right: string[] },
  beat: VisualBeat
): string {
  const focus =
    beat === 'isolate'
      ? 'Highlight the x tile as the thing to stand alone.'
      : beat === 'first-move'
        ? 'Highlight the constant tile sitting with x.'
        : beat === 'glued'
          ? 'Show the constant still glued to x.'
          : beat === 'transfer'
            ? 'A fresh equation, same balance idea.'
            : 'Clear algebra tiles on a balance scale.'
  return (
    `Educational balance scale for ${parsed.raw}. ${focus} ` +
    `Left pan ${parsed.left.join(' and ')}. Right pan ${parsed.right.join(' and ')}. ` +
    'Flat vector, navy and sky blue, white background, no text labels, no watermark.'
  )
}

function nextLineImagePrompt(first: string, second: string): string {
  return (
    `Chalkboard with the faded equation ${first} and a blank next line ${second}. ` +
    'No final value of x, flat vector, navy and sky blue, white background, no watermark.'
  )
}

function notesImagePrompt(cards: string[], fr: boolean): string {
  const topic = cards[0]?.slice(0, 80) || (fr ? 'notes de cours' : 'class notes')
  return (
    `Simple educational diagram of ${topic}. ` +
    'Two or three clear visual cards, flat vector, navy and sky blue, white background, no text, no watermark.'
  )
}

function promptImagePrompt(prompt: string, fr: boolean): string {
  const topic = prompt.slice(0, 90) || (fr ? 'apprentissage' : 'learning')
  return (
    `Friendly study scene about ${topic}. ` +
    'One clear metaphor, flat vector mascot-free objects, navy and sky blue, white background, no text, no watermark.'
  )
}
