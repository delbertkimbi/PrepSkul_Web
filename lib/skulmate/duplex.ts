/**
 * Full-duplex lesson call without WebRTC turn-taking.
 * Mate can speak while the mic stays open. New student speech barges in.
 */

export function shouldBargeIn(input: {
  speaking: boolean
  previousHeard: string
  nextHeard: string
}): boolean {
  if (!input.speaking) return false
  const prev = input.previousHeard.replace(/\s+/g, ' ').trim()
  const next = input.nextHeard.replace(/\s+/g, ' ').trim()
  if (next.length < 4) return false
  if (next === prev) return false
  const added = next.startsWith(prev) ? next.slice(prev.length).trim() : next
  const words = added.split(/\s+/).filter((w) => w.length > 1)
  return words.length >= 2 || added.length >= 12
}

export function isCallMode(listening: boolean, duplex: boolean): boolean {
  return listening || duplex
}

/** End of a spoken turn: the learner paused, so Mate can answer without a tap. */
export function utteranceReady(input: {
  heard: string
  lastChangedAt: number
  now: number
  silenceMs?: number
  minChars?: number
}): boolean {
  const heard = input.heard.replace(/\s+/g, ' ').trim()
  if (heard.length < (input.minChars ?? 4)) return false
  return input.now - input.lastChangedAt >= (input.silenceMs ?? 1400)
}
