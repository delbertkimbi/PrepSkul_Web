/**
 * Generate additional revision deck cards from existing source material.
 */

import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'
import type { RevisionDeck, RevisionDeckCard } from './revision-deck'
import { pickConceptCheckCardIds } from './revision-deck'

function getSkulMateApiKeys(): string[] {
  const keys = [
    process.env.SKULMATE_OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_SKULMATE_KEY,
  ].filter((key): key is string => Boolean(key && key.trim()))
  return [...new Set(keys)]
}

function slugId(value: string, index: number): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
  return `more-${base || 'card'}-${index + 1}`
}

function parseAppendResponse(raw: string, startIndex: number): RevisionDeckCard[] {
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return []
  const parsed = JSON.parse(jsonMatch[0]) as {
    cards?: Array<Record<string, unknown>>
  }
  const rows = Array.isArray(parsed.cards) ? parsed.cards : []
  const unitId = 'core-1'
  const cards: RevisionDeckCard[] = []

  rows.forEach((row, offset) => {
    const prompt = String(row.prompt ?? row.question ?? row.term ?? '').trim()
    const answer = String(row.answer ?? row.definition ?? '').trim()
    if (!prompt || !answer) return

    const cardTypeRaw = String(row.cardType ?? row.type ?? 'mcq').toLowerCase()
    const cardType =
      cardTypeRaw === 'term_def' || cardTypeRaw === 'flashcard'
        ? 'term_def'
        : cardTypeRaw === 'pair' || cardTypeRaw === 'matching'
          ? 'pair'
          : cardTypeRaw === 'cloze' || cardTypeRaw === 'fill_blank'
            ? 'cloze'
            : 'mcq'

    const distractors = Array.isArray(row.distractors)
      ? row.distractors.map((d) => String(d).trim()).filter(Boolean)
      : undefined

    cards.push({
      id: slugId(prompt, startIndex + offset),
      knowledgeUnitId: unitId,
      cardType: cardType as RevisionDeckCard['cardType'],
      prompt,
      answer,
      distractors,
      explanation:
        typeof row.explanation === 'string' ? row.explanation.trim() : undefined,
      difficulty: 'medium',
      tags: ['append'],
    })
  })

  return cards
}

export async function generateAppendDeckCards(params: {
  sourceText: string
  topicLabel: string
  existingDeck: RevisionDeck
  count?: number
}): Promise<RevisionDeckCard[]> {
  const { sourceText, topicLabel, existingDeck } = params
  const count = Math.min(Math.max(params.count ?? 6, 3), 10)
  const existingSummaries = existingDeck.cards
    .slice(0, 40)
    .map((card) => `- ${card.prompt} → ${card.answer}`)
    .join('\n')

  const systemPrompt = `You add revision cards for an existing study deck.
Return JSON only: { "cards": [ { "cardType": "mcq|term_def|pair|cloze", "prompt": "...", "answer": "...", "distractors": ["..."], "explanation": "..." } ] }
Rules:
- Use ONLY facts from the provided source text.
- Do NOT repeat cards that already exist.
- Mix card types when possible.
- Keep prompts concise and student-friendly.`

  const userPrompt = `Topic: ${topicLabel}

Source text:
${sourceText.slice(0, 6000)}

Existing cards (do not duplicate):
${existingSummaries || '(none)'}

Add ${count} NEW revision cards grounded in the source.`

  const apiKeys = getSkulMateApiKeys()
  if (apiKeys.length === 0) {
    throw new Error('SkulMate AI is not configured for card generation.')
  }

  const models = [
    process.env.SKULMATE_GAME_MODEL,
    'google/gemini-2.0-flash-001',
    'openai/gpt-4o-mini',
  ].filter((model): model is string => Boolean(model))

  let lastError: Error | null = null
  for (const apiKey of apiKeys) {
    for (const model of models) {
      try {
        const response = await callOpenRouterWithKey(apiKey, {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 2200,
          response_format: { type: 'json_object' },
        })
        const content = response.choices?.[0]?.message?.content ?? ''
        const cards = parseAppendResponse(content, existingDeck.cards.length)
        if (cards.length === 0) {
          throw new Error('No new cards were generated')
        }
        return cards.slice(0, count)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  throw lastError ?? new Error('Failed to generate more cards')
}

export function appendCardsToDeck(
  deck: RevisionDeck,
  newCards: RevisionDeckCard[]
): RevisionDeck {
  const mergedCards = [...deck.cards, ...newCards]
  return {
    ...deck,
    cards: mergedCards,
    conceptCheckCardIds: pickConceptCheckCardIds(mergedCards),
  }
}
