export type BoardStepKind = 'heading' | 'equation' | 'note' | 'diagram' | 'prompt'

export type BoardStep = {
  kind: BoardStepKind
  text: string
}

export type WhiteboardPayload = {
  title: string
  steps: BoardStep[]
}

const KINDS: BoardStepKind[] = ['heading', 'equation', 'note', 'diagram', 'prompt']

export function validateWhiteboard(raw: unknown): WhiteboardPayload | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, unknown>
  const title = String(data.title || 'Board').slice(0, 80)
  const stepsRaw = Array.isArray(data.steps) ? data.steps : []
  const steps: BoardStep[] = []
  for (const row of stepsRaw) {
    if (!row || typeof row !== 'object') continue
    const item = row as Record<string, unknown>
    const kind = KINDS.includes(item.kind as BoardStepKind)
      ? (item.kind as BoardStepKind)
      : 'note'
    const text = String(item.text || '').replace(/\s+/g, ' ').trim().slice(0, 280)
    if (!text) continue
    steps.push({ kind, text })
    if (steps.length >= 8) break
  }
  if (!steps.length) return null
  return { title, steps }
}

export function boardFromFocusPrompt(prompt: string, title = 'Think out loud'): WhiteboardPayload {
  return {
    title,
    steps: [{ kind: 'prompt', text: prompt.slice(0, 280) }],
  }
}
