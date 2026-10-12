import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { NextRequest } from 'next/server'
import { jsonWithCors, skulmateCorsHeaders, skulmatePreflight } from '@/lib/skulmate/http'
import { hasSkulMateApiKeys, resolveSkulMateUserId } from '@/lib/skulmate/auth'
import { clientLimitKey, rateLimited } from '@/lib/skulmate/rate-limit'
import { synthesizeSpeech } from '@/lib/skulmate/engines/openrouter-tts'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

/**
 * Cloud neural TTS via OpenRouter. Device voice is the client fallback.
 */
async function handlePOST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: string
    language?: string
    voice?: string
  }
  const text = String(body.text || '').trim()
  if (text.length > 4000) return jsonWithCors(request, { error: 'Speech text too long' }, 400)
  if (text.length < 1) {
    return jsonWithCors(request, { error: 'Nothing to speak' }, 400)
  }
  const userId = await resolveSkulMateUserId(request)
  if (!userId || !hasSkulMateApiKeys()) {
    return new Response(null, {
      status: 204,
      headers: skulmateCorsHeaders(request.headers.get('origin')),
    })
  }
  const limited = await rateLimited(
    request,
    `speech:${clientLimitKey(request, userId)}`,
    30,
    60 * 1000
  )
  if (limited) {
    return new Response(null, {
      status: 204,
      headers: skulmateCorsHeaders(request.headers.get('origin')),
    })
  }
  try {
    const result = await synthesizeSpeech({
      text,
      language: body.language,
      voice: body.voice,
    })
    return new Response(new Uint8Array(result.audio), {
      status: 200,
      headers: {
        ...skulmateCorsHeaders(request.headers.get('origin')),
        'Content-Type': result.contentType,
        'X-SkulMate-TTS-Model': result.model,
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response(null, {
      status: 204,
      headers: skulmateCorsHeaders(request.headers.get('origin')),
    })
  }
}

export const POST = guardApi(handlePOST)
