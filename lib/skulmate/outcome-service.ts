import { getServiceSupabaseAdmin } from './billing'
import { computeMasteryUpdate } from './mastery'
import { upsertSkill } from './skill-map'
import { applyAssistanceLedger, clearIndependentDue } from './pedagogy'

export type OutcomeInput = {
  userId: string
  childId?: string | null
  sessionId?: string | null
  turnId?: string | null
  conceptId?: string | null
  surfaceType?: string | null
  correct: boolean
  hintUsed?: boolean
  latencyMs?: number
}

export async function recordOutcome(input: OutcomeInput): Promise<{
  masteryScore: number
  weakStreak: number
  shouldEscalate: boolean
}> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) {
    return { masteryScore: input.correct ? 1 : 0, weakStreak: input.correct ? 0 : 1, shouldEscalate: false }
  }

  await admin.from('skulmate_outcomes').insert({
    user_id: input.userId,
    child_id: input.childId ?? null,
    session_id: input.sessionId ?? null,
    turn_id: input.turnId ?? null,
    concept_id: input.conceptId ?? null,
    surface_type: input.surfaceType ?? null,
    correct: input.correct,
    hint_used: Boolean(input.hintUsed),
    latency_ms: input.latencyMs ?? null,
  })

  const conceptId = input.conceptId || 'open:general'
  let masteryQuery = admin
    .from('skulmate_concept_mastery')
    .select('mastery_score, attempts, weak_streak, correct_total, question_total')
    .eq('user_id', input.userId)
    .eq('topic_id', conceptId)
  masteryQuery = input.childId
    ? masteryQuery.eq('child_id', input.childId)
    : masteryQuery.is('child_id', null)

  const { data: existing } = await masteryQuery.maybeSingle()
  const updated = computeMasteryUpdate({
    previousScore: Number(existing?.mastery_score || 0),
    previousAttempts: Number(existing?.attempts || 0),
    previousWeakStreak: Number(existing?.weak_streak || 0),
    correctAnswers: input.correct ? 1 : 0,
    totalQuestions: 1,
  })

  const row = {
    user_id: input.userId,
    child_id: input.childId ?? null,
    topic_id: conceptId,
    mastery_score: updated.masteryScore,
    attempts: updated.attempts,
    correct_total:
      Number((existing as { correct_total?: number } | null)?.correct_total || 0) +
      (input.correct ? 1 : 0),
    question_total:
      Number((existing as { question_total?: number } | null)?.question_total || 0) + 1,
    weak_streak: updated.weakStreak,
    last_session_accuracy: updated.sessionAccuracy,
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    let update = admin
      .from('skulmate_concept_mastery')
      .update(row)
      .eq('user_id', input.userId)
      .eq('topic_id', conceptId)
    update = input.childId
      ? update.eq('child_id', input.childId)
      : update.is('child_id', null)
    await update
  } else {
    await admin.from('skulmate_concept_mastery').insert(row)
  }

  await upsertLearnerState(input, updated.weakStreak, conceptId)

  return {
    masteryScore: updated.masteryScore,
    weakStreak: updated.weakStreak,
    shouldEscalate: !input.correct && updated.weakStreak >= 3,
  }
}

async function upsertLearnerState(
  input: OutcomeInput,
  weakStreak: number,
  conceptId: string
) {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return

  let query = admin
    .from('skulmate_learner_state')
    .select('id, weak_concepts, last_successful_move, assistance_ledger, skill_map')
    .eq('user_id', input.userId)
  query = input.childId
    ? query.eq('child_id', input.childId)
    : query.is('child_id', null)

  const { data: state } = await query.maybeSingle()
  const weak = Array.isArray(state?.weak_concepts) ? [...state.weak_concepts] : []
  if (!input.correct) {
    if (!weak.some((w: { conceptId?: string }) => w.conceptId === conceptId)) {
      weak.unshift({ conceptId, weakStreak })
    }
  } else {
    const idx = weak.findIndex((w: { conceptId?: string }) => w.conceptId === conceptId)
    if (idx >= 0) weak.splice(idx, 1)
  }

  const ledger = input.correct
    ? clearIndependentDue(state?.assistance_ledger, conceptId)
    : applyAssistanceLedger(state?.assistance_ledger, conceptId, 'hint')
  const skillMap = upsertSkill(state?.skill_map, {
    id: conceptId,
    correct: input.correct,
  })

  const payload = {
    user_id: input.userId,
    child_id: input.childId ?? null,
    weak_concepts: weak.slice(0, 8),
    last_successful_move: input.correct ? 'check' : state?.last_successful_move || null,
    assistance_ledger: ledger,
    skill_map: skillMap,
    updated_at: new Date().toISOString(),
  }

  if (state?.id) {
    await admin.from('skulmate_learner_state').update(payload).eq('id', state.id)
  } else {
    await admin.from('skulmate_learner_state').insert(payload)
  }
}

export function applyOutcomeToState<T extends { weak_concepts?: unknown[] }>(
  state: T,
  conceptId: string,
  correct: boolean
): T {
  const weak = Array.isArray(state.weak_concepts)
    ? [...(state.weak_concepts as Array<{ conceptId?: string }>)]
    : []
  if (!correct) {
    if (!weak.some((w) => w.conceptId === conceptId)) {
      weak.unshift({ conceptId })
    }
  } else {
    const idx = weak.findIndex((w) => w.conceptId === conceptId)
    if (idx >= 0) weak.splice(idx, 1)
  }
  return { ...state, weak_concepts: weak.slice(0, 8) }
}
