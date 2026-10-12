/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { resolveSkulMateUserId } from '@/lib/skulmate/auth'
import { consumeRateLimit, resetRateLimitForTests } from '@/lib/skulmate/rate-limit'
import { POST as postTurn } from '@/app/api/skulmate/session/turn/route'
import { POST as postSession } from '@/app/api/skulmate/session/route'

function jsonRequest(url: string, body: unknown, headers?: Record<string, string>) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('SkulMate auth hardening', () => {
  it('does not trust a body userId without a bearer token', async () => {
    const req = jsonRequest('http://localhost/api/skulmate/session', {
      userId: '00000000-0000-0000-0000-000000000001',
    })
    await expect(
      resolveSkulMateUserId(req, '00000000-0000-0000-0000-000000000001')
    ).resolves.toBeUndefined()
  })

  it('rejects an unauthenticated session open even if userId is posted', async () => {
    const res = await postSession(
      jsonRequest('http://localhost/api/skulmate/session', {
        userId: '00000000-0000-0000-0000-000000000001',
      })
    )
    expect(res.status).toBe(401)
  })

  it('does not fall into demo mode just because the caller is signed out', async () => {
    const res = await postTurn(
      jsonRequest('http://localhost/api/skulmate/session/turn', {
        message: 'Help me with 2x+3=11',
        sessionId: '00000000-0000-0000-0000-000000000099',
      })
    )
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/sign in/i)
  })
})
describe('rate limit', () => {
  beforeEach(() => resetRateLimitForTests())

  it('allows traffic under the window then 429s', () => {
    expect(consumeRateLimit('t', 2, 60_000)).toEqual({ ok: true })
    expect(consumeRateLimit('t', 2, 60_000)).toEqual({ ok: true })
    const blocked = consumeRateLimit('t', 2, 60_000)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.retryAfterMs).toBeGreaterThan(0)
  })
})
