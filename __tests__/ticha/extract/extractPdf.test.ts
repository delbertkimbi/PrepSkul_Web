/**
 * Unit tests for PDF Extraction
 * Note: These tests require actual PDF files or mocked pdf-parse
 */

import { extractPdf } from '@/lib/ticha/extract/extractPdf'
import pdfParse from 'pdf-parse'

// Mock pdf-parse
jest.mock('pdf-parse')

describe('extractPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should extract text from PDF buffer', async () => {
    const mockPdfData = {
      text: 'This is extracted PDF text.\n\nIt has multiple paragraphs.',
      info: {
        Title: 'Test PDF',
        Author: 'Test Author',
      },
      numpages: 1,
    }

    ;(pdfParse as jest.MockedFunction<typeof pdfParse>).mockResolvedValue(mockPdfData as any)

    const buffer = Buffer.from('fake pdf content')
    const result = await extractPdf(buffer)

    expect(result.text).toBe(mockPdfData.text)
    expect(result.metadata).toHaveProperty('title', 'Test PDF')
    expect(result.metadata).toHaveProperty('author', 'Test Author')
    expect(result.metadata).toHaveProperty('pages', 1)
    expect(pdfParse).toHaveBeenCalledWith(buffer)
  })

  it('should handle PDFs without metadata', async () => {
    const mockPdfData = {
      text: 'PDF text without metadata',
      info: {},
      numpages: 2,
    }

    ;(pdfParse as jest.MockedFunction<typeof pdfParse>).mockResolvedValue(mockPdfData as any)

    const buffer = Buffer.from('fake pdf')
    const result = await extractPdf(buffer)

    expect(result.text).toBe('PDF text without metadata')
    expect(result.metadata).toHaveProperty('pages', 2)
    expect(result.metadata?.title).toBeUndefined()
    expect(result.metadata?.author).toBeUndefined()
  })

  it('should handle empty PDFs', async () => {
    const mockPdfData = {
      text: '',
      info: {},
      numpages: 0,
    }

    ;(pdfParse as jest.MockedFunction<typeof pdfParse>).mockResolvedValue(mockPdfData as any)

    const buffer = Buffer.from('empty pdf')
    const result = await extractPdf(buffer)

    expect(result.text).toBe('')
    expect(result.metadata).toHaveProperty('pages', 0)
  })

  it('should throw error for invalid PDF', async () => {
    const error = new Error('Invalid PDF format')
    ;(pdfParse as jest.MockedFunction<typeof pdfParse>).mockRejectedValue(error)

    const buffer = Buffer.from('not a pdf')
    
    await expect(extractPdf(buffer)).rejects.toThrow('Failed to extract text from PDF')
  })

  it('should handle multi-page PDFs', async () => {
    const mockPdfData = {
      text: 'Page 1 content\n\nPage 2 content\n\nPage 3 content',
      info: {
        Title: 'Multi-page PDF',
      },
      numpages: 3,
    }

    ;(pdfParse as jest.MockedFunction<typeof pdfParse>).mockResolvedValue(mockPdfData as any)

    const buffer = Buffer.from('multi page pdf')
    const result = await extractPdf(buffer)

    expect(result.text).toContain('Page 1')
    expect(result.text).toContain('Page 2')
    expect(result.text).toContain('Page 3')
    expect(result.metadata).toHaveProperty('pages', 3)
  })
})

