/**
 * File Extraction Hub
 * Routes files to appropriate extraction method based on file type
 */

import { extractPdf } from './extractPdf'
import { extractDocx } from './extractDocx'
import { extractImage } from './extractImage'
import { extractText } from './extractText'

export interface ExtractedContent {
  text: string
  method: string
  metadata?: Record<string, unknown>
}

/**
 * Detect file type from buffer or MIME type
 */
export function detectFileType(buffer: Buffer, mimeType?: string): {
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
    // Check if it's actually a DOCX by looking for word/ folder structure
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

