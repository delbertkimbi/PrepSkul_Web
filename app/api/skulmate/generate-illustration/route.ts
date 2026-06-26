/**
 * POST /api/skulmate/generate-illustration
 * On-demand educational illustration for puzzle / matching heroes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEducationalIllustration } from '@/lib/skulmate/illustration-generator'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

function getServiceSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin
  return new NextResponse(null, { status: 204, headers })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const body = (await request.json()) as {
      prompt?: string
      topic?: string
      gameId?: string
    }

    const prompt = body.prompt?.trim() ?? ''
    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400, headers },
      )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    const admin = getServiceSupabaseAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers },
      )
    }

    const token = authHeader.slice(7)
    const { data: userData, error: authError } = await admin.auth.getUser(token)
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    const result = await generateEducationalIllustration(prompt, {
      topic: body.topic?.trim() || undefined,
    })

    return NextResponse.json(
      {
        imageUrl: result.imageUrl,
        cached: result.cached,
        model: result.model,
        gameId: body.gameId ?? null,
      },
      { headers },
    )
  } catch (e) {
    console.warn('[skulMate] generate-illustration failed:', e)
    return NextResponse.json(
      { error: 'Illustration generation failed' },
      { status: 500, headers },
    )
  }
}
