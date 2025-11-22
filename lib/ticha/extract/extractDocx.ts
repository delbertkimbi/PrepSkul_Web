/**
 * DOCX Text Extraction
 * Uses docx library to extract text from Word documents
 */

import { Document } from 'docx'

export interface ExtractedText {
  text: string
  metadata?: {
    title?: string
    author?: string
  }
}

/**
 * Extract text from DOCX buffer
 */
export async function extractDocx(docxBuffer: Buffer): Promise<ExtractedText> {
  try {
    // Note: The docx library is primarily for creating docs, not reading
    // For reading, we'll use mammoth which is better suited
    const mammoth = await import('mammoth')
    
    const result = await mammoth.extractRawText({ buffer: docxBuffer })
    
    return {
      text: result.value,
      metadata: {},
    }
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

