import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/require-admin'
import { getServiceSupabaseAdmin } from '@/lib/supabase-service'

export async function GET() {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const admin = getServiceSupabaseAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server missing Supabase service role configuration' },
      { status: 500 }
    )
  }

  const { data, error } = await admin
    .from('skulmate_pricing')
    .select(
      'revision_packages, promo_discount_percent, free_doc_text_games_per_day, free_image_games_per_day, credits_per_manual_text_game, credits_per_doc_text_game, credits_per_image_game_base'
    )
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ pricing: data })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const admin = getServiceSupabaseAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: 'Server missing Supabase service role configuration' },
      { status: 500 }
    )
  }

  const body = await request.json()
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (Array.isArray(body.revision_packages)) {
    patch.revision_packages = body.revision_packages
  }
  if (body.promo_discount_percent != null) {
    patch.promo_discount_percent = Number(body.promo_discount_percent)
  }
  if (body.free_doc_text_games_per_day != null) {
    patch.free_doc_text_games_per_day = Number(body.free_doc_text_games_per_day)
  }
  if (body.free_image_games_per_day != null) {
    patch.free_image_games_per_day = Number(body.free_image_games_per_day)
  }

  const { data, error } = await admin
    .from('skulmate_pricing')
    .update(patch)
    .eq('id', 1)
    .select(
      'revision_packages, promo_discount_percent, free_doc_text_games_per_day, free_image_games_per_day'
    )
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ pricing: data })
}
