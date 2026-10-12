/**
 * Learner growth memory. Cloud: skulmate_learner_state + pgvector.
 * Local: the same shape in localStorage so demo and offline still learn.
 */

import { upsertSkill, weakestSkills, type SkillMap } from './skill-map'
import { unitsForSubject, type CorpusUnit } from './curriculum-corpus'

export type Challenge = {
  conceptId: string
  label: string
  misses: number
  lastAt: string
}

export type LearnerMemory = {
  subjectId?: string | null
  goals: string[]
  summary: string
  challenges: Challenge[]
  skillMap: SkillMap
  lastTopics: string[]
  updatedAt: string
}

export const LOCAL_MEMORY_KEY = 'skulmate.memory'

export function emptyMemory(subjectId?: string | null): LearnerMemory {
  return {
    subjectId: subjectId || null,
    goals: [],
    summary: '',
    challenges: [],
    skillMap: {},
    lastTopics: [],
    updatedAt: new Date().toISOString(),
  }
}

export function loadLocalMemory(): LearnerMemory {
  if (typeof window === 'undefined') return emptyMemory()
  try {
    const raw = window.localStorage.getItem(LOCAL_MEMORY_KEY)
    if (!raw) return emptyMemory()
    const parsed = JSON.parse(raw) as LearnerMemory
    return {
      ...emptyMemory(parsed.subjectId),
      ...parsed,
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      challenges: Array.isArray(parsed.challenges) ? parsed.challenges : [],
      skillMap: parsed.skillMap && typeof parsed.skillMap === 'object' ? parsed.skillMap : {},
      lastTopics: Array.isArray(parsed.lastTopics) ? parsed.lastTopics : [],
    }
  } catch {
    return emptyMemory()
  }
}

export function saveLocalMemory(memory: LearnerMemory): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      LOCAL_MEMORY_KEY,
      JSON.stringify({ ...memory, updatedAt: new Date().toISOString() })
    )
  } catch {
    /* ignore quota */
  }
}

export function rememberTurn(input: {
  memory?: LearnerMemory | null
  subjectId?: string | null
  conceptId?: string | null
  label?: string
  correct?: boolean | null
  goal?: string | null
  summary?: string | null
}): LearnerMemory {
  const next = { ...(input.memory || emptyMemory(input.subjectId)) }
  if (input.subjectId) next.subjectId = input.subjectId
  if (input.goal) {
    next.goals = [input.goal, ...next.goals.filter((g) => g !== input.goal)].slice(0, 6)
  }
  if (input.summary) next.summary = input.summary.slice(0, 280)
  if (input.conceptId) {
    next.lastTopics = [
      input.conceptId,
      ...next.lastTopics.filter((t) => t !== input.conceptId),
    ].slice(0, 8)
    if (typeof input.correct === 'boolean') {
      next.skillMap = upsertSkill(next.skillMap, {
        id: input.conceptId,
        label: input.label,
        correct: input.correct,
      })
      if (!input.correct) {
        const existing = next.challenges.find((c) => c.conceptId === input.conceptId)
        if (existing) {
          existing.misses += 1
          existing.lastAt = new Date().toISOString()
          existing.label = input.label || existing.label
        } else {
          next.challenges.unshift({
            conceptId: input.conceptId,
            label: input.label || input.conceptId,
            misses: 1,
            lastAt: new Date().toISOString(),
          })
        }
      } else {
        next.challenges = next.challenges.filter((c) => c.conceptId !== input.conceptId)
      }
      next.challenges = next.challenges.slice(0, 8)
    }
  }
  next.updatedAt = new Date().toISOString()
  return next
}

export function memoryPromptBlock(memory?: LearnerMemory | null): string {
  if (!memory) return ''
  const lines = ['LEARNER GROWTH (teach from this, do not mention the file)']
  if (memory.subjectId) lines.push(`They chose to study: ${memory.subjectId}.`)
  if (memory.goals.length) lines.push(`Goals: ${memory.goals.slice(0, 3).join('; ')}.`)
  if (memory.challenges.length) {
    lines.push(
      `Diagnosed challenges: ${memory.challenges
        .slice(0, 4)
        .map((c) => `${c.label} (${c.misses} misses)`)
        .join(', ')}.`
    )
  }
  const weak = weakestSkills(memory.skillMap, 4)
  if (weak.length) {
    lines.push(
      `Skill map, weak first: ${weak
        .map((s) => `${s.label || s.id} ${Math.round(s.mastery * 100)}%`)
        .join(', ')}.`
    )
  }
  if (memory.summary) lines.push(`Running summary: ${memory.summary}`)
  if (memory.lastTopics.length) lines.push(`Recent topics: ${memory.lastTopics.slice(0, 4).join(', ')}.`)
  if (lines.length === 1) return ''
  return lines.join('\n')
}

export function suggestStarters(input: {
  subjectId?: string | null
  memory?: LearnerMemory | null
  language?: string
}): Array<{ label: string; message: string }> {
  const fr = (input.language || '').toLowerCase().startsWith('fr')
  const units = unitsForSubject(input.subjectId)
  const fromChallenges = (input.memory?.challenges || [])
    .map((c) => units.find((u) => u.conceptId === c.conceptId))
    .filter((u): u is CorpusUnit => Boolean(u))
  const picked = (fromChallenges.length ? fromChallenges : units).slice(0, 2)
  return picked.map((unit) => ({
    label: unit.title,
    message: fr ? unit.focusing.fr : unit.focusing.en,
  }))
}

export function mergeCloudMemory(
  local: LearnerMemory,
  cloud?: {
    summary?: string | null
    class_level?: string | null
    skill_map?: SkillMap | null
    weak_concepts?: Array<{ conceptId?: string; masteryScore?: number }>
  } | null
): LearnerMemory {
  if (!cloud) return local
  const next = { ...local }
  if (cloud.summary && !next.summary) next.summary = cloud.summary
  if (cloud.skill_map) {
    next.skillMap = { ...cloud.skill_map, ...next.skillMap }
  }
  for (const weak of cloud.weak_concepts || []) {
    if (!weak.conceptId) continue
    if (next.challenges.some((c) => c.conceptId === weak.conceptId)) continue
    next.challenges.push({
      conceptId: weak.conceptId,
      label: weak.conceptId,
      misses: 1,
      lastAt: next.updatedAt,
    })
  }
  return next
}
