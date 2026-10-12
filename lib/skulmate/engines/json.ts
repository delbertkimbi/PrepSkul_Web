/** Pull a JSON object out of model chatter, fences, or trailing text. */
export function extractJsonObject(raw: string): Record<string, unknown> | null {
  if (!raw) return null
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const direct = tryParse(cleaned)
  if (direct) return direct
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return tryParse(cleaned.slice(start, end + 1))
  }
  return null
}

function tryParse(text: string): Record<string, unknown> | null {
  try {
    const value = JSON.parse(text)
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
  } catch {
    return null
  }
  return null
}
