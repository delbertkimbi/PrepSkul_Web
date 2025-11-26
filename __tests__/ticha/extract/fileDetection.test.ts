/**
 * Unit tests for File Type Detection
 */

import { detectFileType, extractFile } from '@/lib/ticha/extract'

describe('detectFileType', () => {
  it('should detect PDF from MIME type', () => {
    const buffer = Buffer.from('fake content')
    const result = detectFileType(buffer, 'application/pdf')

    expect(result.type).toBe('pdf')
    expect(result.extension).toBe('pdf')
  })

  it('should detect PDF from file signature', () => {
    const buffer = Buffer.from('%PDF-1.4\nfake pdf content')
    const result = detectFileType(buffer)

    expect(result.type).toBe('pdf')
    expect(result.extension).toBe('pdf')
  })

  it('should detect DOCX from MIME type', () => {
    const buffer = Buffer.from('fake content')
    const result = detectFileType(
      buffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

    expect(result.type).toBe('docx')
    expect(result.extension).toBe('docx')
  })

  it('should detect DOCX from ZIP signature', () => {
    // DOCX is a ZIP file, so it starts with PK (ZIP signature)
    const buffer = Buffer.from('PK\x03\x04word/document.xml')
    const result = detectFileType(buffer)

    expect(result.type).toBe('docx')
    expect(result.extension).toBe('docx')
  })

  it('should detect JPG from MIME type', () => {
    const buffer = Buffer.from('fake content')
    const result = detectFileType(buffer, 'image/jpeg')

    expect(result.type).toBe('image')
    expect(result.extension).toBe('jpeg')
  })

  it('should detect JPG from file signature', () => {
    // JPEG starts with FFD8FF
    const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
    const result = detectFileType(buffer)

    expect(result.type).toBe('image')
    expect(result.extension).toBe('jpg')
  })

  it('should detect PNG from file signature', () => {
    // PNG starts with 89504E47
    const buffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A])
    const result = detectFileType(buffer)

    expect(result.type).toBe('image')
    expect(result.extension).toBe('png')
  })

  it('should detect GIF from file signature', () => {
    // GIF starts with 474946
    const buffer = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    const result = detectFileType(buffer)

    expect(result.type).toBe('image')
    expect(result.extension).toBe('gif')
  })

  it('should detect TXT from MIME type', () => {
    const buffer = Buffer.from('plain text content')
    const result = detectFileType(buffer, 'text/plain')

    expect(result.type).toBe('text')
    expect(result.extension).toBe('txt')
  })

  it('should detect TXT from readable content', () => {
    const buffer = Buffer.from('This is readable text content with normal ASCII characters.')
    const result = detectFileType(buffer)

    expect(result.type).toBe('text')
    expect(result.extension).toBe('txt')
  })

  it('should return unknown for unrecognized files', () => {
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05])
    const result = detectFileType(buffer, 'application/octet-stream')

    expect(result.type).toBe('unknown')
    expect(result.extension).toBe('bin')
  })
})

describe('extractFile', () => {
  it('should route TXT files correctly', async () => {
    const { extractFile } = await import('@/lib/ticha/extract')
    const buffer = Buffer.from('plain text content', 'utf-8')
    
    const result = await extractFile(buffer, 'text/plain')

    expect(result.method).toBe('plain-text')
    expect(result.text).toBe('plain text content')
  })

  it('should throw error for unsupported file types', async () => {
    const { extractFile } = await import('@/lib/ticha/extract')
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03])
    
    await expect(extractFile(buffer, 'application/unknown')).rejects.toThrow('Unsupported file type')
  })

  // Note: PDF and DOCX routing tests are in their respective test files
  // (extractPdf.test.ts and extractDocx.test.ts) where the extraction
  // functions are properly mocked
})

