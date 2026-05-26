import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdminOrDeny, getTimeRanges } from '../_lib';
import { COMMISSION_RATE, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';

export const runtime = 'nodejs';

type Scope = 'on' | 'off' | 'combined';

const COMPLETED_STATUSES = ['completed', 'evaluated'];

function revenueForState(state: string | null | undefined, amount: number, isHistoricalImport?: boolean | null) {
  if (isHistoricalImport) return amount;
  const s = (state || 'active').toLowerCase();
  return s === 'active' ? amount : 0;
}

function monthKey(dateLike: string | null | undefined) {
  if (!dateLike) return '';
  return dateLike.slice(0, 7);
}

function addMonths(year: number, monthIndex: number, offset: number) {
  const d = new Date(year, monthIndex + offset, 1);
  return monthKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
}

function distributePeriodRevenueAcrossMonths(period: {
  period_start?: string | null;
  pay_per_month_xaf?: number | null;
  pay_months_count?: number | null;
  expected_period_revenue_xaf?: number | null;
  operation_state?: string | null;
  is_historical_import?: boolean | null;
}) {
  const payPerMonth = Number(period.pay_per_month_xaf || 0);
  const payMonths = Math.max(1, Number(period.pay_months_count || 1));
  const totalExpected = Number(period.expected_period_revenue_xaf || payPerMonth * payMonths);
  const countedTotal = revenueForState(period.operation_state, totalExpected, period.is_historical_import);
  if (!countedTotal) return [] as Array<{ month: string; revenue: number }>;

  const start = period.period_start ? new Date(`${period.period_start}T12:00:00`) : null;
  if (!start || Number.isNaN(start.getTime())) {
    return [{ month: monthKey(period.period_start), revenue: countedTotal }];
  }

  const perMonth = payMonths > 1 ? Math.round(countedTotal / payMonths) : countedTotal;
  const rows: Array<{ month: string; revenue: number }> = [];
  for (let i = 0; i < payMonths; i++) {
    rows.push({
      month: addMonths(start.getFullYear(), start.getMonth(), i),
      revenue: i === payMonths - 1 ? countedTotal - perMonth * (payMonths - 1) : perMonth,
    });
  }
  return rows.filter((row) => row.month);
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const scope = (request.nextUrl.searchParams.get('scope') || 'off') as Scope;
    getTimeRanges();

    const { data: periods } = await supabaseAdmin
      .from('offline_scheduling_periods')
      .select(
        'id, tutor_user_id, primary_user_id, learner_user_id, learner_display_names, sessions_per_week, onsite_location, meet_link, pay_per_month_xaf, pay_months_count, expected_period_revenue_xaf, operation_state, period_start, start_month_label, delivery_mode, is_historical_import'
      )
      .order('period_start', { ascending: true });

    const { data: onPayments } = await supabaseAdmin
      .from('session_payments')
      .select('amount, payment_status, session_id, created_at')
      .eq('payment_status', 'paid');

    const { data: onSessions } = await supabaseAdmin
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, status, scheduled_date, created_at, offline_scheduling_period_id')
      .is('offline_scheduling_period_id', null);

    const { data: offSessions } = await supabaseAdmin
      .from('individual_sessions')
      .select('id, tutor_id, offline_scheduling_period_id, status')
      .not('offline_scheduling_period_id', 'is', null);

    const periodRows = periods || [];
    const parentIds = [...new Set(periodRows.map((p) => p.primary_user_id).filter(Boolean))];
    const offTutorIds = [...new Set(periodRows.map((p) => p.tutor_user_id).filter(Boolean))];
    const onTutorIds = [...new Set((onSessions || []).map((s) => s.tutor_id).filter(Boolean))];
    const allTutorIds = [...new Set([...offTutorIds, ...onTutorIds])];

    const { data: parentProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', parentIds.length ? parentIds : ['00000000-0000-0000-0000-000000000000']);

    const { data: tutorProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', allTutorIds.length ? allTutorIds : ['00000000-0000-0000-0000-000000000000']);

    const { data: learnerProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in(
        'id',
        [...new Set((onSessions || []).map((s) => s.learner_id || s.parent_id).filter(Boolean))].length
          ? [...new Set((onSessions || []).map((s) => s.learner_id || s.parent_id).filter(Boolean))]
          : ['00000000-0000-0000-0000-000000000000']
      );

    const parentName = new Map((parentProfiles || []).map((p) => [p.id, p.full_name || 'Parent']));
    const tutorName = new Map((tutorProfiles || []).map((t) => [t.id, t.full_name || 'Tutor']));
    const learnerName = new Map((learnerProfiles || []).map((p) => [p.id, p.full_name || 'Learner']));

    const offRecords = periodRows.map((p) => {
      const revenue = Number(p.expected_period_revenue_xaf || 0);
      const counted = revenueForState(p.operation_state, revenue, p.is_historical_import);
      return {
        tutorName: tutorName.get(p.tutor_user_id) || 'Tutor',
        parentName: parentName.get(p.primary_user_id) || '—',
        students: p.learner_display_names || '—',
        sessionsPerWeek: p.sessions_per_week,
        location: p.onsite_location || p.meet_link || p.delivery_mode,
        payPerMonth: Number(p.pay_per_month_xaf || 0),
        payMonths: Number(p.pay_months_count || 0),
        startMonth: p.start_month_label || p.period_start,
        state: p.operation_state || 'active',
        revenue,
        prepskulProfit: Math.round(counted * COMMISSION_RATE),
        tutorEarnings: Math.round(counted * TUTOR_EARNINGS_RATE),
        countedRevenue: counted,
        isHistoricalImport: Boolean(p.is_historical_import),
      };
    });

    const onSessionIds = new Set((onSessions || []).map((s) => s.id));
    const onPaymentBySession = new Map<string, number>();
    for (const p of onPayments || []) {
      if (!p.session_id || !onSessionIds.has(p.session_id)) continue;
      onPaymentBySession.set(
        p.session_id,
        (onPaymentBySession.get(p.session_id) || 0) + Number(p.amount || 0)
      );
    }

    const onRecordsMap = new Map<
      string,
      {
        tutorName: string;
        parentName: string;
        students: string;
        sessionsPerWeek: number;
        location: string;
        payPerMonth: number;
        payMonths: number;
        startMonth: string;
        state: string;
        revenue: number;
        prepskulProfit: number;
        tutorEarnings: number;
        countedRevenue: number;
      }
    >();

    for (const s of onSessions || []) {
      const revenue = onPaymentBySession.get(s.id) || 0;
      const key = `${s.tutor_id}:${s.learner_id || s.parent_id || 'unknown'}`;
      const studentLabel =
        learnerName.get(s.learner_id || s.parent_id || '') || 'On-platform learner';
      const existing = onRecordsMap.get(key);
      if (existing) {
        existing.revenue += revenue;
        existing.countedRevenue += revenue;
        existing.prepskulProfit = Math.round(existing.countedRevenue * COMMISSION_RATE);
        existing.tutorEarnings = Math.round(existing.countedRevenue * TUTOR_EARNINGS_RATE);
        existing.sessionsPerWeek += 1;
        continue;
      }
      onRecordsMap.set(key, {
        tutorName: tutorName.get(s.tutor_id) || 'Tutor',
        parentName: learnerName.get(s.parent_id || '') || '—',
        students: studentLabel,
        sessionsPerWeek: 1,
        location: 'On-platform',
        payPerMonth: 0,
        payMonths: 0,
        startMonth: monthKey(s.scheduled_date || s.created_at) || '—',
        state: COMPLETED_STATUSES.includes(String(s.status || '').toLowerCase()) ? 'active' : 'paused',
        revenue,
        prepskulProfit: Math.round(revenue * COMMISSION_RATE),
        tutorEarnings: Math.round(revenue * TUTOR_EARNINGS_RATE),
        countedRevenue: revenue,
      });
    }

    const onRecords = [...onRecordsMap.values()];

    const offTutorSummaryMap = new Map<
      string,
      { sessions: number; revenue: number; profit: number; earnings: number; state: string }
    >();
    for (const p of periodRows) {
      const key = p.tutor_user_id;
      const rev = revenueForState(
        p.operation_state,
        Number(p.expected_period_revenue_xaf || 0),
        p.is_historical_import
      );
      const cur = offTutorSummaryMap.get(key) || {
        sessions: 0,
        revenue: 0,
        profit: 0,
        earnings: 0,
        state: p.operation_state || 'active',
      };
      cur.revenue += rev;
      cur.profit += Math.round(rev * COMMISSION_RATE);
      cur.earnings += Math.round(rev * TUTOR_EARNINGS_RATE);
      offTutorSummaryMap.set(key, cur);
    }
    for (const s of offSessions || []) {
      const cur = offTutorSummaryMap.get(s.tutor_id);
      if (cur) cur.sessions += 1;
    }

    const offTutorSummary = [...offTutorSummaryMap.entries()].map(([tid, v]) => ({
      tutorName: tutorName.get(tid) || 'Tutor',
      totalSessions: v.sessions,
      totalRevenueXaf: v.revenue,
      prepskulProfit: v.profit,
      tutorEarnings: v.earnings,
      state: v.state,
    }));

    const onTutorSummaryMap = new Map<
      string,
      { sessions: number; revenue: number; profit: number; earnings: number; state: string }
    >();
    for (const s of onSessions || []) {
      const key = s.tutor_id;
      const rev = onPaymentBySession.get(s.id) || 0;
      const cur = onTutorSummaryMap.get(key) || {
        sessions: 0,
        revenue: 0,
        profit: 0,
        earnings: 0,
        state: 'active',
      };
      cur.sessions += 1;
      cur.revenue += rev;
      cur.profit += Math.round(rev * COMMISSION_RATE);
      cur.earnings += Math.round(rev * TUTOR_EARNINGS_RATE);
      onTutorSummaryMap.set(key, cur);
    }

    const onTutorSummary = [...onTutorSummaryMap.entries()].map(([tid, v]) => ({
      tutorName: tutorName.get(tid) || 'Tutor',
      totalSessions: v.sessions,
      totalRevenueXaf: v.revenue,
      prepskulProfit: v.profit,
      tutorEarnings: v.earnings,
      state: v.state,
    }));

    const offMonthlyMap = new Map<string, { revenue: number; students: number; tutors: Set<string> }>();
    for (const p of periodRows) {
      const monthRows = distributePeriodRevenueAcrossMonths(p);
      for (const row of monthRows) {
        const cur = offMonthlyMap.get(row.month) || { revenue: 0, students: 0, tutors: new Set<string>() };
        cur.revenue += row.revenue;
        if (row.revenue > 0) cur.students += 1;
        cur.tutors.add(p.tutor_user_id);
        offMonthlyMap.set(row.month, cur);
      }
    }

    const offMonthlySummary = [...offMonthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        tutorNames: [...v.tutors].map((id) => tutorName.get(id) || 'Tutor'),
        revenue: v.revenue,
        commission: Math.round(v.revenue * COMMISSION_RATE),
        tutorShare: Math.round(v.revenue * TUTOR_EARNINGS_RATE),
        studentCount: v.students,
      }));

    const onMonthlyMap = new Map<string, { revenue: number; students: Set<string>; tutors: Set<string> }>();
    for (const s of onSessions || []) {
      const m = monthKey(s.scheduled_date || s.created_at);
      if (!m) continue;
      const rev = onPaymentBySession.get(s.id) || 0;
      const cur = onMonthlyMap.get(m) || { revenue: 0, students: new Set<string>(), tutors: new Set<string>() };
      cur.revenue += rev;
      const learnerKey = (s.learner_id || s.parent_id) as string | undefined;
      if (learnerKey) cur.students.add(learnerKey);
      cur.tutors.add(s.tutor_id);
      onMonthlyMap.set(m, cur);
    }

    const onMonthlySummary = [...onMonthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        tutorNames: [...v.tutors].map((id) => tutorName.get(id) || 'Tutor'),
        revenue: v.revenue,
        commission: Math.round(v.revenue * COMMISSION_RATE),
        tutorShare: Math.round(v.revenue * TUTOR_EARNINGS_RATE),
        studentCount: v.students.size,
      }));

    const offRevenue = offRecords.reduce((s, r) => s + r.countedRevenue, 0);
    const onRevenue = (onPayments || []).reduce((s, p) => {
      if (!p.session_id || !onSessionIds.has(p.session_id)) return s;
      return s + Number(p.amount || 0);
    }, 0);

    const onSessionCount = (onSessions || []).length;
    const offSessionCount = (offSessions || []).length;

    const scopeTotals = {
      on: {
        sessions: onSessionCount,
        revenue: onRevenue,
        commission: Math.round(onRevenue * COMMISSION_RATE),
        tutorEarnings: Math.round(onRevenue * TUTOR_EARNINGS_RATE),
      },
      off: {
        sessions: offSessionCount,
        revenue: offRevenue,
        commission: Math.round(offRevenue * COMMISSION_RATE),
        tutorEarnings: Math.round(offRevenue * TUTOR_EARNINGS_RATE),
      },
      combined: {
        sessions: onSessionCount + offSessionCount,
        revenue: onRevenue + offRevenue,
        commission: Math.round((onRevenue + offRevenue) * COMMISSION_RATE),
        tutorEarnings: Math.round((onRevenue + offRevenue) * TUTOR_EARNINGS_RATE),
      },
    };

    const pick =
      scope === 'on'
        ? { records: onRecords, tutorSummary: onTutorSummary, monthlySummary: onMonthlySummary, totals: scopeTotals.on }
        : scope === 'off'
          ? { records: offRecords, tutorSummary: offTutorSummary, monthlySummary: offMonthlySummary, totals: scopeTotals.off }
          : {
              records: [...offRecords, ...onRecords],
              tutorSummary: [...offTutorSummary, ...onTutorSummary],
              monthlySummary: [...offMonthlySummary, ...onMonthlySummary],
              totals: scopeTotals.combined,
            };

    const combinedRevenue = onRevenue + offRevenue;

    return NextResponse.json({
      scope,
      ...pick,
      grandTotals: {
        sessionsRevenue: combinedRevenue,
        prepskulProfit: Math.round(combinedRevenue * COMMISSION_RATE),
        tutorEarnings: Math.round(combinedRevenue * TUTOR_EARNINGS_RATE),
        totalRevenue: combinedRevenue,
      },
    });
  } catch (e: unknown) {
    console.error('operations-insights', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
