import { createClient } from '@supabase/supabase-js'

export type SkulmatePricingConfig = {
  creditsPerManualTextGame: number
  creditsPerDocTextGame: number
  creditsPerImageGameBase: number
  freeDocTextGamesPerDay: number
  freeImageGamesPerDay: number
  maxImagesPerPromptFree: number
  maxImagesPerPromptPaid: number
}

export function getServiceSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function getSkulmatePricingConfig(
  admin: ReturnType<typeof createClient>
): Promise<SkulmatePricingConfig> {
  const defaults: SkulmatePricingConfig = {
    creditsPerManualTextGame: 2,
    creditsPerDocTextGame: 5,
    creditsPerImageGameBase: 10,
    freeDocTextGamesPerDay: 2,
    freeImageGamesPerDay: 4,
    maxImagesPerPromptFree: 3,
    maxImagesPerPromptPaid: 5,
  }

  try {
    const { data, error } = await admin
      .from('skulmate_pricing')
      .select(
        [
          'credits_per_manual_text_game',
          'credits_per_doc_text_game',
          'credits_per_image_game_base',
          'free_doc_text_games_per_day',
          'free_image_games_per_day',
          'max_images_per_prompt_free',
          'max_images_per_prompt_paid',
        ].join(',')
      )
      .eq('id', 1)
      .maybeSingle()

    if (error || !data) return defaults

    return {
      creditsPerManualTextGame: Number(
        data.credits_per_manual_text_game ?? defaults.creditsPerManualTextGame
      ),
      creditsPerDocTextGame: Number(
        data.credits_per_doc_text_game ?? defaults.creditsPerDocTextGame
      ),
      creditsPerImageGameBase: Number(
        data.credits_per_image_game_base ?? defaults.creditsPerImageGameBase
      ),
      freeDocTextGamesPerDay: Number(
        data.free_doc_text_games_per_day ?? defaults.freeDocTextGamesPerDay
      ),
      freeImageGamesPerDay: Number(
        data.free_image_games_per_day ?? defaults.freeImageGamesPerDay
      ),
      maxImagesPerPromptFree: Number(
        data.max_images_per_prompt_free ?? defaults.maxImagesPerPromptFree
      ),
      maxImagesPerPromptPaid: Number(
        data.max_images_per_prompt_paid ?? defaults.maxImagesPerPromptPaid
      ),
    }
  } catch {
    return defaults
  }
}

export async function ensureUserCreditsRow(
  admin: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: existing, error: fetchError } = await admin
    .from('user_credits')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (fetchError) {
    throw new Error(`Failed to check user credits: ${fetchError.message}`)
  }
  if (existing) return

  const now = new Date().toISOString()
  const { error: insertError } = await admin.from('user_credits').insert({
    user_id: userId,
    balance: 0,
    total_spent: 0,
    created_at: now,
    updated_at: now,
  })
  if (insertError) {
    throw new Error(`Failed to initialize user credits: ${insertError.message}`)
  }
}

export async function getUserCreditsBalance(
  admin: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  const { data, error } = await admin
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(`Failed to read credits balance: ${error.message}`)
  return Number(data?.balance || 0)
}

export async function chargeSkulmateCredits(params: {
  admin: ReturnType<typeof createClient>
  userId: string
  credits: number
  description: string
  referenceType?: string
}): Promise<{ charged: boolean; balanceAfter: number }> {
  const { admin, userId, credits, description, referenceType = 'skulmate_generate' } =
    params
  if (credits <= 0) {
    return { charged: false, balanceAfter: await getUserCreditsBalance(admin, userId) }
  }

  const { data: row, error: readError } = await admin
    .from('user_credits')
    .select('balance, total_spent')
    .eq('user_id', userId)
    .maybeSingle()
  if (readError) {
    throw new Error(`Failed to read credits before charging: ${readError.message}`)
  }

  const balance = Number(row?.balance || 0)
  const totalSpent = Number(row?.total_spent || 0)
  if (balance < credits) {
    return { charged: false, balanceAfter: balance }
  }

  const balanceAfter = balance - credits
  const now = new Date().toISOString()
  const { error: updateError } = await admin
    .from('user_credits')
    .update({
      balance: balanceAfter,
      total_spent: totalSpent + credits,
      updated_at: now,
    })
    .eq('user_id', userId)
  if (updateError) {
    throw new Error(`Failed to update credits balance: ${updateError.message}`)
  }

  const { error: txError } = await admin.from('credit_transactions').insert({
    user_id: userId,
    type: 'deduction',
    amount: credits,
    balance_before: balance,
    balance_after: balanceAfter,
    reference_type: referenceType,
    reference_id: null,
    description,
    created_at: now,
  })
  if (txError) {
    throw new Error(`Failed to insert credit transaction: ${txError.message}`)
  }

  return { charged: true, balanceAfter }
}

export function deckAppendCreditsRequired(pricing: SkulmatePricingConfig): number {
  return Math.max(1, pricing.creditsPerManualTextGame)
}
