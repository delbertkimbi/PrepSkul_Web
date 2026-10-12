import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { resolveSkulMateUserId } from '@/lib/skulmate/auth'
import { loadOwnedSession } from '@/lib/skulmate/session-turn'
import { buildSessionRecap } from '@/lib/skulmate/session-recap'
import { getServiceSupabaseAdmin } from '@/lib/skulmate/billing'

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
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) {
    return jsonWithCors(request, { error: 'sessionId required' }, 400)
  }
  try {
    const owned = await loadOwnedSession({ userId, sessionId })
    const recap =
      (owned.session as { recap?: unknown }).recap ||
      buildSessionRecap({
        title: owned.session.title as string | null,
        turns: owned.turns.map((t) => ({
          role: String(t.role),
          text: t.text as string | null,
        })),
      })
    return jsonWithCors(request, { sessionId, recap })
  } catch (error) {
    const message = publicErrorMessage(error)
    return jsonWithCors(request, { error: message }, 404)
  }
}

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userId = await resolveSkulMateUserId(request, body.userId)
  if (!userId) {
    return jsonWithCors(request, { error: 'Sign in to use SkulMate' }, 401)
  }
  if (!body.sessionId) {
    return jsonWithCors(request, { error: 'sessionId required' }, 400)
  }
  const owned = await loadOwnedSession({ userId, sessionId: body.sessionId })
  const recap = buildSessionRecap({
    title: owned.session.title as string | null,
    turns: owned.turns.map((t) => ({
      role: String(t.role),
      text: t.text as string | null,
    })),
  })
  const admin = getServiceSupabaseAdmin()
  if (admin) {
    await admin
      .from('skulmate_sessions')
      .update({ recap, updated_at: new Date().toISOString() })
      .eq('id', body.sessionId)
      .eq('user_id', userId)
  }
  return jsonWithCors(request, { sessionId: body.sessionId, recap })
}

export const POST = guardApi(handlePOST)

export const GET = guardApi(handleGET)
