import { NextResponse } from 'next/server';
import { getTimeRanges, groupByDay, requireAdminOrDeny } from '../_lib';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const ranges = getTimeRanges();

    // Try dedicated login_events first; fallback to profiles.last_seen if table doesn't exist.
    const { data: loginEvents, error: loginEventsError } = await supabaseAdmin
      .from('login_events')
      .select('user_id, user_role, timestamp')
      .gte('timestamp', ranges.yearly)
      .order('timestamp', { ascending: true });

    let source: Array<{ user_id: string; user_role?: string | null; timestamp: string }> = [];

    if (!loginEventsError && loginEvents) {
      source = loginEvents;
    } else {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_type, last_seen')
        .gte('last_seen', ranges.yearly)
        .not('last_seen', 'is', null);

      source = (profiles || []).map((p: { id: string; user_type: string | null; last_seen: string }) => ({
        user_id: p.id,
        user_role: p.user_type,
        timestamp: p.last_seen,
      }));
    }

    const since = {
      daily: new Date(ranges.daily),
      weekly: new Date(ranges.weekly),
      monthly: new Date(ranges.monthly),
      yearly: new Date(ranges.yearly),
    };

    const counts = { daily: 0, weekly: 0, monthly: 0, yearly: source.length };
    const dauSet = new Set<string>();
    const wauSet = new Set<string>();
    const mauSet = new Set<string>();

    source.forEach((ev) => {
      const t = new Date(ev.timestamp);
      if (t >= since.daily) {
        counts.daily += 1;
        dauSet.add(ev.user_id);
      }
      if (t >= since.weekly) {
        counts.weekly += 1;
        wauSet.add(ev.user_id);
      }
      if (t >= since.monthly) {
        counts.monthly += 1;
        mauSet.add(ev.user_id);
      }
    });

    return NextResponse.json({
      logins: counts,
      activeUsers: {
        dau: dauSet.size,
        wau: wauSet.size,
        mau: mauSet.size,
      },
      charts: {
        dailyLoginsLast30Days: groupByDay(source, 30),
      },
      source: !loginEventsError && loginEvents ? 'login_events' : 'profiles.last_seen',
    });
  } catch (error) {
    console.error('admin analytics logins error', error);
    return NextResponse.json({ error: 'Failed to load login analytics' }, { status: 500 });
  }
}
