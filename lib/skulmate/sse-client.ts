/**
 * Tiny SSE reader for Mate tutor turns.
 * The turn route emits status / token / message / board / surface / done.
 */

export type SseEvent = { event: string; data: unknown }

export function parseSseBuffer(buffer: string): { events: SseEvent[]; rest: string } {
  const events: SseEvent[] = []
  const parts = buffer.split('\n\n')
  const rest = parts.pop() || ''
  for (const block of parts) {
    let event = 'message'
    const dataLines: string[] = []
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) event = line.slice(6).trim()
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
    }
    const raw = dataLines.join('\n')
    if (!raw) continue
    let data: unknown = raw
    try {
      data = JSON.parse(raw)
    } catch {
      /* keep raw string */
    }
    events.push({ event, data })
  }
  return { events, rest }
}

export async function consumeSseTextStream(
  chunks: AsyncIterable<string>,
  onEvent: (event: string, data: unknown) => void
): Promise<void> {
  let buffer = ''
  for await (const chunk of chunks) {
    buffer += chunk
    const parsed = parseSseBuffer(buffer)
    buffer = parsed.rest
    for (const ev of parsed.events) onEvent(ev.event, ev.data)
  }
  if (buffer.trim()) {
    const parsed = parseSseBuffer(`${buffer}\n\n`)
    for (const ev of parsed.events) onEvent(ev.event, ev.data)
  }
}

export async function consumeTutorTurnResponse(
  response: Response,
  onEvent: (event: string, data: unknown) => void
): Promise<void> {
  if (!response.body) {
    throw new Error('empty stream')
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  async function* chunks() {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  }
  await consumeSseTextStream(chunks(), onEvent)
}

export function isEventStream(response: Response): boolean {
  const type = response.headers.get('content-type') || ''
  return type.includes('text/event-stream')
}
