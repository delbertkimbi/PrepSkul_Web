import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmateCorsHeaders, skulmatePreflight } from '@/lib/skulmate/http'
import { resolveSkulMateUserId, type SkulMateAccountRole } from '@/lib/skulmate/auth'
import { clientLimitKey, rateLimited } from '@/lib/skulmate/rate-limit'
import { runTutorTurn, runTutorTurnDemo } from '@/lib/skulmate/session-turn'
import type { LearnerContextInput } from '@/lib/skulmate/learner-context'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

const MAX_TURN_CHARS = 4000

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userId = await resolveSkulMateUserId(request, body.userId)
  const message = String(body.message || body.text || '').trim().slice(0, MAX_TURN_CHARS)
  if (!message) {
    return jsonWithCors(request, { error: 'Say or type something to start.' }, 400)
  }

  const demo = body.demo === true
  if (!demo && !userId) {
    return jsonWithCors(request, { error: 'Sign in to use SkulMate' }, 401)
  }
  const limited = await rateLimited(
    request,
    `turn:${clientLimitKey(request, userId)}`,
    demo ? 12 : 30,
    60 * 1000
  )
  if (limited) return limited
  const wantStream =
    request.headers.get('accept')?.includes('text/event-stream') ||
    body.stream === true

  const run = () => {
    if (demo) {
      return runTutorTurnDemo({
        message,
        learnerContext: (body.learnerContext || null) as LearnerContextInput | null,
        language: body.language,
        accountRole: (body.accountRole as SkulMateAccountRole) || 'learner',
        recentTurns: Array.isArray(body.recentTurns) ? body.recentTurns : [],
        notes: typeof body.notes === 'string' ? body.notes : undefined,
        learnerMemory: body.learnerMemory || null,
      })
    }
    if (!body.sessionId) {
      throw new Error('sessionId required')
    }
    return runTutorTurn({
      userId: userId!,
      sessionId: body.sessionId,
      childId: body.childId ?? null,
      message,
      learnerContext: (body.learnerContext || null) as LearnerContextInput | null,
      language: body.language,
      learnerMemory: body.learnerMemory || undefined,
    })
  }

  if (!wantStream) {
    try {
      const result = await run()
      return jsonWithCors(request, result)
    } catch (error) {
      const messageText = publicErrorMessage(error)
      const status = statusForTurnError(messageText)
      return jsonWithCors(request, { error: messageText }, status)
    }
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }
      send('status', { state: 'thinking' })
      try {
        const result = await run()
        send('status', { state: 'speaking', model: result.model, demo: result.demo })
        for (const piece of splitForSpeech(result.message)) {
          send('token', { text: piece })
        }
        send('message', { text: result.message, speak: result.speak })
        if (result.board) send('board', result.board)
        if (result.surface) send('surface', result.surface)
        if (result.display) send('display', result.display)
        if (result.escalate) send('escalate', { escalate: true })
        send('done', result)
      } catch (error) {
        send('error', {
          error: publicErrorMessage(error),
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...skulmateCorsHeaders(request.headers.get('origin')),
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

function statusForTurnError(messageText: string) {
  if (messageText.includes('sessionId')) return 400
  if (messageText.toLowerCase().includes('not found')) return 404
  if (messageText.toLowerCase().includes('sign in')) return 401
  return 500
}

function splitForSpeech(text: string): string[] {
  const parts: string[] = []
  let buf = ''
  for (const ch of text) {
    buf += ch
    if (buf.length >= 4 || /[.!?,]\s$/.test(buf)) {
      parts.push(buf)
      buf = ''
    }
  }
  if (buf) parts.push(buf)
  return parts
}

export const POST = guardApi(handlePOST)
