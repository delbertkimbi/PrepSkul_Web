/**
 * Unit tests for Text Extraction
 */

import { extractText } from '@/lib/ticha/extract/extractText'

describe('extractText', () => {
  it('should extract text from UTF-8 buffer', async () => {
    const textContent = 'This is a test document.\n\nIt has multiple paragraphs.\n\nAnd some content here.'
    const buffer = Buffer.from(textContent, 'utf-8')

    const result = await extractText(buffer)

    expect(result.text).toBe(textContent)
    expect(result.metadata).toHaveProperty('encoding', 'utf-8')
    expect(result.metadata).toHaveProperty('size', buffer.length)
  })

  it('should handle empty text files', async () => {
    const buffer = Buffer.from('', 'utf-8')

    const result = await extractText(buffer)

    expect(result.text).toBe('')
    expect(result.metadata).toHaveProperty('size', 0)
  })

  it('should handle special characters and unicode', async () => {
    const textContent = 'Hello 世界 🌍\n\nSpecial chars: àáâãäå\n\nEmoji: 😀😁😂'
    const buffer = Buffer.from(textContent, 'utf-8')

    const result = await extractText(buffer)

    expect(result.text).toBe(textContent)
    expect(result.text).toContain('世界')
    expect(result.text).toContain('🌍')
  })

  it('should handle large text files', async () => {
    const largeText = 'A'.repeat(10000) + '\n\n' + 'B'.repeat(10000)
    const buffer = Buffer.from(largeText, 'utf-8')

    const result = await extractText(buffer)

    expect(result.text.length).toBe(largeText.length)
    expect(result.metadata).toHaveProperty('size', buffer.length)
  })

  it('should preserve line breaks and formatting', async () => {
    const textContent = 'Line 1\nLine 2\n\nParagraph 2\n\n\nParagraph 3'
    const buffer = Buffer.from(textContent, 'utf-8')

    const result = await extractText(buffer)

    expect(result.text).toBe(textContent)
    expect(result.text).toContain('\n\n')
  })
})

