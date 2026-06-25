/**
 * Multimodal image understanding for SkulMate intake preview (before /generate).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  assertImageBundleWithinLimit,
  parseImageBundleLimits,
  resolveImageBundleLimit,
} from '@/lib/skulmate/image-bundle-limits'
import { understandImageBundle } from '@/lib/skulmate/understand'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

function getServiceSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function getUserCreditsBalance(admin: ReturnType<typeof createClient>, userId: string) {
  const { data } = await admin
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle()
  return Number(data?.balance ?? 0)
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = { ...corsHeaders }
  if (origin) headers['Access-Control-Allow-Origin'] = origin

  try {
    const body = await request.json()
    const fileUrls = (body?.fileUrls as string[] | undefined)?.filter(
      (u) => typeof u === 'string' && u.trim().length > 0
    )
    if (!fileUrls || fileUrls.length === 0) {
      return NextResponse.json(
        { error: 'fileUrls is required', errorCode: 'FILE_URLS_REQUIRED' },
        { status: 400, headers }
      )
    }

    const admin = getServiceSupabaseAdmin()
    let hasPaidCredits = false
    if (admin) {
      const { data: pricingRow } = await admin
        .from('skulmate_pricing')
        .select('max_images_per_prompt_free, max_images_per_prompt_paid')
        .eq('id', 1)
        .maybeSingle()

      const limits = parseImageBundleLimits(
        (pricingRow as Record<string, unknown> | null) ?? null
      )

      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.id) {
          const balance = await getUserCreditsBalance(admin, user.id)
          hasPaidCredits = balance >= 2
        }
      }

      const limit = resolveImageBundleLimit(limits, hasPaidCredits)
      const bundleCheck = assertImageBundleWithinLimit(fileUrls.length, limit)
      if (!bundleCheck.ok) {
        return NextResponse.json(
          { error: bundleCheck.error, errorCode: bundleCheck.errorCode },
          { status: 400, headers }
        )
      }
    }

    const understood = await understandImageBundle(fileUrls)
    return NextResponse.json(
      {
        topicLabel: understood.topicLabel,
        summary: understood.summary,
        concepts: understood.concepts,
        perImageEvidence: understood.perImageEvidence,
        confidence: understood.confidence,
        studyText: understood.studyText,
      },
      { headers }
    )
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Image understanding failed.'
    const lower = message.toLowerCase()
    const isAuth =
      lower.includes('openrouter') &&
      (lower.includes('401') || lower.includes('auth') || lower.includes('api key'))
    const isUnavailable =
      lower.includes('openrouter') ||
      lower.includes('temporarily') ||
      lower.includes('missing skulmate_openrouter')

    if (isAuth) {
      return NextResponse.json(
        {
          error: 'Image processing is temporarily unavailable due to a server configuration issue.',
          errorCode: 'IMAGE_PROVIDER_AUTH',
        },
        { status: 502, headers }
      )
    }
    if (isUnavailable) {
      return NextResponse.json(
        {
          error: 'Image processing provider is temporarily unavailable right now.',
          errorCode: 'IMAGE_PROVIDER_UNAVAILABLE',
        },
        { status: 503, headers }
      )
    }

    return NextResponse.json(
      {
        error: message,
        errorCode: 'IMAGE_UNDERSTAND_FAILED',
      },
      { status: 422, headers }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}
