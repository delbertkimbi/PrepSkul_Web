import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdminOrDeny, getTimeRanges } from '../_lib';
import { COMMISSION_RATE, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';

export const runtime = 'nodejs';

type Scope = 'on' | 'off' | 'combined';

function revenueForState(state: string | null, amount: number) {
  const s = (state || 'active').toLowerCase();
  return s === 'active' ? amount : 0;
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
        'id, tutor_user_id, primary_user_id, learner_user_id, learner_display_names, sessions_per_week, onsite_location, meet_link, pay_per_month_xaf, pay_months_count, expected_period_revenue_xaf, operation_state, period_start, start_month_label, delivery_mode'
      )
      .order('period_start', { ascending: true });

    const { data: onPayments } = await supabaseAdmin
      .from('session_payments')
      .select('amount, payment_status, created_at')
      .eq('payment_status', 'paid');

    const periodRows = periods || [];
    const parentIds = [...new Set(periodRows.map((p) => p.primary_user_id).filter(Boolean))];
    const tutorIds = [...new Set(periodRows.map((p) => p.tutor_user_id).filter(Boolean))];

    const { data: parentProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', parentIds.length ? parentIds : ['00000000-0000-0000-0000-000000000000']);

    const { data: tutorProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', tutorIds.length ? tutorIds : ['00000000-0000-0000-0000-000000000000']);

    const parentName = new Map((parentProfiles || []).map((p) => [p.id, p.full_name || 'Parent']));
    const tutorName = new Map((tutorProfiles || []).map((t) => [t.id, t.full_name || 'Tutor']));

    const { data: offSessions } = await supabaseAdmin
      .from('individual_sessions')
      .select('id, tutor_id, offline_scheduling_period_id, status')
      .not('offline_scheduling_period_id', 'is', null);

    const records = periodRows.map((p) => {
      const revenue = Number(p.expected_period_revenue_xaf || 0);
      const counted = revenueForState(p.operation_state, revenue);
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
      };
    });

    const tutorSummaryMap = new Map<
      string,
      { sessions: number; revenue: number; profit: number; earnings: number; state: string }
    >();
    for (const p of periodRows) {
      const key = p.tutor_user_id;
      const rev = revenueForState(p.operation_state, Number(p.expected_period_revenue_xaf || 0));
      const cur = tutorSummaryMap.get(key) || {
        sessions: 0,
        revenue: 0,
        profit: 0,
        earnings: 0,
        state: p.operation_state || 'active',
      };
      cur.revenue += rev;
      cur.profit += Math.round(rev * COMMISSION_RATE);
      cur.earnings += Math.round(rev * TUTOR_EARNINGS_RATE);
      tutorSummaryMap.set(key, cur);
    }
    for (const s of offSessions || []) {
      const cur = tutorSummaryMap.get(s.tutor_id);
      if (cur) cur.sessions += 1;
    }

    const tutorSummary = [...tutorSummaryMap.entries()].map(([tid, v]) => ({
      tutorName: tutorName.get(tid) || 'Tutor',
      totalSessions: v.sessions,
      totalRevenueXaf: v.revenue,
      prepskulProfit: v.profit,
      tutorEarnings: v.earnings,
      state: v.state,
    }));

    const monthlyMap = new Map<string, { revenue: number; students: number; tutors: Set<string> }>();
    for (const p of periodRows) {
      const m = (p.period_start || '').slice(0, 7);
      if (!m) continue;
      const rev = revenueForState(p.operation_state, Number(p.expected_period_revenue_xaf || 0));
      const cur = monthlyMap.get(m) || { revenue: 0, students: 0, tutors: new Set<string>() };
      cur.revenue += rev;
      if (rev > 0) cur.students += 1;
      cur.tutors.add(p.tutor_user_id);
      monthlyMap.set(m, cur);
    }

    const monthlySummary = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        tutorNames: [...v.tutors]
          .map((id) => tutorName.get(id) || 'Tutor')
          .join(', '),
        revenue: v.revenue,
        commission: Math.round(v.revenue * COMMISSION_RATE),
        tutorShare: Math.round(v.revenue * TUTOR_EARNINGS_RATE),
        studentCount: v.students,
      }));

    const offRevenue = records.reduce((s, r) => s + r.countedRevenue, 0);
    const onRevenue = (onPayments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

    const scopeTotals = {
      on: {
        sessions: 0,
        revenue: onRevenue,
        commission: Math.round(onRevenue * COMMISSION_RATE),
        tutorEarnings: Math.round(onRevenue * TUTOR_EARNINGS_RATE),
      },
      off: {
        sessions: (offSessions || []).length,
        revenue: offRevenue,
        commission: Math.round(offRevenue * COMMISSION_RATE),
        tutorEarnings: Math.round(offRevenue * TUTOR_EARNINGS_RATE),
      },
      combined: {
        sessions: (offSessions || []).length,
        revenue: onRevenue + offRevenue,
        commission: Math.round((onRevenue + offRevenue) * COMMISSION_RATE),
        tutorEarnings: Math.round((onRevenue + offRevenue) * TUTOR_EARNINGS_RATE),
      },
    };

    const pick =
      scope === 'on'
        ? { records: [], tutorSummary: [], monthlySummary: [], totals: scopeTotals.on }
        : scope === 'off'
          ? { records, tutorSummary, monthlySummary, totals: scopeTotals.off }
          : {
              records,
              tutorSummary,
              monthlySummary,
              totals: scopeTotals.combined,
            };

    return NextResponse.json({
      scope,
      ...pick,
      grandTotals: {
        sessionsRevenue: offRevenue,
        prepskulProfit: Math.round(offRevenue * COMMISSION_RATE),
        tutorEarnings: Math.round(offRevenue * TUTOR_EARNINGS_RATE),
        totalRevenue: offRevenue,
      },
    });
  } catch (e: unknown) {
    console.error('operations-insights', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
