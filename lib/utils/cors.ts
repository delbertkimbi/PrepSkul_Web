import type { NextRequest } from 'next/server'
import { skulmateCorsHeaders } from '@/lib/skulmate/http'
/** Shared exact-origin policy. Never reflect an arbitrary origin with credentials. */
export function getCorsHeaders(request: NextRequest): Record<string,string> {
  return skulmateCorsHeaders(request.headers.get('origin'))
}
