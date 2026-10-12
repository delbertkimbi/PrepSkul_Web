/**
 * Model-backed teaching verifier.
 *
 * Regex in pedagogy.ts is a safety net, not the tutor. The policy model
 * teaches; this engine judges the turn against Aristotle-class rules and
 * the learner's region pack. If the model is down, heuristics still block
 * answer dumps and funneling.
 */

import { getSkulMateApiKeys } from '../auth'
import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import { getEngineConfig } from './registry'
import {
  focusingRewrite,
  verifyTutorTurn,
  type AssistanceLevel,
  type PedagogyMove,
  type PedagogyVerdict,
} from '../pedagogy'

export const VERIFIER_SYSTEM = `You judge a tutor turn. You do not teach.

Return JSON only:
{"ok": true} or {"ok": false, "reason": "funneling"|"answer_dump"|"overhelp"|"lecture"|"off_voice", "rewrite": "short focusing line in the student's language"}

Rules:
- Focusing questions are good. Funneling ("what do you get?", fill-in-the-blank, leading yes/no) is bad.
- Dumping the final answer is bad unless move is instruct AND unproductiveStruggle is true, or move is escalate.
- Long lectures while the student sits silent are bad.
- Rewrite must keep them working. Never include the numeric/final answer.
- Respect the region pack for names of exams/classes, but do not force exam talk.`

export type VerifierInput = {
  message: string
  move: PedagogyMove
  assistance?: AssistanceLevel
  unproductiveStruggle?: boolean
  studentMessage?: string
  regionNotes?: string
}

export type VerifierClient = (args: {
  system: string
  user: string
  model: string
}) => Promise<string>

function heuristicGuard(input: VerifierInput): PedagogyVerdict {
  return verifyTutorTurn({
    message: input.message,
    move: input.move,
    assistance: input.assistance,
    unproductiveStruggle: input.unproductiveStruggle,
  })
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer)
    }),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error('verifier-timeout')), ms)
    }),
  ])
}

function parseVerdict(raw: string, studentMessage: string): PedagogyVerdict | null {
  try {
    const parsed = JSON.parse(
      raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    )
    if (parsed.ok === true) return { ok: true }
    if (parsed.ok === false) {
      const rewrite =
        typeof parsed.rewrite === 'string' && parsed.rewrite.trim()
          ? parsed.rewrite.trim()
          : focusingRewrite(studentMessage)
      return {
        ok: false,
        reason: typeof parsed.reason === 'string' ? parsed.reason : 'rewrite',
        rewrite,
      }
    }
  } catch {
    return null
  }
  return null
}

async function defaultClient(args: {
  system: string
  user: string
  model: string
}): Promise<string> {
  const keys = getSkulMateApiKeys()
  let lastError: unknown
  for (const key of keys) {
    try {
      const response = await callOpenRouterWithKey(key, {
        model: args.model,
        messages: [
          { role: 'system', content: args.system },
          { role: 'user', content: args.user },
        ],
        temperature: 0,
        max_tokens: 220,
        response_format: { type: 'json_object' },
      })
      return response.choices?.[0]?.message?.content || '{}'
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('verifier unavailable')
}

export async function verifyTutorTurnWithEngine(
  input: VerifierInput,
  client: VerifierClient = defaultClient
): Promise<PedagogyVerdict> {
  const safety = heuristicGuard(input)
  const timeoutMs = getEngineConfig('verifier').timeoutMs

  const user = [
    `MOVE: ${input.move}`,
    `ASSISTANCE: ${input.assistance || 'none'}`,
    `UNPRODUCTIVE_STRUGGLE: ${Boolean(input.unproductiveStruggle)}`,
    input.regionNotes ? `REGION:\n${input.regionNotes}` : '',
    `STUDENT SAID:\n${input.studentMessage || ''}`,
    `TUTOR SAID:\n${input.message}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  let modelVerdict: PedagogyVerdict | null = null
  try {
    const raw = await withTimeout(
      client({
        system: VERIFIER_SYSTEM,
        user,
        model: getEngineConfig('verifier').model,
      }),
      timeoutMs
    )
    modelVerdict = parseVerdict(raw, input.studentMessage || '')
  } catch {
    modelVerdict = null
  }

  if (!safety.ok) return safety
  if (modelVerdict && !modelVerdict.ok) return modelVerdict
  return { ok: true }
}
