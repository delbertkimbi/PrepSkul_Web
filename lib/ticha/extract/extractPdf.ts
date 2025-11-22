/**
 * PDF Text Extraction
 * Uses pdf-parse to extract text from PDF files
 */

import pdfParse from 'pdf-parse'

export interface ExtractedText {
  text: string
  metadata?: {
    title?: string
    author?: string
    pages?: number
  }
}

/**
 * Extract text from PDF buffer
 */
export async function extractPdf(pdfBuffer: Buffer): Promise<ExtractedText> {
  try {
    const data = await pdfParse(pdfBuffer)

    return {
      text: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        pages: data.numpages,
      },
    }
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

