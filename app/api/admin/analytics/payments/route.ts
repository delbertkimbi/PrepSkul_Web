import { NextResponse } from 'next/server';
import { classifyPaymentEnvironment, isRealPayment } from '@/lib/analytics-payment-env';
import { sessionBelongsToOfflineOps } from '@/lib/analytics-offline-scope';
import { getTimeRanges, groupByDay, requireAdminOrDeny } from '../_lib';

export const runtime = 'nodejs';

type PaymentRow = {
  payment_status: string | null;
  payment_method?: string | null;
  fapshi_trans_id?: string | null;
  amount: number | string | null;
  created_at: string;
  source?: 'on_platform' | 'off_platform' | 'booking_request';
  payment_environment?: string | null;
  session_id?: string | null;
};

function sumAmount(rows: PaymentRow[]) {
  return rows.reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

function inRangeRows(rows: PaymentRow[], sinceIso: string) {
  const since = new Date(sinceIso);
  return rows.filter((r) => new Date(r.created_at) >= since);
}

function normalizePaymentStatus(status: string | null): 'paid' | 'failed' | 'pending' {
  const s = (status || '').toLowerCase();
  if (['paid', 'successful', 'success'].includes(s)) return 'paid';
  if (['failed', 'refunded', 'expired'].includes(s)) return 'failed';
  return 'pending';
}

function isConfirmedFapshiPayment(row: PaymentRow) {
  if (normalizePaymentStatus(row.payment_status) !== 'paid') return false;
  return Boolean(row.fapshi_trans_id?.trim());
}

function isRealConfirmedFapshi(row: PaymentRow) {
  return isConfirmedFapshiPayment(row) && isRealPayment(row);
}

function dedupeByFapshiTransId(rows: PaymentRow[]) {
  const byTx = new Map<string, PaymentRow>();
  for (const row of rows) {
    const tx = row.fapshi_trans_id?.trim();
    if (!tx) continue;
    const key = tx.toLowerCase();
    if (!byTx.has(key)) byTx.set(key, row);
  }
  return [...byTx.values()];
}

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const ranges = getTimeRanges();

    let safeSessionRows: PaymentRow[] = [];
    const { data: sessionPayments, error: sessionPaymentsError } = await supabaseAdmin
      .from('session_payments')
      .select(
        'payment_status, payment_method, fapshi_trans_id, amount, created_at, session_id, payment_environment'
      )
      .eq('payment_status', 'paid')
      .not('fapshi_trans_id', 'is', null)
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    if (!sessionPaymentsError) {
      safeSessionRows = (sessionPayments || []) as PaymentRow[];
    } else {
      const { data: fallbackSessionPayments } = await supabaseAdmin
        .from('session_payments')
        .select('payment_status, amount, created_at, session_id, fapshi_trans_id, payment_method')
        .eq('payment_status', 'paid')
        .gte('created_at', ranges.yearly)
        .order('created_at', { ascending: true });
      safeSessionRows = ((fallbackSessionPayments || []) as PaymentRow[]).map((row) => ({
        ...row,
        payment_environment: null,
      }));
    }

    const sessionIds = [
      ...new Set(safeSessionRows.map((r) => r.session_id).filter(Boolean)),
    ] as string[];

    const { data: paymentSessions } = sessionIds.length
      ? await supabaseAdmin
          .from('individual_sessions')
          .select('id, offline_scheduling_period_id, tutor_id, learner_id, parent_id')
          .in('id', sessionIds)
      : { data: [] };

    const sessionById = new Map((paymentSessions || []).map((s) => [s.id, s]));

    const onPlatformSessionPayments = safeSessionRows
      .filter((row) => {
        if (!row.session_id) return false;
        const session = sessionById.get(row.session_id);
        if (!session) return false;
        return !sessionBelongsToOfflineOps(session);
      })
      .map((row) => ({ ...row, source: 'on_platform' as const }));

    const offlineSessionPayments = safeSessionRows
      .filter((row) => {
        if (!row.session_id) return false;
        const session = sessionById.get(row.session_id);
        return session ? sessionBelongsToOfflineOps(session) : false;
      })
      .map((row) => ({ ...row, source: 'off_platform' as const }));

    let mappedRequestRows: PaymentRow[] = [];
    const { data: paymentRequests, error: paymentRequestsError } = await supabaseAdmin
      .from('payment_requests')
      .select('status, amount, fapshi_trans_id, created_at, payment_environment')
      .eq('status', 'paid')
      .not('fapshi_trans_id', 'is', null)
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    if (!paymentRequestsError) {
      mappedRequestRows = (
        (paymentRequests || []) as Array<{
          status: string | null;
          amount: number | string | null;
          fapshi_trans_id?: string | null;
          created_at: string;
          payment_environment?: string | null;
        }>
      ).map((row) => ({
        payment_status: row.status,
        payment_method: null,
        fapshi_trans_id: row.fapshi_trans_id ?? null,
        amount: row.amount,
        created_at: row.created_at,
        payment_environment: row.payment_environment ?? null,
        source: 'booking_request' as const,
      }));
    } else {
      const { data: fallbackRequests } = await supabaseAdmin
        .from('payment_requests')
        .select('status, amount, fapshi_trans_id, created_at')
        .eq('status', 'paid')
        .not('fapshi_trans_id', 'is', null)
        .gte('created_at', ranges.yearly)
        .order('created_at', { ascending: true });
      mappedRequestRows = ((fallbackRequests || []) as Array<{
        status: string | null;
        amount: number | string | null;
        fapshi_trans_id?: string | null;
        created_at: string;
      }>).map((row) => ({
        payment_status: row.status,
        payment_method: null,
        fapshi_trans_id: row.fapshi_trans_id ?? null,
        amount: row.amount,
        created_at: row.created_at,
        payment_environment: null,
        source: 'booking_request' as const,
      }));
    }

    const realOnPlatformSessionRows = dedupeByFapshiTransId(
      onPlatformSessionPayments.filter(isRealConfirmedFapshi)
    );
    const sessionTxIds = new Set(
      realOnPlatformSessionRows.map((r) => r.fapshi_trans_id?.trim().toLowerCase()).filter(Boolean)
    );
    const realBookingOnlyRows = dedupeByFapshiTransId(
      mappedRequestRows.filter(
        (row) =>
          isRealConfirmedFapshi(row) &&
          !sessionTxIds.has((row.fapshi_trans_id || '').trim().toLowerCase())
      )
    );

    const realOfflineSessionRows = dedupeByFapshiTransId(
      offlineSessionPayments.filter(isRealConfirmedFapshi)
    );

    const { data: offlinePayments, error: offlinePaymentsError } = await supabaseAdmin
      .from('offline_operations')
      .select('payment_status, payment_environment, amount_paid, created_at')
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    const offlineOpsRows: PaymentRow[] = offlinePaymentsError
      ? []
      : ((offlinePayments || []) as Array<{
          payment_status: string | null;
          payment_environment: string | null;
          amount_paid: number | string | null;
          created_at: string;
        }>).map((row) => ({
          payment_status: row.payment_status,
          payment_environment: row.payment_environment,
          amount: row.amount_paid,
          created_at: row.created_at,
          source: 'off_platform',
        }));

    const realOfflineOpsRows = offlineOpsRows.filter(isRealPayment);
    const sandboxOfflineOpsRows = offlineOpsRows.filter(
      (row) => classifyPaymentEnvironment(row) === 'sandbox'
    );

    const headlineRows = realOnPlatformSessionRows;
    const paid = (rows: PaymentRow[]) =>
      rows.filter((p) => normalizePaymentStatus(p.payment_status) === 'paid');

    const completed = paid(headlineRows);
    const offlineOpsPaid = paid(realOfflineOpsRows);
    const offlineSessionPaid = paid(realOfflineSessionRows);
    const offlinePaidTotal = offlineOpsPaid.length + offlineSessionPaid.length;
    const offlineVolumeXaf =
      sumAmount(offlineOpsPaid) + sumAmount(offlineSessionPaid);
    const bookingPaid = paid(realBookingOnlyRows);

    const sandboxFapshiRows = [
      ...onPlatformSessionPayments,
      ...offlineSessionPayments,
      ...mappedRequestRows,
    ].filter(isConfirmedFapshiPayment).filter((row) => classifyPaymentEnvironment(row) === 'sandbox');
    const sandboxFapshiPaid = dedupeByFapshiTransId(sandboxFapshiRows).filter(
      (p) => normalizePaymentStatus(p.payment_status) === 'paid'
    );

    const headlineRealRows = headlineRows;
    const dailyRows = inRangeRows(headlineRealRows, ranges.daily);
    const weeklyRows = inRangeRows(headlineRealRows, ranges.weekly);
    const monthlyRows = inRangeRows(headlineRealRows, ranges.monthly);

    return NextResponse.json({
      totals: {
        completedPayments: completed.length,
        failedPayments: 0,
        pendingPayments: 0,
        offlineCompletedPayments: offlinePaidTotal,
        offlineEnrollmentPayments: offlineOpsPaid.length,
        offlineSessionPayments: offlineSessionPaid.length,
        offlineVolumeXaf,
        bookingPaymentsPaid: bookingPaid.length,
        sandboxFapshiPayments: sandboxFapshiPaid.length,
        sandboxOfflinePayments: paid(sandboxOfflineOpsRows).length,
      },
      volume: {
        daily: sumAmount(dailyRows),
        weekly: sumAmount(weeklyRows),
        monthly: sumAmount(monthlyRows),
        yearly: sumAmount(headlineRealRows),
        offlineYearly: offlineVolumeXaf,
      },
      charts: {
        dailyVolumeLast30Days: groupByDay(headlineRealRows, 30),
        statusBreakdown: [
          { name: 'Completed', value: completed.length },
          { name: 'Failed', value: 0 },
          { name: 'Pending', value: 0 },
        ],
      },
      platformBreakdown: {
        onPlatform: {
          transactions: headlineRealRows.length,
          volume: sumAmount(headlineRealRows),
          completedPayments: completed.length,
          failedPayments: 0,
          pendingPayments: 0,
        },
        bookingRequests: {
          transactions: realBookingOnlyRows.length,
          volume: sumAmount(realBookingOnlyRows),
          completedPayments: bookingPaid.length,
          failedPayments: 0,
          pendingPayments: 0,
        },
        offPlatform: {
          transactions: realOfflineOpsRows.length + realOfflineSessionRows.length,
          volume: offlineVolumeXaf,
          completedPayments: offlinePaidTotal,
          failedPayments: 0,
          pendingPayments: 0,
        },
      },
    });
  } catch (error) {
    console.error('admin analytics payments error', error);
    return NextResponse.json({ error: 'Failed to load payment analytics' }, { status: 500 });
  }
}
