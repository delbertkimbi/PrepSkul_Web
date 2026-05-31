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
    .select('id, tutor_id, monthly_total, frequency, location, payment_plan, transportation_cost_per_session')
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
  const transportPerSession = isOnsite ? Number(rs.transportation_cost_per_session || 0) : 0;

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

/** Cancel scheduled sessions beyond the paid installment window (oldest kept). */
export async function cancelExcessFutureSessions(
  supabase: SupabaseClient,
  recurringSessionId: string,
  maxSessions: number
): Promise<number> {
  const { data: sessions, error } = await supabase
    .from('individual_sessions')
    .select('id, scheduled_date')
    .eq('recurring_session_id', recurringSessionId)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  const list = sessions || [];
  if (list.length <= maxSessions) return 0;

  const excess = list.slice(maxSessions);
  let cancelled = 0;
  for (const s of excess) {
    const { error: upErr } = await supabase
      .from('individual_sessions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', s.id);
    if (!upErr) cancelled++;
  }
  return cancelled;
}

export type BackfillResult = {
  paymentRequestId: string;
  cancelledExcess: number;
  allocation: AllocateEarningsResult;
};

/**
 * Repair a paid payment_request: trim over-generated sessions, then allocate pending earnings.
 * Safe to re-run (idempotent allocation).
 */
export async function backfillTutorEarningsForPaymentRequest(
  supabase: SupabaseClient,
  paymentRequestId: string,
  options?: { cancelExcess?: boolean }
): Promise<BackfillResult> {
  const cancelExcess = options?.cancelExcess !== false;
  let cancelledExcess = 0;

  const { data: pr } = await supabase
    .from('payment_requests')
    .select('id, status, recurring_session_id')
    .eq('id', paymentRequestId)
    .maybeSingle();

  if (pr?.recurring_session_id && cancelExcess) {
    const { data: rs } = await supabase
      .from('recurring_sessions')
      .select('frequency, payment_plan')
      .eq('id', pr.recurring_session_id)
      .maybeSingle();

    if (rs) {
      const frequency = Number(rs.frequency || 1);
      const weeks = weeksAheadForPaymentPlan(rs.payment_plan as string);
      cancelledExcess = await cancelExcessFutureSessions(
        supabase,
        pr.recurring_session_id as string,
        frequency * weeks
      );
    }
  }

  const allocation = await allocateTutorEarningsForPaymentRequest(supabase, paymentRequestId);

  return { paymentRequestId, cancelledExcess, allocation };
}

/** Paid payment_requests with no tutor_earnings rows yet. */
export async function listPaymentRequestsNeedingEarningsBackfill(
  supabase: SupabaseClient,
  limit = 50
): Promise<
  Array<{
    id: string;
    tutor_id: string;
    amount: number;
    paid_at: string | null;
    recurring_session_id: string | null;
  }>
> {
  const { data: paid, error } = await supabase
    .from('payment_requests')
    .select('id, tutor_id, amount, paid_at, recurring_session_id')
    .eq('status', 'paid')
    .not('recurring_session_id', 'is', null)
    .order('paid_at', { ascending: false })
    .limit(limit * 3);

  if (error) throw error;
  if (!paid?.length) return [];

  const ids = paid.map((p) => p.id);
  const { data: allocated } = await supabase
    .from('tutor_earnings')
    .select('payment_request_id')
    .in('payment_request_id', ids);

  const allocatedSet = new Set(
    (allocated || []).map((r) => r.payment_request_id).filter(Boolean)
  );

  return paid.filter((p) => !allocatedSet.has(p.id)).slice(0, limit);
}

/** Cancel scheduled sessions beyond the paid installment window (oldest kept). */
export async function cancelExcessFutureSessions(
  supabase: SupabaseClient,
  recurringSessionId: string,
  maxSessions: number
): Promise<number> {
  const { data: sessions, error } = await supabase
    .from('individual_sessions')
    .select('id, scheduled_date')
    .eq('recurring_session_id', recurringSessionId)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  const list = sessions || [];
  if (list.length <= maxSessions) return 0;

  const excess = list.slice(maxSessions);
  let cancelled = 0;
  for (const s of excess) {
    const { error: upErr } = await supabase
      .from('individual_sessions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', s.id);
    if (!upErr) cancelled++;
  }
  return cancelled;
}

export type BackfillResult = {
  paymentRequestId: string;
  cancelledExcess: number;
  allocation: AllocateEarningsResult;
};

/**
 * Repair a paid payment_request: trim over-generated sessions, then allocate pending earnings.
 * Safe to re-run (idempotent allocation).
 */
export async function backfillTutorEarningsForPaymentRequest(
  supabase: SupabaseClient,
  paymentRequestId: string,
  options?: { cancelExcess?: boolean }
): Promise<BackfillResult> {
  const cancelExcess = options?.cancelExcess !== false;
  let cancelledExcess = 0;

  const { data: pr } = await supabase
    .from('payment_requests')
    .select('id, status, recurring_session_id')
    .eq('id', paymentRequestId)
    .maybeSingle();

  if (pr?.recurring_session_id && cancelExcess) {
    const { data: rs } = await supabase
      .from('recurring_sessions')
      .select('frequency, payment_plan')
      .eq('id', pr.recurring_session_id)
      .maybeSingle();

    if (rs) {
      const frequency = Number(rs.frequency || 1);
      const weeks = weeksAheadForPaymentPlan(rs.payment_plan as string);
      cancelledExcess = await cancelExcessFutureSessions(
        supabase,
        pr.recurring_session_id as string,
        frequency * weeks
      );
    }
  }

  const allocation = await allocateTutorEarningsForPaymentRequest(supabase, paymentRequestId);

  return { paymentRequestId, cancelledExcess, allocation };
}

/** Paid payment_requests with no tutor_earnings rows yet. */
export async function listPaymentRequestsNeedingEarningsBackfill(
  supabase: SupabaseClient,
  limit = 50
): Promise<
  Array<{
    id: string;
    tutor_id: string;
    amount: number;
    paid_at: string | null;
    recurring_session_id: string | null;
  }>
> {
  const { data: paid, error } = await supabase
    .from('payment_requests')
    .select('id, tutor_id, amount, paid_at, recurring_session_id')
    .eq('status', 'paid')
    .not('recurring_session_id', 'is', null)
    .order('paid_at', { ascending: false })
    .limit(limit * 3);

  if (error) throw error;
  if (!paid?.length) return [];

  const ids = paid.map((p) => p.id);
  const { data: allocated } = await supabase
    .from('tutor_earnings')
    .select('payment_request_id')
    .in('payment_request_id', ids);

  const allocatedSet = new Set(
    (allocated || []).map((r) => r.payment_request_id).filter(Boolean)
  );

  return paid.filter((p) => !allocatedSet.has(p.id)).slice(0, limit);
}
