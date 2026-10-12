import { getOpenRouterHealth } from '@/lib/skulmate/openrouter-health'
import { hasSkulMateApiKeys } from '@/lib/skulmate/auth'
import { OPENROUTER_SLUGS } from '@/lib/skulmate/engines/registry'

describe('OpenRouter health', () => {
  const previousOpenRouter = process.env.OPENROUTER_API_KEY
  const previousSkulmate = process.env.SKULMATE_OPENROUTER_API_KEY

  beforeAll(() => {
    delete process.env.OPENROUTER_API_KEY
    delete process.env.SKULMATE_OPENROUTER_API_KEY
  })

  afterAll(() => {
    if (previousOpenRouter) process.env.OPENROUTER_API_KEY = previousOpenRouter
    if (previousSkulmate) process.env.SKULMATE_OPENROUTER_API_KEY = previousSkulmate
  })

  it('reports the wired catalog without leaking keys', () => {
    const health = getOpenRouterHealth()
    expect(health.ok).toBe(true)
    expect(health.provider).toBe('openrouter')
    expect(health.product).toBe('PrepSkul')
    expect(health.experience).toBe('SkulMate')
    expect(health.baseUrl).toBe('https://openrouter.ai/api/v1')
    expect(health.models.talk).toBe(OPENROUTER_SLUGS.kimiK3)
    expect(health.models.check).toBe(OPENROUTER_SLUGS.fable51)
    expect(health.models.reteach).toBe(OPENROUTER_SLUGS.astra)
    expect(health.models.images).toBe(OPENROUTER_SLUGS.flux)
    expect(JSON.stringify(health)).not.toMatch(/sk-or-/)
    expect(health.configured).toBe(hasSkulMateApiKeys())
    expect(health.demoFallback).toBe(!health.configured)
  })

  it('treats SKULMATE_OPENROUTER_API_KEY as the primary key', () => {
    process.env.SKULMATE_OPENROUTER_API_KEY = 'sk-or-v1-test'
    expect(hasSkulMateApiKeys()).toBe(true)
    const health = getOpenRouterHealth()
    expect(health.configured).toBe(true)
    expect(health.keys.skulmate).toBe(true)
    expect(JSON.stringify(health)).not.toContain('sk-or-v1-test')
    delete process.env.SKULMATE_OPENROUTER_API_KEY
  })
})
