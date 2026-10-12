import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { resolveSkulMateUserId, assertOwnedChild } from '@/lib/skulmate/auth'
import { recordOutcome } from '@/lib/skulmate/outcome-service'
import { recordTutorTrace } from '@/lib/skulmate/traces'
import { loadOwnedSession } from '@/lib/skulmate/session-turn'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userId = await resolveSkulMateUserId(request, body.userId)
  if (!userId) {
    return jsonWithCors(request, { error: 'Sign in to use SkulMate' }, 401)
  }
  if (typeof body.correct !== 'boolean') {
    return jsonWithCors(request, { error: 'correct is required' }, 400)
  }
  await assertOwnedChild(userId, body.childId)
  if (!body.sessionId) return jsonWithCors(request, {error: 'sessionId required'}, 400)
  if (body.sessionId) {
    try {
      const owned = await loadOwnedSession({ userId, sessionId: String(body.sessionId) })
      if (body.childId != null && body.childId !== owned.session.child_id) throw new Error('Session not found')
      body.childId = owned.session.child_id ?? null
      if (body.turnId && !owned.turns.some(t => t.id === body.turnId)) throw new Error('Turn not found')
    } catch {
      return jsonWithCors(request, { error: 'Session not found' }, 404)
    }
  }

  const result = await recordOutcome({
    userId,
    childId: body.childId ?? null,
    sessionId: body.sessionId ?? null,
    turnId: body.turnId ?? null,
    conceptId: body.conceptId ?? null,
    surfaceType: body.surfaceType ?? null,
    correct: body.correct,
    hintUsed: body.hintUsed,
    latencyMs: body.latencyMs,
  })

  await recordTutorTrace({
    userId,
    sessionId: body.sessionId,
    outcome: {
      correct: body.correct,
      conceptId: body.conceptId,
      ...result,
    },
  })

  return jsonWithCors(request, result)
}

export const POST = guardApi(handlePOST)
