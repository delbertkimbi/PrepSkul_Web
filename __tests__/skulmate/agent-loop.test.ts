import { extractJsonObject } from '@/lib/skulmate/engines/json'
import { parsePolicy, runTutorAgent } from '@/lib/skulmate/engines/agent-loop'
import { focusingRewrite } from '@/lib/skulmate/pedagogy'
import type { ChatResult } from '@/lib/skulmate/engines/openrouter'

describe('extractJsonObject', () => {
  it('reads a fence and ignores chatter', () => {
    const raw = 'Sure.\n```json\n{"message":"Try the first step.","move":"focus"}\n```'
    expect(extractJsonObject(raw)?.message).toBe('Try the first step.')
  })

  it('returns null for empty prose', () => {
    expect(extractJsonObject('no json here')).toBeNull()
  })
})

describe('parsePolicy', () => {
  it('normalizes teach to focus and keeps a board', () => {
    const parsed = parsePolicy(
      JSON.stringify({
        message: 'What did you try first?',
        move: 'teach',
        board: { title: 'Think', steps: [{ kind: 'prompt', text: 'Say the first step.' }] },
      }),
      'scaffold'
    )
    expect(parsed?.move).toBe('focus')
    expect(parsed?.board?.steps[0].text).toContain('first step')
  })
})

describe('runTutorAgent', () => {
  it('fails over when the first model returns junk', async () => {
    const calls: string[] = []
    const result = await runTutorAgent({
      compiled: 'IDENTITY\nlearner',
      userMessage: 'solve 2x+3=11 for me',
      suggestedMove: 'focus',
      chat: async ({ model }) => {
        calls.push(model)
        if (calls.length === 1) {
          return { content: 'I cannot do JSON today', model, toolCalls: [] } satisfies ChatResult
        }
        return {
          content: JSON.stringify({
            message: 'What does 2x mean in that equation?',
            move: 'focus',
            speak: true,
            assistance: 'none',
          }),
          model,
          toolCalls: [],
        }
      },
    })
    expect(result.message).toContain('2x')
    expect(result.attempts).toBe(2)
    expect(calls.length).toBeGreaterThanOrEqual(2)
  })

  it('runs retrieve_notes then answers', async () => {
    const queries: string[] = []
    let step = 0
    const result = await runTutorAgent({
      compiled: 'RETRIEVED CONTEXT\nNo files uploaded.',
      userMessage: 'photosynthesis in leaves',
      suggestedMove: 'focus',
      tools: {
        retrieveNotes: async (query) => {
          queries.push(query)
          return 'Leaves make glucose with light.'
        },
      },
      chat: async ({ messages }) => {
        step += 1
        if (step === 1) {
          return {
            content: '',
            model: 'test',
            toolCalls: [
              {
                id: 'call_1',
                type: 'function',
                function: {
                  name: 'retrieve_notes',
                  arguments: JSON.stringify({ query: 'photosynthesis leaves' }),
                },
              },
            ],
          } satisfies ChatResult
        }
        const sawNotes = messages.some((m) => m.role === 'tool' && m.content?.includes('glucose'))
        return {
          content: JSON.stringify({
            message: sawNotes
              ? 'What happens in the leaf when light hits it?'
              : 'What do you already know?',
            move: 'focus',
          }),
          model: 'test',
          toolCalls: [],
        }
      },
    })
    expect(queries[0]).toContain('photosynthesis')
    expect(result.message).toContain('leaf')
  })

  it('falls back to the local focusing tutor if every model fails', async () => {
    const result = await runTutorAgent({
      compiled: '',
      userMessage: 'I am stuck on 2x+3=11',
      suggestedMove: 'focus',
      chat: async () => {
        throw new Error('down')
      },
    })
    expect(result.model).toBe('local')
    expect(result.message).toContain('2x')
    expect(result.message).not.toMatch(/x\s*=\s*4/)
    expect(result.message).not.toMatch(/—/)
  })
})

describe('focusingRewrite', () => {
  it('does not use an em dash', () => {
    expect(focusingRewrite('x=3')).not.toMatch(/—/)
  })
})
