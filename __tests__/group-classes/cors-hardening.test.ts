import fs from 'fs'

describe('CORS hardening for token and group APIs', () => {
  it('shared CORS helper uses wildcard for unknown origins', () => {
    const content = fs.readFileSync('lib/services/group-classes/cors.ts', 'utf8')
    expect(content).toContain("headers['Access-Control-Allow-Origin'] = '*'")
    expect(content).toContain("Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'")
  })

  it('agora token route uses shared CORS helper', () => {
    const content = fs.readFileSync('app/api/agora/token/route.ts', 'utf8')
    expect(content).toContain("import { buildCorsHeaders } from '@/lib/services/group-classes/cors'")
    expect(content).toContain('const corsHeaders = buildCorsHeaders(request')
  })

  it('agora token route emits structured diagnostics fields', () => {
    const content = fs.readFileSync('app/api/agora/token/route.ts', 'utf8')
    expect(content).toContain('code:')
    expect(content).toContain('reason:')
    expect(content).toContain('hint:')
    expect(content).toContain('retryable:')
  })

  it('group classes route serves CORS preflight via shared helper', () => {
    const content = fs.readFileSync('app/api/group-classes/route.ts', 'utf8')
    expect(content).toContain('export async function OPTIONS')
    expect(content).toContain('buildCorsHeaders(request)')
  })
})
