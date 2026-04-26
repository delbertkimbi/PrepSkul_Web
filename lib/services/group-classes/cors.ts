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

export function buildCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  }

  if (!origin) {
    headers['Access-Control-Allow-Origin'] = '*'
    return headers
  }

  if (ALLOWED_ORIGINS.includes(origin) || isPrivateNetworkOrigin(origin) || origin.includes('prepskul.com')) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
    return headers
  }

  headers['Access-Control-Allow-Origin'] = origin
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

