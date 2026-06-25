/**
 * Multimodal image understanding for SkulMate intake.
 * Produces structured study context — OCR supplements this, never blocks it.
 */

import { callOpenRouterWithKey } from '@/lib/ticha/openrouter'

const UNDERSTAND_MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-flash-1.5',
]

export type PerImageEvidence = {
  imageIndex: number
  label: string
  observations: string[]
}

export type ImageUnderstandResult = {
  summary: string
  topicLabel: string
  concepts: string[]
  perImageEvidence: PerImageEvidence[]
  confidence: number
  studyText: string
}

function getSkulMateApiKeys(): string[] {
  const primary = process.env.SKULMATE_OPENROUTER_API_KEY
  const fallback = process.env.OPENROUTER_API_KEY
  const keys = [primary, fallback].filter((k): k is string => Boolean(k && k.trim()))
  const unique = [...new Set(keys)]
  if (unique.length === 0) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  return unique
}

function parseTextContent(response: unknown): string {
  const rawContent = (response as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0]?.message?.content

  if (typeof rawContent === 'string') return rawContent.trim()

  if (Array.isArray(rawContent)) {
    return rawContent
      .map((part: unknown) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text: string }).text)
        }
        return ''
      })
      .join('\n')
      .trim()
  }

  return ''
}

export function parseUnderstandJson(raw: string): Omit<ImageUnderstandResult, 'studyText'> {
  const trimmed = raw.trim()
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const jsonStr = fenceMatch?.[1]?.trim() ?? trimmed

  const parsed = JSON.parse(jsonStr) as {
    summary?: string
    topicLabel?: string
    concepts?: unknown[]
    perImageEvidence?: Array<{
      imageIndex?: number
      label?: string
      observations?: unknown[]
    }>
    confidence?: number
  }

  const summary = String(parsed.summary || '').trim()
  const topicLabel = String(parsed.topicLabel || parsed.summary || 'Study notes').trim()
  const concepts = Array.isArray(parsed.concepts)
    ? parsed.concepts.map((c) => String(c).trim()).filter(Boolean)
    : []

  const perImageEvidence: PerImageEvidence[] = Array.isArray(parsed.perImageEvidence)
    ? parsed.perImageEvidence.map((row, idx) => ({
        imageIndex: typeof row.imageIndex === 'number' ? row.imageIndex : idx + 1,
        label: String(row.label || `Image ${idx + 1}`).trim(),
        observations: Array.isArray(row.observations)
          ? row.observations.map((o) => String(o).trim()).filter(Boolean)
          : [],
      }))
    : []

  let confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.5
  if (confidence > 1) confidence = confidence / 100
  confidence = Math.max(0, Math.min(1, confidence))

  if (!summary && concepts.length === 0 && perImageEvidence.length === 0) {
    throw new Error('Understand response was empty')
  }

  return { summary, topicLabel, concepts, perImageEvidence, confidence }
}

export function formatUnderstandResultAsStudyText(
  result: Omit<ImageUnderstandResult, 'studyText'>
): string {
  const lines: string[] = []
  if (result.topicLabel) lines.push(`Topic: ${result.topicLabel}`)
  if (result.summary) lines.push('', result.summary)
  if (result.concepts.length > 0) {
    lines.push('', 'Key concepts:')
    for (const c of result.concepts) lines.push(`- ${c}`)
  }
  for (const ev of result.perImageEvidence) {
    if (ev.observations.length === 0) continue
    lines.push('', `[${ev.label}]`)
    for (const o of ev.observations) lines.push(`- ${o}`)
  }
  return lines.join('\n').trim()
}

function buildUnderstandPrompt(imageCount: number): string {
  return (
    `You are analyzing ${imageCount} study image(s) for a learning app. ` +
    'Describe what the learner is studying — printed notes, handwriting, whiteboards, diagrams, textbooks. ' +
    'Extract educational meaning even when OCR would fail.\n\n' +
    'Return JSON only (no markdown outside the object):\n' +
    '{\n' +
    '  "topicLabel": "short topic title (max 12 words)",\n' +
    '  "summary": "2-4 sentences of what the content covers",\n' +
    '  "concepts": ["key term or idea", "..."],\n' +
    '  "perImageEvidence": [\n' +
    '    { "imageIndex": 1, "label": "brief label", "observations": ["what you see", "..."] }\n' +
    '  ],\n' +
    '  "confidence": 0.0 to 1.0 (how sure you are the content is study-worthy and readable)\n' +
    '}\n\n' +
    'Rules:\n' +
    '- Include one perImageEvidence entry per image, in order.\n' +
    '- concepts: 3-12 items when possible.\n' +
    '- confidence below 0.4 only if image is blank, unreadable, or not educational.\n' +
    '- Do not invent facts not supported by the images.'
  )
}

/**
 * One vision call for 1–N image URLs (signed Supabase or data URLs).
 */
export async function understandImageBundle(
  imageUrls: string[]
): Promise<ImageUnderstandResult> {
  const urls = imageUrls.map((u) => u.trim()).filter(Boolean)
  if (urls.length === 0) {
    throw new Error('understandImageBundle requires at least one image URL')
  }

  const apiKeys = getSkulMateApiKeys()
  const prompt = buildUnderstandPrompt(urls.length)

  const imageParts = urls.map((url) => ({
    type: 'image_url' as const,
    image_url: { url },
  }))

  let lastError: Error | null = null

  for (const apiKey of apiKeys) {
    for (const model of UNDERSTAND_MODELS) {
      try {
        const response = await callOpenRouterWithKey(apiKey, {
          model,
          messages: [
            {
              role: 'user',
              content: [{ type: 'text', text: prompt }, ...imageParts],
            },
          ],
          max_tokens: 2200,
          temperature: 0.2,
        })

        const raw = parseTextContent(response)
        if (raw.length < 20) {
          throw new Error('Understand response too short')
        }

        const parsed = parseUnderstandJson(raw)
        const studyText = formatUnderstandResultAsStudyText(parsed)

        if (studyText.length < 30) {
          throw new Error('Formatted study text too short')
        }

        return { ...parsed, studyText }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[skulMate understand] Model ${model} failed:`, lastError.message)
      }
    }
  }

  throw new Error(
    `Image understanding failed: ${lastError?.message || 'Unknown error'}`
  )
}

export function isLowConfidenceUnderstand(confidence: number): boolean {
  return confidence < 0.6
}
