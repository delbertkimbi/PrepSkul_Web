export type SkillNode = {
  id: string
  label?: string
  mastery: number
  attempts: number
  prerequisites?: string[]
}

export type SkillMap = Record<string, SkillNode>

export function upsertSkill(
  map: SkillMap | null | undefined,
  input: { id: string; label?: string; correct: boolean; prerequisites?: string[] }
): SkillMap {
  const next: SkillMap = { ...(map || {}) }
  const prev = next[input.id]
  const attempts = (prev?.attempts || 0) + 1
  const prevMastery = prev?.mastery ?? 0.4
  const mastery = clamp(
    prevMastery + (input.correct ? 0.18 : -0.22),
    0,
    1
  )
  next[input.id] = {
    id: input.id,
    label: input.label || prev?.label || input.id,
    mastery,
    attempts,
    prerequisites: input.prerequisites || prev?.prerequisites,
  }
  return next
}

export function weakestSkills(map: SkillMap | null | undefined, limit = 4): SkillNode[] {
  return Object.values(map || {})
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, limit)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
