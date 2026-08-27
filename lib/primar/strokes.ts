/**
 * The visual vocabulary.
 *
 * Every shape a child sees is a SET of strokes drawn in a shared 100x100 grid.
 * Because shapes are sets, "add" is union and "subtract" is difference — the
 * whole item engine is set arithmetic over this table, with no text anywhere.
 *
 * Nothing here is language-dependent, which is the point: identical items work
 * for Anglophone and Francophone learners with no translation layer.
 */

export type StrokeId =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "vert"
  | "horiz"
  | "diagA"
  | "diagB"
  | "arcL"
  | "arcR"
  | "arcT"
  | "arcB"
  | "chevU"
  | "chevD"
  | "triL"
  | "triR"
  | "innerBox"
  | "innerRing"

export type StrokeKind = "line" | "diagonal" | "curve"

export interface Stroke {
  id: StrokeId
  /** SVG path data in the shared 100x100 viewBox. */
  d: string
  kind: StrokeKind
  /**
   * Strokes that are easy to confuse with this one. Used to build near-miss
   * distractors — the difference between a real item and a guessable one.
   */
  confusableWith: StrokeId[]
}

/** Frame bounds for the shared drawing grid. */
const A = 22
const Z = 78
const M = 50

export const STROKES: Record<StrokeId, Stroke> = {
  top: { id: "top", d: `M${A},${A} L${Z},${A}`, kind: "line", confusableWith: ["bottom", "horiz"] },
  bottom: { id: "bottom", d: `M${A},${Z} L${Z},${Z}`, kind: "line", confusableWith: ["top", "horiz"] },
  left: { id: "left", d: `M${A},${A} L${A},${Z}`, kind: "line", confusableWith: ["right", "vert"] },
  right: { id: "right", d: `M${Z},${A} L${Z},${Z}`, kind: "line", confusableWith: ["left", "vert"] },
  vert: { id: "vert", d: `M${M},${A} L${M},${Z}`, kind: "line", confusableWith: ["left", "right"] },
  horiz: { id: "horiz", d: `M${A},${M} L${Z},${M}`, kind: "line", confusableWith: ["top", "bottom"] },

  diagA: { id: "diagA", d: `M${A},${Z} L${Z},${A}`, kind: "diagonal", confusableWith: ["diagB"] },
  diagB: { id: "diagB", d: `M${A},${A} L${Z},${Z}`, kind: "diagonal", confusableWith: ["diagA"] },

  arcL: { id: "arcL", d: `M${M},${A} A28,28 0 0,0 ${M},${Z}`, kind: "curve", confusableWith: ["arcR"] },
  arcR: { id: "arcR", d: `M${M},${A} A28,28 0 0,1 ${M},${Z}`, kind: "curve", confusableWith: ["arcL"] },
  /**
   * Deliberately radius 40, not 28.
   *
   * At radius 28 these are exact semicircles of the very same circle that
   * arcL + arcR draw, so adding one to a shape that already contains the circle
   * paints nothing at all — two different shapes render pixel-identical and a
   * child gets marked wrong for an answer that looked correct. The shallower
   * radius makes the horizontal pair a visibly distinct lens.
   */
  arcT: { id: "arcT", d: `M${A},${M} A40,40 0 0,1 ${Z},${M}`, kind: "curve", confusableWith: ["arcB"] },
  arcB: { id: "arcB", d: `M${A},${M} A40,40 0 0,0 ${Z},${M}`, kind: "curve", confusableWith: ["arcT"] },

  chevU: { id: "chevU", d: `M${A},64 L${M},32 L${Z},64`, kind: "diagonal", confusableWith: ["chevD"] },
  chevD: { id: "chevD", d: `M${A},36 L${M},68 L${Z},36`, kind: "diagonal", confusableWith: ["chevU"] },

  triL: { id: "triL", d: `M${M},24 L24,74`, kind: "diagonal", confusableWith: ["triR", "diagA"] },
  triR: { id: "triR", d: `M${M},24 L76,74`, kind: "diagonal", confusableWith: ["triL", "diagB"] },

  innerBox: { id: "innerBox", d: "M38,38 L62,38 L62,62 L38,62 Z", kind: "line", confusableWith: ["innerRing"] },
  innerRing: {
    id: "innerRing",
    d: "M50,36 A14,14 0 1,0 50,64 A14,14 0 1,0 50,36",
    kind: "curve",
    confusableWith: ["innerBox"],
  },
}

export const ALL_STROKE_IDS = Object.keys(STROKES) as StrokeId[]

/** A shape is just a set of strokes. Order never matters. */
export type Shape = StrokeId[]

const canonical = (shape: Shape): Shape =>
  ALL_STROKE_IDS.filter((id) => shape.includes(id))

export const shapeKey = (shape: Shape): string => canonical(shape).join("+")

export const shapesEqual = (a: Shape, b: Shape): boolean => shapeKey(a) === shapeKey(b)

export const union = (a: Shape, b: Shape): Shape => canonical([...new Set([...a, ...b])])

export const difference = (a: Shape, b: Shape): Shape => canonical(a.filter((s) => !b.includes(s)))

/** How many strokes differ between two shapes — the distractor-difficulty metric. */
export function shapeDistance(a: Shape, b: Shape): number {
  const setA = new Set(a)
  const setB = new Set(b)
  let d = 0
  for (const s of setA) if (!setB.has(s)) d++
  for (const s of setB) if (!setA.has(s)) d++
  return d
}

export const hasKind = (shape: Shape, kind: StrokeKind): boolean =>
  shape.some((id) => STROKES[id].kind === kind)

/**
 * Whole shapes worth building toward. Composition rules stay legible because
 * every target is something a child can recognise once it snaps together.
 */
export interface Composite {
  id: string
  strokes: Shape
  /** Roughly how many strokes a learner must hold in mind at once. */
  weight: number
}

export const COMPOSITES: Composite[] = [
  { id: "circle", strokes: ["arcL", "arcR"], weight: 2 },
  { id: "plus", strokes: ["vert", "horiz"], weight: 2 },
  { id: "cross", strokes: ["diagA", "diagB"], weight: 2 },
  { id: "diamond", strokes: ["chevU", "chevD"], weight: 2 },
  { id: "lens", strokes: ["arcT", "arcB"], weight: 2 },
  { id: "corner", strokes: ["left", "bottom"], weight: 2 },
  { id: "triangle", strokes: ["triL", "triR", "bottom"], weight: 3 },
  { id: "channel", strokes: ["left", "right", "bottom"], weight: 3 },
  { id: "square", strokes: ["top", "bottom", "left", "right"], weight: 4 },
  { id: "squarePlus", strokes: ["top", "bottom", "left", "right", "vert", "horiz"], weight: 6 },
  { id: "squareCross", strokes: ["top", "bottom", "left", "right", "diagA", "diagB"], weight: 6 },
  { id: "circleCross", strokes: ["arcL", "arcR", "diagA", "diagB"], weight: 4 },
  { id: "circlePlus", strokes: ["arcL", "arcR", "vert", "horiz"], weight: 4 },
  { id: "nestedBox", strokes: ["top", "bottom", "left", "right", "innerBox"], weight: 5 },
  { id: "nestedRing", strokes: ["arcL", "arcR", "innerRing"], weight: 3 },
  { id: "boxedRing", strokes: ["top", "bottom", "left", "right", "innerRing"], weight: 5 },
  { id: "star", strokes: ["vert", "horiz", "diagA", "diagB"], weight: 4 },
]
