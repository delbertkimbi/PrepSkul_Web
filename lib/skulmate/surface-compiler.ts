import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import { getSkulMateApiKeys, hasSkulMateApiKeys } from './auth'
import { getEngineConfig } from './engines/registry'
import { validatePracticeSurface, type PracticeSurface } from './surface-contract'

export async function compilePracticeSurface(params: {
  sourceText: string
  conceptId?: string
  preferredType?: string
  language?: string
}): Promise<PracticeSurface | null> {
  if (!hasSkulMateApiKeys()) return null
  const keys = getSkulMateApiKeys()
  const model = getEngineConfig('surface').model
  const typeHint = params.preferredType || 'quiz'
  const prompt = `Create a short in-thread practice surface from the source.
Return JSON only: {"title": string, "gameType": "quiz"|"flashcards"|"matching"|"fill_blank", "conceptId": string, "items": [...]}
Rules:
- 1 to 3 items only.
- gameType ${typeHint} unless another type fits the source better.
- quiz items need question, options (4), correctAnswer index, explanation.
- flashcards need term + definition.
- matching needs leftItem + rightItem.
- fill_blank needs blankText with ____ and correctAnswer string.
- Language: ${params.language || 'en'}
- Teach the source. Do not invent a different topic.
Source:
${params.sourceText.slice(0, 3500)}`

  for (const key of keys) {
    try {
      const response = await callOpenRouterWithKey(key, {
        model,
        messages: [
          {
            role: 'system',
            content:
              'You compile playable practice JSON for a tutor thread. No markdown.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      })
      const raw = response.choices?.[0]?.message?.content || '{}'
      const parsed = JSON.parse(stripFences(raw))
      if (params.conceptId && !parsed.conceptId) parsed.conceptId = params.conceptId
      const result = validatePracticeSurface(parsed)
      if (result.ok) return result.surface
    } catch {
      continue
    }
  }
  return null
}

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}
