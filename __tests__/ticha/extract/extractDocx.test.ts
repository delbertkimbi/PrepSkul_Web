/**
 * Unit tests for DOCX Extraction
 */

import { extractDocx } from '@/lib/ticha/extract/extractDocx'

// Mock mammoth
jest.mock('mammoth', () => ({
  extractRawText: jest.fn(),
}))

const mammoth = require('mammoth')

describe('extractDocx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should extract text from DOCX buffer', async () => {
    const mockResult = {
      value: 'This is extracted DOCX text.\n\nIt has multiple paragraphs.',
    }

    mammoth.extractRawText.mockResolvedValue(mockResult)

    const buffer = Buffer.from('fake docx content')
    const result = await extractDocx(buffer)

    expect(result.text).toBe(mockResult.value)
    expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer })
  })

  it('should handle empty DOCX files', async () => {
    const mockResult = {
      value: '',
    }

    mammoth.extractRawText.mockResolvedValue(mockResult)

    const buffer = Buffer.from('empty docx')
    const result = await extractDocx(buffer)

    expect(result.text).toBe('')
  })

  it('should handle DOCX with formatting', async () => {
    const mockResult = {
      value: 'Bold text\n\nItalic text\n\nNormal text',
    }

    mammoth.extractRawText.mockResolvedValue(mockResult)

    const buffer = Buffer.from('formatted docx')
    const result = await extractDocx(buffer)

    expect(result.text).toContain('Bold text')
    expect(result.text).toContain('Italic text')
  })

  it('should throw error for invalid DOCX', async () => {
    const error = new Error('Invalid DOCX format')
    mammoth.extractRawText.mockRejectedValue(error)

    const buffer = Buffer.from('not a docx')
    
    await expect(extractDocx(buffer)).rejects.toThrow('Failed to extract text from DOCX')
  })

  it('should handle DOCX with special characters', async () => {
    const mockResult = {
      value: 'Special chars: àáâãäå\n\nUnicode: 世界 🌍',
    }

    mammoth.extractRawText.mockResolvedValue(mockResult)

    const buffer = Buffer.from('special chars docx')
    const result = await extractDocx(buffer)

    expect(result.text).toContain('àáâãäå')
    expect(result.text).toContain('世界')
  })
})

