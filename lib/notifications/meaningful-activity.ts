import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStartOfDayWatIso } from './timezone-wat';

/**
 * Meaningful activity = user did not need a nudge today:
 * opened app (last_seen), session/trial, SkulMate, booking/payment/message.
 */
export async function hadMeaningfulActivityToday(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const startIso = getStartOfDayWatIso();

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_seen')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.last_seen && profile.last_seen >= startIso) {
    return true;
  }

  const sessionChecks = await Promise.all([
    supabase
      .from('individual_sessions')
      .select('id')
      .or(`learner_id.eq.${userId},parent_id.eq.${userId},tutor_id.eq.${userId}`)
      .gte('updated_at', startIso)
      .limit(1),
    supabase
      .from('trial_sessions')
      .select('id')
      .or(`learner_id.eq.${userId},parent_id.eq.${userId},tutor_id.eq.${userId}`)
      .gte('updated_at', startIso)
      .limit(1),
  ]);

  if (sessionChecks[0].data?.length || sessionChecks[1].data?.length) {
    return true;
  }

  const { data: skulPlay } = await supabase
    .from('skulmate_usage_events')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startIso)
    .limit(1);
  if (skulPlay?.length) return true;

  const { data: gameStats } = await supabase
    .from('user_game_stats')
    .select('last_played_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (
    gameStats?.last_played_at &&
    (gameStats.last_played_at as string) >= startIso
  ) {
    return true;
  }

  const bookingOrPayment = await Promise.all([
    supabase
      .from('booking_requests')
      .select('id')
      .or(`student_id.eq.${userId},parent_id.eq.${userId},tutor_id.eq.${userId}`)
      .gte('updated_at', startIso)
      .limit(1),
    supabase
      .from('session_payments')
      .select('id, individual_sessions!inner(learner_id, parent_id, tutor_id)')
      .gte('updated_at', startIso)
      .limit(5),
    supabase
      .from('messages')
      .select('id')
      .eq('sender_id', userId)
      .gte('created_at', startIso)
      .limit(1),
  ]);

  if (bookingOrPayment[0].data?.length) return true;
  if (bookingOrPayment[2].data?.length) return true;

  for (const pay of bookingOrPayment[1].data || []) {
    const sess = (pay as any).individual_sessions;
    if (
      sess?.learner_id === userId ||
      sess?.parent_id === userId ||
      sess?.tutor_id === userId
    ) {
      return true;
    }
  }

  return false;
}
