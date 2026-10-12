/**
 * Offline / no-key focusing tutor, mapped from Aristotle:
 * focusing questions, playable check, Bridge on a miss, then an independent
 * transfer. Curriculum-first. Optional uploads are extra context.
 */

import { compileAdaptiveSurface } from '../content-to-ui'
import { retrieveCurriculum, unitByConcept } from '../curriculum-corpus'
import { wantsVisualization } from '../display-contract'
import type { LearnerMemory } from '../learner-memory'
import { constantTile, nextLineShape } from '../lesson-visual'
import { diagnoseBridge, type AssistanceLevel, type PedagogyMove } from '../pedagogy'
import type { PracticeSurface } from '../surface-contract'
import type { WhiteboardPayload } from '../whiteboard-contract'
import { planSubjectPlaybook } from './subject-playbooks'

type LocalPolicy = {
  message: string
  move: PedagogyMove
  speak: boolean
  assistance: AssistanceLevel
  misconception: string | null
  conceptId: string | null
  board?: WhiteboardPayload | null
  tool?: {
    name: 'spawn_surface' | 'escalate_tutor' | 'draw_board' | 'retrieve_notes' | 'retrieve_context' | 'show_image'
    conceptId?: string
    surfaceType?: string
  } | null
  model: string
  attempts: number
  surface?: PracticeSurface | null
  displayHint?: string | null
  imagePrompt?: string | null
}

const LINEAR = /(-?\d*)\s*[xX]\s*([+-]\s*\d+)?\s*=\s*(-?\d+(?:\.\d+)?)/g
const TRANSFER = '5x+1=16'
const CONCEPT = 'algebra:linear-undo'

export type LocalTurnInput = {
  userMessage: string
  suggestedMove: PedagogyMove
  language?: string
  notes?: string
  recentTurns?: Array<{ role: string; text?: string | null }>
  subjectId?: string | null
  memory?: LearnerMemory | null
}

export function planLocalTurn(input: LocalTurnInput): LocalPolicy {
  const fr = (input.language || '').toLowerCase().startsWith('fr')
  const turns = input.recentTurns || []
  const userCount = turns.filter((t) => t.role === 'user').length
  const haystack = [
    input.userMessage,
    input.notes || '',
    ...turns.map((t) => t.text || ''),
  ].join('\n')
  const currentEq = findEquation(`${input.userMessage}\n${input.notes || ''}`)
  const threadEq = currentEq || findEquation(haystack)
  const notes = (input.notes || '').replace(/\s+/g, ' ').trim()
  const lastAssistant = lastText(turns, 'assistant')
  const wantsImage = wantsVisualization(input.userMessage)
  const subjectId =
    input.subjectId ||
    input.memory?.subjectId ||
    inferSubject(input.userMessage)

  const curriculumHits = retrieveCurriculum({
    query: wantsImage ? `${input.userMessage}\n${haystack}` : input.userMessage,
    subjectId,
    limit: 3,
  })
  const unit =
    unitByConcept(curriculumHits[0]?.conceptId) ||
    unitByConcept(input.memory?.challenges[0]?.conceptId)
  const offAlgebra = Boolean(unit && unit.conceptId !== CONCEPT)

  if (currentEq || (threadEq && !offAlgebra)) {
    return withDisplay(
      planEquation({
        eq: currentEq || threadEq!,
        message: input.userMessage,
        userCount,
        fr,
        lastAssistant,
      }),
      wantsImage ? 'image' : 'board'
    )
  }

  if (unit) {
    const sameConcept = turns.filter((t) =>
      (t.text || '').toLowerCase().includes((unit.title.split(' ')[0] || '').toLowerCase())
    )
    const play = planSubjectPlaybook({
      unit,
      message: input.userMessage,
      userCount: Math.max(1, sameConcept.length) || 1,
      lastAssistant,
      fr,
      wantsImage,
    })
    return turn({
      message: play.message,
      move: play.move,
      assistance: play.assistance,
      misconception: play.misconception,
      conceptId: play.conceptId,
      board: play.board,
      surface: play.surface,
      displayHint: play.displayHint,
      imagePrompt: play.imagePrompt,
      tool: play.surface
        ? { name: 'spawn_surface', conceptId: play.conceptId, surfaceType: 'quiz' }
        : play.displayHint === 'image'
          ? { name: 'show_image', conceptId: play.conceptId }
          : { name: 'draw_board', conceptId: play.conceptId },
    })
  }

  if (notes) {
    return withDisplay(planFromNotes(notes, input.userMessage, userCount, fr), 'play')
  }

  return planOpen(input.userMessage, input.suggestedMove, userCount, fr, subjectId)
}

function planEquation(input: {
  eq: { left: string; raw: string }
  message: string
  userCount: number
  fr: boolean
  lastAssistant: string
}): LocalPolicy {
  const { eq, message, userCount, fr, lastAssistant } = input
  const said = message.toLowerCase()
  const namedUnknown = /\bx\b|inconnue|unknown/.test(said)
  const pick = parsePick(message)
  const last = lastAssistant.toLowerCase()
  const afterCheck = /without giving x|sans donner x|first move|premier geste|tap one|appuie/i.test(
    last
  )
  const afterNextLine = /next line|prochaine ligne/.test(last)
  const afterTransfer = /same idea|même idée|new problem|nouveau problème/.test(last)

  if (userCount <= 1 && !namedUnknown && !pick) {
    return isolateTurn(eq, fr)
  }

  if (afterNextLine) {
    return transferTurn(fr)
  }

  if (afterCheck || pick) {
    if (isCorrectFirstMove(said, pick)) {
      return nextLineTurn(eq, fr)
    }
    return bridgeWrongTurn(eq, pick || said, fr)
  }

  if (afterTransfer && !namedUnknown) {
    return isolateTurn(eq, fr)
  }

  return firstMovePlay(eq, fr)
}

function isolateTurn(eq: { raw: string }, fr: boolean): LocalPolicy {
  const messageText = fr
    ? `Tu as ${eq.raw}. Qu’est-ce que tu veux isoler, avant de toucher aux nombres ? Ne calcule pas encore.`
    : `You have ${eq.raw}. What are you trying to isolate, before you touch the numbers? Do not compute yet.`
  return turn({
    message: messageText,
    move: 'focus',
    displayHint: 'board',
    board: {
      title: eq.raw,
      steps: [
        { kind: 'equation', text: eq.raw },
        { kind: 'diagram', text: 'isolate:x' },
        {
          kind: 'prompt',
          text: fr ? 'Nomme ce que tu veux seul d’un côté.' : 'Name what you want standing alone.',
        },
      ],
    },
  })
}

function firstMovePlay(eq: { raw: string }, fr: boolean): LocalPolicy {
  const quiz = firstMoveQuiz(eq, fr)
  const messageText = fr
    ? `Sur ${eq.raw}, quel premier geste garde le sens de x, et pourquoi celui-là ? Appuie, puis dis pourquoi. Ne donne pas x.`
    : `On ${eq.raw}, which first move keeps the meaning of x, and why that one? Tap, then say why. Do not give x.`
  return turn({
    message: messageText,
    move: 'check',
    assistance: 'hint',
    conceptId: CONCEPT,
    displayHint: 'play',
    board: {
      title: eq.raw,
      steps: [
        { kind: 'equation', text: eq.raw },
        { kind: 'diagram', text: `highlight:${constantTile(eq.raw) || '+3'}` },
        {
          kind: 'prompt',
          text: fr ? 'Justifie le premier geste. Pas le résultat.' : 'Justify the first move. Not the result.',
        },
      ],
    },
    tool: { name: 'spawn_surface', conceptId: CONCEPT, surfaceType: 'quiz' },
    surface: quiz,
  })
}

function firstMoveQuiz(eq: { raw: string }, fr: boolean): PracticeSurface {
  return {
    gameType: 'quiz',
    title: fr ? 'Premier geste' : 'First move',
    conceptId: CONCEPT,
    items: [
      {
        question: fr
          ? `Sur ${eq.raw}, tu commences par quoi, et pourquoi ?`
          : `On ${eq.raw}, what do you start with, and why?`,
        options: fr
          ? [
              'Enlever le terme constant',
              'Diviser par le coefficient de x',
              'Inverser les deux côtés',
              'Deviner x',
            ]
          : [
              'Undo the constant term',
              'Divide by the coefficient of x',
              'Flip both sides',
              'Guess x',
            ],
        correctAnswer: 0,
      },
    ],
  }
}

function nextLineTurn(eq: { raw: string }, fr: boolean): LocalPolicy {
  const messageText = fr
    ? `Tu as choisi d’enlever le constant. En tes mots, pourquoi ça avant de diviser ? Puis écris la prochaine ligne de ${eq.raw}, sans résoudre x.`
    : `You chose undoing the constant. In your own words, why that before dividing? Then write the next line of ${eq.raw}, still without solving for x.`
  return turn({
    message: messageText,
    move: 'scaffold',
    assistance: 'hint',
    conceptId: CONCEPT,
    displayHint: 'board',
    board: {
      title: eq.raw,
      steps: [
        { kind: 'equation', text: eq.raw },
        { kind: 'equation', text: nextLineShape(eq.raw) },
        { kind: 'diagram', text: 'next-line' },
        {
          kind: 'prompt',
          text: fr ? 'Prochaine ligne, pas la valeur de x.' : 'Next line, not the value of x.',
        },
      ],
    },
  })
}

function bridgeWrongTurn(eq: { raw: string }, picked: string, fr: boolean): LocalPolicy {
  const bridge = diagnoseBridge({ studentMessage: picked, lastMiss: true })
  const lower = picked.toLowerCase()
  let messageText: string
  let misconception = bridge.misconception.replace(/—/g, ',')
  if (/divide|divis|coefficient/.test(lower)) {
    misconception = fr
      ? 'Ils divisent alors qu’un terme est encore ajouté à x'
      : 'They divide while a term is still added to x'
    messageText = fr
      ? `Si tu divises les deux côtés maintenant, qu’est-ce qui reste collé à x sur ${eq.raw} ? Dis-le, sans calculer.`
      : `If you divide both sides now, what is still sitting with x on ${eq.raw}? Say it, without computing.`
    return turn({
      message: messageText,
      move: 'scaffold',
      assistance: 'hint',
      misconception,
      conceptId: CONCEPT,
      displayHint: 'board',
      board: {
        title: eq.raw,
        steps: [
          { kind: 'equation', text: eq.raw },
          { kind: 'diagram', text: `glued:${constantTile(eq.raw) || '+3'}` },
          { kind: 'prompt', text: messageText },
        ],
      },
    })
  } else if (/flip|invers/.test(lower)) {
    misconception = fr
      ? 'Ils traitent le égal comme un échange de côtés'
      : 'They treat equals as swapping the two sides'
    messageText = fr
      ? `Le signe égal, sur ${eq.raw}, t’autorise à faire quoi exactement, sans échanger au hasard ?`
      : `On ${eq.raw}, what does the equals sign actually let you do, without swapping at random?`
    return turn({
      message: messageText,
      move: 'scaffold',
      assistance: 'hint',
      misconception,
      conceptId: CONCEPT,
      displayHint: 'board',
      board: {
        title: eq.raw,
        steps: [
          { kind: 'equation', text: eq.raw },
          { kind: 'diagram', text: 'flip' },
          { kind: 'prompt', text: messageText },
        ],
      },
    })
  } else {
    misconception = fr
      ? 'Ils sautent les opérations inverses'
      : 'They skip inverse operations'
    messageText = fr
      ? `Sans deviner x, quel serait un premier geste légal sur ${eq.raw}, et pourquoi ?`
      : `Without guessing x, what would a first legal move look like on ${eq.raw}, and why?`
    return turn({
      message: messageText,
      move: 'scaffold',
      assistance: 'hint',
      misconception,
      conceptId: CONCEPT,
      displayHint: 'board',
      board: {
        title: eq.raw,
        steps: [
          { kind: 'equation', text: eq.raw },
          { kind: 'diagram', text: `highlight:${constantTile(eq.raw) || '+3'}` },
          { kind: 'prompt', text: messageText },
        ],
      },
    })
  }
}

function transferTurn(fr: boolean): LocalPolicy {
  const messageText = fr
    ? `Nouveau problème, même idée. Tu as ${TRANSFER}. Qu’est-ce que ça te demande de faire, à toi, sans calculer ?`
    : `New problem, same idea. You have ${TRANSFER}. What is this asking you to do, in your words, without computing?`
  return turn({
    message: messageText,
    move: 'independent',
    assistance: 'none',
    conceptId: CONCEPT,
    displayHint: 'board',
    board: {
      title: TRANSFER,
      steps: [
        { kind: 'equation', text: TRANSFER },
        { kind: 'diagram', text: 'transfer' },
        {
          kind: 'prompt',
          text: fr ? 'Isole, ne calcule pas.' : 'Name the isolate. Do not compute.',
        },
      ],
    },
  })
}

function planFromNotes(notes: string, message: string, userCount: number, fr: boolean): LocalPolicy {
  const adaptive = compileAdaptiveSurface({ notes, language: fr ? 'fr' : 'en' })
  if (userCount <= 1 && adaptive) {
    return turn({
      message: adaptive.message,
      move: 'check',
      assistance: 'hint',
      board: adaptive.board,
      surface: adaptive.surface,
      displayHint: 'play',
      tool: {
        name: 'spawn_surface',
        conceptId: adaptive.surface.conceptId,
        surfaceType: 'quiz',
      },
      conceptId: adaptive.surface.conceptId,
    })
  }
  const snippet = notes.slice(0, 90)
  if (userCount <= 1) {
    const messageText = fr
      ? `Tu as collé: “${snippet}”. Quelle phrase tu comprends déjà, et laquelle bloque ?`
      : `You pasted: “${snippet}”. Which sentence do you already get, and which one is stuck?`
    return turn({
      message: messageText,
      move: 'focus',
      displayHint: 'conversation',
      board: {
        title: fr ? 'À déballer' : 'Unpack this',
        steps: [
          { kind: 'note', text: snippet },
          { kind: 'prompt', text: fr ? 'Montre-moi la phrase bloquée.' : 'Show me the stuck sentence.' },
        ],
      },
    })
  }
  const messageText = fr
    ? `Reprends ce que tu viens de dire. Quelle est la toute première étape, en une phrase ?`
    : `Take what you just said. What is the very first step, in one sentence?`
  return turn({
    message: messageText,
    move: 'scaffold',
    assistance: 'hint',
    displayHint: 'conversation',
    board: {
      title: fr ? 'Micro-étape' : 'Tiny step',
      steps: [{ kind: 'prompt', text: messageText }],
    },
  })
}

function planOpen(
  message: string,
  suggested: PedagogyMove,
  userCount: number,
  fr: boolean,
  subjectId?: string | null
): LocalPolicy {
  const clip = message.replace(/\s+/g, ' ').trim().slice(0, 80)
  const subject = subjectId ? ` ${subjectId}` : ''
  if (userCount <= 1) {
    const messageText = fr
      ? `Tu travailles sur${subject}: “${clip}”. Qu’est-ce que tu as déjà essayé, concrètement ?`
      : `You’re working on${subject}: “${clip}”. What have you already tried, concretely?`
    return turn({
      message: messageText,
      move: 'focus',
      displayHint: 'conversation',
      imagePrompt: `Study scene about ${clip || subjectId || 'learning'}. Flat vector, navy and sky, white background, no text.`,
      board: {
        title: fr ? 'On commence' : 'We start',
        steps: [{ kind: 'prompt', text: messageText }],
      },
    })
  }
  const messageText = fr
    ? 'Dis-moi seulement la prochaine micro-étape. Pas le résultat final.'
    : 'Tell me only the next tiny step. Not the final result.'
  return turn({
    message: messageText,
    move: suggested === 'check' ? 'check' : 'scaffold',
    assistance: 'hint',
    displayHint: 'conversation',
    board: {
      title: fr ? 'Micro-étape' : 'Tiny step',
      steps: [{ kind: 'prompt', text: messageText }],
    },
  })
}

function findEquation(text: string): { left: string; raw: string } | null {
  const matches = [...text.matchAll(LINEAR)]
  const match = matches[matches.length - 1]
  if (!match) return null
  return { left: match[0].replace(/\s+/g, ''), raw: match[0].replace(/\s+/g, ' ').trim() }
}

function lastText(
  turns: Array<{ role: string; text?: string | null }>,
  role: string
): string {
  for (let i = turns.length - 1; i >= 0; i--) {
    if (turns[i].role === role) return turns[i].text || ''
  }
  return ''
}

function parsePick(message: string): string {
  const match = message.match(/(?:picked|choisi)\s*:\s*(.+)/i)
  return (match?.[1] || '').trim()
}

function isCorrectFirstMove(said: string, pick: string): boolean {
  const blob = `${said} ${pick}`.toLowerCase()
  return /constant|subtract|minus|enlever|soustrair|terme constant/.test(blob)
}

function inferSubject(text: string): string | null {
  const lower = text.toLowerCase()
  if (/photo|chloro|osmosis|cell/.test(lower)) return 'biology'
  if (/force|newton|ramp/.test(lower)) return 'physics'
  if (/percent|%|equation|algebra/.test(lower)) return 'maths'
  if (/demand|price|market/.test(lower)) return 'economics'
  if (/variable|python|loop/.test(lower)) return 'cs'
  return null
}

function withDisplay(policy: LocalPolicy, hint: string): LocalPolicy {
  return { ...policy, displayHint: policy.displayHint || hint }
}

function turn(
  partial: Omit<LocalPolicy, 'speak' | 'model' | 'attempts' | 'misconception' | 'conceptId' | 'assistance'> &
    Partial<LocalPolicy>
): LocalPolicy {
  return {
    speak: true,
    assistance: 'none',
    misconception: null,
    conceptId: partial.tool?.conceptId || partial.conceptId || null,
    model: 'local',
    attempts: 0,
    displayHint: partial.displayHint || null,
    imagePrompt: partial.imagePrompt || null,
    ...partial,
  }
}
