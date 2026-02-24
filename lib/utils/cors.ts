/**
 * CORS headers for Flutter Web and cross-origin API requests.
 * Mirrors the pattern used in app/api/agora/token/route.ts
 */
import { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:8080',
  'http://localhost:8888',
  'http://localhost:52988', // Flutter web default dev server
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5000',
  'https://app.prepskul.com',
  'https://www.prepskul.com',
  'https://prepskul.com',
];

function isLocalOrNetworkOrigin(orig: string): boolean {
  if (orig.includes('localhost') || orig.includes('127.0.0.1')) return true;
  const ipPattern = /^http:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/;
  const match = orig.match(ipPattern);
  if (match) {
    const parts = match[1].split('.').map(Number);
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
  }
  return false;
}

export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && (ALLOWED_ORIGINS.includes(origin) || isLocalOrNetworkOrigin(origin) || origin.includes('prepskul.com'))) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (!origin && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}
