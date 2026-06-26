/**
 * POST /api/skulmate/generate-illustration
 * On-demand educational diagram for puzzle / matching heroes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateEducationalIllustration } from '@/lib/skulmate/illustration-generator'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

interface IllustrationRequest {
  prompt: string
  topic?: string
  gameId?: string
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const body = (await request.json()) as IllustrationRequest
    const prompt = body.prompt?.trim()
    if (!prompt) {
      return NextResponse.json(
        { error: 'prompt is required' },
        { status: 400, headers: corsHeaders },
      )
    }

    const result = await generateEducationalIllustration(prompt, {
      topic: body.topic,
    })

    if (body.gameId) {
      try {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )
        const { data: gameRow } = await admin
          .from('skulmate_games')
          .select('game_data')
          .eq('id', body.gameId)
          .maybeSingle()

        if (gameRow?.game_data && typeof gameRow.game_data === 'object') {
          const gameData = gameRow.game_data as Record<string, unknown>
          const items = gameData.items
          if (Array.isArray(items) && items.length > 0 && items[0] && typeof items[0] === 'object') {
            ;(items[0] as Record<string, unknown>).imageUrl = result.imageUrl
            await admin
              .from('skulmate_games')
              .update({ game_data: gameData })
              .eq('id', body.gameId)
          }
        }
      } catch (persistErr) {
        console.warn('[skulMate] illustration persist skipped:', persistErr)
      }
    }

    return NextResponse.json(
      {
        imageUrl: result.imageUrl,
        cached: result.cached,
        model: result.model,
      },
      { headers: corsHeaders },
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Illustration generation failed'
    console.error('[skulMate] generate-illustration error:', message)
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders })
  }
}
