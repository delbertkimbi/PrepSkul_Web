import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdminOrDeny, getTimeRanges } from '../_lib';
import { COMMISSION_RATE } from '@/lib/offline-session-emails';

export const runtime = 'nodejs';

type Scope = 'on' | 'off' | 'combined';

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const scope = (request.nextUrl.searchParams.get('scope') || 'combined') as Scope;
    getTimeRanges();

    const { data: periods } = await supabaseAdmin
      .from('offline_scheduling_periods')
      .select(
        'id, tutor_user_id, learner_user_id, learner_display_names, sessions_per_week, onsite_location, meet_link, pay_per_month_xaf, pay_months_count, expected_period_revenue_xaf, operation_state, period_start, start_month_label, delivery_mode'
      )
      .order('period_start', { ascending: true });

    const { data: onPayments } = await supabaseAdmin
      .from('session_payments')
      .select('amount, payment_status, created_at')
      .eq('payment_status', 'paid');

    const periodRows = periods || [];
    const offRevenue = periodRows.reduce((s, p) => s + Number(p.expected_period_revenue_xaf || 0), 0);
    const onRevenue = (onPayments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

    const tutorIds = [...new Set(periodRows.map((p) => p.tutor_user_id))];
    const { data: tutorProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', tutorIds.length ? tutorIds : ['00000000-0000-0000-0000-000000000000']);

    const tutorName = new Map((tutorProfiles || []).map((t) => [t.id, t.full_name || 'Tutor']));

    const { data: offSessions } = await supabaseAdmin
      .from('individual_sessions')
      .select('id, tutor_id, offline_scheduling_period_id, status')
      .not('offline_scheduling_period_id', 'is', null);

    const records = periodRows.map((p) => ({
      tutorName: tutorName.get(p.tutor_user_id) || 'Tutor',
      students: p.learner_display_names || '—',
      sessionsPerWeek: p.sessions_per_week,
      location: p.onsite_location || p.meet_link || p.delivery_mode,
      payPerMonth: Number(p.pay_per_month_xaf || 0),
      payMonths: Number(p.pay_months_count || 0),
      startMonth: p.start_month_label || p.period_start,
      state: p.operation_state,
      revenue: Number(p.expected_period_revenue_xaf || 0),
    }));

    const tutorSummaryMap = new Map<string, { sessions: number; revenue: number; state: string }>();
    for (const p of periodRows) {
      const key = p.tutor_user_id;
      const cur = tutorSummaryMap.get(key) || { sessions: 0, revenue: 0, state: p.operation_state || 'active' };
      cur.revenue += Number(p.expected_period_revenue_xaf || 0);
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
      state: v.state,
    }));

    const monthlyMap = new Map<string, { revenue: number; students: number; tutors: Set<string> }>();
    for (const p of periodRows) {
      const m = (p.period_start || '').slice(0, 7);
      if (!m) continue;
      const cur = monthlyMap.get(m) || { revenue: 0, students: 0, tutors: new Set<string>() };
      cur.revenue += Number(p.expected_period_revenue_xaf || 0);
      cur.students += 1;
      cur.tutors.add(p.tutor_user_id);
      monthlyMap.set(m, cur);
    }

    const monthlySummary = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        tutorInitials: [...v.tutors].slice(0, 6).map((id) => (tutorName.get(id) || 'T').slice(0, 2).toUpperCase()).join(', '),
        revenue: v.revenue,
        commission: Math.round(v.revenue * COMMISSION_RATE),
        studentCount: v.students,
      }));

    const scopeTotals = {
      on: { sessions: 0, revenue: onRevenue, commission: Math.round(onRevenue * COMMISSION_RATE) },
      off: {
        sessions: (offSessions || []).length,
        revenue: offRevenue,
        commission: Math.round(offRevenue * COMMISSION_RATE),
      },
      combined: {
        sessions: (offSessions || []).length,
        revenue: onRevenue + offRevenue,
        commission: Math.round((onRevenue + offRevenue) * COMMISSION_RATE),
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
      charts: {
        monthlyRevenueVsCommission: monthlySummary.map((m) => ({
          month: m.month,
          revenue: m.revenue,
          commission: m.commission,
        })),
        tutorPerformance: tutorSummary.map((t) => ({
          tutor: t.tutorName,
          sessions: t.totalSessions,
          revenue: t.totalRevenueXaf,
        })),
      },
    });
  } catch (e: unknown) {
    console.error('operations-insights', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
