import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'https://app.prepskul.com',
  'https://www.prepskul.com',
  'https://prepskul.com',
]

function isPrivateNetworkOrigin(origin: string): boolean {
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true
  const m = origin.match(/^http:\/\/(\d{1,3}\.){3}\d{1,3}:\d+$/)
  return !!m
}

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin) || isPrivateNetworkOrigin(origin) || origin.includes('prepskul.com')
}

type CorsHeaderOptions = {
  methods?: string
  allowHeaders?: string
}

export function buildCorsHeaders(
  request: NextRequest,
  options?: CorsHeaderOptions,
): Record<string, string> {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': options?.methods ?? 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      options?.allowHeaders ?? 'Content-Type, Authorization, X-Requested-With, X-PrepSkul-QA-Bypass',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  }

  if (!origin) {
    headers['Access-Control-Allow-Origin'] = '*'
    return headers
  }

  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
    return headers
  }

  // Disallow credentialed browser use for unknown origins.
  headers['Access-Control-Allow-Origin'] = '*'
  return headers
}

export function jsonWithCors(
  request: NextRequest,
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> },
) {
  const headers = {
    ...buildCorsHeaders(request),
    ...(init?.headers || {}),
  }
  return NextResponse.json(body, { status: init?.status, headers })
}

