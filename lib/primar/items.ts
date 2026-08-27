/**
 * Item generation.
 *
 * Items are generated to hit a requested difficulty level (1–10) rather than
 * generated randomly and scored afterwards. The staircase asks for a level and
 * gets an item that genuinely sits there, which is what makes the resulting
 * mastery number worth trusting.
 *
 * Zero model calls, zero marginal cost, unlimited items.
 */

import {
  ALL_STROKE_IDS,
  COMPOSITES,
  STROKES,
  type Shape,
  type StrokeId,
  difference,
  hasKind,
  shapeDistance,
  shapeKey,
  shapesEqual,
  union,
} from "./strokes"

export type Operation = "add" | "subtract"

export interface Item {
  id: string
  level: number
  op: Operation
  operandA: Shape
  operandB: Shape
  answer: Shape
  /** Answer plus three distractors, already shuffled. */
  options: Shape[]
  answerIndex: number
}

/* ------------------------------------------------------------------ */
/* Seeded RNG — reproducible sessions make bugs reproducible too.      */
/* ------------------------------------------------------------------ */

export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(arr: T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)]

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Level design                                                        */
/* ------------------------------------------------------------------ */

interface LevelSpec {
  ops: Operation[]
  /** Allowed composite weight (how many strokes in the whole figure). */
  minWeight: number
  maxWeight: number
  /** Allow curved and diagonal strokes, which are harder to hold in mind. */
  allowCurves: boolean
  /** Smaller = distractors sit closer to the answer = harder discrimination. */
  targetDistractorDistance: number
}

const LEVELS: Record<number, LevelSpec> = {
  1: { ops: ["add"], minWeight: 2, maxWeight: 2, allowCurves: false, targetDistractorDistance: 2 },
  2: { ops: ["add"], minWeight: 2, maxWeight: 3, allowCurves: true, targetDistractorDistance: 2 },
  3: { ops: ["add"], minWeight: 3, maxWeight: 4, allowCurves: true, targetDistractorDistance: 2 },
  4: { ops: ["add"], minWeight: 4, maxWeight: 4, allowCurves: true, targetDistractorDistance: 1 },
  5: { ops: ["add", "subtract"], minWeight: 3, maxWeight: 4, allowCurves: true, targetDistractorDistance: 2 },
  6: { ops: ["subtract"], minWeight: 4, maxWeight: 4, allowCurves: true, targetDistractorDistance: 2 },
  7: { ops: ["add", "subtract"], minWeight: 4, maxWeight: 5, allowCurves: true, targetDistractorDistance: 1 },
  8: { ops: ["subtract"], minWeight: 5, maxWeight: 6, allowCurves: true, targetDistractorDistance: 1 },
  9: { ops: ["add", "subtract"], minWeight: 5, maxWeight: 6, allowCurves: true, targetDistractorDistance: 1 },
  10: { ops: ["subtract"], minWeight: 6, maxWeight: 6, allowCurves: true, targetDistractorDistance: 1 },
}

export const clampLevel = (n: number): number => Math.max(1, Math.min(10, Math.round(n)))

/* ------------------------------------------------------------------ */
/* Distractors                                                         */
/* ------------------------------------------------------------------ */

function buildDistractors(
  answer: Shape,
  operandA: Shape,
  operandB: Shape,
  op: Operation,
  spec: LevelSpec,
  rng: () => number,
): Shape[] {
  const candidates: Shape[] = []
  const seen = new Set<string>([shapeKey(answer)])

  const offer = (shape: Shape) => {
    if (shape.length === 0) return
    const key = shapeKey(shape)
    if (seen.has(key)) return
    seen.add(key)
    candidates.push(shape)
  }

  // The mistake a learner actually makes: applying the wrong operation.
  offer(op === "subtract" ? operandA : operandA.length ? operandA : operandB)
  if (op === "add") offer(operandB)

  // One stroke too many.
  const unused = ALL_STROKE_IDS.filter(
    (id) => !answer.includes(id) && (spec.allowCurves || STROKES[id].kind !== "curve"),
  )
  for (const extra of shuffle(unused, rng).slice(0, 4)) offer(union(answer, [extra]))

  // One stroke short.
  if (answer.length > 1) {
    for (const drop of shuffle(answer, rng).slice(0, 3)) offer(difference(answer, [drop]))
  }

  // A stroke swapped for one it is easy to confuse with — the near miss.
  for (const s of shuffle(answer, rng)) {
    for (const twin of STROKES[s].confusableWith) {
      if (!answer.includes(twin)) offer(union(difference(answer, [s]), [twin]))
    }
  }

  // Prefer distractors sitting at the level's intended discrimination distance.
  const ranked = candidates
    .map((shape) => ({ shape, gap: Math.abs(shapeDistance(shape, answer) - spec.targetDistractorDistance) }))
    .sort((x, y) => x.gap - y.gap)

  const chosen: Shape[] = []
  for (const { shape } of ranked) {
    if (chosen.length >= 3) break
    chosen.push(shape)
  }

  // Last resort, so an item is never malformed.
  while (chosen.length < 3) {
    const filler = union(answer, [pick(ALL_STROKE_IDS, rng)])
    if (!chosen.some((c) => shapesEqual(c, filler)) && !shapesEqual(filler, answer)) chosen.push(filler)
    else chosen.push(pick(COMPOSITES, rng).strokes)
  }

  return chosen.slice(0, 3)
}

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

function splitShape(shape: Shape, rng: () => number): [Shape, Shape] {
  const shuffled = shuffle(shape, rng)
  const cut = 1 + Math.floor(rng() * (shuffled.length - 1))
  return [shuffled.slice(0, cut), shuffled.slice(cut)]
}

export function generateItem(level: number, rng: () => number, index = 0): Item {
  const lvl = clampLevel(level)
  const spec = LEVELS[lvl]

  const pool = COMPOSITES.filter((c) => {
    if (c.weight < spec.minWeight || c.weight > spec.maxWeight) return false
    if (!spec.allowCurves && hasKind(c.strokes, "curve")) return false
    return c.strokes.length >= 2
  })

  const composite = pick(pool.length ? pool : COMPOSITES, rng)
  const op = pick(spec.ops, rng)

  let operandA: Shape
  let operandB: Shape
  let answer: Shape

  if (op === "add") {
    const [a, b] = splitShape(composite.strokes, rng)
    operandA = a
    operandB = b
    answer = union(a, b)
  } else {
    // Remove a proper, non-empty subset so something always remains.
    const removable = shuffle(composite.strokes, rng)
    const removeCount = 1 + Math.floor(rng() * Math.max(1, composite.strokes.length - 2))
    operandB = removable.slice(0, removeCount)
    operandA = composite.strokes
    answer = difference(operandA, operandB)
    if (answer.length === 0) {
      operandB = [removable[0]]
      answer = difference(operandA, operandB)
    }
  }

  const distractors = buildDistractors(answer, operandA, operandB, op, spec, rng)
  const options = shuffle([answer, ...distractors], rng)
  const answerIndex = options.findIndex((o) => shapesEqual(o, answer))

  return {
    id: `L${lvl}-${index}-${shapeKey(answer)}`,
    level: lvl,
    op,
    operandA,
    operandB,
    answer,
    options,
    answerIndex,
  }
}

/**
 * The three worked examples shown before a child's first item. The rule is
 * taught by watching shapes slide together — never by reading an instruction.
 */
export function demonstrationItems(rng: () => number): Item[] {
  const scripted: Array<{ composite: string; op: Operation }> = [
    { composite: "circle", op: "add" },
    { composite: "plus", op: "add" },
    { composite: "square", op: "subtract" },
  ]

  return scripted.map((s, i) => {
    const composite = COMPOSITES.find((c) => c.id === s.composite) ?? COMPOSITES[0]
    if (s.op === "add") {
      const half = Math.ceil(composite.strokes.length / 2)
      const operandA = composite.strokes.slice(0, half)
      const operandB = composite.strokes.slice(half)
      return {
        id: `demo-${i}`,
        level: 1,
        op: "add" as Operation,
        operandA,
        operandB,
        answer: union(operandA, operandB),
        options: [],
        answerIndex: -1,
      }
    }
    const operandB: Shape = ["top"]
    const answer = difference(composite.strokes, operandB)
    return {
      id: `demo-${i}`,
      level: 1,
      op: "subtract" as Operation,
      operandA: composite.strokes,
      operandB,
      answer,
      options: [],
      answerIndex: -1,
    }
  })
}
