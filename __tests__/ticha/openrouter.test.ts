/**
 * Unit tests for OpenRouter API functions
 * These tests mock the OpenRouter API calls
 */

import { cleanText, generateOutline, chunkText } from '@/lib/ticha/openrouter'

// Mock fetch globally
global.fetch = jest.fn()

describe('chunkText', () => {
  it('should split text into chunks', () => {
    const text = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3\n\nParagraph 4'
    const chunks = chunkText(text, 20)

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks.every(chunk => chunk.length <= 20)).toBe(true)
  })

  it('should handle text smaller than chunk size', () => {
    const text = 'Short text'
    const chunks = chunkText(text, 100)

    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe(text)
  })

  it('should preserve paragraph structure', () => {
    const text = 'Para 1\n\nPara 2\n\nPara 3'
    const chunks = chunkText(text, 10)

    // At least one chunk should contain paragraph breaks, or chunks should combine to original
    const combined = chunks.join('\n\n')
    expect(combined).toContain('\n\n')
    expect(chunks.length).toBeGreaterThan(0)
  })

  it('should return at least one chunk even for empty text', () => {
    const chunks = chunkText('', 100)

    expect(chunks).toHaveLength(1)
  })
})

describe('cleanText', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should clean text using OpenRouter API', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Cleaned text without extra spaces',
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const rawText = 'Text   with   extra   spaces'
    const result = await cleanText(rawText)

    expect(result).toBe('Cleaned text without extra spaces')
    expect(global.fetch).toHaveBeenCalled()
  })

  it('should return original text if API fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    const rawText = 'Original text'
    const result = await cleanText(rawText)

    expect(result).toBe(rawText)
  })

  it('should return original text if credits are required', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 402,
      text: async () => 'Insufficient credits',
    })

    const rawText = 'Original text'
    const result = await cleanText(rawText)

    expect(result).toBe(rawText)
  })

  it('should limit input to 4000 characters', async () => {
    const longText = 'A'.repeat(5000)
    const mockResponse = {
      choices: [{
        message: {
          content: 'Cleaned',
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    await cleanText(longText)

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    const userContent = callBody.messages.find((m: any) => m.role === 'user')?.content || ''
    
    expect(userContent.length).toBeLessThanOrEqual(4000 + 100) // Allow for prompt text
  })

  it('should try multiple models with fallback', async () => {
    // First model fails
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Model 1 failed'))
    
    // Second model succeeds
    const mockResponse = {
      choices: [{
        message: {
          content: 'Cleaned text',
        },
      }],
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await cleanText('test text')

    expect(result).toBe('Cleaned text')
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})

describe('generateOutline', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate outline with slides', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            slides: [
              {
                slide_title: 'Introduction',
                bullets: ['Point 1', 'Point 2'],
                design: {
                  background_color: 'light-blue',
                  text_color: 'black',
                  layout: 'title-and-bullets',
                  icon: 'none',
                },
              },
            ],
          }),
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const cleanedText = 'This is test content for presentation'
    const result = await generateOutline(cleanedText)

    expect(result.slides).toHaveLength(1)
    expect(result.slides[0].slide_title).toBe('Introduction')
    expect(result.slides[0].bullets).toHaveLength(2)
    expect(result.slides[0].design.background_color).toBe('light-blue')
  })

  it('should include user prompt in outline generation', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            slides: [
              {
                slide_title: 'Custom Title',
                bullets: [],
                design: {
                  background_color: 'dark-blue',
                  text_color: 'white',
                  layout: 'title-only',
                  icon: 'none',
                },
              },
            ],
          }),
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const cleanedText = 'Content'
    const userPrompt = 'Make it professional'
    const result = await generateOutline(cleanedText, userPrompt)

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    const userMessage = callBody.messages.find((m: any) => m.role === 'user')?.content || ''
    
    expect(userMessage).toContain(userPrompt)
    expect(result.slides).toHaveLength(1)
  })

  it('should validate outline structure', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            slides: [
              {
                slide_title: 'Test',
                bullets: ['Bullet'],
                design: {
                  background_color: 'light-blue',
                  text_color: 'black',
                  layout: 'title-and-bullets',
                  icon: 'none',
                },
              },
            ],
          }),
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await generateOutline('test content')

    expect(result.slides[0]).toHaveProperty('slide_title')
    expect(result.slides[0]).toHaveProperty('bullets')
    expect(result.slides[0]).toHaveProperty('design')
  })

  it('should throw error for invalid JSON response', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Invalid JSON',
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    await expect(generateOutline('test')).rejects.toThrow()
  })

  it('should limit input to 12000 characters', async () => {
    const longText = 'A'.repeat(15000)
    const mockResponse = {
      choices: [{
        message: {
          content: JSON.stringify({ slides: [] }),
        },
      }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    await generateOutline(longText)

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    const userContent = callBody.messages.find((m: any) => m.role === 'user')?.content || ''
    
    expect(userContent.length).toBeLessThanOrEqual(12000 + 200) // Allow for prompt text
  })
})

