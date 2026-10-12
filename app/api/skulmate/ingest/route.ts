import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { resolveSkulMateUserId, loadAccountRole } from '@/lib/skulmate/auth'
import { ingestArtifact } from '@/lib/skulmate/ingest'
import { loadOwnedSession, openOrResumeSession, runTutorTurn } from '@/lib/skulmate/session-turn'
import { clientLimitKey, rateLimited } from '@/lib/skulmate/rate-limit'
import type { LearnerContextInput } from '@/lib/skulmate/learner-context'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

async function handlePOST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const userId = await resolveSkulMateUserId(request, body.userId)
  if (!userId) {
    return jsonWithCors(request, { error: 'Sign in to use SkulMate' }, 401)
  }
  const limited = await rateLimited(
    request,
    `ingest:${clientLimitKey(request, userId)}`,
    20,
    60 * 1000
  )
  if (limited) return limited

  try {
    const accountRole = await loadAccountRole(userId)
    const session = body.sessionId
      ? (await loadOwnedSession({ userId, sessionId: String(body.sessionId) })).session
      : await openOrResumeSession({
          userId,
          childId: body.childId ?? null,
          accountRole,
        })

    if (body.sessionId && body.childId != null && body.childId !== ('child_id' in session ? session.child_id : null)) return jsonWithCors(request, {error: 'Session not found'}, 404)
    const resolvedChildId = 'child_id' in session ? session.child_id : body.childId ?? null
    const ingested = await ingestArtifact({
      userId,
      childId: resolvedChildId,
      sessionId: session.id,
      sourceType: body.sourceType || 'text',
      text: body.text,
      fileUrl: body.fileUrl,
      fileUrls: body.fileUrls,
      youtubeUrl: body.youtubeUrl,
      title: body.title,
    })

    const kickoff =
      body.autoTeach === false
        ? null
        : await runTutorTurn({
            userId,
            sessionId: session.id,
            childId: resolvedChildId,
            message:
              body.message ||
              `I just added material (${ingested.chunkCount} chunks). Ask me what I already understand, then put the first step on the board.`,
            learnerContext: (body.learnerContext ||
              null) as LearnerContextInput | null,
            language: body.language,
          })

    return jsonWithCors(request, {
      sessionId: session.id,
      artifact: ingested,
      turn: kickoff,
    })
  } catch (error) {
    const message = publicErrorMessage(error)
    const status = message.toLowerCase().includes('not found') ? 404 : 422
    return jsonWithCors(request, { error: message }, status)
  }
}

export const POST = guardApi(handlePOST)
