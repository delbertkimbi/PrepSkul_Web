/**
 * Append more revision cards to an existing deck/game.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  appendCardsToDeck,
  generateAppendDeckCards,
} from '@/lib/skulmate/deck-append'
import {
  chargeSkulmateCredits,
  deckAppendCreditsRequired,
  ensureUserCreditsRow,
  getServiceSupabaseAdmin,
  getSkulmatePricingConfig,
  getUserCreditsBalance,
} from '@/lib/skulmate/billing'
import { projectDeckToGameItems } from '@/lib/skulmate/deck-projector'
import { buildRevisionDeckFromGame } from '@/lib/skulmate/revision-deck'
import type { RevisionDeck } from '@/lib/skulmate/revision-deck'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const body = await request.json()
    const gameId = body?.gameId as string | undefined
    const count = Number(body?.count ?? 6)

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

    const baseDeck =
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

    const sourceText =
      String(gameRow.source_text_snapshot ?? '').trim() ||
      String(context.extractedText ?? '').trim() ||
      baseDeck.notes

    if (sourceText.trim().length < 80) {
      return NextResponse.json(
        {
          error:
            'Not enough source material to generate more cards. Paste longer notes or re-import the content.',
          errorCode: 'SOURCE_TOO_SHORT',
        },
        { status: 422, headers }
      )
    }

    const billingAdmin = getServiceSupabaseAdmin()
    let billedCredits = 0
    let creditsBalanceAfter: number | undefined

    if (billingAdmin) {
      const pricing = await getSkulmatePricingConfig(billingAdmin)
      await ensureUserCreditsRow(billingAdmin, userId)
      const creditsRequired = deckAppendCreditsRequired(pricing)
      const balance = await getUserCreditsBalance(billingAdmin, userId)

      if (balance < creditsRequired) {
        return NextResponse.json(
          {
            error:
              'Generating more cards needs SkulMate credits. Choose a plan or top up to continue.',
            errorCode: 'INSUFFICIENT_CREDITS',
            creditsRequired,
            creditsBalance: balance,
          },
          { status: 402, headers }
        )
      }

      const charge = await chargeSkulmateCredits({
        admin: billingAdmin,
        userId,
        credits: creditsRequired,
        description: 'SkulMate deck append',
        referenceType: 'skulmate_deck_append',
      })

      if (!charge.charged) {
        return NextResponse.json(
          {
            error: 'Insufficient credits to generate more cards.',
            errorCode: 'INSUFFICIENT_CREDITS',
          },
          { status: 402, headers }
        )
      }

      billedCredits = creditsRequired
      creditsBalanceAfter = charge.balanceAfter
    }

    const newCards = await generateAppendDeckCards({
      sourceText,
      topicLabel: baseDeck.topicLabel,
      existingDeck: baseDeck,
      count,
    })

    const updatedDeck = appendCardsToDeck(baseDeck, newCards)
    updatedDeck.id = gameId
    updatedDeck.linkedGameId = gameId

    const targetGameType = String(updatedDeck.gameType || gameRow.game_type || 'quiz')
    const projectedItems = projectDeckToGameItems(updatedDeck, targetGameType)

    const nextMetadata = {
      ...metadata,
      totalItems: projectedItems.length,
      topic: updatedDeck.topicLabel,
    }

    const nextContext = {
      ...context,
      revisionDeck: updatedDeck,
    }

    const { error: updateGameError } = await admin
      .from('skulmate_games')
      .update({
        generation_context: nextContext,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId)

    if (updateGameError) {
      throw updateGameError
    }

    const { error: updateDataError } = await admin
      .from('skulmate_game_data')
      .update({
        game_content: projectedItems,
        metadata: nextMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('game_id', gameId)

    if (updateDataError) {
      throw updateDataError
    }

    return NextResponse.json(
      {
        success: true,
        deck: updatedDeck,
        addedCount: newCards.length,
        creditsCharged: billedCredits,
        creditsBalance: creditsBalanceAfter,
        game: {
          id: gameId,
          gameType: targetGameType,
          title: gameRow.title,
          items: projectedItems,
          metadata: nextMetadata,
        },
      },
      { headers }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate more cards'
    return NextResponse.json(
      { error: message, errorCode: 'DECK_APPEND_FAILED' },
      { status: 500, headers }
    )
  }
}
