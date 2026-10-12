import { getServiceSupabaseAdmin } from './billing'
import type { NextRequest } from 'next/server'
import { jsonWithCors } from './http'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfterMs: existing.resetAt - now }
  }
  existing.count += 1
  return { ok: true }
}

export function clientLimitKey(
  request: NextRequest,
  userId?: string
): string {
  if (userId) return `user:${userId}`
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'anon'
  return `ip:${ip}`
}

export async function rateLimited(
  request: NextRequest,
  key: string,
  limit: number,
  windowMs: number
) {
  if (process.env.NODE_ENV === 'production') {
    const admin = getServiceSupabaseAdmin()
    if (!admin) return jsonWithCors(request, {error: 'Service temporarily unavailable'}, 503)
    const {data, error} = await admin.rpc('consume_api_rate_limit', {bucket_key: key, max_hits: limit, window_seconds: Math.ceil(windowMs / 1000)})
    if (error) return jsonWithCors(request, {error: 'Service temporarily unavailable'}, 503)
    if (data !== true) return jsonWithCors(request, {error: 'Too many requests. Try again shortly.'}, 429)
    return null
  }
  const result = consumeRateLimit(key, limit, windowMs)
  if (result.ok) return null
  return jsonWithCors(
    request,
    {
      error: 'Too many requests. Try again in a moment.',
      retryAfterMs: result.retryAfterMs,
    },
    429
  )
}

export function resetRateLimitForTests() {
  buckets.clear()
}
