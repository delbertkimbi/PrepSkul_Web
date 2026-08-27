/**
 * Adaptive placement.
 *
 * A 2-up/1-down staircase: two correct answers in a row move the child up a
 * level, a single wrong answer moves them down. This targets roughly 70%
 * accuracy, which matters for two reasons — it converges on the level a child
 * can *reliably* work at rather than the level they fail at, and it means most
 * of what a child sees, they get right. A child who already associates school
 * with failure should not meet a wall on their first session.
 *
 * The converged level is read from reversals (the points where direction
 * changes), which is standard practice and far more stable than reading the
 * final level alone.
 */

import { clampLevel, generateItem, makeRng, type Item } from "./items"

export const START_LEVEL = 3
export const SESSION_LENGTH = 14
/** Reversals to discard before averaging — the early ones are just approach. */
const WARMUP_REVERSALS = 1
/**
 * Before the first reversal the staircase moves in big steps and needs only one
 * correct answer to climb, so it reaches the right neighbourhood in a few items
 * instead of spending the whole session walking there. After the first reversal
 * it switches to fine steps and the 2-up/1-down rule for precision.
 */
const APPROACH_STEP = 2
const REFINE_STEP = 1

export interface Attempt {
  itemId: string
  level: number
  correct: boolean
  /** Milliseconds from item shown to answer chosen. */
  elapsedMs: number
}

export interface SessionState {
  seed: number
  attempts: Attempt[]
  currentLevel: number
  consecutiveCorrect: number
  /** Levels at which the staircase changed direction. */
  reversals: number[]
  lastDirection: "up" | "down" | null
  finished: boolean
}

export function startSession(seed = Date.now()): SessionState {
  return {
    seed,
    attempts: [],
    currentLevel: START_LEVEL,
    consecutiveCorrect: 0,
    reversals: [],
    lastDirection: null,
    finished: false,
  }
}

export function nextItem(state: SessionState): Item {
  const rng = makeRng(state.seed + state.attempts.length * 7919)
  return generateItem(state.currentLevel, rng, state.attempts.length)
}

export function recordAttempt(state: SessionState, attempt: Attempt): SessionState {
  const attempts = [...state.attempts, attempt]

  let level = state.currentLevel
  let consecutiveCorrect = state.consecutiveCorrect
  let direction = state.lastDirection
  const reversals = [...state.reversals]

  const approaching = reversals.length === 0
  const step = approaching ? APPROACH_STEP : REFINE_STEP
  const correctNeeded = approaching ? 1 : 2

  if (attempt.correct) {
    consecutiveCorrect += 1
    if (consecutiveCorrect >= correctNeeded) {
      consecutiveCorrect = 0
      const next = clampLevel(level + step)
      if (next !== level) {
        if (direction === "down") reversals.push(level)
        direction = "up"
        level = next
      }
    }
  } else {
    consecutiveCorrect = 0
    const next = clampLevel(level - step)
    if (next !== level) {
      if (direction === "up") reversals.push(level)
      direction = "down"
      level = next
    }
  }

  return {
    ...state,
    attempts,
    currentLevel: level,
    consecutiveCorrect,
    reversals,
    lastDirection: direction,
    finished: attempts.length >= SESSION_LENGTH,
  }
}

export interface Placement {
  /** Converged working level, 1–10. */
  level: number
  /** Normalised 0–1, written straight into skulmate_concept_mastery. */
  masteryScore: number
  accuracy: number
  correct: number
  total: number
  medianMs: number
  /** True when the staircase never settled — placement is a guess, say so. */
  provisional: boolean
}

export function computePlacement(state: SessionState): Placement {
  const total = state.attempts.length
  const correct = state.attempts.filter((a) => a.correct).length
  const accuracy = total ? correct / total : 0

  const usable = state.reversals.slice(WARMUP_REVERSALS)
  let level: number
  let provisional = false

  if (usable.length >= 2) {
    level = usable.reduce((sum, l) => sum + l, 0) / usable.length
  } else if (state.attempts.length) {
    // Never settled: fall back to the average level actually worked at.
    level = state.attempts.reduce((sum, a) => sum + a.level, 0) / state.attempts.length
    provisional = true
  } else {
    level = START_LEVEL
    provisional = true
  }

  const times = state.attempts.map((a) => a.elapsedMs).sort((x, y) => x - y)
  const medianMs = times.length ? times[Math.floor(times.length / 2)] : 0

  return {
    level: Math.round(level * 10) / 10,
    masteryScore: Math.max(0, Math.min(1, level / 10)),
    accuracy,
    correct,
    total,
    medianMs,
    provisional,
  }
}

/**
 * Shaped for the existing `skulmate_concept_mastery` row so a session writes
 * into the schema that is already there rather than inventing a parallel one.
 */
export interface MasteryUpsert {
  topic_id: string
  mastery_score: number
  attempts: number
  correct_total: number
  question_total: number
  weak_streak: number
  last_session_accuracy: number
}

export const WEAK_THRESHOLD = 0.4

export function toMasteryUpsert(
  placement: Placement,
  topicId: string,
  previous?: Pick<MasteryUpsert, "attempts" | "correct_total" | "question_total" | "weak_streak">,
): MasteryUpsert {
  const weak = placement.masteryScore < WEAK_THRESHOLD
  return {
    topic_id: topicId,
    mastery_score: Number(placement.masteryScore.toFixed(4)),
    attempts: (previous?.attempts ?? 0) + 1,
    correct_total: (previous?.correct_total ?? 0) + placement.correct,
    question_total: (previous?.question_total ?? 0) + placement.total,
    weak_streak: weak ? (previous?.weak_streak ?? 0) + 1 : 0,
    last_session_accuracy: Number(placement.accuracy.toFixed(4)),
  }
}

/** The topic this item type reports against, matching curriculum_nodes.topic_id. */
export const TOPIC_ID = "foundational.visual-reasoning.shape-composition"
