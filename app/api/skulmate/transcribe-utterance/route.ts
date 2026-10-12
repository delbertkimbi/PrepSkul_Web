import { assertOwnedUpload } from '@/lib/skulmate/owned-upload'
import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { resolveSkulMateUserId } from '@/lib/skulmate/auth'
import { DeepgramClient } from '@/lib/services/transcription/deepgram.client'
import { clientLimitKey, rateLimited } from '@/lib/skulmate/rate-limit'
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
    `stt:${clientLimitKey(request, userId)}`,
    20,
    60 * 1000
  )
  if (limited) return limited
  const audioUrl = String(body.audioUrl || '').trim()
  if (!audioUrl) {
    return jsonWithCors(request, { error: 'audioUrl required' }, 400)
  }

  try {
    assertOwnedUpload(audioUrl, userId)
    const client = new DeepgramClient()
    const result = await client.transcribeFromUrl(audioUrl, {
      language: body.language === 'fr' ? 'fr' : 'en',
    })
    const text = (result.text || '').trim()
    if (!text) {
      return jsonWithCors(
        request,
        { error: 'Could not hear speech', errorCode: 'EMPTY_TRANSCRIPT' },
        422
      )
    }
    return jsonWithCors(request, { text, duration: result.duration })
  } catch (error) {
    const message =
      publicErrorMessage(error)
    return jsonWithCors(
      request,
      { error: message, errorCode: 'TRANSCRIPTION_FAILED' },
      502
    )
  }
}

export const POST = guardApi(handlePOST)
