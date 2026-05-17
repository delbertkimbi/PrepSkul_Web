import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

function getServiceSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getUtcDayStartIso(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  return d.toISOString()
}

async function countTodayFreeSkulmateGames(admin: any, userId: string, sourceType: 'doc_text' | 'image') {
  const dayStartIso = getUtcDayStartIso()
  let query = admin
    .from('skulmate_games')
    .select('id')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .gte('created_at', dayStartIso)

  if (sourceType === 'doc_text') {
    query = query.in('source_type', ['text', 'pdf', 'docx'])
  } else {
    query = query.eq('source_type', 'image')
  }

  const { data, error } = await query
  if (error) return 0
  return data?.length || 0
}

async function getUserCreditsBalance(admin: any, userId: string): Promise<number> {
  const { data, error } = await admin
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return 0
  return Number(data?.balance || 0)
}

async function getSkulmatePricingConfig(admin: any) {
  const defaults = {
    creditsPerManualTextGame: 2,
    creditsPerDocTextGame: 5,
    creditsPerImageGameBase: 10,
    freeDocTextGamesPerDay: 2,
    freeImageGamesPerDay: 4,
    maxImagesPerPromptPaid: 5,
  }

  const { data, error } = await admin
    .from('skulmate_pricing')
    .select(
      [
        'credits_per_manual_text_game',
        'credits_per_doc_text_game',
        'credits_per_image_game_base',
        'free_doc_text_games_per_day',
        'free_image_games_per_day',
        'max_images_per_prompt_paid',
      ].join(',')
    )
    .eq('id', 1)
    .maybeSingle()

  if (error || !data) return defaults

  return {
    creditsPerManualTextGame: Number(data.credits_per_manual_text_game ?? defaults.creditsPerManualTextGame),
    creditsPerDocTextGame: Number(data.credits_per_doc_text_game ?? defaults.creditsPerDocTextGame),
    creditsPerImageGameBase: Number(data.credits_per_image_game_base ?? defaults.creditsPerImageGameBase),
    freeDocTextGamesPerDay: Number(data.free_doc_text_games_per_day ?? defaults.freeDocTextGamesPerDay),
    freeImageGamesPerDay: Number(data.free_image_games_per_day ?? defaults.freeImageGamesPerDay),
    maxImagesPerPromptPaid: Number(data.max_images_per_prompt_paid ?? defaults.maxImagesPerPromptPaid),
  }
}

function extractBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') || ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match?.[1] || null
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  headers['Access-Control-Allow-Origin'] = origin || '*'
  if (origin) headers['Access-Control-Allow-Credentials'] = 'true'

  const admin = getServiceSupabaseAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Server misconfigured: missing Supabase service role' }, { status: 500, headers })
  }

  const token = extractBearerToken(request)
  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization bearer token' }, { status: 401, headers })
  }

  const { data: authData, error: authError } = await admin.auth.getUser(token)
  const userId = authData?.user?.id
  if (authError || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  const pricing = await getSkulmatePricingConfig(admin)
  const [creditsBalance, freeDocUsed, freeImageUsed] = await Promise.all([
    getUserCreditsBalance(admin, userId),
    countTodayFreeSkulmateGames(admin, userId, 'doc_text'),
    countTodayFreeSkulmateGames(admin, userId, 'image'),
  ])

  return NextResponse.json(
    {
      pricing,
      creditsBalance,
      today: {
        freeDocTextUsed: freeDocUsed,
        freeDocTextLimit: pricing.freeDocTextGamesPerDay,
        freeImageUsed: freeImageUsed,
        freeImageLimit: pricing.freeImageGamesPerDay,
      },
    },
    { headers }
  )
}

export async function POST(request: NextRequest) {
  // Same behavior as GET, but allows the Flutter web client to reuse its POST-only CORS helper.
  return GET(request)
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  headers['Access-Control-Allow-Origin'] = origin || '*'
  if (origin) headers['Access-Control-Allow-Credentials'] = 'true'
  return new NextResponse(null, { status: 204, headers })
}

