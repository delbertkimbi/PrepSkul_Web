/** Voice-out is a preference, not a lesson feature. Default on. */

export function parseVoiceOut(raw: unknown): boolean {
  if (raw === false || raw === 0) return false
  if (typeof raw === 'string') {
    const v = raw.toLowerCase().trim()
    if (v === 'silent' || v === 'false' || v === '0' || v === 'off' || v === 'mute') return false
  }
  return true
}

export function shouldSpeak(voiceOut: boolean): boolean {
  return voiceOut !== false
}

export function lessonProgress(userTurns: number): number {
  const n = Number.isFinite(userTurns) ? Math.max(0, userTurns) : 0
  return Math.min(0.92, 0.14 + n * 0.16)
}
