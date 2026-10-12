import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { resolveSkulMateUserId, loadAccountRole } from '@/lib/skulmate/auth'
import {
  listSessions,
  loadOwnedSession,
  loadSessionTurns,
  openOrResumeSession,
} from '@/lib/skulmate/session-turn'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

async function handleGET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = await resolveSkulMateUserId(
    request,
    searchParams.get('userId') || undefined
  )
  if (!userId) {
    return jsonWithCors(request, { error: 'Sign in to use SkulMate' }, 401)
  }
  const childId = searchParams.get('childId')
  const sessionId = searchParams.get('sessionId')
  if (sessionId) {
    try {
      const owned = await loadOwnedSession({ userId, sessionId })
      return jsonWithCors(request, {
        sessionId: owned.session.id,
        session: owned.session,
        turns: owned.turns,
      })
    } catch (error) {
      const message = publicErrorMessage(error)
      return jsonWithCors(request, { error: message }, 404)
    }
  }
  const sessions = await listSessions({ userId, childId })
  return jsonWithCors(request, { sessions })
}

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userId = await resolveSkulMateUserId(request, body.userId)
  if (!userId) {
    return jsonWithCors(request, { error: 'Sign in to use SkulMate' }, 401)
  }
  const accountRole = await loadAccountRole(userId)
  const session = await openOrResumeSession({
    userId,
    childId: body.childId ?? null,
    accountRole,
    forceNew: Boolean(body.forceNew),
  })
  const turns = await loadSessionTurns(session.id)
  return jsonWithCors(request, {
    session,
    turns,
    accountRole,
  })
}

export const POST = guardApi(handlePOST)

export const GET = guardApi(handleGET)
