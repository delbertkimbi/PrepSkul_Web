/**
 * Background curriculum matcher — silent enrichment only.
 * Uses bundled seed corpus; optional DB sync via migration 099.
 */

import seedData from '@/data/curriculum/seed-nodes.json'
import type { CurriculumAlignment, LearnerContextInput } from './learner-context'

export type CurriculumNodeSeed = {
  topic_id: string
  framework_id: string
  subject_code: string
  title_en: string
  title_fr: string
  grade_levels: string[]
  keywords: string[]
  objectives: string[]
}

type MatchResult = {
  node: CurriculumNodeSeed
  score: number
}

const NODES: CurriculumNodeSeed[] = (seedData as { nodes: CurriculumNodeSeed[] }).nodes

const SCHOOL_FRAMEWORK_HINTS: Record<string, string[]> = {
  cm_gce_ol: ['gce', 'o level', 'o/l', 'ordinary', 'form 3', 'form 4', 'form 5'],
  cm_gce_al: ['gce', 'a level', 'a/l', 'advanced', 'lower sixth', 'upper sixth', 'u6', 'l6'],
  cm_francophone: ['bepc', 'probatoire', 'bac', 'francophone', 'seconde', 'première', 'terminale'],
  waec: ['waec', 'wassce', 'ssce'],
  steam: ['steam', 'coding', 'programming', 'robotics'],
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function learnerFrameworkIds(ctx?: LearnerContextInput | null): string[] {
  if (!ctx) return []
  const blob = normalizeText(
    [
      ctx.curriculum,
      ctx.exam,
      ctx.exam_type,
      ctx.target_exam,
      ctx.class_level,
      ctx.student_grade,
    ]
      .filter(Boolean)
      .join(' ')
  )

  const ids: string[] = []
  for (const [frameworkId, hints] of Object.entries(SCHOOL_FRAMEWORK_HINTS)) {
    if (hints.some((h) => blob.includes(h))) ids.push(frameworkId)
  }
  return ids
}

function scoreNode(text: string, node: CurriculumNodeSeed): number {
  let score = 0
  const title = normalizeText(node.title_en)
  for (const word of title.split(/\s+/)) {
    if (word.length >= 4 && text.includes(word)) score += 2
  }
  for (const kw of node.keywords) {
    if (text.includes(normalizeText(kw))) score += 3
  }
  for (const obj of node.objectives) {
    const firstWord = normalizeText(obj).split(/\s+/)[0]
    if (firstWord.length >= 5 && text.includes(firstWord)) score += 1
  }
  return score
}

export function matchCurriculumNodes(params: {
  extractedText: string
  learnerContext?: LearnerContextInput | null
  limit?: number
}): MatchResult[] {
  const text = normalizeText(params.extractedText.slice(0, 12000))
  const preferredFrameworks = learnerFrameworkIds(params.learnerContext)
  const limit = params.limit ?? 3

  const scored = NODES.map((node) => {
    let score = scoreNode(text, node)
    if (preferredFrameworks.includes(node.framework_id)) score += 2
    return { node, score }
  })
    .filter((r) => r.score >= 3)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit)
}

export function resolveBackgroundCurriculumAlignment(params: {
  extractedText: string
  learnerContext?: LearnerContextInput | null
}): CurriculumAlignment {
  const matches = matchCurriculumNodes(params)
  if (matches.length === 0) {
    return { mode: 'open', confidence: 0 }
  }

  const top = matches[0]
  const hasSchoolProfile = learnerFrameworkIds(params.learnerContext).length > 0
  const confidence = Math.min(0.95, top.score / 15)

  if (top.score >= 8 && hasSchoolProfile) {
    return {
      mode: 'school_matched',
      confidence,
      frameworkId: top.node.framework_id,
      matchedTopicIds: matches.map((m) => m.node.topic_id),
    }
  }

  if (top.score >= 5) {
    return {
      mode: 'school_soft',
      confidence,
      frameworkId: top.node.framework_id,
      matchedTopicIds: matches.map((m) => m.node.topic_id),
    }
  }

  return {
    mode: 'open',
    confidence,
    frameworkId: top.node.framework_id,
    matchedTopicIds: matches.map((m) => m.node.topic_id),
  }
}

/** Silent prompt enrichment — never overrides source topic. */
export function buildCurriculumBackgroundPromptSection(
  alignment: CurriculumAlignment,
  matches: MatchResult[]
): string {
  if (matches.length === 0 || alignment.mode === 'open') return ''

  const top = matches[0].node
  const objectives = top.objectives.slice(0, 3).join('; ')

  return (
    '\n\nOPTIONAL CURRICULUM HINTS (background only — do not mention in title; source content still wins):\n' +
    `- Related syllabus area: ${top.title_en}\n` +
    `- You may optionally reinforce these learning points if they fit the source: ${objectives}\n` +
    '- If the source is off-syllabus, ignore this section completely.\n'
  )
}

export function getMatchedNodes(topicIds: string[]): CurriculumNodeSeed[] {
  const set = new Set(topicIds)
  return NODES.filter((n) => set.has(n.topic_id))
}
