/**
 * Image Text Extraction (OCR)
 * Uses OpenRouter Vision model first, falls back to Tesseract.js
 */

import { extractTextFromImage as openRouterOCR } from '../openrouter'
import { getTichaSupabaseAdmin } from '../supabase-service'

export interface ExtractedText {
  text: string
  method: 'openrouter' | 'tesseract'
}

/**
 * Extract text from image using OCR
 * Tries OpenRouter Vision first, falls back to Tesseract.js
 */
export async function extractImage(
  imageBuffer: Buffer,
  mimeType: string,
  useOpenRouter: boolean = true
): Promise<ExtractedText> {
  try {
    // Upload image temporarily to get a public URL for OpenRouter
    const tempPath = `temp/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    
    if (useOpenRouter) {
      try {
        // Upload to temp location
        const supabase = getTichaSupabaseAdmin()
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(tempPath, imageBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
          })

        if (uploadError) {
          console.warn('Failed to upload temp image, falling back to Tesseract:', uploadError)
          return await extractWithTesseract(imageBuffer)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(uploadData.path)

        // Extract text using OpenRouter Vision
        const text = await openRouterOCR(publicUrl)

        // Clean up temp file
        await supabase.storage
          .from('uploads')
          .remove([tempPath])
          .catch(() => {}) // Ignore cleanup errors

        return {
          text,
          method: 'openrouter',
        }
      } catch (openRouterError) {
        console.error('OpenRouter OCR failed:', openRouterError)
        
        // Check if it's a credits issue
        const errorMessage = openRouterError instanceof Error ? openRouterError.message : String(openRouterError)
        if (errorMessage.includes('402') || errorMessage.includes('credits') || errorMessage.includes('Insufficient credits')) {
          throw new Error(`Image OCR requires OpenRouter credits. Please purchase credits at https://openrouter.ai/settings/credits to use image processing. Alternatively, convert your image to PDF or text format for processing.`)
        }
        
        // Other errors (invalid model IDs, etc.)
        throw new Error(`Image OCR failed: ${errorMessage}. Please check OpenRouter model availability or convert image to PDF/text format.`)
      }
    } else {
      return await extractWithTesseract(imageBuffer)
    }
  } catch (error) {
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Extract text using Tesseract.js (fallback)
 * Note: Tesseract.js requires worker files which are problematic in Next.js server environment
 * For now, we'll skip Tesseract and rely on OpenRouter Vision only
 */
async function extractWithTesseract(imageBuffer: Buffer): Promise<ExtractedText> {
  try {
    // Tesseract.js is not suitable for server-side Next.js environments
    // It requires worker files that are not available in API routes
    // For now, throw an error to use OpenRouter Vision only
    throw new Error('Tesseract.js OCR is not available in server environment. Please ensure OpenRouter Vision model is configured correctly.')
  } catch (error) {
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check OpenRouter Vision model configuration.`)
  }
}

