/**
 * skulMate File Extraction
 * Completely independent from Ticha - uses ONLY main Supabase project
 */

import { createClient } from '@supabase/supabase-js'
import { extractPdf } from '../ticha/extract/extractPdf'
import { extractDocx } from '../ticha/extract/extractDocx'
import { extractText } from '../ticha/extract/extractText'
import { callOpenRouterWithKey } from '../ticha/openrouter'

export interface ExtractedContent {
  text: string
  method: string
  metadata?: Record<string, unknown>
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
 * Get skulMate OpenRouter API key
 */
function getSkulMateApiKey(): string {
  const key = process.env.SKULMATE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY
  if (!key) {
    throw new Error('Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY environment variable')
  }
  return key
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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
  if (normalized.length < 24) return false

  // Must contain at least a few alphanumeric chunks (not just symbols/noise).
  const tokens = normalized.match(/[A-Za-z0-9]{2,}/g) || []
  return tokens.length >= 4
}

/**
 * Extract text from image using OpenRouter Vision (skulMate-specific, uses skulMate API key)
 */
async function extractTextFromImageSkulMate(imageUrl: string): Promise<string> {
  const skulMateApiKey = getSkulMateApiKey()
  const extractionPrompts = [
    'Extract all text content from this image. Preserve the structure, bullet points, and formatting. Return only the extracted text, no explanations.',
    'Carefully read handwritten and faint text in this image. Reconstruct likely words where letters are unclear using nearby context. Keep line structure. Return only extracted text with no explanation.',
  ]

  // Lower-cost models first, then stronger models.
  // This mirrors tichar's strategy: cheap -> better if needed.
  const visionModels = [
    'google/gemini-flash-1.5-8b',
    'google/gemini-flash-1.5',
    'qwen/qwen-2.5-vl-7b-instruct',
    'google/gemini-1.5-pro',
    'anthropic/claude-3-haiku-20240307',
    'anthropic/claude-3-sonnet-20240229',
  ]

  let response: any
  let lastError: Error | null = null

  for (const model of visionModels) {
    for (let i = 0; i < extractionPrompts.length; i += 1) {
      const prompt = extractionPrompts[i]
      try {
        const messages = [
          {
            role: 'user' as const,
            content: [
              {
                type: 'text' as const,
                text: prompt,
              },
              {
                type: 'image_url' as const,
                image_url: { url: imageUrl },
              },
            ],
          },
        ]

        console.log(`[skulMate OCR] Trying vision model: ${model} (pass ${i + 1})`)
        response = await callOpenRouterWithKey(skulMateApiKey, {
          model,
          messages,
          max_tokens: 2000,
          temperature: 0.2,
        })

        const extractedText = parseOpenRouterTextResponse(response)
        if (!isMeaningfulOcrText(extractedText)) {
          throw new Error('OCR response was low quality or too short')
        }

        console.log(`[skulMate OCR] Success with model: ${model} (pass ${i + 1})`)
        return extractedText
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[skulMate OCR] Model ${model} pass ${i + 1} failed:`, lastError.message)

        // If it's a 401 (invalid API key), stop trying immediately
        if (lastError.message.includes('401') || lastError.message.includes('User not found') || lastError.message.includes('Invalid API key')) {
          console.error('[skulMate OCR] Invalid API key detected. Stopping all model attempts.')
          throw new Error('Invalid OpenRouter API key. Please check SKULMATE_OPENROUTER_API_KEY in your environment variables. The API key must be valid and have credits.')
        }
      }
    }
  }

  if (!response) {
    throw new Error(`All vision models failed. Last error: ${lastError?.message || 'Unknown error'}`)
  }

  const fallbackText = parseOpenRouterTextResponse(response)
  if (!isMeaningfulOcrText(fallbackText)) {
    throw new Error('OCR could not extract meaningful text from this image')
  }
  return fallbackText
}

/**
 * Extract text from image using OpenRouter Vision
 * Uses base64 data URL first, falls back to main Supabase storage if needed
 */
async function extractImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ text: string; method: string }> {
  try {
    // Try base64 data URL first (no storage needed)
    const base64Image = imageBuffer.toString('base64')
    const dataUrl = `data:${mimeType};base64,${base64Image}`
    
    try {
      const text = await extractTextFromImageSkulMate(dataUrl)
      return { text, method: 'openrouter-base64' }
    } catch (base64Error) {
      // If base64 fails (e.g., image too large), use main Supabase storage
      console.warn('[skulMate] Base64 failed, using main Supabase storage:', base64Error)
      
      const supabase = getMainSupabaseAdmin()
      const tempPath = `skulmate-temp/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(tempPath, imageBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
        })

      if (uploadError) {
        throw new Error(`Failed to upload temp image to main Supabase: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path)

      // Extract text using OpenRouter Vision with skulMate API key
      const text = await extractTextFromImageSkulMate(publicUrl)

      // Clean up temp file
      await supabase.storage
        .from('documents')
        .remove([tempPath])
        .catch(() => {}) // Ignore cleanup errors

      return { text, method: 'openrouter-storage' }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Check if it's a credits issue
    if (errorMessage.includes('402') || errorMessage.includes('credits') || errorMessage.includes('Insufficient credits')) {
      throw new Error(`Image OCR requires OpenRouter credits. Please purchase credits at https://openrouter.ai/settings/credits to use image processing. Alternatively, convert your image to PDF or text format for processing.`)
    }
    
    throw new Error(`Failed to extract text from image: ${errorMessage}`)
  }
}

/**
 * Detect file type from buffer or MIME type
 */
function detectFileType(buffer: Buffer, mimeType?: string): {
  type: 'pdf' | 'docx' | 'image' | 'text' | 'unknown'
  extension: string
} {
  // Check MIME type first
  if (mimeType) {
    if (mimeType === 'application/pdf') {
      return { type: 'pdf', extension: 'pdf' }
    }
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
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
    const bufferStr = buffer.toString('utf-8', 0, 2000)
    if (bufferStr.includes('word/') || bufferStr.includes('WordDocument')) {
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
  const fileInfo = detectFileType(buffer, mimeType)

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
        metadata: { type: fileInfo.extension },
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
