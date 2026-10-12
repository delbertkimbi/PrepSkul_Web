import { getEngineConfig } from './engines/registry'
import { getSkulMateApiKeys } from './auth'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const config = getEngineConfig('embed')
  const keys = getSkulMateApiKeys()
  let lastError: Error | null = null

  for (const key of keys) {
    try {
      const response = await fetch(`${OPENROUTER_BASE}/embeddings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          input: texts,
        }),
      })
      if (!response.ok) {
        lastError = new Error(
          `Embed failed: ${response.status} ${await response.text()}`
        )
        continue
      }
      const json = (await response.json()) as {
        data?: Array<{ embedding: number[] }>
      }
      const vectors = (json.data || []).map((row) => row.embedding)
      if (vectors.length === texts.length) return vectors
      lastError = new Error('Embed response length mismatch')
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError || new Error('Embedding engines unavailable')
}
