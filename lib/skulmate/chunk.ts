/** Split ingested study text into overlapping chunks for retrieval. */

const DEFAULT_CHARS = 900
const DEFAULT_OVERLAP = 120

export type TextChunk = {
  content: string
  index: number
  tokenCount: number
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.trim().length / 4))
}

export function chunkText(
  text: string,
  opts?: { maxChars?: number; overlap?: number }
): TextChunk[] {
  const maxChars = opts?.maxChars ?? DEFAULT_CHARS
  const overlap = opts?.overlap ?? DEFAULT_OVERLAP
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return []

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0
  while (start < cleaned.length) {
    const end = Math.min(cleaned.length, start + maxChars)
    const slice = cleaned.slice(start, end).trim()
    if (slice) {
      chunks.push({
        content: slice,
        index,
        tokenCount: estimateTokens(slice),
      })
      index += 1
    }
    if (end >= cleaned.length) break
    start = Math.max(end - overlap, start + 1)
  }
  return chunks
}
