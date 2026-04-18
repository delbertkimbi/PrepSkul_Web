import { NextResponse } from 'next/server';
import { getTimeRanges, percentDelta, requireAdminOrDeny, trendColor } from '../_lib';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const ranges = getTimeRanges();
    const prevMonthlyStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const [currMonthlyUsers, prevMonthlyUsers, currMonthlySessions, prevMonthlySessions, currMonthlyRevenue, prevMonthlyRevenue] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ranges.monthly),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', prevMonthlyStart).lt('created_at', ranges.monthly),
      supabaseAdmin.from('individual_sessions').select('*', { count: 'exact', head: true }).gte('created_at', ranges.monthly),
      supabaseAdmin.from('individual_sessions').select('*', { count: 'exact', head: true }).gte('created_at', prevMonthlyStart).lt('created_at', ranges.monthly),
      supabaseAdmin.from('session_payments').select('amount').eq('payment_status', 'paid').gte('created_at', ranges.monthly),
      supabaseAdmin.from('session_payments').select('amount').eq('payment_status', 'paid').gte('created_at', prevMonthlyStart).lt('created_at', ranges.monthly),
    ]);

    const [currOffline, prevOffline] = await Promise.all([
      supabaseAdmin
        .from('offline_operations')
        .select('sessions_completed, amount_paid, payment_status, created_at')
        .gte('created_at', ranges.monthly),
      supabaseAdmin
        .from('offline_operations')
        .select('sessions_completed, amount_paid, payment_status, created_at')
        .gte('created_at', prevMonthlyStart)
        .lt('created_at', ranges.monthly),
    ]);

    const currOfflineRows = currOffline.error ? [] : (currOffline.data || []);
    const prevOfflineRows = prevOffline.error ? [] : (prevOffline.data || []);

    const currentRevenue = (currMonthlyRevenue.data || []).reduce((s: number, p: { amount: number | string | null }) => s + Number(p.amount || 0), 0);
    const previousRevenue = (prevMonthlyRevenue.data || []).reduce((s: number, p: { amount: number | string | null }) => s + Number(p.amount || 0), 0);

    const currentOfflineUsers = currOfflineRows.length;
    const previousOfflineUsers = prevOfflineRows.length;

    const currentOfflineSessions = currOfflineRows.reduce(
      (sum: number, row: { sessions_completed: number | null }) => sum + Number(row.sessions_completed || 0),
      0
    );
    const previousOfflineSessions = prevOfflineRows.reduce(
      (sum: number, row: { sessions_completed: number | null }) => sum + Number(row.sessions_completed || 0),
      0
    );

    const currentOfflineRevenue = currOfflineRows
      .filter((row: { payment_status: string | null }) => (row.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum: number, row: { amount_paid: number | string | null }) => sum + Number(row.amount_paid || 0), 0);
    const previousOfflineRevenue = prevOfflineRows
      .filter((row: { payment_status: string | null }) => (row.payment_status || '').toLowerCase() === 'paid')
      .reduce((sum: number, row: { amount_paid: number | string | null }) => sum + Number(row.amount_paid || 0), 0);

    const mergedCurrentUsers = (currMonthlyUsers.count ?? 0) + currentOfflineUsers;
    const mergedPreviousUsers = (prevMonthlyUsers.count ?? 0) + previousOfflineUsers;
    const mergedCurrentSessions = (currMonthlySessions.count ?? 0) + currentOfflineSessions;
    const mergedPreviousSessions = (prevMonthlySessions.count ?? 0) + previousOfflineSessions;
    const mergedCurrentRevenue = currentRevenue + currentOfflineRevenue;
    const mergedPreviousRevenue = previousRevenue + previousOfflineRevenue;

    const userGrowthRate = percentDelta(mergedCurrentUsers, mergedPreviousUsers);
    const sessionGrowthRate = percentDelta(mergedCurrentSessions, mergedPreviousSessions);
    const revenueGrowthRate = percentDelta(mergedCurrentRevenue, mergedPreviousRevenue);

    return NextResponse.json({
      growth: {
        users: {
          current: mergedCurrentUsers,
          previous: mergedPreviousUsers,
          rate: userGrowthRate,
          color: trendColor(userGrowthRate),
        },
        sessions: {
          current: mergedCurrentSessions,
          previous: mergedPreviousSessions,
          rate: sessionGrowthRate,
          color: trendColor(sessionGrowthRate),
        },
        revenue: {
          current: mergedCurrentRevenue,
          previous: mergedPreviousRevenue,
          rate: revenueGrowthRate,
          color: trendColor(revenueGrowthRate),
        },
      },
    });
  } catch (error) {
    console.error('admin analytics growth error', error);
    return NextResponse.json({ error: 'Failed to load growth analytics' }, { status: 500 });
  }
}
