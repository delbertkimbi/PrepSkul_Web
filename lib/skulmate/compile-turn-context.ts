import type { LearnerContextInput } from './learner-context'
import type { RetrievedChunk } from './retrieve'
import type { SkulMateAccountRole } from './auth'
import { estimateTokens } from './chunk'
import { compileRegionContext } from './region-packs'
import { memoryPromptBlock, type LearnerMemory } from './learner-memory'

export type CompiledTurnContext = {
  identity: string
  region: string
  state: string
  thread: string
  retrieved: string
  appGraph: string
  tools: string
  full: string
  tokenEstimate: number
}

const MAX_TOKENS = 4500

export type CompileTurnInput = {
  accountRole: SkulMateAccountRole
  childId?: string | null
  learnerContext?: LearnerContextInput | null
  learnerState?: {
    weak_concepts?: Array<{ conceptId?: string; masteryScore?: number }>
    last_successful_move?: string | null
    summary?: string | null
    class_level?: string | null
    language?: string | null
    assistance_ledger?: Array<{
      conceptId?: string
      independentDue?: boolean
      level?: string
    }>
    skill_map?: Record<string, { id?: string; mastery?: number }>
  } | null
  recentOutcomes?: Array<{
    concept_id?: string | null
    correct: boolean
    surface_type?: string | null
  }>
  recentTurns?: Array<{ role: string; text?: string | null }>
  retrievedChunks?: RetrievedChunk[]
  appGraph?: {
    lastClassSummary?: string | null
    recentDeckTitles?: string[]
    openBookingHint?: boolean
  }
  language?: string
  learnerMemory?: LearnerMemory | null
}

/**
 * Budgeted packet the policy model is allowed to see.
 * Signup is learner | parent. Both are the student in SkulMate.
 * childId only scopes notes for a linked profile — it is not a bystander mode.
 */
export function compileTurnContext(input: CompileTurnInput): CompiledTurnContext {
  const identity = buildIdentity(input)
  const region = buildRegion(input)
  const state = buildState(input)
  const growth = memoryPromptBlock(input.learnerMemory)
  const thread = buildThread(input.recentTurns || [])
  const retrieved = buildRetrieved(input.retrievedChunks || [])
  const appGraph = buildAppGraph(input.appGraph)
  const tools = TOOL_SCHEMA

  let parts = [identity, region, state, growth, thread, retrieved, appGraph, tools]
  let full = parts.filter(Boolean).join('\n\n')
  let tokenEstimate = estimateTokens(full)

  if (tokenEstimate > MAX_TOKENS) {
    const trimmedRetrieved = buildRetrieved((input.retrievedChunks || []).slice(0, 3), 400)
    const trimmedThread = buildThread((input.recentTurns || []).slice(-6), 220)
    parts = [identity, region, state, growth, trimmedThread, trimmedRetrieved, appGraph, tools]
    full = parts.filter(Boolean).join('\n\n')
    tokenEstimate = estimateTokens(full)
  }

  return {
    identity,
    region,
    state,
    thread,
    retrieved,
    appGraph,
    tools,
    full,
    tokenEstimate,
  }
}

function buildIdentity(input: CompileTurnInput): string {
  const ctx = input.learnerContext
  const lang =
    input.language ||
    input.learnerState?.language ||
    ctx?.language ||
    'en'
  const level =
    input.learnerState?.class_level || ctx?.class_level || ctx?.student_grade
  const subjects = ctx?.subjects || ctx?.subject_preferences
  const subjectLine = Array.isArray(subjects)
    ? subjects.join(', ')
    : subjects
      ? String(subjects)
      : ''

  const who = studentIdentityLine(input.accountRole)

  let block = `IDENTITY\n${who}\nLanguage: ${lang}.`
  if (level) block += `\nLevel (tone/difficulty only): ${level}.`
  if (subjectLine) block += `\nThey chose to study: ${subjectLine}.`
  if (ctx?.learning_goals) block += `\nGoals: ${ctx.learning_goals}.`
  if (ctx?.pace) block += `\nPace they asked for: ${ctx.pace}.`
  if (ctx?.channel) block += `\nThey prefer to work by: ${ctx.channel}.`
  block +=
    '\nPrimary: their curriculum, what they want to study, and diagnosed challenges. Optional uploads are extra context, never a requirement. Never refuse off-syllabus content. Use the region pack for examples only. Do not mention exams unless they asked this turn. Do not ask for notes.'
  return block
}

function buildRegion(input: CompileTurnInput): string {
  const ctx = input.learnerContext
  return compileRegionContext(
    {
      countryId: ctx?.country,
      cityId: ctx?.city,
      systemId: ctx?.school_system || ctx?.curriculum,
      levelId: ctx?.class_level,
      examId: ctx?.exam || ctx?.target_exam || ctx?.exam_type,
      examWhen: ctx?.exam_when,
      subjectId: Array.isArray(ctx?.subjects)
        ? ctx?.subjects[0]
        : (ctx?.subjects as string | undefined),
      locale: input.language || ctx?.language,
    },
    { compact: true }
  )
}

function buildState(input: CompileTurnInput): string {
  const lines = ['LEARNING STATE (evidence — choose the next teaching move from this)']
  const weak = input.learnerState?.weak_concepts || []
  if (weak.length) {
    lines.push(
      `Weak concepts: ${weak
        .slice(0, 5)
        .map((w) => w.conceptId)
        .filter(Boolean)
        .join(', ')}`
    )
  }
  const outcomes = input.recentOutcomes || []
  if (outcomes.length) {
    const last = outcomes
      .slice(0, 3)
      .map(
        (o) =>
          `${o.concept_id || 'topic'}: ${o.correct ? 'correct' : 'miss'}${o.surface_type ? ` (${o.surface_type})` : ''}`
      )
      .join('; ')
    lines.push(`Last checks: ${last}`)
  } else {
    lines.push('No checks yet this session — teach, then check.')
  }
  if (input.learnerState?.last_successful_move) {
    lines.push(`Last successful move: ${input.learnerState.last_successful_move}`)
  }
  if (input.learnerState?.summary) {
    lines.push(`Running summary: ${input.learnerState.summary}`)
  }
  const due = (input.learnerState?.assistance_ledger || []).find(
    (e) => e.independentDue
  )
  if (due?.conceptId) {
    lines.push(
      `ASSISTANCE LEDGER: you already helped on ${due.conceptId}. Do NOT claim mastery. Next move must be an independent transfer check.`
    )
  }
  const skills = Object.values(input.learnerState?.skill_map || {})
    .filter((s) => typeof s.mastery === 'number')
    .sort((a, b) => Number(a.mastery) - Number(b.mastery))
    .slice(0, 4)
  if (skills.length) {
    lines.push(
      `Skill map (weak first): ${skills
        .map((s) => `${s.id || 'skill'} ${(Number(s.mastery) * 100).toFixed(0)}%`)
        .join(', ')}`
    )
  }
  return lines.join('\n')
}

function buildThread(
  turns: Array<{ role: string; text?: string | null }>,
  maxChars = 360
): string {
  if (!turns.length) return 'THREAD\n(new session)'
  const lines = turns.slice(-10).map((t) => {
    const role = t.role === 'user' ? 'Student' : t.role === 'assistant' ? 'Tutor' : 'Tool'
    const text = (t.text || '').replace(/\s+/g, ' ').slice(0, maxChars)
    return `${role}: ${text}`
  })
  return `THREAD\n${lines.join('\n')}`
}

function buildRetrieved(chunks: RetrievedChunk[], maxChars = 520): string {
  if (!chunks.length) {
    return 'RETRIEVED CONTEXT\nNo files uploaded. Teach from curriculum, their goals, and diagnosed challenges. Do not ask for notes.'
  }
  const body = chunks
    .slice(0, 6)
    .map((c, i) => {
      const source = c.artifactId === 'curriculum' ? 'curriculum' : 'upload'
      return `[${i + 1} ${source}] ${c.content.replace(/\s+/g, ' ').slice(0, maxChars)}`
    })
    .join('\n')
  return `RETRIEVED CONTEXT (curriculum first, optional uploads extra)\n${body}`
}

function buildAppGraph(graph?: CompileTurnInput['appGraph']): string {
  if (!graph) return ''
  const lines = ['APP GRAPH (use only if relevant)']
  if (graph.lastClassSummary) {
    lines.push(`Last class recap: ${graph.lastClassSummary.slice(0, 400)}`)
  }
  if (graph.recentDeckTitles?.length) {
    lines.push(`Recent revision: ${graph.recentDeckTitles.slice(0, 5).join(', ')}`)
  }
  if (graph.openBookingHint) {
    lines.push('They can book a live PrepSkul tutor if still stuck after reteach.')
  }
  return lines.length > 1 ? lines.join('\n') : ''
}

export function studentIdentityLine(role: SkulMateAccountRole): string {
  if (role === 'parent') {
    return [
      'Signup role: parent. This person is the student.',
      'Address them in the second person. Teach the speaker in this thread.',
      'Do not talk as if they are watching someone else study.',
      'Do not ask them to get a parent. Do not imitate a caregiver voice.',
      'Only mention a child if they named one.',
    ].join(' ')
  }
  return [
    'Signup role: learner. This person is the student.',
    'Address them in the second person. Teach the speaker in this thread.',
  ].join(' ')
}

export const TOOL_SCHEMA = `PEDAGOGY (Aristotle-class)
- focus: they explain first. Open question. No fill-in-the-blank.
- scaffold: hint the next thinking move, not the answer.
- instruct: only after unproductive struggle (3+ misses). Still keep them working.
- check: short in-thread practice on the current idea.
- independent: transfer problem on a concept you already helped with.
- reteach / escalate: prerequisite gap, or live PrepSkul tutor.

DISPLAY (pick one hero. The board is optional.)
- play: quiz / matching / flashcards they tap.
- image: unique picture this turn when they cannot see the idea.
- board: algebra or labelled diagram steps. Never a finished solution.
- diagram: process (cells, forces, reactions).
- timeline: sequence of events.
- call: they are talking live; keep a live transcript, not a poster.
Never default to the board. Never ask them to upload notes.

TOOLS (at most one)
- speak: short student-facing line (they can barge in).
- show_image: unique picture of the current idea.
- draw_board: only if the board is the right visual. 1-6 steps.
- spawn_surface: quiz | flashcards | matching | fill_blank.
- retrieve_context: search curriculum and optional uploads.
- escalate_tutor: only after repeated misses.

Respond as JSON:
{"message": string, "move": "focus"|"scaffold"|"instruct"|"check"|"independent"|"reteach"|"escalate", "speak": boolean, "assistance": "none"|"hint"|"instruct", "misconception": string|null, "conceptId": string|null, "displayHint": "play"|"image"|"board"|"diagram"|"timeline"|"call"|"conversation", "imagePrompt": string, "board": {"title": string, "steps": [{"kind": "heading"|"equation"|"note"|"diagram"|"prompt", "text": string}]}, "tool": null | {"name": "spawn_surface"|"escalate_tutor"|"draw_board"|"show_image"|"retrieve_context", "conceptId": string, "surfaceType"?: string, "query"?: string}}`

export { MAX_TOKENS as TURN_CONTEXT_TOKEN_BUDGET }
