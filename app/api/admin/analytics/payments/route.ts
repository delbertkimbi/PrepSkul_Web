import { NextResponse } from 'next/server';
import { getTimeRanges, groupByDay, requireAdminOrDeny } from '../_lib';

export const runtime = 'nodejs';

type PaymentRow = {
  payment_status: string | null;
  payment_method?: string | null;
  fapshi_trans_id?: string | null;
  amount: number | string | null;
  created_at: string;
  source?: 'on_platform' | 'off_platform';
  payment_environment?: 'real' | 'sandbox' | null;
};

function sumAmount(rows: PaymentRow[]) {
  return rows.reduce((sum, p) => sum + Number(p.amount || 0), 0);
}

function inRangeRows(rows: PaymentRow[], sinceIso: string) {
  const since = new Date(sinceIso);
  return rows.filter((r) => new Date(r.created_at) >= since);
}

type PaymentEnv = 'real' | 'sandbox';

function classifyPaymentEnvironment(row: PaymentRow): PaymentEnv {
  if (row.payment_environment) {
    return row.payment_environment === 'sandbox' ? 'sandbox' : 'real';
  }
  const method = (row.payment_method || '').toLowerCase();
  const txRef = (row.fapshi_trans_id || '').toLowerCase();
  const fingerprint = `${method} ${txRef}`;
  const looksSandbox = /sandbox|test|demo/.test(fingerprint);
  return looksSandbox ? 'sandbox' : 'real';
}

function normalizePaymentStatus(status: string | null): 'paid' | 'failed' | 'pending' {
  const s = (status || '').toLowerCase();
  if (['paid', 'successful', 'success'].includes(s)) return 'paid';
  if (['failed', 'refunded', 'expired'].includes(s)) return 'failed';
  return 'pending';
}

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const ranges = getTimeRanges();
    const { data: sessionPayments, error: sessionPaymentsError } = await supabaseAdmin
      .from('session_payments')
      .select('payment_status, payment_method, fapshi_trans_id, amount, created_at')
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    // Some deployments may not have all optional columns yet; retry with minimal fields.
    let safeSessionRows = (sessionPayments || []) as PaymentRow[];
    if (sessionPaymentsError) {
      const { data: fallbackSessionPayments } = await supabaseAdmin
        .from('session_payments')
        .select('payment_status, amount, created_at')
        .gte('created_at', ranges.yearly)
        .order('created_at', { ascending: true });
      safeSessionRows = ((fallbackSessionPayments || []) as Array<{
        payment_status: string | null;
        amount: number | string | null;
        created_at: string;
      }>).map((row) => ({ ...row, payment_method: null, fapshi_trans_id: null }));
    }

    // Include payment_requests to avoid zero totals when payments are tracked there.
    const { data: paymentRequests } = await supabaseAdmin
      .from('payment_requests')
      .select('status, amount, fapshi_trans_id, created_at')
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    const mappedRequestRows: PaymentRow[] = ((paymentRequests || []) as Array<{
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
      source: 'on_platform',
    }));

    const onPlatformRows: PaymentRow[] = [
      ...safeSessionRows.map((row) => ({ ...row, source: 'on_platform' as const })),
      ...mappedRequestRows,
    ];

    const { data: offlinePayments, error: offlinePaymentsError } = await supabaseAdmin
      .from('offline_operations')
      .select('payment_status, payment_environment, amount_paid, created_at')
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    const offPlatformRows: PaymentRow[] = offlinePaymentsError
      ? []
      : ((offlinePayments || []) as Array<{
          payment_status: string | null;
          payment_environment: 'real' | 'sandbox' | null;
          amount_paid: number | string | null;
          created_at: string;
        }>).map((row) => ({
          payment_status: row.payment_status,
          payment_environment: row.payment_environment,
          amount: row.amount_paid,
          created_at: row.created_at,
          source: 'off_platform',
        }));

    const rows = [...onPlatformRows, ...offPlatformRows];

    const completed = rows.filter((p) => normalizePaymentStatus(p.payment_status) === 'paid');
    const failed = rows.filter((p) => normalizePaymentStatus(p.payment_status) === 'failed');
    const pending = rows.filter((p) => normalizePaymentStatus(p.payment_status) === 'pending');

    const dailyRows = inRangeRows(rows, ranges.daily);
    const weeklyRows = inRangeRows(rows, ranges.weekly);
    const monthlyRows = inRangeRows(rows, ranges.monthly);

    const envRows = {
      real: rows.filter((p) => classifyPaymentEnvironment(p) === 'real'),
      sandbox: rows.filter((p) => classifyPaymentEnvironment(p) === 'sandbox'),
    };

    const envByStatus = (env: PaymentEnv, status: 'paid' | 'failed' | 'pending') =>
      envRows[env].filter((p) => normalizePaymentStatus(p.payment_status) === status);

    const sourceRows = {
      on: rows.filter((r) => r.source === 'on_platform'),
      off: rows.filter((r) => r.source === 'off_platform'),
    };

    const sourceCount = (source: 'on' | 'off', status: 'paid' | 'failed' | 'pending') =>
      sourceRows[source].filter((r) => normalizePaymentStatus(r.payment_status) === status).length;

    return NextResponse.json({
      totals: {
        completedPayments: completed.length,
        failedPayments: failed.length,
        pendingPayments: pending.length,
      },
      volume: {
        daily: sumAmount(dailyRows),
        weekly: sumAmount(weeklyRows),
        monthly: sumAmount(monthlyRows),
        yearly: sumAmount(rows),
      },
      charts: {
        dailyVolumeLast30Days: groupByDay(rows, 30),
        statusBreakdown: [
          { name: 'Completed', value: completed.length },
          { name: 'Failed', value: failed.length },
          { name: 'Pending', value: pending.length },
        ],
      },
      environmentBreakdown: {
        real: {
          transactions: envRows.real.length,
          volume: sumAmount(envRows.real),
          completedPayments: envByStatus('real', 'paid').length,
          failedPayments: envByStatus('real', 'failed').length,
          pendingPayments: envByStatus('real', 'pending').length,
        },
        sandbox: {
          transactions: envRows.sandbox.length,
          volume: sumAmount(envRows.sandbox),
          completedPayments: envByStatus('sandbox', 'paid').length,
          failedPayments: envByStatus('sandbox', 'failed').length,
          pendingPayments: envByStatus('sandbox', 'pending').length,
        },
      },
      platformBreakdown: {
        onPlatform: {
          transactions: sourceRows.on.length,
          volume: sumAmount(sourceRows.on),
          completedPayments: sourceCount('on', 'paid'),
          failedPayments: sourceCount('on', 'failed'),
          pendingPayments: sourceCount('on', 'pending'),
        },
        offPlatform: {
          transactions: sourceRows.off.length,
          volume: sumAmount(sourceRows.off),
          completedPayments: sourceCount('off', 'paid'),
          failedPayments: sourceCount('off', 'failed'),
          pendingPayments: sourceCount('off', 'pending'),
        },
      },
    });
  } catch (error) {
    console.error('admin analytics payments error', error);
    return NextResponse.json({ error: 'Failed to load payment analytics' }, { status: 500 });
  }
}
