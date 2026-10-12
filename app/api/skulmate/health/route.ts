import { NextRequest } from 'next/server'
import { jsonWithCors, skulmatePreflight } from '@/lib/skulmate/http'
import { getOpenRouterHealth } from '@/lib/skulmate/openrouter-health'

export async function OPTIONS(request: NextRequest) {
  return skulmatePreflight(request)
}

export async function GET(request: NextRequest) {
  return jsonWithCors(request, getOpenRouterHealth())
}
