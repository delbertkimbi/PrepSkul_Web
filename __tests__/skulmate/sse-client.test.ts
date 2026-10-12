import { consumeSseTextStream, parseSseBuffer } from '@/lib/skulmate/sse-client'

describe('parseSseBuffer', () => {
  it('reads token and board events and keeps a partial tail', () => {
    const raw =
      'event: token\ndata: {"text":"You h"}\n\nevent: token\ndata: {"text":"ave "}\n\nevent: board\ndata: {"title":"2x + 3 = 11"}\n\nevent: tok'
    const parsed = parseSseBuffer(raw)
    expect(parsed.events).toHaveLength(3)
    expect(parsed.events[0]).toEqual({ event: 'token', data: { text: 'You h' } })
    expect((parsed.events[2].data as { title: string }).title).toContain('2x')
    expect(parsed.rest).toBe('event: tok')
  })
})

describe('consumeSseTextStream', () => {
  it('fires callbacks as chunks arrive', async () => {
    async function* chunks() {
      yield 'event: status\ndata: {"state":"thinking"}\n\n'
      yield 'event: token\ndata: {"text":"What "}\n\n'
      yield 'event: token\ndata: {"text":"are you isolating?"}\n\n'
      yield 'event: done\ndata: {"message":"What are you isolating?"}\n\n'
    }
    const seen: Array<{ event: string; data: unknown }> = []
    await consumeSseTextStream(chunks(), (event, data) => seen.push({ event, data }))
    expect(seen.map((e) => e.event)).toEqual(['status', 'token', 'token', 'done'])
    expect((seen[1].data as { text: string }).text).toBe('What ')
  })
})
