import { runTutorTurnDemo } from '@/lib/skulmate/session-turn'

describe('runTutorTurnDemo', () => {
  const previousOpenRouter = process.env.OPENROUTER_API_KEY
  const previousSkulmate = process.env.SKULMATE_OPENROUTER_API_KEY

  beforeAll(() => {
    delete process.env.OPENROUTER_API_KEY
    delete process.env.SKULMATE_OPENROUTER_API_KEY
  })

  afterAll(() => {
    if (previousOpenRouter) process.env.OPENROUTER_API_KEY = previousOpenRouter
    if (previousSkulmate) process.env.SKULMATE_OPENROUTER_API_KEY = previousSkulmate
  })

  it('teaches a linear equation without solving it', async () => {
    const result = await runTutorTurnDemo({
      message: 'I need help with BEPC maths. I do not know how to start 2x+3=11.',
      language: 'en',
      recentTurns: [
        {
          role: 'user',
          text: 'I need help with BEPC maths. I do not know how to start 2x+3=11.',
        },
      ],
    })
    expect(result.demo).toBe(true)
    expect(result.model).toBe('local')
    expect(result.message).toMatch(/isolate|standing alone|2x/i)
    expect(result.message).not.toMatch(/x\s*=\s*4/)
    expect(result.message).not.toMatch(/—/)
    expect(result.board?.steps.some((s) => s.kind === 'equation')).toBe(true)
  })

  it('teaches photosynthesis from curriculum when nothing was uploaded', async () => {
    const result = await runTutorTurnDemo({
      message: 'Help me with photosynthesis',
      language: 'en',
      learnerContext: { subjects: ['biology'] },
      recentTurns: [{ role: 'user', text: 'Help me with photosynthesis' }],
    })
    expect(result.message).toMatch(/chloroplast|where|plant|light/i)
    expect(result.display?.kind).toBeTruthy()
    expect(result.display?.uniqueImage).toMatch(/^data:image\/svg/)
  })

  it('still accepts an optional excerpt without stalling', async () => {
    const result = await runTutorTurnDemo({
      message: 'I pasted an excerpt',
      language: 'en',
      notes: 'Quantum tunnelling in semiconductors. Electrons can appear past a barrier.',
      recentTurns: [{ role: 'user', text: 'I pasted an excerpt' }],
    })
    expect(result.message.length).toBeGreaterThan(10)
    expect(result.message).not.toMatch(/send notes|upload notes/i)
  })
})
