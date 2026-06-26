import { createHash } from 'crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const OPENROUTER_IMAGES_URL = 'https://openrouter.ai/api/v1/images'
const DEFAULT_MODEL =
  process.env.SKULMATE_IMAGE_MODEL || 'black-forest-labs/flux.2-klein-4b'

export function buildIllustrationPrompt(imagePrompt: string, topic?: string): string {
  const subject = imagePrompt.trim()
  const topicLine = topic?.trim() ? `Topic: ${topic.trim()}. ` : ''
  return (
    `${topicLine}Educational diagram for secondary students: ${subject}. ` +
    'Modern flat vector illustration, soft colors, clear process arrows and icons, white background, no text, no labels, no watermark, centered composition, accurate and engaging.'
  )
}

export function hashIllustrationPrompt(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').slice(0, 32)
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase admin credentials for illustration upload')
  }
  return createClient(url, key)
}

function getSkulMateApiKey(): string {
  const key =
    process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY')
  }
  return key
}

async function fetchExistingPublicUrl(hash: string): Promise<string | null> {
  const supabase = getSupabaseAdmin()
  const path = `skulmate-illustrations/${hash}.png`
  const { data } = supabase.storage.from('documents').getPublicUrl(path)
  if (!data?.publicUrl) return null

  try {
    const head = await fetch(data.publicUrl, { method: 'HEAD' })
    if (head.ok) return data.publicUrl
  } catch {
    // miss cache
  }
  return null
}

export interface GenerateIllustrationResult {
  imageUrl: string
  cached: boolean
  model: string
}

/**
 * Generate or return cached educational illustration via OpenRouter Image API.
 */
export async function generateEducationalIllustration(
  imagePrompt: string,
  options?: { topic?: string; model?: string },
): Promise<GenerateIllustrationResult> {
  const prompt = buildIllustrationPrompt(imagePrompt, options?.topic)
  const hash = hashIllustrationPrompt(prompt)
  const cachedUrl = await fetchExistingPublicUrl(hash)
  if (cachedUrl) {
    return { imageUrl: cachedUrl, cached: true, model: options?.model || DEFAULT_MODEL }
  }

  const apiKey = getSkulMateApiKey()
  const model = options?.model || DEFAULT_MODEL

  const response = await fetch(OPENROUTER_IMAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer':
        process.env.NEXT_PUBLIC_SITE_URL || 'https://prepskul.com',
      'X-Title': 'PrepSkul SkulMate',
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      aspect_ratio: '4:3',
      output_format: 'png',
      background: 'transparent',
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter image API error: ${response.status} - ${errText}`)
  }

  const payload = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>
    usage?: { cost?: number }
  }

  const first = payload.data?.[0]
  let buffer: Buffer | null = null
  if (first?.b64_json) {
    buffer = Buffer.from(first.b64_json, 'base64')
  } else if (first?.url) {
    const imgRes = await fetch(first.url)
    if (!imgRes.ok) {
      throw new Error(`Failed to download generated image: ${imgRes.status}`)
    }
    buffer = Buffer.from(await imgRes.arrayBuffer())
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('OpenRouter image API returned no image data')
  }

  const supabase = getSupabaseAdmin()
  const storagePath = `skulmate-illustrations/${hash}.png`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, buffer, {
      contentType: 'image/png',
      cacheControl: '31536000',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Illustration upload failed: ${uploadError.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('documents').getPublicUrl(storagePath)

  if (!publicUrl) {
    throw new Error('Failed to resolve public URL for illustration')
  }

  if (payload.usage?.cost != null) {
    console.log(
      `[skulMate] illustration generated model=${model} cost=$${payload.usage.cost}`,
    )
  }

  return { imageUrl: publicUrl, cached: false, model }
}

const ILLUSTRATION_GAME_TYPES = new Set([
  'puzzle_pieces',
  'diagram_label',
  'drag_drop',
  'matching',
])

export function shouldGenerateIllustration(
  gameType: string | undefined,
  item: Record<string, unknown>,
): boolean {
  if (!ILLUSTRATION_GAME_TYPES.has(gameType || '')) return false
  if (item.imageUrl) return false
  const needsImage = item.needsImage === true
  const prompt =
    typeof item.imagePrompt === 'string' ? item.imagePrompt.trim() : ''
  return needsImage && prompt.length > 0
}

export async function enrichItemsWithIllustrations(
  items: Array<Record<string, unknown>>,
  gameType: string | undefined,
  topic?: string,
): Promise<void> {
  let puzzleHeroDone = false
  for (const item of items) {
    if (shouldGenerateIllustration(gameType, item)) {
      if (gameType === 'puzzle_pieces') {
        if (puzzleHeroDone) continue
        puzzleHeroDone = true
      }
      const prompt = String(item.imagePrompt)
      try {
        const result = await generateEducationalIllustration(prompt, { topic })
        item.imageUrl = result.imageUrl
        console.log(
          `[skulMate] illustration ${result.cached ? 'cache hit' : 'generated'} for item hero`,
        )
      } catch (e) {
        console.warn('[skulMate] illustration generation skipped:', e)
      }
    }

    if (gameType !== 'puzzle_pieces') continue

    const steps = item.puzzleSteps as Array<Record<string, unknown>> | undefined
    if (!Array.isArray(steps)) continue

    for (const step of steps) {
      if (step.imageUrl) continue
      const needsImage = step.needsImage === true
      const stepPrompt =
        typeof step.imagePrompt === 'string' ? step.imagePrompt.trim() : ''
      if (!needsImage || stepPrompt.length === 0) continue
      try {
        const result = await generateEducationalIllustration(stepPrompt, {
          topic,
        })
        step.imageUrl = result.imageUrl
        console.log(
          `[skulMate] step illustration ${result.cached ? 'cache hit' : 'generated'}`,
        )
      } catch (e) {
        console.warn('[skulMate] step illustration skipped:', e)
      }
    }
  }
}
