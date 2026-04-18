import { NextResponse } from 'next/server';
import { getTimeRanges, groupByDay, percentDelta, requireAdminOrDeny, trendColor } from '../_lib';

export const runtime = 'nodejs';

const STUDENT_ROLES = ['student', 'learner'];

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const ranges = getTimeRanges();

    const [{ count: totalUsers }, { count: tutorCount }, { count: parentCount }, { count: studentCount }] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'tutor'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'parent'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).in('user_type', STUDENT_ROLES),
    ]);

    const [dailySignups, weeklySignups, monthlySignups, yearlySignups, prevWeeklySignups] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ranges.daily),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ranges.weekly),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ranges.monthly),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ranges.yearly),
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', ranges.weekly),
    ]);

    const { data: signupRows } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .gte('created_at', ranges.monthly)
      .order('created_at', { ascending: true });

    const { data: offlineRows, error: offlineError } = await supabaseAdmin
      .from('offline_operations')
      .select('customer_role, created_at')
      .gte('created_at', ranges.yearly)
      .order('created_at', { ascending: true });

    const safeOfflineRows = offlineError ? [] : (offlineRows || []);
    const offlineParents = safeOfflineRows.filter((r: { customer_role: string }) => r.customer_role === 'Parent').length;
    const offlineStudents = safeOfflineRows.filter((r: { customer_role: string }) => r.customer_role === 'Student').length;
    const offlineTotal = safeOfflineRows.length;

    const inRangeCount = (rows: Array<{ created_at: string }>, sinceIso: string) =>
      rows.filter((r) => new Date(r.created_at) >= new Date(sinceIso)).length;

    const roleBreakdown = {
      tutor: (tutorCount ?? 0),
      parent: (parentCount ?? 0) + offlineParents,
      student: (studentCount ?? 0) + offlineStudents,
    };

    const weeklyGrowthRate = percentDelta(weeklySignups.count ?? 0, prevWeeklySignups.count ?? 0);

    return NextResponse.json({
      totals: {
        totalUsers: (totalUsers ?? 0) + offlineTotal,
        totalTutors: tutorCount ?? 0,
        totalParents: (parentCount ?? 0) + offlineParents,
        totalStudents: (studentCount ?? 0) + offlineStudents,
      },
      signups: {
        daily: (dailySignups.count ?? 0) + inRangeCount(safeOfflineRows as Array<{ created_at: string }>, ranges.daily),
        weekly: (weeklySignups.count ?? 0) + inRangeCount(safeOfflineRows as Array<{ created_at: string }>, ranges.weekly),
        monthly: (monthlySignups.count ?? 0) + inRangeCount(safeOfflineRows as Array<{ created_at: string }>, ranges.monthly),
        yearly: (yearlySignups.count ?? 0) + offlineTotal,
      },
      roleBreakdown,
      platformBreakdown: {
        onPlatform: {
          totalUsers: totalUsers ?? 0,
          parents: parentCount ?? 0,
          students: studentCount ?? 0,
          tutors: tutorCount ?? 0,
        },
        offPlatform: {
          totalUsers: offlineTotal,
          parents: offlineParents,
          students: offlineStudents,
          tutors: 0,
        },
      },
      growth: {
        weeklyGrowthRate,
        weeklyTrendColor: trendColor(weeklyGrowthRate),
      },
      charts: {
        dailySignupsLast30Days: groupByDay(
          [
            ...((signupRows || []) as Array<{ created_at: string }>),
            ...(safeOfflineRows as Array<{ created_at: string }>),
          ],
          30
        ),
      },
    });
  } catch (error) {
    console.error('admin analytics users error', error);
    return NextResponse.json({ error: 'Failed to load user analytics' }, { status: 500 });
  }
}
