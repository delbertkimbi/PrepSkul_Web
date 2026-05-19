import { NextRequest, NextResponse } from 'next/server'
import { estimateBatchCost, estimateSkulmateGameCost } from '@/lib/skulmate/costing'

interface CostEstimateRequest {
  games: number
  imageRatio?: number // 0..1
  avgTextChars?: number
  avgItemsPerGame?: number
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  headers['Access-Control-Allow-Origin'] = origin || '*'
  if (origin) headers['Access-Control-Allow-Credentials'] = 'true'

  try {
    const body = (await request.json()) as CostEstimateRequest
    const games = Math.max(0, Number(body.games || 0))
    const imageRatio = Math.min(1, Math.max(0, Number(body.imageRatio ?? 0.4)))
    const avgTextChars = Math.max(200, Number(body.avgTextChars ?? 4500))
    const avgItemsPerGame = Math.max(5, Number(body.avgItemsPerGame ?? 12))

    const imageEstimate = estimateSkulmateGameCost({
      sourceType: 'image',
      textLengthChars: avgTextChars,
      itemsCount: avgItemsPerGame,
      ocrAttempts: 2,
    })
    const textEstimate = estimateSkulmateGameCost({
      sourceType: 'text',
      textLengthChars: avgTextChars,
      itemsCount: avgItemsPerGame,
      ocrAttempts: 1,
    })

    const avgCostUsdPerGame =
      imageEstimate.estimatedCostUsd * imageRatio +
      textEstimate.estimatedCostUsd * (1 - imageRatio)
    const avgCreditsPerGame =
      imageEstimate.estimatedCredits * imageRatio +
      textEstimate.estimatedCredits * (1 - imageRatio)

    const totals = estimateBatchCost({
      games,
      avgCostUsdPerGame,
      avgCreditsPerGame,
    })

    return NextResponse.json(
      {
        input: { games, imageRatio, avgTextChars, avgItemsPerGame },
        perGame: {
          estimatedCostUsd: Number(avgCostUsdPerGame.toFixed(6)),
          estimatedCredits: Number(avgCreditsPerGame.toFixed(2)),
          imageCase: imageEstimate,
          textCase: textEstimate,
        },
        totals,
        suggestedBusinessModel: {
          freeTier: '3 games/day, text only; image OCR uses extra credits',
          subscription: 'Starter 600 credits/month, Pro 2500 credits/month',
          overagePacks: 'Top-up packs of 200, 500, 1500 credits',
          note: '1 game usually costs 1-3 internal credits depending on OCR and content size.',
        },
      },
      { headers }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to estimate costs' },
      { status: 400, headers }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  headers['Access-Control-Allow-Origin'] = origin || '*'
  if (origin) headers['Access-Control-Allow-Credentials'] = 'true'
  return new NextResponse(null, { status: 204, headers })
}
