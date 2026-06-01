/**
 * One-off: backfill tutor earnings for a payment_request_id
 * Usage: node scripts/run-backfill-tutor-earnings.mjs <payment_request_id>
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    // rely on existing env
  }
}

loadEnv();

const paymentRequestId = process.argv[2];
if (!paymentRequestId) {
  console.error('Usage: node scripts/run-backfill-tutor-earnings.mjs <payment_request_id>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const COMMISSION_RATE = 0.15;
const TUTOR_RATE = 0.85;

function weeksAheadForPaymentPlan(paymentPlan) {
  const p = String(paymentPlan || 'monthly').trim().toLowerCase();
  if (p === 'weekly') return 1;
  if (p === 'biweekly' || p === 'bi-weekly') return 2;
  return 4;
}

async function cancelExcess(recurringSessionId, maxSessions) {
  const { data: sessions, error } = await supabase
    .from('individual_sessions')
    .select('id')
    .eq('recurring_session_id', recurringSessionId)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true });
  if (error) throw error;
  const list = sessions || [];
  if (list.length <= maxSessions) return 0;
  let cancelled = 0;
  for (const s of list.slice(maxSessions)) {
    const { error: upErr } = await supabase
      .from('individual_sessions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', s.id);
    if (!upErr) cancelled++;
  }
  return cancelled;
}

async function allocate(paymentRequestId) {
  const { data: existing } = await supabase
    .from('tutor_earnings')
    .select('id')
    .eq('payment_request_id', paymentRequestId)
    .limit(1);
  if (existing?.length) {
    return { allocated: 0, skipped: true, reason: 'already_allocated' };
  }

  const { data: pr } = await supabase
    .from('payment_requests')
    .select('id, status, tutor_id, recurring_session_id')
    .eq('id', paymentRequestId)
    .maybeSingle();
  if (!pr || pr.status !== 'paid') {
    return { allocated: 0, skipped: true, reason: 'not_paid' };
  }
  if (!pr.recurring_session_id) {
    return { allocated: 0, skipped: true, reason: 'no_recurring_session' };
  }

  const { data: rs } = await supabase
    .from('recurring_sessions')
    .select('id, tutor_id, monthly_total, frequency, location, payment_plan, transportation_cost_per_session')
    .eq('id', pr.recurring_session_id)
    .maybeSingle();
  if (!rs) return { allocated: 0, skipped: true, reason: 'no_recurring_session_row' };

  const frequency = Number(rs.frequency || 1);
  const weeks = weeksAheadForPaymentPlan(rs.payment_plan);
  const maxSessions = frequency * weeks;
  const monthlyTotal = Number(rs.monthly_total || 0);
  const sessionFee = monthlyTotal / Math.max(frequency * 4, 1);
  const platformFee = sessionFee * COMMISSION_RATE;
  const sessionTutorShare = sessionFee * TUTOR_RATE;
  const location = String(rs.location || 'online').toLowerCase();
  const isOnsite = location === 'onsite' || location === 'hybrid';
  const transportPerSession = isOnsite ? Number(rs.transportation_cost_per_session || 0) : 0;
  const tutorId = pr.tutor_id || rs.tutor_id;

  const { data: sessions } = await supabase
    .from('individual_sessions')
    .select('id, transportation_cost')
    .eq('recurring_session_id', pr.recurring_session_id)
    .eq('status', 'scheduled')
    .order('scheduled_date', { ascending: true })
    .limit(maxSessions);

  if (!sessions?.length) {
    return { allocated: 0, skipped: true, reason: 'no_scheduled_sessions' };
  }

  const now = new Date().toISOString();
  const rows = sessions.map((s) => {
    const transport =
      Number(s.transportation_cost || 0) > 0
        ? Number(s.transportation_cost)
        : transportPerSession;
    const totalTutor = sessionTutorShare + (isOnsite ? transport : 0);
    return {
      tutor_id: tutorId,
      session_id: s.id,
      recurring_session_id: pr.recurring_session_id,
      payment_request_id: paymentRequestId,
      session_fee: sessionFee,
      platform_fee: platformFee,
      tutor_earnings: totalTutor,
      transportation_earnings: isOnsite ? transport : 0,
      earnings_type: transport > 0 ? 'combined' : 'session',
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
  return { allocated: rows.length, skipped: false };
}

async function main() {
  console.log('Payment request:', paymentRequestId);

  const { data: pr } = await supabase
    .from('payment_requests')
    .select('id, status, amount, tutor_id, recurring_session_id, paid_at')
    .eq('id', paymentRequestId)
    .maybeSingle();

  console.log('Payment request row:', pr);

  if (!pr) {
    console.error('Not found');
    process.exit(1);
  }

  let cancelled = 0;
  if (pr.recurring_session_id) {
    const { data: rs } = await supabase
      .from('recurring_sessions')
      .select('frequency, payment_plan')
      .eq('id', pr.recurring_session_id)
      .maybeSingle();
    if (rs) {
      const max = Number(rs.frequency || 1) * weeksAheadForPaymentPlan(rs.payment_plan);
      cancelled = await cancelExcess(pr.recurring_session_id, max);
      console.log('Cancelled excess sessions:', cancelled, '(max kept:', max + ')');
    }
  }

  const allocation = await allocate(paymentRequestId);
  console.log('Allocation result:', allocation);

  const { data: earnings } = await supabase
    .from('tutor_earnings')
    .select('id, session_id, tutor_earnings, earnings_status')
    .eq('payment_request_id', paymentRequestId);

  const pendingSum = (earnings || []).reduce((s, e) => s + Number(e.tutor_earnings || 0), 0);
  console.log('Earnings rows:', earnings?.length ?? 0, 'pending total:', pendingSum, 'XAF');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
