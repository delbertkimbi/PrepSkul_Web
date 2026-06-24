/**
 * skulMate File Extraction
 * Completely independent from Ticha - uses ONLY main Supabase project
 */

import { createClient } from '@supabase/supabase-js'
import { extractPdf } from '../ticha/extract/extractPdf'
import { extractDocx } from '../ticha/extract/extractDocx'
import { extractText } from '../ticha/extract/extractText'
import { callOpenRouterWithKey } from '../ticha/openrouter'
const DEBUG_INGEST_URL = 'http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478'
const DEBUG_SESSION_ID = '793f36'
const sharp = require('sharp') as typeof import('sharp')

export interface ExtractedContent {
  text: string
  method: string
  metadata?: Record<string, unknown>
}

interface ImageExtractResult {
  text: string
  method: string
  metadata?: Record<string, unknown>
}

interface OcrVariant {
  name: string
  buffer: Buffer
  mimeType: string
}

/** Hard cap on OpenRouter vision calls per image to control credit usage. */
const MAX_VISION_CALLS_PER_IMAGE = 4

const OCR_PRIMARY_PROMPT =
  'Extract all text content from this image. Preserve the structure, bullet points, and formatting. Return only the extracted text, no explanations.'

const OCR_HANDWRITING_PROMPT =
  'Carefully read handwritten and faint text in this image. Reconstruct likely words where letters are unclear using nearby context. Keep line structure. Return only extracted text with no explanation.'

/** Cheap model first; escalate only when budget allows. */
const OCR_VISION_MODELS = [
  'google/gemini-flash-1.5-8b',
  'google/gemini-flash-1.5',
  'qwen/qwen-2.5-vl-7b-instruct',
]

const VISUAL_FALLBACK_MODELS = ['google/gemini-flash-1.5', 'qwen/qwen-2.5-vl-7b-instruct']

class VisionCallBudget {
  used = 0

  constructor(readonly max: number = MAX_VISION_CALLS_PER_IMAGE) {}

  get remaining(): number {
    return Math.max(0, this.max - this.used)
  }

  consume(): void {
    if (this.used >= this.max) {
      throw new Error('Vision call budget exceeded for this image')
    }
    this.used += 1
  }
}

/**
 * Get main Supabase admin client for skulMate
 * Uses ONLY main Supabase project (not Ticha)
 */
function getMainSupabaseAdmin() {
  const mainSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const mainSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!mainSupabaseUrl || !mainSupabaseServiceKey) {
    throw new Error('Missing main Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.')
  }
  
  return createClient(mainSupabaseUrl, mainSupabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Get ordered OpenRouter keys for skulMate calls.
 * Primary key first, then fallback key (if different).
 */
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

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function emitAgentDebugLog(params: {
  runId: string
  hypothesisId: string
  location: string
  message: string
  data?: Record<string, unknown>
}) {
  // #region agent log
  fetch(DEBUG_INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: params.runId,
      hypothesisId: params.hypothesisId,
      location: params.location,
      message: params.message,
      data: params.data || {},
      timestamp: Date.now(),
    }),
  }).catch(() => {})
  // #endregion
}

function parseOpenRouterTextResponse(response: any): string {
  const rawContent = response?.choices?.[0]?.message?.content

  if (typeof rawContent === 'string') {
    return normalizeExtractedText(rawContent)
  }

  if (Array.isArray(rawContent)) {
    const joined = rawContent
      .map((part: any) => {
        if (typeof part === 'string') return part
        if (part && typeof part.text === 'string') return part.text
        return ''
      })
      .join('\n')
    return normalizeExtractedText(joined)
  }

  return ''
}

function isMeaningfulOcrText(text: string): boolean {
  const normalized = normalizeExtractedText(text)
  if (normalized.length < 14) return false

  // Must contain at least a few alphanumeric chunks (not just symbols/noise).
  const tokens = normalized.match(/[A-Za-z0-9]{2,}/g) || []
  return tokens.length >= 3
}

async function buildOcrVariants(
  originalBuffer: Buffer,
  originalMimeType: string
): Promise<OcrVariant[]> {
  const variants: OcrVariant[] = []

  try {
    const base = sharp(originalBuffer, { failOn: 'none' }).rotate()
    const meta = await base.metadata()
    const width = meta.width || 1200
    const targetWidth = Math.max(1200, Math.min(width, 2400))

    const enhanced = await base
      .clone()
      .resize({ width: targetWidth, fit: 'inside', withoutEnlargement: false })
      .normalise()
      .sharpen()
      .png({ compressionLevel: 9 })
      .toBuffer()
    variants.push({ name: 'enhanced', buffer: enhanced, mimeType: 'image/png' })
  } catch (error) {
    console.warn('[skulMate OCR] Could not build enhanced variant:', error)
  }

  variants.push({ name: 'original', buffer: originalBuffer, mimeType: originalMimeType })

  const seen = new Set<string>()
  return variants.filter((v) => {
    const key = `${v.buffer.length}:${v.mimeType}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Extract text from image using OpenRouter Vision (skulMate-specific, uses skulMate API key)
 */
async function extractTextFromImageSkulMate(
  imageUrl: string,
  budget: VisionCallBudget,
  options?: { useHandwritingPrompt?: boolean }
): Promise<string> {
  const apiKeys = getSkulMateApiKeys()
  const prompt = options?.useHandwritingPrompt ? OCR_HANDWRITING_PROMPT : OCR_PRIMARY_PROMPT
  let lastError: Error | null = null

  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex += 1) {
    const apiKey = apiKeys[keyIndex]
    let keyInvalid = false

    for (const model of OCR_VISION_MODELS) {
      if (budget.remaining <= 0) {
        throw new Error(
          `OCR budget exhausted. Last error: ${lastError?.message || 'Unknown error'}`
        )
      }

      try {
        budget.consume()
        console.log(
          `[skulMate OCR] Trying vision model: ${model} (key ${keyIndex + 1}/${apiKeys.length}, budget ${budget.used}/${budget.max})`
        )
        emitAgentDebugLog({
          runId: 'image-extract',
          hypothesisId: 'H-img-1',
          location: 'lib/skulmate/extract.ts:extractTextFromImageSkulMate:before-call',
          message: 'Calling OpenRouter vision for OCR',
          data: {
            model,
            keyIndex,
            budgetUsed: budget.used,
            imageUrlPrefix: imageUrl.substring(0, 80),
          },
        })

        const response = await callOpenRouterWithKey(apiKey, {
          model,
          messages: [
            {
              role: 'user' as const,
              content: [
                { type: 'text' as const, text: prompt },
                { type: 'image_url' as const, image_url: { url: imageUrl } },
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.2,
        })

        const extractedText = parseOpenRouterTextResponse(response)
        if (!isMeaningfulOcrText(extractedText)) {
          throw new Error('OCR response was low quality or too short')
        }

        console.log(`[skulMate OCR] Success with model: ${model}`)
        return extractedText
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[skulMate OCR] Model ${model} failed:`, lastError.message)
        emitAgentDebugLog({
          runId: 'image-extract',
          hypothesisId: 'H-img-2',
          location: 'lib/skulmate/extract.ts:extractTextFromImageSkulMate:catch',
          message: 'OpenRouter vision OCR call failed',
          data: {
            model,
            keyIndex,
            errorMessage: lastError.message,
          },
        })

        const keyLooksInvalid =
          lastError.message.includes('401') ||
          lastError.message.includes('User not found') ||
          lastError.message.includes('Invalid API key')
        if (keyLooksInvalid) {
          keyInvalid = true
          break
        }
      }
    }
    if (keyInvalid) continue
  }

  throw new Error(`All vision models failed. Last error: ${lastError?.message || 'Unknown error'}`)
}

/**
 * Fallback for images that do not contain much readable text.
 * Uses vision understanding to produce structured study material context.
 */
async function extractVisualConceptFromImageSkulMate(
  imageUrl: string,
  budget: VisionCallBudget
): Promise<string> {
  const apiKeys = getSkulMateApiKeys()
  const prompt =
    'You are helping build a study game from an image that may contain little/no text. ' +
    'Identify what is visible and convert it into concise educational notes. ' +
    'Return plain text only with these sections: ' +
    'Main subject, key observations, related concepts, and 5 short study questions.'

  let lastError: Error | null = null
  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex += 1) {
    const apiKey = apiKeys[keyIndex]
    for (const model of VISUAL_FALLBACK_MODELS) {
      if (budget.remaining <= 0) {
        throw new Error(
          `Visual fallback budget exhausted: ${lastError?.message || 'Unknown error'}`
        )
      }

      try {
        budget.consume()
        const response = await callOpenRouterWithKey(apiKey, {
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } },
              ],
            },
          ],
          max_tokens: 1800,
          temperature: 0.2,
        })
        const text = parseOpenRouterTextResponse(response)
        if (text.length >= 30) {
          return text
        }
        throw new Error('Visual fallback response too short')
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[skulMate OCR] Visual fallback model ${model} failed:`, lastError.message)
      }
    }
  }

  throw new Error(
    `Visual understanding fallback failed: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * Extract text from image using OpenRouter Vision
 * Uses base64 data URL first, falls back to main Supabase storage if needed
 */
async function extractImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ImageExtractResult> {
  const budget = new VisionCallBudget()
  try {
    const variants = await buildOcrVariants(imageBuffer, mimeType)
    let lastBase64Error: Error | null = null

    // Pass 1: OCR via base64 — enhanced first, then original (budget-capped).
    for (const variant of variants) {
      if (budget.remaining <= 0) break
      try {
        const dataUrl = `data:${variant.mimeType};base64,${variant.buffer.toString('base64')}`
        const text = await extractTextFromImageSkulMate(dataUrl, budget)
        return {
          text,
          method: `openrouter-base64:${variant.name}`,
          metadata: {
            variant: variant.name,
            variantsAttempted: variants.length,
            visionCallsUsed: budget.used,
            transport: 'base64',
          },
        }
      } catch (error) {
        lastBase64Error = error instanceof Error ? error : new Error(String(error))
        console.warn(`[skulMate OCR] Base64 OCR failed for variant "${variant.name}":`, lastBase64Error.message)
      }
    }

    // Pass 2: One storage URL attempt when base64 path fails (budget-capped).
    const storageVariant =
      variants.find((v) => v.name === 'enhanced') ?? variants.find((v) => v.name === 'original')

    let lastStorageError: Error | null = null
    if (storageVariant && budget.remaining > 0) {
      const supabase = getMainSupabaseAdmin()
      const ext = storageVariant.mimeType.includes('png') ? 'png' : 'jpg'
      const tempPath = `skulmate-temp/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(tempPath, storageVariant.buffer, {
            contentType: storageVariant.mimeType,
            cacheControl: '3600',
          })

        if (uploadError) {
          throw new Error(`Failed to upload temp image to main Supabase: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(uploadData.path)

        const text = await extractTextFromImageSkulMate(publicUrl, budget, {
          useHandwritingPrompt: true,
        })
        return {
          text,
          method: `openrouter-storage:${storageVariant.name}`,
          metadata: {
            variant: storageVariant.name,
            variantsAttempted: variants.length,
            visionCallsUsed: budget.used,
            transport: 'storage-url',
            base64FallbackError: lastBase64Error?.message,
          },
        }
      } catch (error) {
        lastStorageError = error instanceof Error ? error : new Error(String(error))
        console.warn(
          `[skulMate OCR] Storage OCR failed for variant "${storageVariant.name}":`,
          lastStorageError.message
        )
      } finally {
        await supabase.storage
          .from('documents')
          .remove([tempPath])
          .catch(() => {})
      }
    }

    // Pass 3: Visual understanding fallback (single budget-capped call).
    let lastVisualError: Error | null = null
    const visualVariant =
      variants.find((v) => v.name === 'original') ?? variants.find((v) => v.name === 'enhanced')

    if (visualVariant && budget.remaining > 0) {
      try {
        const dataUrl = `data:${visualVariant.mimeType};base64,${visualVariant.buffer.toString('base64')}`
        const text = await extractVisualConceptFromImageSkulMate(dataUrl, budget)
        return {
          text,
          method: `openrouter-visual:${visualVariant.name}`,
          metadata: {
            variant: visualVariant.name,
            variantsAttempted: variants.length,
            visionCallsUsed: budget.used,
            mode: 'visual-fallback',
            base64OcrError: lastBase64Error?.message,
            storageOcrError: lastStorageError?.message,
          },
        }
      } catch (error) {
        lastVisualError = error instanceof Error ? error : new Error(String(error))
        console.warn(
          `[skulMate OCR] Visual fallback failed for variant "${visualVariant.name}":`,
          lastVisualError.message
        )
      }
    }

    console.error('[skulMate OCR] All extraction strategies failed', {
      visionCallsUsed: budget.used,
      base64Error: lastBase64Error?.message,
      storageError: lastStorageError?.message,
      visualError: lastVisualError?.message,
    })

    throw new Error(
      `All image extraction strategies failed. OCR(base64): ${lastBase64Error?.message || 'n/a'}. OCR(storage): ${lastStorageError?.message || 'n/a'}. Visual fallback: ${lastVisualError?.message || 'n/a'}`
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (
      errorMessage.includes('401') ||
      errorMessage.includes('Invalid OpenRouter API key') ||
      errorMessage.includes('Missing SKULMATE_OPENROUTER_API_KEY')
    ) {
      console.error('[skulMate OCR] OpenRouter auth error:', errorMessage)
      throw new Error('Invalid OpenRouter API key')
    }

    if (errorMessage.includes('402') || errorMessage.includes('credits') || errorMessage.includes('Insufficient credits')) {
      console.error('[skulMate OCR] OpenRouter credits/provider error:', errorMessage)
      throw new Error('Image processing provider is temporarily unavailable')
    }

    if (errorMessage.includes('Vision call budget exceeded')) {
      throw new Error('Vision call budget exceeded for this image')
    }

    throw new Error(`Failed to extract text from image: ${errorMessage}`)
  }
}

/**
 * Detect file type from buffer or MIME type
 */
function detectFileType(buffer: Buffer, mimeType?: string, fileName?: string): {
  type: 'pdf' | 'docx' | 'image' | 'text' | 'unknown'
  extension: string
} {
  const lowerName = (fileName || '').toLowerCase().trim()
  const nameExt = lowerName.includes('.') ? lowerName.split('.').pop() || '' : ''

  // Check MIME type first
  if (mimeType) {
    if (mimeType === 'application/pdf') {
      return { type: 'pdf', extension: 'pdf' }
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return { type: 'docx', extension: 'docx' }
    }
    // Some clients upload DOCX as octet-stream or zip.
    if ((mimeType === 'application/octet-stream' || mimeType === 'application/zip') && nameExt === 'docx') {
      return { type: 'docx', extension: 'docx' }
    }
    if (mimeType.startsWith('image/')) {
      return { type: 'image', extension: mimeType.split('/')[1] || 'jpg' }
    }
    if (mimeType === 'text/plain') {
      return { type: 'text', extension: 'txt' }
    }
  }

  // Check file signature (magic numbers)
  const signature = buffer.toString('hex', 0, 8).toUpperCase()

  // PDF: starts with %PDF
  if (buffer.toString('utf-8', 0, 4) === '%PDF') {
    return { type: 'pdf', extension: 'pdf' }
  }

  // DOCX: ZIP file with specific structure (starts with PK)
  if (signature.startsWith('504B')) {
    // If filename says .docx, trust it (DOCX is a ZIP container).
    if (nameExt === 'docx') {
      return { type: 'docx', extension: 'docx' }
    }

    // Heuristic scan a larger prefix for docx folder markers
    const bufferStr = buffer.toString('utf-8', 0, Math.min(buffer.length, 20000))
    if (bufferStr.includes('word/') || bufferStr.includes('WordDocument') || bufferStr.includes('[Content_Types].xml')) {
      return { type: 'docx', extension: 'docx' }
    }
  }

  // Images: Check common image signatures
  if (signature.startsWith('FFD8FF')) {
    return { type: 'image', extension: 'jpg' }
  }
  if (signature.startsWith('89504E47')) {
    return { type: 'image', extension: 'png' }
  }
  if (signature.startsWith('474946')) {
    return { type: 'image', extension: 'gif' }
  }

  // Default to text if it looks like readable text
  try {
    const text = buffer.toString('utf-8', 0, 100)
    if (text.replace(/[^\x20-\x7E\n\r\t]/g, '').length > text.length * 0.8) {
      return { type: 'text', extension: 'txt' }
    }
  } catch {
    // Not text
  }

  return { type: 'unknown', extension: 'bin' }
}

/**
 * Extract text from any file type
 * Uses ONLY main Supabase project (not Ticha)
 */
export async function extractFile(
  buffer: Buffer,
  mimeType?: string,
  fileName?: string
): Promise<ExtractedContent> {
  const fileInfo = detectFileType(buffer, mimeType, fileName)

  switch (fileInfo.type) {
    case 'pdf':
      const pdfResult = await extractPdf(buffer)
      return {
        text: pdfResult.text,
        method: 'pdf-parse',
        metadata: pdfResult.metadata,
      }

    case 'docx':
      const docxResult = await extractDocx(buffer)
      return {
        text: docxResult.text,
        method: 'mammoth',
        metadata: docxResult.metadata,
      }

    case 'image':
      const imageResult = await extractImage(buffer, mimeType || `image/${fileInfo.extension}`)
      return {
        text: imageResult.text,
        method: imageResult.method,
        metadata: {
          type: fileInfo.extension,
          ...(imageResult.metadata ?? {}),
        },
      }

    case 'text':
      const textResult = await extractText(buffer)
      return {
        text: textResult.text,
        method: 'plain-text',
        metadata: textResult.metadata,
      }

    default:
      throw new Error(`Unsupported file type: ${fileInfo.type}. Supported types: PDF, DOCX, Images (JPG/PNG/GIF), TXT`)
  }
}
