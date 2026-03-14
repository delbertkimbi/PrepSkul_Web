import { createClient } from '@supabase/supabase-js'

export interface SkulmateUsageEvent {
  userId?: string
  childId?: string | null
  eventType: 'generate_game' | 'flashcard_explain' | 'extract_entities' | 'challenge_from_session'
  sourceType?: string | null
  gameType?: string | null
  gameId?: string | null
  success: boolean
  estimatedCostUsd: number
  estimatedCredits: number
  metadata?: Record<string, unknown>
}

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function recordSkulmateUsageEvent(event: SkulmateUsageEvent): Promise<void> {
  const supabase = getServiceSupabase()
  if (!supabase || !event.userId) return

  try {
    await supabase.from('skulmate_usage_events').insert({
      user_id: event.userId,
      child_id: event.childId ?? null,
      event_type: event.eventType,
      source_type: event.sourceType ?? null,
      game_type: event.gameType ?? null,
      game_id: event.gameId ?? null,
      success: event.success,
      estimated_cost_usd: event.estimatedCostUsd,
      estimated_credits: event.estimatedCredits,
      metadata: event.metadata ?? {},
    })
  } catch (error) {
    // Non-blocking on purpose: generation should not fail if analytics table is missing.
    console.warn('[skulMate usage] Could not record usage event:', error)
  }
}
