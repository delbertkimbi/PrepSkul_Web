/**
 * Integration tests for TichaAI complete pipeline
 * These tests verify the end-to-end flow
 */

import { extractFile } from '@/lib/ticha/extract'
import { cleanText, generateOutline, chunkText } from '@/lib/ticha/openrouter'
import { createPPT, type SlideData } from '@/lib/ticha/ppt/createPPT'

// Mock OpenRouter API
global.fetch = jest.fn()

describe('TichaAI Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete Pipeline: TXT File', () => {
    it('should process TXT file through complete pipeline', async () => {
      // Step 1: Extract text
      const textContent = `Introduction
      
This is a test document about artificial intelligence.

Key Points:
- AI is transforming industries
- Machine learning enables automation
- Natural language processing is advancing

Conclusion:
AI will continue to evolve and impact our daily lives.`

      const buffer = Buffer.from(textContent, 'utf-8')
      const extracted = await extractFile(buffer, 'text/plain')

      expect(extracted.text).toBe(textContent)
      expect(extracted.method).toBe('plain-text')

      // Step 2: Clean text (mocked)
      const mockCleanResponse = {
        choices: [{
          message: {
            content: extracted.text, // Assume cleaning doesn't change much
          },
        }],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCleanResponse,
      })

      const cleaned = await cleanText(extracted.text)
      expect(cleaned).toBeDefined()

      // Step 3: Generate outline (mocked)
      const mockOutlineResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              slides: [
                {
                  slide_title: 'Introduction',
                  bullets: [],
                  design: {
                    background_color: 'light-blue',
                    text_color: 'black',
                    layout: 'title-only',
                    icon: 'none',
                  },
                },
                {
                  slide_title: 'Key Points',
                  bullets: [
                    'AI is transforming industries',
                    'Machine learning enables automation',
                    'Natural language processing is advancing',
                  ],
                  design: {
                    background_color: 'white',
                    text_color: 'black',
                    layout: 'title-and-bullets',
                    icon: 'idea',
                  },
                },
                {
                  slide_title: 'Conclusion',
                  bullets: ['AI will continue to evolve and impact our daily lives.'],
                  design: {
                    background_color: 'dark-blue',
                    text_color: 'white',
                    layout: 'title-and-bullets',
                    icon: 'check',
                  },
                },
              ],
            }),
          },
        }],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOutlineResponse,
      })

      const outline = await generateOutline(cleaned)
      expect(outline.slides).toHaveLength(3)
      expect(outline.slides[0].slide_title).toBe('Introduction')

      // Step 4: Create PowerPoint
      const pptBuffer = await createPPT({
        title: 'Test Presentation',
        author: 'TichaAI',
        company: 'TichaAI',
        slides: outline.slides as SlideData[],
      })

      expect(pptBuffer).toBeInstanceOf(Buffer)
      expect(pptBuffer.length).toBeGreaterThan(0)
    })
  })

  describe('Text Chunking for Large Files', () => {
    it('should handle large text files with chunking', async () => {
      // Create a large text file
      const paragraphs: string[] = []
      for (let i = 0; i < 10; i++) {
        paragraphs.push(`Paragraph ${i + 1}\n\nThis is paragraph content with multiple sentences.`)
      }
      const largeText = paragraphs.join('\n\n')

      // Chunk the text
      const chunks = chunkText(largeText, 200)
      expect(chunks.length).toBeGreaterThan(1)

      // Mock cleaning for each chunk
      const mockCleanResponse = {
        choices: [{
          message: {
            content: 'Cleaned chunk',
          },
        }],
      }

      chunks.forEach(() => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockCleanResponse,
        })
      })

      // Clean all chunks
      const cleanedChunks = await Promise.all(
        chunks.map(chunk => cleanText(chunk))
      )

      expect(cleanedChunks).toHaveLength(chunks.length)
      const combinedText = cleanedChunks.join('\n\n')
      expect(combinedText).toBeDefined()
    })
  })

  describe('Error Handling in Pipeline', () => {
    it('should handle extraction errors gracefully', async () => {
      const invalidBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03])

      await expect(
        extractFile(invalidBuffer, 'application/unknown')
      ).rejects.toThrow('Unsupported file type')
    })

    it('should handle API errors in text cleaning', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      const result = await cleanText('test text')
      // Should return original text on error
      expect(result).toBe('test text')
    })

    it('should handle API errors in outline generation', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

      await expect(
        generateOutline('test content')
      ).rejects.toThrow()
    })
  })

  describe('PPT Generation with Various Designs', () => {
    it('should create PPT with all layout types', async () => {
      const slides: SlideData[] = [
        {
          slide_title: 'Title Only',
          bullets: [],
          design: {
            background_color: 'light-blue',
            text_color: 'black',
            layout: 'title-only',
            icon: 'none',
          },
        },
        {
          slide_title: 'Title and Bullets',
          bullets: ['Point 1', 'Point 2', 'Point 3'],
          design: {
            background_color: 'white',
            text_color: 'black',
            layout: 'title-and-bullets',
            icon: 'book',
          },
        },
        {
          slide_title: 'Two Column',
          bullets: ['Left 1', 'Left 2', 'Right 1', 'Right 2'],
          design: {
            background_color: 'gray',
            text_color: 'black',
            layout: 'two-column',
            icon: 'idea',
          },
        },
        {
          slide_title: 'Image Left',
          bullets: ['Content 1', 'Content 2'],
          design: {
            background_color: 'green',
            text_color: 'black',
            layout: 'image-left',
            icon: 'check',
          },
        },
        {
          slide_title: 'Image Right',
          bullets: ['Content 1', 'Content 2'],
          design: {
            background_color: 'dark-blue',
            text_color: 'white',
            layout: 'image-right',
            icon: 'warning',
          },
        },
      ]

      const buffer = await createPPT({
        title: 'All Layouts Test',
        slides,
      })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(buffer.length).toBeGreaterThan(0)
    })
  })
})

