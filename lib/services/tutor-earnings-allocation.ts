import type { SupabaseClient } from '@supabase/supabase-js';

const COMMISSION_RATE = 0.15;
const TUTOR_RATE = 0.85;

function weeksAheadForPaymentPlan(paymentPlan: string | null | undefined): number {
  const p = String(paymentPlan || 'monthly').trim().toLowerCase();
  if (p === 'weekly') return 1;
  if (p === 'biweekly' || p === 'bi-weekly') return 2;
  return 4;
}

function perSessionFee(monthlyTotal: number, frequency: number): number {
  const sessionsPerMonth = Math.max(frequency * 4, 1);
  return monthlyTotal / sessionsPerMonth;
}

export type AllocateEarningsResult = {
  allocated: number;
  skipped: boolean;
  reason?: string;
};

/**
 * Allocate tutor pending earnings (85% session + 100% transport) across paid-period sessions
 * when a payment_request is marked paid. Idempotent per payment_request_id.
 */
export async function allocateTutorEarningsForPaymentRequest(
  supabase: SupabaseClient,
  paymentRequestId: string
): Promise<AllocateEarningsResult> {
  const { data: existing } = await supabase
    .from('tutor_earnings')
    .select('id')
    .eq('payment_request_id', paymentRequestId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { allocated: 0, skipped: true, reason: 'already_allocated' };
  }

  const { data: pr, error: prErr } = await supabase
    .from('payment_requests')
    .select('id, amount, tutor_id, recurring_session_id, booking_request_id, status')
    .eq('id', paymentRequestId)
    .maybeSingle();

  if (prErr || !pr) {
    return { allocated: 0, skipped: true, reason: 'payment_request_not_found' };
  }

  if (pr.status !== 'paid') {
    return { allocated: 0, skipped: true, reason: 'payment_not_paid' };
  }

  const recurringSessionId = pr.recurring_session_id as string | null;
  if (!recurringSessionId) {
    return { allocated: 0, skipped: true, reason: 'no_recurring_session' };
  }

  const { data: rs, error: rsErr } = await supabase
    .from('recurring_sessions')
    .select('id, tutor_id, monthly_total, frequency, location, payment_plan, transportation_cost')
    .eq('id', recurringSessionId)
    .maybeSingle();

  if (rsErr || !rs) {
    return { allocated: 0, skipped: true, reason: 'recurring_session_not_found' };
  }

  const tutorId = (pr.tutor_id || rs.tutor_id) as string;
  const frequency = Number(rs.frequency || 1);
  const weeks = weeksAheadForPaymentPlan(rs.payment_plan as string);
  const maxSessions = frequency * weeks;
  const monthlyTotal = Number(rs.monthly_total || 0);
  const sessionFee = perSessionFee(monthlyTotal, frequency);
  const platformFee = sessionFee * COMMISSION_RATE;
  const sessionTutorShare = sessionFee * TUTOR_RATE;

  const location = String(rs.location || 'online').toLowerCase();
  const isOnsite = location === 'onsite' || location === 'hybrid';
  const transportPerSession = isOnsite ? Number(rs.transportation_cost || 0) : 0;

  const { data: sessions, error: sessErr } = await supabase
    .from('individual_sessions')
    .select('id, transportation_cost, location')
    .eq('recurring_session_id', recurringSessionId)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true })
    .limit(maxSessions);

  if (sessErr) {
    throw sessErr;
  }

  if (!sessions || sessions.length === 0) {
    return { allocated: 0, skipped: true, reason: 'no_scheduled_sessions' };
  }

  const now = new Date().toISOString();
  const rows = sessions.map((s) => {
    const transport =
      Number(s.transportation_cost || 0) > 0
        ? Number(s.transportation_cost)
        : transportPerSession;
    const totalTutor = sessionTutorShare + (isOnsite ? transport : 0);
    const earningsType = transport > 0 ? 'combined' : 'session';

    return {
      tutor_id: tutorId,
      session_id: s.id,
      recurring_session_id: recurringSessionId,
      payment_request_id: paymentRequestId,
      session_fee: sessionFee,
      platform_fee: platformFee,
      tutor_earnings: totalTutor,
      transportation_earnings: isOnsite ? transport : 0,
      earnings_type: earningsType,
      earnings_status: 'pending',
      added_to_pending_balance: true,
      pending_balance_added_at: now,
      created_at: now,
      updated_at: now,
    };
  });

  const { error: insertErr } = await supabase.from('tutor_earnings').insert(rows);
  if (insertErr) {
    if (insertErr.code === '23505') {
      return { allocated: 0, skipped: true, reason: 'duplicate' };
    }
    throw insertErr;
  }

  try {
    await supabase.rpc('refresh_tutor_public_stats', { p_tutor_user_id: tutorId });
  } catch {
    // RPC may not exist on older DBs
  }

  return { allocated: rows.length, skipped: false };
}

/**
 * Allocate pending earnings for offline operation sessions when marked paid.
 */
export async function allocateOfflineEarningsForOperation(
  supabase: SupabaseClient,
  offlineOperationId: string
): Promise<AllocateEarningsResult> {
  const { data: op, error: opErr } = await supabase
    .from('offline_operations')
    .select('id, tutor_user_id, payment_status, expected_total_amount')
    .eq('id', offlineOperationId)
    .maybeSingle();

  if (opErr || !op || op.payment_status !== 'paid') {
    return { allocated: 0, skipped: true, reason: 'not_paid_or_missing' };
  }

  const { data: period } = await supabase
    .from('offline_scheduling_periods')
    .select('id, expected_period_revenue_xaf, tutor_user_id, sessions_planned')
    .eq('offline_operation_id', offlineOperationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const periodId = period?.id as string | null;
  if (!periodId) {
    return { allocated: 0, skipped: true, reason: 'no_period' };
  }

  const idempotencyKey = `offline_op_${offlineOperationId}`;
  const { data: sessionsForCheck } = await supabase
    .from('individual_sessions')
    .select('id')
    .eq('offline_scheduling_period_id', periodId)
    .limit(1);

  if (sessionsForCheck && sessionsForCheck.length > 0) {
    const { data: existing } = await supabase
      .from('tutor_earnings')
      .select('id')
      .eq('session_id', sessionsForCheck[0].id)
      .limit(1);
    if (existing && existing.length > 0) {
      return { allocated: 0, skipped: true, reason: 'already_allocated' };
    }
  }

  void idempotencyKey;

  const tutorId = (op.tutor_user_id || period?.tutor_user_id) as string;
  const totalRevenue = Number(
    period?.expected_period_revenue_xaf || op.expected_total_amount || 0
  );
  const sessionsPlanned = Math.max(Number(period?.sessions_planned || 1), 1);
  const sessionFee = totalRevenue / sessionsPlanned;
  const platformFee = sessionFee * COMMISSION_RATE;
  const tutorShare = sessionFee * TUTOR_RATE;

  const { data: sessions } = await supabase
    .from('individual_sessions')
    .select('id')
    .eq('offline_scheduling_period_id', periodId)
    .in('status', ['scheduled', 'completed', 'evaluated'])
    .order('scheduled_date', { ascending: true });

  if (!sessions || sessions.length === 0) {
    return { allocated: 0, skipped: true, reason: 'no_offline_sessions' };
  }

  const now = new Date().toISOString();
  const rows = sessions.map((s) => ({
    tutor_id: tutorId,
    session_id: s.id,
    recurring_session_id: periodId,
    session_fee: sessionFee,
    platform_fee: platformFee,
    tutor_earnings: tutorShare,
    transportation_earnings: 0,
    earnings_type: 'session',
    earnings_status: 'pending',
    added_to_pending_balance: true,
    pending_balance_added_at: now,
    created_at: now,
    updated_at: now,
  }));

  const { error: insertErr } = await supabase.from('tutor_earnings').insert(rows);
  if (insertErr) throw insertErr;

  return { allocated: rows.length, skipped: false };
}
