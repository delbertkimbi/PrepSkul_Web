/**
 * skulMate File Extraction
 * Completely independent from Ticha - uses ONLY main Supabase project
 */

import { createClient } from '@supabase/supabase-js'
import { extractPdf } from '../ticha/extract/extractPdf'
import { extractDocx } from '../ticha/extract/extractDocx'
import { extractText } from '../ticha/extract/extractText'
import { callOpenRouterWithKey } from '../ticha/openrouter'
import { understandImageBundle } from './understand'
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
const MAX_VISION_CALLS_PER_IMAGE = 8

const OCR_PRIMARY_PROMPT =
  'Extract all text content from this image. Preserve the structure, bullet points, and formatting. Return only the extracted text, no explanations.'

const OCR_HANDWRITING_PROMPT =
  'Carefully read handwritten and faint text in this image. Reconstruct likely words where letters are unclear using nearby context. Keep line structure. Return only extracted text with no explanation.'

/** Cheap model first; one model per OCR attempt to preserve budget for fallbacks. */
const OCR_VISION_MODELS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-flash-1.5',
  'google/gemini-flash-1.5-8b',
]

const VISUAL_FALLBACK_MODELS = ['google/gemini-2.0-flash-001', 'google/gemini-flash-1.5']

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

export function isMeaningfulOcrText(text: string): boolean {
  const normalized = normalizeExtractedText(text)
  if (normalized.length < 10) return false

  const tokens = normalized.match(/[A-Za-z0-9]{2,}/g) || []
  return tokens.length >= 2
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
  options?: { useHandwritingPrompt?: boolean; models?: string[] }
): Promise<string> {
  const apiKeys = getSkulMateApiKeys()
  const prompt = options?.useHandwritingPrompt ? OCR_HANDWRITING_PROMPT : OCR_PRIMARY_PROMPT
  const modelsToTry = options?.models ?? OCR_VISION_MODELS
  let lastError: Error | null = null

  for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex += 1) {
    const apiKey = apiKeys[keyIndex]
    let keyInvalid = false

    for (const model of modelsToTry) {
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
 * Multimodal understand fallback for images where OCR fails or is low quality.
 */
async function extractUnderstandFromImageUrl(
  imageUrl: string,
  label: string
): Promise<ImageExtractResult> {
  const understood = await understandImageBundle([imageUrl])
  return {
    text: understood.studyText,
    method: `openrouter-understand:${label}`,
    metadata: {
      variant: label,
      mode: 'understand',
      confidence: understood.confidence,
      topicLabel: understood.topicLabel,
      concepts: understood.concepts,
      perImageEvidence: understood.perImageEvidence,
    },
  }
}

/**
 * Extract text from image using OpenRouter Vision
 * Uses signed source URL when available, then base64, storage URL, and visual fallback.
 * Each attempt uses a single vision model to preserve the call budget for fallbacks.
 */
async function extractImage(
  imageBuffer: Buffer,
  mimeType: string,
  options?: { imageSourceUrl?: string }
): Promise<ImageExtractResult> {
  const budget = new VisionCallBudget()
  const errors: Record<string, string> = {}

  type OcrAttempt = {
    label: string
    resolveImageUrl: () => Promise<string>
    model: string
    mode: 'ocr' | 'understand'
    useHandwritingPrompt?: boolean
    transport: 'source-url' | 'base64' | 'storage-url' | 'understand'
  }

  try {
    const variants = await buildOcrVariants(imageBuffer, mimeType)
    const attempts: OcrAttempt[] = []

    if (options?.imageSourceUrl?.trim()) {
      const sourceUrl = options.imageSourceUrl.trim()
      attempts.push({
        label: 'source-original',
        resolveImageUrl: async () => sourceUrl,
        model: OCR_VISION_MODELS[0],
        mode: 'ocr',
        transport: 'source-url',
      })
      attempts.push({
        label: 'source-handwriting',
        resolveImageUrl: async () => sourceUrl,
        model: OCR_VISION_MODELS[1] ?? OCR_VISION_MODELS[0],
        mode: 'ocr',
        useHandwritingPrompt: true,
        transport: 'source-url',
      })
    }

    for (let i = 0; i < variants.length; i += 1) {
      const variant = variants[i]
      const model = OCR_VISION_MODELS[i % OCR_VISION_MODELS.length]
      attempts.push({
        label: `base64-${variant.name}`,
        resolveImageUrl: async () =>
          `data:${variant.mimeType};base64,${variant.buffer.toString('base64')}`,
        model,
        mode: 'ocr',
        transport: 'base64',
      })
    }

    const storageVariant =
      variants.find((v) => v.name === 'enhanced') ?? variants.find((v) => v.name === 'original')
    if (storageVariant) {
      attempts.push({
        label: `storage-${storageVariant.name}`,
        resolveImageUrl: async () => {
          const supabase = getMainSupabaseAdmin()
          const ext = storageVariant.mimeType.includes('png') ? 'png' : 'jpg'
          const tempPath = `skulmate-temp/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(tempPath, storageVariant.buffer, {
              contentType: storageVariant.mimeType,
              cacheControl: '3600',
            })

          if (uploadError) {
            throw new Error(`Failed to upload temp image to main Supabase: ${uploadError.message}`)
          }

          try {
            const {
              data: { publicUrl },
            } = supabase.storage.from('documents').getPublicUrl(uploadData.path)
            return publicUrl
          } finally {
            await supabase.storage
              .from('documents')
              .remove([tempPath])
              .catch(() => {})
          }
        },
        model: OCR_VISION_MODELS[2] ?? OCR_VISION_MODELS[0],
        mode: 'ocr',
        useHandwritingPrompt: true,
        transport: 'storage-url',
      })
    }

    const understandVariant =
      variants.find((v) => v.name === 'original') ?? variants.find((v) => v.name === 'enhanced')
    const understandUrl =
      options?.imageSourceUrl?.trim() ||
      (understandVariant
        ? `data:${understandVariant.mimeType};base64,${understandVariant.buffer.toString('base64')}`
        : null)
    if (understandUrl) {
      attempts.push({
        label: understandVariant ? `understand-${understandVariant.name}` : 'understand-source',
        resolveImageUrl: async () => understandUrl,
        model: VISUAL_FALLBACK_MODELS[0],
        mode: 'understand',
        transport: 'understand',
      })
    }

    for (const attempt of attempts) {
      if (budget.remaining <= 0) break
      try {
        const imageUrl = await attempt.resolveImageUrl()
        if (attempt.mode === 'understand') {
          const result = await extractUnderstandFromImageUrl(imageUrl, attempt.label)
          return {
            ...result,
            metadata: {
              ...result.metadata,
              variantsAttempted: variants.length,
              visionCallsUsed: budget.used,
              transport: attempt.transport,
            },
          }
        }

        const text = await extractTextFromImageSkulMate(imageUrl, budget, {
          useHandwritingPrompt: attempt.useHandwritingPrompt,
          models: [attempt.model],
        })

        return {
          text,
          method: `openrouter-${attempt.transport}:${attempt.label}`,
          metadata: {
            variant: attempt.label,
            variantsAttempted: variants.length,
            visionCallsUsed: budget.used,
            transport: attempt.transport,
            model: attempt.model,
          },
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors[attempt.label] = message
        console.warn(`[skulMate OCR] Attempt "${attempt.label}" failed:`, message)
      }
    }

    console.error('[skulMate OCR] All extraction strategies failed', {
      visionCallsUsed: budget.used,
      errors,
    })

    throw new Error(
      `All image extraction strategies failed. Attempts: ${JSON.stringify(errors)}`
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
  fileName?: string,
  options?: { imageSourceUrl?: string }
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
      const imageResult = await extractImage(
        buffer,
        mimeType || `image/${fileInfo.extension}`,
        { imageSourceUrl: options?.imageSourceUrl }
      )
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
