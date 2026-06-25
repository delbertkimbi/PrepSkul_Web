/**
 * @jest-environment node
 */

jest.mock('@/lib/skulmate/understand', () => ({
  understandImageBundle: jest.fn(),
}))

import { NextRequest } from 'next/server'
import { understandImageBundle } from '@/lib/skulmate/understand'
import { POST } from '@/app/api/skulmate/understand-images/route'

const mockUnderstand = understandImageBundle as jest.Mock

describe('POST /api/skulmate/understand-images', () => {
  beforeEach(() => {
    mockUnderstand.mockReset()
  })

  it('returns 400 when fileUrls is missing', async () => {
    const req = new NextRequest('http://localhost/api/skulmate/understand-images', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errorCode).toBe('FILE_URLS_REQUIRED')
  })

  it('returns understanding payload on success', async () => {
    mockUnderstand.mockResolvedValue({
      topicLabel: 'Cell biology',
      summary: 'Notes about cells and organelles.',
      concepts: ['mitochondria'],
      perImageEvidence: [],
      confidence: 0.9,
      studyText: 'study text',
    })

    const req = new NextRequest('http://localhost/api/skulmate/understand-images', {
      method: 'POST',
      body: JSON.stringify({
        fileUrls: ['https://example.com/photo.jpg'],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.topicLabel).toBe('Cell biology')
    expect(body.summary).toContain('organelles')
    expect(mockUnderstand).toHaveBeenCalledWith(['https://example.com/photo.jpg'])
  })

  it('maps OpenRouter auth failures to IMAGE_PROVIDER_AUTH', async () => {
    mockUnderstand.mockRejectedValue(
      new Error('OpenRouter 401: invalid API key')
    )

    const req = new NextRequest('http://localhost/api/skulmate/understand-images', {
      method: 'POST',
      body: JSON.stringify({
        fileUrls: ['https://example.com/photo.jpg'],
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.errorCode).toBe('IMAGE_PROVIDER_AUTH')
  })
})
