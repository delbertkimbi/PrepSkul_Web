/**
 * Plain Text File Extraction
 * For .txt files, simply read the buffer as UTF-8 text
 */

export interface ExtractedText {
  text: string
  metadata?: Record<string, unknown>
}

/**
 * Extract text from plain text buffer
 */
export async function extractText(textBuffer: Buffer): Promise<ExtractedText> {
  try {
    const text = textBuffer.toString('utf-8')
    
    return {
      text,
      metadata: {
        encoding: 'utf-8',
        size: textBuffer.length,
      },
    }
  } catch (error) {
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

