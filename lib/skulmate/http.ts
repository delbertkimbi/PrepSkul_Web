import { NextRequest, NextResponse } from 'next/server'

const productionOrigins = new Set([
  'https://prepskul.com', 'https://www.prepskul.com', 'https://app.prepskul.com',
  'https://operating-axis-420213.web.app', 'https://operating-axis-420213.firebaseapp.com',
  ...(process.env.SKULMATE_ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean),
])
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true // Native clients authenticate with bearer tokens.
  if (productionOrigins.has(origin)) return true
  if (process.env.NODE_ENV !== 'production') {
    try { const u = new URL(origin); return u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname) } catch { return false }
  }
  return false
}
export function skulmateCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Idempotency-Key',
    'Access-Control-Max-Age': '600', 'Vary': 'Origin', 'Cache-Control': 'no-store',
  }
  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
  }
  return headers
}
export function skulmatePreflight(request: NextRequest) {
  return new NextResponse(null, { status: isAllowedOrigin(request.headers.get('origin')) ? 204 : 403,
    headers: skulmateCorsHeaders(request.headers.get('origin')) })
}
export function jsonWithCors(request: NextRequest, body: unknown, status = 200) {
  return NextResponse.json(body, {status, headers: skulmateCorsHeaders(request.headers.get('origin'))})
}
