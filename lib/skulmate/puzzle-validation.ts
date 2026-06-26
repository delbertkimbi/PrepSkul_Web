/**
 * Post-LLM validation and normalization for puzzle_pieces items.
 */

const BANNED_PROMPT_PATTERNS = [
  /what happens first\??/i,
  /select the correct answer/i,
  /^option\s*[a-d]$/i,
  /^option\s*\d+$/i,
  /^choice\s*\d+$/i,
]

const MIN_STEPS = 6
const MAX_STEPS = 8
const MAX_PROMPT_LEN = 120

type PuzzleStep = Record<string, unknown>
type PuzzleItem = Record<string, unknown>

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function assertBannedPrompt(prompt: string, stepId: string): void {
  const p = prompt.trim()
  for (const pattern of BANNED_PROMPT_PATTERNS) {
    if (pattern.test(p)) {
      throw new Error(
        `Puzzle step ${stepId} contains banned prompt pattern: "${p}"`,
      )
    }
  }
}

function validatePickOne(step: PuzzleStep, stepId: string): void {
  const choices = step.choices
  if (!Array.isArray(choices) || choices.length < 2 || choices.length > 4) {
    throw new Error(
      `Puzzle step ${stepId} pick_one requires 2–4 choices`,
    )
  }
  let correctCount = 0
  for (const raw of choices) {
    if (!raw || typeof raw !== 'object') continue
    const c = raw as Record<string, unknown>
    const text = asString(c.text ?? c.label)
    if (!text) {
      throw new Error(`Puzzle step ${stepId} pick_one choice missing text`)
    }
    if (c.correct === true || c.isCorrect === true) correctCount++
  }
  if (correctCount !== 1) {
    throw new Error(
      `Puzzle step ${stepId} pick_one must have exactly one correct choice`,
    )
  }
}

function validateHotspotDrop(step: PuzzleStep, stepId: string): void {
  const hotspots = step.hotspots
  const dragLabels = step.dragLabels ?? step.drag_labels
  if (!Array.isArray(hotspots) || hotspots.length < 2) {
    throw new Error(
      `Puzzle step ${stepId} hotspot_drop requires at least 2 hotspots`,
    )
  }
  if (!Array.isArray(dragLabels) || dragLabels.length !== hotspots.length) {
    throw new Error(
      `Puzzle step ${stepId} hotspot_drop requires dragLabels count to match hotspots`,
    )
  }

  const labelIds = new Set<string>()
  for (const raw of dragLabels) {
    if (!raw || typeof raw !== 'object') continue
    const l = raw as Record<string, unknown>
    const id = asString(l.id)
    const text = asString(l.text ?? l.label)
    if (!id || !text) {
      throw new Error(
        `Puzzle step ${stepId} hotspot_drop dragLabel missing id or text`,
      )
    }
    labelIds.add(id)
  }

  const acceptsIds = new Set<string>()
  for (const raw of hotspots) {
    if (!raw || typeof raw !== 'object') continue
    const h = raw as Record<string, unknown>
    const id = asString(h.id)
    const label = asString(h.label)
    const accepts = asString(h.accepts ?? h.acceptsId)
    if (!id || !label || !accepts) {
      throw new Error(
        `Puzzle step ${stepId} hotspot_drop slot missing id, label, or accepts`,
      )
    }
    if (!labelIds.has(accepts)) {
      throw new Error(
        `Puzzle step ${stepId} hotspot ${id} accepts unknown dragLabel id "${accepts}"`,
      )
    }
    acceptsIds.add(accepts)
    delete h.x
    delete h.y
    delete h.w
    delete h.h
    delete h.width
    delete h.height
  }

  if (acceptsIds.size !== labelIds.size) {
    throw new Error(
      `Puzzle step ${stepId} hotspot_drop must map each dragLabel to exactly one slot`,
    )
  }
}

function validateOrderCheck(step: PuzzleStep, stepId: string): void {
  const choices = step.choices
  const orderSequence = step.orderSequence ?? step.order_sequence
  if (!Array.isArray(choices) || choices.length < 3 || choices.length > 4) {
    throw new Error(
      `Puzzle step ${stepId} order_check requires 3–4 choices`,
    )
  }
  const choiceIds = new Set<string>()
  for (const raw of choices) {
    if (!raw || typeof raw !== 'object') continue
    const c = raw as Record<string, unknown>
    const id = asString(c.id)
    const text = asString(c.text ?? c.label)
    if (!id || !text) {
      throw new Error(
        `Puzzle step ${stepId} order_check choice missing id or text`,
      )
    }
    choiceIds.add(id)
  }

  if (!Array.isArray(orderSequence) || orderSequence.length < 3) {
    throw new Error(
      `Puzzle step ${stepId} order_check requires orderSequence with 3+ ids`,
    )
  }

  for (const id of orderSequence) {
    const sid = asString(id)
    if (!choiceIds.has(sid)) {
      throw new Error(
        `Puzzle step ${stepId} order_check orderSequence references unknown id "${sid}"`,
      )
    }
  }
}

function validateStep(step: PuzzleStep, index: number): void {
  const stepId = asString(step.id) || `s${index + 1}`
  step.id = stepId

  const type = asString(step.type).toLowerCase() || 'pick_one'
  step.type = type

  let prompt = asString(step.prompt ?? step.question)
  if (!prompt) {
    throw new Error(`Puzzle step ${stepId} missing prompt`)
  }
  if (prompt.length > MAX_PROMPT_LEN) {
    prompt = `${prompt.slice(0, MAX_PROMPT_LEN - 1)}…`
    step.prompt = prompt
  } else {
    step.prompt = prompt
  }

  assertBannedPrompt(prompt, stepId)

  const explanation = asString(step.explanation)
  if (!explanation) {
    throw new Error(`Puzzle step ${stepId} missing explanation`)
  }
  step.explanation = explanation

  step.needsImage = false
  delete step.imagePrompt
  delete step.imageUrl

  switch (type) {
    case 'hotspot_drop':
    case 'hotspot':
      step.type = 'hotspot_drop'
      validateHotspotDrop(step, stepId)
      break
    case 'order_check':
    case 'order':
      step.type = 'order_check'
      validateOrderCheck(step, stepId)
      break
    case 'pick_one':
    case 'pick':
    default:
      step.type = 'pick_one'
      validatePickOne(step, stepId)
      break
  }
}

function buildPuzzlePiecesFallback(steps: PuzzleStep[]): PuzzleItem[] {
  return steps.map((step, i) => {
    const id = asString(step.id) || `s${i + 1}`
    const prompt = asString(step.prompt)
    const shortTitle =
      prompt.length > 40 ? `${prompt.slice(0, 37)}…` : prompt || `Step ${i + 1}`
    return { id, text: shortTitle, order: i }
  })
}

function sanitizeItemImages(item: PuzzleItem): void {
  item.needsImage = false
  delete item.imagePrompt
  delete item.imageUrl
}

/**
 * Validates puzzle structure, normalizes fields, and mutates item in place.
 * Throws on hard failures (triggers regeneration in generate route).
 */
export function validateAndNormalizePuzzleItem(item: PuzzleItem): PuzzleItem {
  sanitizeItemImages(item)

  const stepsRaw = item.puzzleSteps ?? item.puzzle_steps
  if (!Array.isArray(stepsRaw)) {
    throw new Error('Puzzle game must have puzzleSteps array on the single item')
  }

  if (stepsRaw.length < MIN_STEPS || stepsRaw.length > MAX_STEPS) {
    throw new Error(
      `Puzzle game must have ${MIN_STEPS}–${MAX_STEPS} steps (got ${stepsRaw.length})`,
    )
  }

  const steps = stepsRaw.filter(
    (s): s is PuzzleStep => s != null && typeof s === 'object',
  ) as PuzzleStep[]

  if (steps.length !== stepsRaw.length) {
    throw new Error('Puzzle steps must be objects')
  }

  steps.forEach((step, i) => validateStep(step, i))
  item.puzzleSteps = steps

  const pieces = item.puzzlePieces ?? item.puzzle_pieces
  if (!Array.isArray(pieces) || pieces.length === 0) {
    item.puzzlePieces = buildPuzzlePiecesFallback(steps)
  } else {
    item.puzzlePieces = pieces
  }

  return item
}

/** Validates exactly one puzzle item in the game items array. */
export function validateAndNormalizePuzzleGame(
  items: unknown[],
): PuzzleItem {
  if (!Array.isArray(items) || items.length !== 1) {
    throw new Error('Puzzle game must have exactly one item')
  }
  const first = items[0]
  if (!first || typeof first !== 'object') {
    throw new Error('Puzzle item must be an object')
  }
  return validateAndNormalizePuzzleItem(first as PuzzleItem)
}

export { BANNED_PROMPT_PATTERNS, MIN_STEPS, MAX_STEPS, MAX_PROMPT_LEN }
