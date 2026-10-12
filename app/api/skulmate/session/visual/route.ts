import { guardApi, publicErrorMessage } from '@/lib/skulmate/api-input'
import { jsonWithCors, skulmateCorsHeaders, skulmatePreflight } from '@/lib/skulmate/http'
import { generateEducationalIllustration } from '@/lib/skulmate/illustration-generator'
import { resolveSkulMateUserId } from '@/lib/skulmate/auth'
import { clientLimitKey, rateLimited } from '@/lib/skulmate/rate-limit'
import type { NextRequest } from 'next/server'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

/**
 * Background illustration for the lesson stage.
 * Never blocks teaching: missing keys or a failed model call return no image.
 */
async function handlePOST(request: NextRequest) {
  try {
    const userId = await resolveSkulMateUserId(request)
    if (!userId) {
      return jsonWithCors(request, { imageUrl: null })
    }
    const limited = await rateLimited(
      request,
      `visual:${clientLimitKey(request, userId)}`,
      12,
      60 * 1000
    )
    if (limited) return jsonWithCors(request, { imageUrl: null })
    const body = (await request.json().catch(() => ({}))) as {
      prompt?: string
      topic?: string
      uniqueKey?: string
    }
    const prompt = String(body.prompt || '').trim()
    if (prompt.length < 8) {
      return jsonWithCors(request, { imageUrl: null })
    }
    const result = await generateEducationalIllustration(prompt, {
      topic: body.topic?.trim() || undefined,
    })
    return jsonWithCors(request, {
      imageUrl: result.imageUrl,
      cached: result.cached,
      model: result.model,
    })
  } catch {
    return jsonWithCors(request, { imageUrl: null }, 200)
  }
}

async function handleGET(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: skulmateCorsHeaders(request.headers.get('origin')),
  })
}

export const POST = guardApi(handlePOST)

export const GET = guardApi(handleGET)
