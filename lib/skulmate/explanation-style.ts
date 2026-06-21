/**
 * Phase C3 — explanation style (background only, no learner-facing labels).
 * visual | story | quiz_first | balanced
 */

import type { LearnerContextInput } from './learner-context'

export type ExplanationStyle = 'visual' | 'story' | 'quiz_first' | 'balanced'

const STYLE_ORDER: ExplanationStyle[] = [
  'visual',
  'story',
  'quiz_first',
]

function normalizeText(value: string): string {
  return value.toLowerCase().trim()
}

function stylesFromLearnerContext(
  ctx?: LearnerContextInput | null
): string[] {
  if (!ctx) return []
  const raw = ctx.learning_style ?? (ctx as { learning_styles?: unknown }).learning_styles
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((v) => String(v)).filter(Boolean)
  }
  return [String(raw)]
}

function styleFromSurveyHints(hints: string[]): ExplanationStyle | null {
  const blob = normalizeText(hints.join(' '))
  if (!blob) return null

  if (
    /visual|diagram|picture|see|spatial|chart|graph|map|draw|image/.test(blob)
  ) {
    return 'visual'
  }
  if (
    /story|narrat|analog|example|real.?world|scenario|listen|auditory|talk/.test(
      blob
    )
  ) {
    return 'story'
  }
  if (
    /quiz|question|practice|test|active|kinesthetic|hands?.on|do|try/.test(blob)
  ) {
    return 'quiz_first'
  }
  if (/read|write|text|note/.test(blob)) {
    return 'balanced'
  }
  return null
}

/** Stable pseudo-random bucket for users without survey style (silent A/B). */
export function stableExplanationStyleBucket(seed: string): ExplanationStyle {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return STYLE_ORDER[hash % STYLE_ORDER.length]
}

function nextRotatedStyle(last?: ExplanationStyle | null): ExplanationStyle {
  if (!last || last === 'balanced') return 'visual'
  const idx = STYLE_ORDER.indexOf(last)
  if (idx === -1) return 'visual'
  return STYLE_ORDER[(idx + 1) % STYLE_ORDER.length]
}

export function resolveExplanationStyle(params: {
  learnerContext?: LearnerContextInput | null
  userId?: string | null
  weakTopicReroute?: boolean
  lastStyle?: ExplanationStyle | null
}): ExplanationStyle {
  if (params.weakTopicReroute) {
    return nextRotatedStyle(params.lastStyle)
  }

  const fromSurvey = styleFromSurveyHints(
    stylesFromLearnerContext(params.learnerContext)
  )
  if (fromSurvey) return fromSurvey

  if (params.userId) {
    return stableExplanationStyleBucket(params.userId)
  }

  return 'balanced'
}

export function buildExplanationStylePromptSection(
  style: ExplanationStyle
): string {
  if (style === 'balanced') return ''

  const guides: Record<Exclude<ExplanationStyle, 'balanced'>, string> = {
    visual:
      'Use concrete imagery, spatial relationships, and step-by-step structure. Mention shapes, flows, or diagrams-in-words when helpful. Keep copy short.',
    story:
      'Use a brief real-world analogy or mini-scenario before the fact. Make it memorable and conversational, not childish.',
    quiz_first:
      'Open with one guiding question, then explain. End with a quick check-for-understanding line. Do not turn it into a full quiz.',
  }

  return (
    '\n\nEXPLANATION STYLE (silent — do not label the style to the learner):\n' +
    `- ${guides[style]}\n` +
    '- Stay faithful to the source material; style adjusts delivery only.\n'
  )
}

export function buildExplainApiStyleInstruction(style: ExplanationStyle): string {
  switch (style) {
    case 'visual':
      return 'Explain with vivid but concise imagery and clear step-by-step structure. Help the learner picture the idea.'
    case 'story':
      return 'Explain using a short real-world analogy or scenario, then tie it back to the definition clearly.'
    case 'quiz_first':
      return 'Start with one thought-provoking question, answer it in 2 short paragraphs, end with one sentence check-for-understanding.'
    default:
      return 'Explain clearly in 2–3 short paragraphs with plain language.'
  }
}
