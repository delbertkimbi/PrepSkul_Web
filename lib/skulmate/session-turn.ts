import { curriculumScope } from './curriculum-scope'
import { getServiceSupabaseAdmin } from './billing'
import { loadAccountRole, assertOwnedChild, type SkulMateAccountRole } from './auth'
import { compileTurnContext } from './compile-turn-context'
import { retrieveTeachingContext } from './retrieve'
import { compilePracticeSurface } from './surface-compiler'
import { recordTutorTrace } from './traces'
import { runTutorAgent, type PolicyJson } from './engines/agent-loop'
import type { LearnerContextInput } from './learner-context'
import { isTutorEscalationEligible } from './tutor-escalation'
import type { PracticeSurface } from './surface-contract'
import {
  applyAssistanceLedger,
  conceptDueForIndependentCheck,
  recommendPedagogyMove,
  focusingRewrite,
  type PedagogyMove,
  type AssistanceLevel,
} from './pedagogy'
import { verifyTutorTurnWithEngine } from './engines/pedagogy-engine'
import { validateWhiteboard, boardFromFocusPrompt, type WhiteboardPayload } from './whiteboard-contract'
import { buildSessionRecap } from './session-recap'
import { compileAdaptiveDisplay, type AdaptiveDisplay } from './display-contract'
import { type LearnerMemory } from './learner-memory'

export type TutorTurnResult = {
  sessionId: string
  turnId: string
  message: string
  move: PedagogyMove
  speak: boolean
  surface?: PracticeSurface | null
  board?: WhiteboardPayload | null
  misconception?: string | null
  escalate?: boolean
  model?: string
  demo?: boolean
  display?: AdaptiveDisplay | null
  imagePrompt?: string | null
}

export async function openOrResumeSession(params: {
  userId: string
  childId?: string | null
  accountRole?: SkulMateAccountRole
  forceNew?: boolean
}): Promise<{ id: string; title: string | null; accountRole: SkulMateAccountRole }> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) throw new Error('Memory store unavailable')
  await assertOwnedChild(params.userId, params.childId)
  const accountRole = params.accountRole || (await loadAccountRole(params.userId))

  if (params.forceNew) {
    let archive = admin
      .from('skulmate_sessions')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('user_id', params.userId)
      .eq('status', 'active')
    archive = params.childId
      ? archive.eq('child_id', params.childId)
      : archive.is('child_id', null)
    await archive
  } else {
    let query = admin
      .from('skulmate_sessions')
      .select('id, title, account_role')
      .eq('user_id', params.userId)
      .eq('status', 'active')
      .order('last_turn_at', { ascending: false })
      .limit(1)
    query = params.childId
      ? query.eq('child_id', params.childId)
      : query.is('child_id', null)

    const { data: existing } = await query.maybeSingle()
    if (existing) {
      return {
        id: existing.id as string,
        title: existing.title as string | null,
        accountRole: (existing.account_role as SkulMateAccountRole) || accountRole,
      }
    }
  }

  const { data: created, error } = await admin
    .from('skulmate_sessions')
    .insert({
      user_id: params.userId,
      child_id: params.childId ?? null,
      account_role: accountRole,
      title: null,
      status: 'active',
    })
    .select('id, title, account_role')
    .single()
  if (error || !created) throw new Error(error?.message || 'Could not open session')
  return {
    id: created.id as string,
    title: created.title as string | null,
    accountRole,
  }
}

export async function listSessions(params: {
  userId: string
  childId?: string | null
}): Promise<
  Array<{
    id: string
    title: string | null
    lastTurnAt: string
    preview?: string | null
    accountRole?: SkulMateAccountRole
  }>
> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return []
  await assertOwnedChild(params.userId, params.childId)
  let query = admin
    .from('skulmate_sessions')
    .select('id, title, last_turn_at, account_role')
    .eq('user_id', params.userId)
    .order('last_turn_at', { ascending: false })
    .limit(40)
  query = params.childId
    ? query.eq('child_id', params.childId)
    : query.is('child_id', null)
  const { data } = await query
  const rows = data || []
  const ids = rows.map((row) => row.id as string)
  const previewBySession = new Map<string, string>()
  if (ids.length) {
    const { data: turns } = await admin
      .from('skulmate_turns')
      .select('session_id, text, created_at')
      .in('session_id', ids)
      .order('created_at', { ascending: false })
      .limit(80)
    for (const turn of turns || []) {
      const sid = turn.session_id as string
      if (previewBySession.has(sid)) continue
      const text = String(turn.text || '').replace(/\s+/g, ' ').trim()
      if (text) previewBySession.set(sid, text.slice(0, 120))
    }
  }
  return rows.map((row) => ({
    id: row.id as string,
    title: row.title as string | null,
    lastTurnAt: row.last_turn_at as string,
    preview: previewBySession.get(row.id as string) || null,
    accountRole: (row.account_role as SkulMateAccountRole) || 'learner',
  }))
}

export async function loadOwnedSession(params: {
  userId: string
  sessionId: string
}) {
  const admin = getServiceSupabaseAdmin()
  if (!admin) throw new Error('Memory store unavailable')
  const { data: session } = await admin
    .from('skulmate_sessions')
    .select('id, title, account_role, child_id, last_turn_at, status')
    .eq('id', params.sessionId)
    .eq('user_id', params.userId)
    .maybeSingle()
  if (!session) throw new Error('Session not found')
  await assertOwnedChild(params.userId, session.child_id)
  const turns = await loadSessionTurns(params.sessionId)
  return { session, turns }
}

export async function loadSessionTurns(sessionId: string) {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return []
  const { data } = await admin
    .from('skulmate_turns')
    .select('id, role, text, tool_name, tool_payload, board, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(80)
  return data || []
}

export async function runTutorTurn(params: {
  userId: string
  sessionId: string
  childId?: string | null
  message: string
  learnerContext?: LearnerContextInput | null
  language?: string
  learnerMemory?: LearnerMemory | null
}): Promise<TutorTurnResult> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) throw new Error('Memory store unavailable')

  const { data: session } = await admin
    .from('skulmate_sessions')
    .select('id, account_role, child_id, title')
    .eq('id', params.sessionId)
    .eq('user_id', params.userId)
    .maybeSingle()
  if (!session) throw new Error('Session not found')
  await assertOwnedChild(params.userId, session.child_id)

  if (params.childId != null && params.childId !== session.child_id) throw new Error('Session not found')
  params.childId = session.child_id ?? null

  await admin.from('skulmate_turns').insert({
    session_id: params.sessionId,
    user_id: params.userId,
    role: 'user',
    text: params.message,
  })

  const [turns, stateRow, outcomes, chunks] = await Promise.all([
    loadSessionTurns(params.sessionId),
    loadLearnerState(params.userId, params.childId),
    loadRecentOutcomes(params.userId, params.childId),
    retrieveTeachingContext({
      learnerContext: params.learnerContext,
      userId: params.userId,
      childId: params.childId,
      query: params.message,
      subjectId: subjectFrom(params.learnerContext),
      limit: 6,
    }),
  ])

  const independentDue = Boolean(
    conceptDueForIndependentCheck(stateRow?.assistance_ledger)
  )
  const suggestedMove = recommendPedagogyMove({
    lastOutcomes: outcomes,
    independentDue,
  })

  const compiled = compileTurnContext({
    accountRole: (session.account_role as SkulMateAccountRole) || 'learner',
    childId: params.childId,
    learnerContext: params.learnerContext,
    learnerState: stateRow,
    recentOutcomes: outcomes,
    recentTurns: turns.map((t) => ({
      role: String(t.role),
      text: t.text as string | null,
    })),
    retrievedChunks: chunks,
    appGraph: {
      recentDeckTitles:
        params.learnerContext?.intelligenceSignals?.recentDeckTitles,
      openBookingHint: Boolean(
        params.learnerContext?.intelligenceSignals?.needsHumanTutorHint
      ),
    },
    language: params.language,
    learnerMemory: params.learnerMemory,
  })

  let policy = await runPolicy(compiled.full, params.message, suggestedMove, {
    retrieveNotes: async (query) => {
      const more = await retrieveTeachingContext({
      learnerContext: params.learnerContext,
        userId: params.userId,
        childId: params.childId,
        query,
        subjectId: subjectFrom(params.learnerContext),
        limit: 4,
      })
      if (!more.length) return '(No matching source evidence found; curriculum alignment remains unverified)'
      return more.map((c) => c.content).join('\n')
    },
    language: params.language,
    recentTurns: turns.map((t) => ({
      role: String(t.role),
      text: t.text as string | null,
    })),
    subjectId: subjectFrom(params.learnerContext),
    memory: params.learnerMemory,
  })
  const missStreak = outcomes.filter((o) => !o.correct).length
  const verdict = await verifyTutorTurnWithEngine({
    message: policy.message,
    move: policy.move,
    assistance: policy.assistance,
    unproductiveStruggle: missStreak >= 3,
    studentMessage: params.message,
    regionNotes: compiled.region,
  })
  if (!verdict.ok) {
    policy = {
      ...policy,
      message: verdict.rewrite,
      move: suggestedMove === 'escalate' ? 'escalate' : 'focus',
      assistance: 'none',
      board: boardFromFocusPrompt(verdict.rewrite),
    }
  }

  const board =
    validateWhiteboard(policy.board) ||
    boardFromFocusPrompt(policy.message.slice(0, 220))

  let surface: PracticeSurface | null = policy.surface || null
  if (
    !surface &&
    (policy.tool?.name === 'spawn_surface' ||
      policy.move === 'check' ||
      policy.move === 'independent')
  ) {
    const source = chunks.map((c) => c.content).join('\n') || params.message
    surface = await compilePracticeSurface({
      sourceText: source,
      conceptId: policy.tool?.conceptId || policy.conceptId || undefined,
      preferredType: policy.tool?.surfaceType || 'quiz',
      language: params.language,
    })
  }

  const escalate =
    policy.move === 'escalate' ||
    policy.tool?.name === 'escalate_tutor' ||
    maybeEscalate(outcomes)

  const assistantText = policy.message.trim() || focusingRewrite(params.message)
  const conceptId =
    policy.conceptId ||
    policy.tool?.conceptId ||
    conceptDueForIndependentCheck(stateRow?.assistance_ledger) ||
    'open:general'

  const { data: assistantTurn } = await admin
    .from('skulmate_turns')
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      role: 'assistant',
      text: assistantText,
      tool_name: policy.tool?.name || (surface ? 'spawn_surface' : 'draw_board'),
      tool_payload: {
        surface,
        board,
        pedagogy: {
          move: policy.move,
          assistance: policy.assistance,
          misconception: policy.misconception,
          conceptId,
        },
      },
      board,
    })
    .select('id')
    .single()

  if (policy.assistance && policy.assistance !== 'none') {
    await persistAssistance(params.userId, params.childId, conceptId, policy.assistance)
  }

  const recap = buildSessionRecap({
    title: session.title || params.message,
    turns: [
      ...turns.map((t) => ({ role: String(t.role), text: t.text as string | null })),
      { role: 'assistant', text: assistantText },
    ],
    weakConcepts: stateRow?.weak_concepts,
  })

  await admin
    .from('skulmate_sessions')
    .update({
      title: session.title || params.message.slice(0, 72),
      last_turn_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      recap,
    })
    .eq('id', params.sessionId)

  await recordTutorTrace({
    userId: params.userId,
    sessionId: params.sessionId,
    compiledContext: { tokenEstimate: compiled.tokenEstimate, model: policy.model },
    toolCalls: policy.tool,
    surface,
    outcome: { move: policy.move, verified: verdict.ok, model: policy.model, attempts: policy.attempts },
  })

  return {
    sessionId: params.sessionId,
    turnId: (assistantTurn?.id as string) || '',
    message: assistantText,
    move: policy.move,
    speak: policy.speak !== false,
    surface,
    board,
    misconception: policy.misconception,
    escalate,
    model: policy.model,
    display: packDisplay(policy, board, surface, params),
    imagePrompt: policy.imagePrompt || null,
  }
}

async function runPolicy(
  compiled: string,
  userMessage: string,
  suggestedMove: PedagogyMove,
  extra?: {
    retrieveNotes?: (query: string) => Promise<string>
    language?: string
    notes?: string
    recentTurns?: Array<{ role: string; text?: string | null }>
    subjectId?: string | null
    memory?: LearnerMemory | null
  }
): Promise<PolicyJson> {
  return runTutorAgent({
    compiled,
    userMessage,
    suggestedMove,
    tools: extra?.retrieveNotes
      ? { retrieveNotes: extra.retrieveNotes, retrieveContext: extra.retrieveNotes }
      : undefined,
    language: extra?.language,
    notes: extra?.notes,
    recentTurns: extra?.recentTurns,
    subjectId: extra?.subjectId,
    memory: extra?.memory,
  })
}

export async function runTutorTurnDemo(params: {
  message: string
  learnerContext?: LearnerContextInput | null
  language?: string
  accountRole?: SkulMateAccountRole
  recentTurns?: Array<{ role: string; text?: string | null }>
  notes?: string
  learnerMemory?: LearnerMemory | null
}): Promise<TutorTurnResult> {
  const accountRole = params.accountRole || 'learner'
  const notes = (params.notes || '').trim()
  const subjectId = subjectFrom(params.learnerContext)
  const chunks = await retrieveTeachingContext({
      learnerContext: params.learnerContext,
    query: params.message,
    subjectId,
    extraNotes: notes,
    limit: 6,
  })
  const compiled = compileTurnContext({
    accountRole,
    learnerContext: params.learnerContext,
    recentTurns: params.recentTurns || [],
    retrievedChunks: chunks,
    language: params.language,
    learnerMemory: params.learnerMemory,
  })
  const suggestedMove = recommendPedagogyMove({ lastOutcomes: [] })
  let policy = await runPolicy(compiled.full, params.message, suggestedMove, {
    language: params.language,
    notes,
    recentTurns: params.recentTurns,
    subjectId,
    memory: params.learnerMemory,
    retrieveNotes: async (query) => {
      const more = await retrieveTeachingContext({
      learnerContext: params.learnerContext,
        query,
        subjectId,
        extraNotes: notes,
        limit: 4,
      })
      return more.map((c) => c.content).join('\n') || '(No matching source evidence found; curriculum alignment remains unverified)'
    },
  })
  const verdict = await verifyTutorTurnWithEngine({
    message: policy.message,
    move: policy.move,
    assistance: policy.assistance,
    studentMessage: params.message,
    regionNotes: compiled.region,
  })
  if (!verdict.ok && policy.model !== 'local') {
    policy = {
      ...policy,
      message: verdict.rewrite,
      move: 'focus',
      assistance: 'none',
      board: boardFromFocusPrompt(verdict.rewrite),
    }
  }
  const board =
    validateWhiteboard(policy.board) ||
    boardFromFocusPrompt(policy.message.slice(0, 220))
  const surface = policy.surface || null
  return {
    sessionId: 'demo',
    turnId: `demo-${Date.now()}`,
    message: policy.message.trim() || focusingRewrite(params.message),
    move: policy.move,
    speak: policy.speak !== false,
    board,
    surface,
    misconception: policy.misconception,
    escalate: policy.move === 'escalate',
    model: policy.model,
    demo: true,
    display: packDisplay(policy, board, surface, params),
    imagePrompt: policy.imagePrompt || null,
  }
}

function maybeEscalate(
  outcomes: Array<{ concept_id?: string | null; correct: boolean }>
): boolean {
  const misses = outcomes.filter((o) => !o.correct)
  if (misses.length < 3) return false
  const topic = misses[0]?.concept_id || 'open:general'
  return isTutorEscalationEligible({
    topicId: topic,
    previousAttempts: outcomes.length,
    previousScore: 0.4,
    previousWeakStreak: misses.length,
    sessionCorrect: outcomes.filter((o) => o.correct).length,
    sessionTotal: Math.max(1, outcomes.length),
  })
}

async function persistAssistance(
  userId: string,
  childId: string | null | undefined,
  conceptId: string,
  level: AssistanceLevel
) {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return
  let query = admin
    .from('skulmate_learner_state')
    .select('id, assistance_ledger')
    .eq('user_id', userId)
  query = childId ? query.eq('child_id', childId) : query.is('child_id', null)
  const { data: state } = await query.maybeSingle()
  const ledger = applyAssistanceLedger(
    state?.assistance_ledger,
    conceptId,
    level
  )
  if (state?.id) {
    await admin
      .from('skulmate_learner_state')
      .update({ assistance_ledger: ledger, updated_at: new Date().toISOString() })
      .eq('id', state.id)
  } else {
    await admin.from('skulmate_learner_state').insert({
      user_id: userId,
      child_id: childId ?? null,
      assistance_ledger: ledger,
    })
  }
}

async function loadLearnerState(userId: string, childId?: string | null) {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return null
  let query = admin
    .from('skulmate_learner_state')
    .select(
      'weak_concepts, last_successful_move, summary, class_level, language, assistance_ledger, skill_map'
    )
    .eq('user_id', userId)
  query = childId ? query.eq('child_id', childId) : query.is('child_id', null)
  const { data } = await query.maybeSingle()
  return data
}

async function loadRecentOutcomes(userId: string, childId?: string | null) {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return []
  let query = admin
    .from('skulmate_outcomes')
    .select('concept_id, correct, surface_type')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
  query = childId ? query.eq('child_id', childId) : query.is('child_id', null)
  const { data } = await query
  return (data || []) as Array<{
    concept_id?: string | null
    correct: boolean
    surface_type?: string | null
  }>
}

function subjectFrom(ctx?: LearnerContextInput | null): string | null {
  if (!ctx) return null
  const scope = curriculumScope(ctx)
  if (scope.subjectId) return scope.subjectId === 'other' ? scope.subjectOther || null : scope.subjectId
  const subjects = ctx.subjects || ctx.subject_preferences
  if (Array.isArray(subjects)) return subjects[0] || null
  return subjects ? String(subjects) : null
}

function packDisplay(
  policy: PolicyJson,
  board: WhiteboardPayload | null,
  surface: PracticeSurface | null,
  params: {
    message: string
    language?: string
    learnerContext?: LearnerContextInput | null
    notes?: string
  }
): AdaptiveDisplay {
  return compileAdaptiveDisplay({
    board,
    surface,
    message: `${params.message} ${policy.message}`,
    move: policy.move,
    language: params.language,
    notes: params.notes,
    subjectId: subjectFrom(params.learnerContext),
    conceptId: policy.conceptId,
    turnId: policy.model,
    wantsImage: policy.tool?.name === 'show_image' || policy.displayHint === 'image',
    displayHint: policy.displayHint,
  })
}
