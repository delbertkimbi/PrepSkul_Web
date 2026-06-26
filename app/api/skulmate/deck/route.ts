/**
 * Fetch revision deck for an existing game.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { buildRevisionDeckFromGame } from '@/lib/skulmate/revision-deck'
import type { RevisionDeck } from '@/lib/skulmate/revision-deck'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const gameId = request.nextUrl.searchParams.get('gameId')?.trim()
    if (!gameId) {
      return NextResponse.json(
        { error: 'gameId is required', errorCode: 'GAME_ID_REQUIRED' },
        { status: 400, headers }
      )
    }

    let userId: string | undefined
    try {
      const supabase = await createServerSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id
    } catch {
      // continue
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
    }

    if (
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500, headers }
      )
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: gameRow, error: gameError } = await admin
      .from('skulmate_games')
      .select(
        'id, user_id, title, game_type, source_type, source_text_snapshot, generation_context, skulmate_game_data ( game_content, metadata )'
      )
      .eq('id', gameId)
      .eq('user_id', userId)
      .maybeSingle()

    if (gameError || !gameRow) {
      return NextResponse.json(
        { error: 'Game not found', errorCode: 'GAME_NOT_FOUND' },
        { status: 404, headers }
      )
    }

    const context = (gameRow.generation_context ?? {}) as Record<string, unknown>
    const existingDeckRaw = context.revisionDeck as RevisionDeck | undefined
    const relation = gameRow.skulmate_game_data as
      | { game_content?: unknown; metadata?: unknown }
      | Array<{ game_content?: unknown; metadata?: unknown }>
      | null
    const dataRow = Array.isArray(relation) ? relation[0] : relation
    const gameContent = Array.isArray(dataRow?.game_content)
      ? (dataRow?.game_content as Array<Record<string, unknown>>)
      : []
    const metadata = (dataRow?.metadata ?? {}) as Record<string, unknown>

    const deck =
      existingDeckRaw ??
      buildRevisionDeckFromGame({
        gameData: {
          title: gameRow.title,
          gameType: gameRow.game_type,
          items: gameContent,
          metadata,
        },
        extractedText: String(gameRow.source_text_snapshot ?? ''),
        topic: String(metadata.topic ?? gameRow.title ?? ''),
        sourceType: String(gameRow.source_type ?? 'text'),
        linkedGameId: gameId,
      })

    deck.id = gameId
    deck.linkedGameId = gameId

    return NextResponse.json({ success: true, deck }, { headers })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to load deck'
    return NextResponse.json(
      { error: message, errorCode: 'DECK_LOAD_FAILED' },
      { status: 500, headers }
    )
  }
}
