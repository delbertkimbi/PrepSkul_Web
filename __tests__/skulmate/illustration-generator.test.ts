import * as illustrationModule from '@/lib/skulmate/illustration-generator'

const {
  buildIllustrationPrompt,
  hashIllustrationPrompt,
  shouldGenerateIllustration,
  enrichItemsWithIllustrations,
  generateEducationalIllustration,
} = illustrationModule

const mockUpload = jest.fn()
const mockGetPublicUrl = jest.fn()

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: mockGetPublicUrl,
        upload: mockUpload,
      })),
    },
  })),
}))

describe('illustration-generator', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      SKULMATE_OPENROUTER_API_KEY: 'or-test-key',
    }
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/documents/skulmate-illustrations/abc.png' },
    })
    mockUpload.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it('builds backgroundless educational prompt', () => {
    const prompt = buildIllustrationPrompt(
      'cloud computing layers IaaS PaaS SaaS',
      'Cloud Quest',
    )
    expect(prompt).toContain('Cloud Quest')
    expect(prompt).toContain('cloud computing')
    expect(prompt).toContain('no text')
    expect(prompt).toContain('white background')
  })

  it('hashes prompts deterministically', () => {
    const a = hashIllustrationPrompt('same prompt')
    const b = hashIllustrationPrompt('same prompt')
    const c = hashIllustrationPrompt('other prompt')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a.length).toBe(32)
  })

  it('requires needsImage and imagePrompt for illustration candidates', () => {
    expect(
      shouldGenerateIllustration('puzzle_pieces', {
        needsImage: true,
        imagePrompt: 'cell diagram',
      }),
    ).toBe(true)
    expect(
      shouldGenerateIllustration('quiz', {
        needsImage: true,
        imagePrompt: 'cell diagram',
      }),
    ).toBe(false)
    expect(
      shouldGenerateIllustration('puzzle_pieces', {
        needsImage: false,
        imagePrompt: 'cell diagram',
      }),
    ).toBe(false)
    expect(
      shouldGenerateIllustration('puzzle_pieces', {
        needsImage: true,
        imageUrl: 'https://cdn.example.com/diagram.png',
        imagePrompt: 'cell diagram',
      }),
    ).toBe(false)
  })

  it('enriches eligible items with generated imageUrl', async () => {
    const items = [
      { needsImage: true, imagePrompt: 'photosynthesis diagram' },
      { needsImage: false, imagePrompt: 'skip me' },
    ] as Array<Record<string, unknown>>

    const publicUrl =
      'https://example.supabase.co/storage/v1/object/public/documents/skulmate-illustrations/enriched.png'
    mockGetPublicUrl
      .mockReturnValueOnce({ data: { publicUrl: null } })
      .mockReturnValue({ data: { publicUrl } })

    const pngBytes = Buffer.from('fake-png')
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/api/v1/images')) {
        return {
          ok: true,
          json: async () => ({ data: [{ b64_json: pngBytes.toString('base64') }] }),
        } as Response
      }
      throw new Error(`Unexpected fetch: ${url}`)
    }) as typeof fetch

    await enrichItemsWithIllustrations(items, 'puzzle_pieces', 'Biology')
    expect(items[0].imageUrl).toBe(publicUrl)
    expect(items[1].imageUrl).toBeUndefined()
    expect(mockUpload).toHaveBeenCalledTimes(1)
  })

  it('calls OpenRouter image API and uploads PNG to storage', async () => {
    const publicUrl =
      'https://example.supabase.co/storage/v1/object/public/documents/skulmate-illustrations/abc.png'
    mockGetPublicUrl
      .mockReturnValueOnce({ data: { publicUrl: null } })
      .mockReturnValue({ data: { publicUrl } })

    const pngBytes = Buffer.from('fake-png')
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      if (url.includes('/api/v1/images')) {
        expect(init?.method).toBe('POST')
        const body = JSON.parse(String(init?.body))
        expect(body.prompt).toContain('Educational diagram')
        expect(body.prompt).toContain('mitochondria')
        expect(body.aspect_ratio).toBe('4:3')
        expect(body.output_format).toBe('png')
        expect(body.background).toBe('transparent')
        return {
          ok: true,
          json: async () => ({
            data: [{ b64_json: pngBytes.toString('base64') }],
            usage: { cost: 0.02 },
          }),
        } as Response
      }
      throw new Error(`Unexpected fetch: ${url}`)
    }) as typeof fetch

    const result = await generateEducationalIllustration('mitochondria in a cell', {
      topic: 'Cells',
    })

    expect(result.cached).toBe(false)
    expect(result.imageUrl).toBe(publicUrl)
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^skulmate-illustrations\/[a-f0-9]{32}\.png$/),
      expect.any(Buffer),
      expect.objectContaining({ contentType: 'image/png', upsert: true }),
    )
  })
})
