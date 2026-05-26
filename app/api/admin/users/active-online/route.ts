import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdminOrDeny } from '@/app/api/admin/analytics/_lib';

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/**
 * GET /api/admin/users/active-online?source=mobile|all
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;

    const source = request.nextUrl.searchParams.get('source') || 'mobile';
    const admin = getSupabaseAdmin();
    const now = Date.now();
    const onlineSince = new Date(now - ONLINE_WINDOW_MS).toISOString();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let onlineQuery = admin
      .from('profiles')
      .select('id, full_name, email, user_type, avatar_url, last_seen, last_seen_source, last_seen_platform')
      .gte('last_seen', onlineSince)
      .order('last_seen', { ascending: false })
      .limit(100);

    if (source === 'mobile') {
      onlineQuery = onlineQuery.eq('last_seen_source', 'mobile');
    }

    const [
      { data: onlineUsers, error: onlineErr },
      { count: onlineNow },
      { count: activeToday },
      { count: activeThisWeek },
      { count: tutorsOnline },
      { count: learnersOnline },
      { count: parentsOnline },
      { count: inSessions },
      { data: todayActivity },
    ] = await Promise.all([
      onlineQuery,
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', onlineSince),
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', oneDayAgo),
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', oneWeekAgo),
      admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'tutor')
        .gte('last_seen', onlineSince),
      admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'learner')
        .gte('last_seen', onlineSince),
      admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'parent')
        .gte('last_seen', onlineSince),
      admin
        .from('individual_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress'),
      admin.from('profiles').select('last_seen').gte('last_seen', startOfDay.toISOString()),
    ]);

    if (onlineErr) throw onlineErr;

    const hourlyActivity = new Array(24).fill(0);
    for (const row of todayActivity || []) {
      if (!row.last_seen) continue;
      hourlyActivity[new Date(row.last_seen).getHours()] += 1;
    }
    const peakCount = Math.max(...hourlyActivity, 0);
    const peakHour = hourlyActivity.indexOf(peakCount);

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      source,
      summary: {
        onlineNow: onlineNow ?? 0,
        activeToday: activeToday ?? 0,
        activeThisWeek: activeThisWeek ?? 0,
        inSessions: inSessions ?? 0,
        tutorsOnline: tutorsOnline ?? 0,
        learnersOnline: learnersOnline ?? 0,
        parentsOnline: parentsOnline ?? 0,
        peakHour,
        peakCount,
      },
      hourlyActivity,
      users: (onlineUsers || []).map((u) => ({
        id: u.id,
        fullName: u.full_name || 'Unknown',
        email: u.email,
        userType: u.user_type,
        avatarUrl: u.avatar_url,
        lastSeen: u.last_seen,
        lastSeenAgo: u.last_seen ? timeAgo(u.last_seen) : '—',
        source: u.last_seen_source,
        platform: u.last_seen_platform,
      })),
    });
  } catch (error: unknown) {
    console.error('admin active-online', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load active users' },
      { status: 500 }
    );
  }
}
