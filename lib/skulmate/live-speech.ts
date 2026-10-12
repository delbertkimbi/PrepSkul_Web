/**
 * Real-time tutor speech: speak the words the typewriter has already shown,
 * not the whole paragraph after it finishes.
 */

export function speakableDelta(
  full: string,
  spokenEnd: number,
  typedEnd: number
): { chunk: string; end: number } | null {
  if (!full) return null
  const typed = Math.max(0, Math.min(typedEnd, full.length))
  const spoken = Math.max(0, Math.min(spokenEnd, typed))
  if (typed <= spoken) return null

  const rest = full.slice(spoken, typed)
  const sentence = rest.match(/^[\s\S]*?[.!?…](?:["')\]]*)(?:\s|$)/)
  if (sentence) {
    return { chunk: sentence[0], end: spoken + sentence[0].length }
  }
  const word = rest.match(/^[\s\S]*?\s/)
  if (word) {
    return { chunk: word[0], end: spoken + word[0].length }
  }
  if (typed >= full.length && rest.trim()) {
    return { chunk: rest, end: typed }
  }
  return null
}

export function flushSpoken(full: string, spokenEnd: number): { chunk: string; end: number } | null {
  if (spokenEnd >= full.length) return null
  const chunk = full.slice(spokenEnd)
  if (!chunk.trim()) return { chunk: '', end: full.length }
  return { chunk, end: full.length }
}
