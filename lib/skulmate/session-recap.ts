export type SessionRecap = {
  title: string
  covered: string[]
  stuck: string[]
  nextMove: string
  studentDidTheWork: boolean
}

export function buildSessionRecap(input: {
  title?: string | null
  turns: Array<{ role: string; text?: string | null }>
  weakConcepts?: Array<{ conceptId?: string }>
  independentChecksPassed?: number
}): SessionRecap {
  const studentTurns = input.turns.filter((t) => t.role === 'user')
  const tutorTurns = input.turns.filter((t) => t.role === 'assistant')
  const covered = unique(
    studentTurns
      .map((t) => (t.text || '').replace(/\s+/g, ' ').trim().slice(0, 72))
      .filter((t) => t.length > 8)
      .slice(0, 5)
  )
  const stuck = unique(
    (input.weakConcepts || [])
      .map((w) => w.conceptId)
      .filter((id): id is string => Boolean(id))
      .slice(0, 5)
  )
  const studentShare =
    studentTurns.length / Math.max(1, studentTurns.length + tutorTurns.length)
  return {
    title: (input.title || covered[0] || 'Tutor session').slice(0, 80),
    covered,
    stuck,
    nextMove: stuck[0]
      ? `Independent check on ${stuck[0]} next time.`
      : 'Pick up the next idea they name.',
    studentDidTheWork: studentShare >= 0.35 || (input.independentChecksPassed || 0) > 0,
  }
}

function unique(items: string[]): string[] {
  return [...new Set(items)]
}
