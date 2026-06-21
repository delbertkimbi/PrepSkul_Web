/**
 * Phase D1 — lesson path planner (turn-by-turn steps).
 */

import type { LearnerContextInput } from './learner-context'

export type LessonStepType =
  | 'overview'
  | 'concepts'
  | 'drill'
  | 'quiz'
  | 'recap'

export type LessonStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export type LessonStep = {
  type: LessonStepType
  title: string
  body?: string
  bullets?: string[]
  gameType?: 'flashcards' | 'quiz'
  status: LessonStepStatus
}

export type LessonPlanAIResponse = {
  topic: string
  steps: Array<{
    type: LessonStepType
    title: string
    body?: string
    bullets?: string[]
    gameType?: 'flashcards' | 'quiz'
  }>
}

const STEP_TYPES: LessonStepType[] = [
  'overview',
  'concepts',
  'drill',
  'quiz',
  'recap',
]

export function buildLessonPlanPrompt(params: {
  topic: string
  sourceText?: string
  locale?: string
  learnerContext?: LearnerContextInput | null
}): string {
  const lang = params.locale === 'fr' ? 'French' : 'English'
  const source = params.sourceText?.trim()
    ? `\n\nSOURCE MATERIAL (primary — base all steps on this):\n${params.sourceText.slice(0, 12000)}`
    : ''

  return `You are a learning path designer for SkulMate (PrepSkul).
Create a turn-by-turn lesson path for the topic: "${params.topic}".
Learner-facing language: ${lang}.
${source}

Return JSON only:
{
  "topic": "short topic title",
  "steps": [
    {
      "type": "overview|concepts|drill|quiz|recap",
      "title": "step title",
      "body": "1-3 sentences for overview/concepts/recap",
      "bullets": ["optional bullet for concepts step"],
      "gameType": "flashcards|quiz (required for drill and quiz steps only)"
    }
  ]
}

Rules:
- Exactly 4 to 6 steps in this order: overview → concepts → drill → quiz → recap (omit recap only if source is very thin).
- overview: what we will learn (body only).
- concepts: 3-6 key bullets.
- drill: gameType flashcards, body = practice focus.
- quiz: gameType quiz, body = assessment focus.
- recap: summary body celebrating progress.
- No exam labels or syllabus jargon in titles.
- Titles and body in ${lang}.`
}

export function parseLessonPlanResponse(raw: string): LessonPlanAIResponse {
  const parsed = JSON.parse(raw) as LessonPlanAIResponse
  if (!parsed?.steps || !Array.isArray(parsed.steps)) {
    throw new Error('Invalid lesson plan: missing steps')
  }
  return {
    topic: String(parsed.topic || 'Lesson').trim() || 'Lesson',
    steps: parsed.steps.map(normalizeRawStep),
  }
}

function normalizeRawStep(
  step: LessonPlanAIResponse['steps'][number],
  index: number
): LessonPlanAIResponse['steps'][number] {
  const type = STEP_TYPES.includes(step.type) ? step.type : fallbackType(index)
  const title = String(step.title || defaultTitle(type)).trim()
  const body = step.body ? String(step.body).trim() : undefined
  const bullets = Array.isArray(step.bullets)
    ? step.bullets.map((b) => String(b).trim()).filter(Boolean)
    : undefined
  const gameType =
    type === 'drill'
      ? 'flashcards'
      : type === 'quiz'
        ? 'quiz'
        : step.gameType === 'flashcards' || step.gameType === 'quiz'
          ? step.gameType
          : undefined

  return { type, title, body, bullets, gameType }
}

function fallbackType(index: number): LessonStepType {
  return STEP_TYPES[Math.min(index, STEP_TYPES.length - 1)]
}

function defaultTitle(type: LessonStepType): string {
  switch (type) {
    case 'overview':
      return 'Topic overview'
    case 'concepts':
      return 'Key concepts'
    case 'drill':
      return 'Guided practice'
    case 'quiz':
      return 'Quick check'
    case 'recap':
      return 'Recap'
    default:
      return 'Step'
  }
}

export function normalizeLessonSteps(
  steps: LessonPlanAIResponse['steps']
): LessonStep[] {
  const trimmed = steps.slice(0, 6)
  if (trimmed.length < 4) {
    throw new Error('Lesson plan must have at least 4 steps')
  }
  return trimmed.map((s) => ({
    type: s.type,
    title: s.title,
    body: s.body,
    bullets: s.bullets,
    gameType: s.gameType,
    status: 'pending' as LessonStepStatus,
  }))
}

export function fallbackLessonPlan(topic: string, locale?: string): LessonPlanAIResponse {
  const fr = locale === 'fr'
  return {
    topic,
    steps: [
      {
        type: 'overview',
        title: fr ? 'Aperçu du sujet' : 'Topic overview',
        body: fr
          ? `Nous allons explorer ${topic} étape par étape.`
          : `We will explore ${topic} step by step.`,
      },
      {
        type: 'concepts',
        title: fr ? 'Concepts clés' : 'Key concepts',
        bullets: fr
          ? ['Idées principales', 'Vocabulaire important', 'Exemples à retenir']
          : ['Core ideas', 'Important vocabulary', 'Examples to remember'],
      },
      {
        type: 'drill',
        title: fr ? 'Pratique guidée' : 'Guided practice',
        body: fr ? 'Révise avec des cartes.' : 'Review with flashcards.',
        gameType: 'flashcards',
      },
      {
        type: 'quiz',
        title: fr ? 'Défi final' : 'Final challenge',
        body: fr ? 'Teste ce que tu as appris.' : 'Test what you learned.',
        gameType: 'quiz',
      },
      {
        type: 'recap',
        title: fr ? 'Récapitulatif' : 'Recap',
        body: fr
          ? 'Bravo — tu as terminé ce parcours.'
          : 'Nice work — you finished this path.',
      },
    ],
  }
}
