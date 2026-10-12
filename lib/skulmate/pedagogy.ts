/**
 * SkulMate teaching protocol, mapped from Aristotle's public research:
 * ICAP (talk out loud) → focusing questions (not funneling) → Bridge
 * (error → misconception → remediation) → assistance ledger → independent check.
 *
 * Signup is learner | parent. Both are the student in the thread.
 *
 * This file is a safety net and move recommender — not the tutor.
 * The policy model teaches. engines/pedagogy-engine.ts verifies with a
 * cheap model and falls back to these heuristics when the model is down.
 */

export type PedagogyMove =
  | 'focus'
  | 'scaffold'
  | 'instruct'
  | 'check'
  | 'independent'
  | 'reteach'
  | 'escalate'

export type AssistanceLevel = 'none' | 'hint' | 'instruct'

export type AssistanceEntry = {
  conceptId: string
  level: AssistanceLevel
  independentDue: boolean
  at: string
}

export type BridgeDiagnosis = {
  error: string
  misconception: string
  strategy: 'focus' | 'scaffold' | 'instruct'
}

export type PedagogyVerdict =
  | { ok: true }
  | { ok: false; reason: string; rewrite: string }

const FUNNELING_PATTERNS = [
  /what do you get\??$/i,
  /so that cancels, and you.?re left with what/i,
  /just add .+ both sides/i,
  /we balance .+ first, right\??/i,
  /do you do the .+ first or the .+\??/i,
  /fill in the blank/i,
  /the answer is\b/i,
  /therefore the (answer|result) is\b/i,
  /equals?\s+-?\d+(\.\d+)?\s*\.?\s*$/i,
]

const ANSWER_DUMP_PATTERNS = [
  /here is the (full )?solution/i,
  /step by step solution:/i,
  /the final answer is\b/i,
  /so the answer is\b/i,
]

export function isFunnelingQuestion(text: string): boolean {
  const trimmed = text.trim()
  return FUNNELING_PATTERNS.some((re) => re.test(trimmed))
}

export function isAnswerDump(text: string): boolean {
  if (ANSWER_DUMP_PATTERNS.some((re) => re.test(text))) return true
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length > 90 && /\btherefore\b|\bhence\b|\bso the answer\b/i.test(text)) {
    return true
  }
  return false
}

export function focusingRewrite(studentMessage: string): string {
  const clipped = studentMessage.replace(/\s+/g, ' ').trim().slice(0, 80)
  if (!clipped) {
    return 'Talk me through what you want to work on. What have you already tried?'
  }
  return `Don’t give me the answer yet. Walk me through the first step you would take with: “${clipped}”. What are you noticing?`
}

export function diagnoseBridge(input: {
  studentMessage: string
  lastMiss?: boolean
  missStreak?: number
}): BridgeDiagnosis {
  const missStreak = input.missStreak ?? (input.lastMiss ? 1 : 0)
  if (missStreak >= 3) {
    return {
      error: 'Repeated misses on the same idea',
      misconception: 'The earlier prerequisite is likely missing',
      strategy: 'instruct',
    }
  }
  if (input.lastMiss || missStreak > 0) {
    return {
      error: 'Last check was wrong',
      misconception: 'A specific step in their reasoning is off. Find it before telling.',
      strategy: 'scaffold',
    }
  }
  return {
    error: 'No error yet',
    misconception: 'Unknown. Have them explain first.',
    strategy: 'focus',
  }
}

export function recommendPedagogyMove(input: {
  lastOutcomes: Array<{ concept_id?: string | null; correct: boolean }>
  independentDue?: boolean
}): PedagogyMove {
  const last = input.lastOutcomes
  if (!last.length) return 'focus'
  if (input.independentDue) return 'independent'

  const recent = last.slice(0, 3)
  const sameConcept = recent.every(
    (o) => o.concept_id && o.concept_id === recent[0].concept_id
  )
  const missStreak = recent.filter((o) => !o.correct).length
  if (sameConcept && missStreak >= 3) return 'escalate'
  if (!recent[0].correct) return 'scaffold'
  return 'check'
}

/** Back-compat for older eval names. */
export function recommendMoveFromEvidence(
  lastOutcomes: Array<{ concept_id?: string; correct: boolean }>
): PedagogyMove {
  return recommendPedagogyMove({ lastOutcomes })
}

export function verifyTutorTurn(params: {
  message: string
  move: PedagogyMove
  assistance?: AssistanceLevel
  unproductiveStruggle?: boolean
}): PedagogyVerdict {
  const message = params.message.trim()
  if (!message) {
    return {
      ok: false,
      reason: 'empty',
      rewrite: focusingRewrite(''),
    }
  }
  if (isAnswerDump(message) && params.move !== 'instruct') {
    return {
      ok: false,
      reason: 'answer_dump',
      rewrite: focusingRewrite(message),
    }
  }
  if (isFunnelingQuestion(message)) {
    return {
      ok: false,
      reason: 'funneling',
      rewrite: focusingRewrite(message),
    }
  }
  if (
    params.assistance === 'instruct' &&
    !params.unproductiveStruggle &&
    params.move !== 'escalate'
  ) {
    return {
      ok: false,
      reason: 'overhelp',
      rewrite: focusingRewrite(message),
    }
  }
  return { ok: true }
}

export function applyAssistanceLedger(
  ledger: AssistanceEntry[] | null | undefined,
  conceptId: string,
  level: AssistanceLevel
): AssistanceEntry[] {
  const next = Array.isArray(ledger) ? [...ledger] : []
  const independentDue = level !== 'none'
  const row: AssistanceEntry = {
    conceptId,
    level,
    independentDue,
    at: new Date().toISOString(),
  }
  const idx = next.findIndex((e) => e.conceptId === conceptId)
  if (idx >= 0) next[idx] = row
  else next.unshift(row)
  return next.slice(0, 12)
}

export function clearIndependentDue(
  ledger: AssistanceEntry[] | null | undefined,
  conceptId: string
): AssistanceEntry[] {
  return (ledger || []).map((e) =>
    e.conceptId === conceptId ? { ...e, independentDue: false, level: 'none' as const } : e
  )
}

export function conceptDueForIndependentCheck(
  ledger: AssistanceEntry[] | null | undefined
): string | null {
  const due = (ledger || []).find((e) => e.independentDue)
  return due?.conceptId || null
}

export const PEDAGOGY_SYSTEM = `You are SkulMate, a PrepSkul tutor. Users sign up as learners or parents; both are the student. Teach the speaker.

You are NOT a chatbot and NOT a cheatbot.
- Voice-first full duplex: they can barge in while you speak. Keep turns short.
- ICAP: they must explain out loud. Do not lecture while they sit silent.
- Focusing, not funneling. Never fill-in-the-blank. Never "what do you get?".
- Never supply the final answer unless move is instruct AFTER unproductive struggle (3+ misses) or escalate.
- Bridge: name the error, the misconception underneath, then choose focus | scaffold | instruct.
- If you lightened load (hint or instruct), mark assistance so the next turn is an independent transfer check.
- Teach from their curriculum, what they asked to study, and diagnosed challenges. Optional file uploads are extra context. Do not ask for notes. Do not stall because nothing was uploaded.
- Adaptive UI: pick play, image, board, diagram, timeline, or conversation. The board is one visualization tool, not the whole lesson.
- Unique picture every turn when they cannot see the idea. Never reuse a poster.
- Human-level in every subject. Off-script topics still get a real sequence: focusing question, visual or check, then transfer. Not a shallow quiz dump.
- JSON only.`
