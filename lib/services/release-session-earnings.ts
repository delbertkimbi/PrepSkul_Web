import type { SupabaseClient } from '@supabase/supabase-js';

export type ReleaseEarningsResult = {
  released: boolean;
  reason?: string;
  amount?: number;
};

/**
 * Admin-gated release: move pending tutor_earnings for a session to active.
 */
export async function releaseSessionEarningsToActive(
  supabase: SupabaseClient,
  sessionId: string,
  adminUserId: string,
  options?: { reject?: boolean; rejectReason?: string }
): Promise<ReleaseEarningsResult> {
  const { data: session, error: sErr } = await supabase
    .from('individual_sessions')
    .select('id, tutor_id, location, attendance_admin_status')
    .eq('id', sessionId)
    .maybeSingle();

  if (sErr || !session) {
    return { released: false, reason: 'session_not_found' };
  }

  const location = String(session.location || 'online').toLowerCase();
  const isOnsite = location === 'onsite' || location === 'hybrid';

  if (options?.reject) {
    await supabase
      .from('individual_sessions')
      .update({
        attendance_admin_status: 'rejected',
        attendance_admin_reviewed_at: new Date().toISOString(),
        attendance_admin_reviewed_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    return { released: false, reason: options.rejectReason || 'rejected' };
  }

  if (isOnsite) {
    await supabase
      .from('individual_sessions')
      .update({
        attendance_admin_status: 'approved',
        attendance_admin_reviewed_at: new Date().toISOString(),
        attendance_admin_reviewed_by: adminUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);
  }

  const { data: earnings, error: eErr } = await supabase
    .from('tutor_earnings')
    .select('id, tutor_earnings, earnings_status')
    .eq('session_id', sessionId)
    .eq('earnings_status', 'pending');

  if (eErr) throw eErr;
  if (!earnings || earnings.length === 0) {
    return { released: false, reason: 'no_pending_earnings' };
  }

  const now = new Date().toISOString();
  let totalAmount = 0;

  for (const e of earnings) {
    totalAmount += Number(e.tutor_earnings || 0);
    await supabase
      .from('tutor_earnings')
      .update({
        earnings_status: 'active',
        added_to_active_balance: true,
        active_balance_added_at: now,
        updated_at: now,
      })
      .eq('id', e.id);
  }

  const tutorId = session.tutor_id as string;
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com';

  try {
    await fetch(`${apiUrl}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: tutorId,
        type: 'earnings_released',
        title: 'Earnings released',
        message: `${Math.round(totalAmount).toLocaleString()} XAF from your session is now available for withdrawal.`,
        priority: 'high',
        actionUrl: '/tutor/wallet',
        metadata: { session_id: sessionId, amount: totalAmount },
        sendEmail: true,
        sendPush: true,
      }),
    });
  } catch (err) {
    console.warn('[releaseSessionEarnings] notification failed', err);
  }

  return { released: true, amount: totalAmount };
}
