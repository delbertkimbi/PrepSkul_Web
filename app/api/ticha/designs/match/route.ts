/**
 * Match Designs to User Prompt
 * POST /api/ticha/designs/match
 */

import { NextRequest, NextResponse } from 'next/server'
import { matchDesignsToPrompt } from '@/lib/ticha/design/matcher'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userPrompt, content, limit } = body

    if (!userPrompt && !content) {
      return NextResponse.json(
        { error: 'Either userPrompt or content is required' },
        { status: 400 }
      )
    }

    console.log(`[DesignMatch] Matching designs for prompt: ${userPrompt?.substring(0, 50)}...`)

    const matchedDesigns = await matchDesignsToPrompt(
      userPrompt || '',
      content || '',
      limit || 5
    )

    return NextResponse.json({
      success: true,
      matchedDesigns,
      count: matchedDesigns.length,
    })
  } catch (error) {
    console.error(`[DesignMatch] Error:`, error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to match designs: ${errorMessage}` },
      { status: 500 }
    )
  }
}

