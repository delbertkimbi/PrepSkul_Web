import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Monthly Engagement Broadcast (Happy New Month)
 *
 * Intended to be called once per month (e.g. first day of month, morning)
 * by an external cron (or Vercel cron where available).
 *
 * - Different copy per role (student / parent / tutor)
 * - Skips admins
 * - Skips users who already received any notification today
 * - Relies on /api/notifications/send for preferences and quiet hours
 * - No emojis in title/body
 */
const MAX_USERS_PER_RUN = 500;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const isVercelCron =
        request.headers.get('user-agent')?.includes('vercel-cron') ||
        request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized. Provide Authorization: Bearer YOUR_CRON_SECRET.' },
          { status: 401 },
        );
      }
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Compute start of today in UTC.
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const startOfDayIso = startOfDay.toISOString();

    // Fetch non-admin profiles.
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin')
      .limit(MAX_USERS_PER_RUN * 2);

    if (profilesError) {
      console.error('monthly-engagement cron: error fetching profiles', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 },
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No profiles found' });
    }

    const candidateProfiles = profiles.filter((p: any) => {
      if (p.is_admin === true) return false;
      const role = (p.user_type || '').toString().toLowerCase();
      return role === 'student' || role === 'learner' || role === 'parent' || role === 'tutor';
    });

    if (!candidateProfiles.length) {
      return NextResponse.json({ success: true, processed: 0, message: 'No eligible profiles' });
    }

    const userIds = candidateProfiles.map((p: any) => p.id as string);

    // Users who already had at least one notification today.
    const { data: notifiedToday, error: notifiedError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .in('user_id', userIds)
      .gte('created_at', startOfDayIso);

    if (notifiedError) {
      console.error('monthly-engagement cron: error fetching notifications', notifiedError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: notifiedError.message },
        { status: 500 },
      );
    }

    const alreadyNotified = new Set((notifiedToday || []).map((row: any) => row.user_id as string));

    const eligible = candidateProfiles
      .filter((p: any) => !alreadyNotified.has(p.id as string))
      .slice(0, MAX_USERS_PER_RUN);

    if (!eligible.length) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'All users already contacted today; no monthly broadcast sent',
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      console.warn('monthly-engagement cron: no NEXT_PUBLIC_APP_URL or VERCEL_URL, skipping send');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No app URL configured; cannot call /api/notifications/send',
      });
    }

    let processed = 0;
    let failed = 0;

    for (const profile of eligible) {
      const userId = profile.id as string;
      const roleRaw = (profile.user_type || '').toString().toLowerCase();

      let title = 'New month, new learning goals';
      let message = 'Open PrepSkul to set one learning goal for this month and review your upcoming sessions.';
      let actionUrl = '/';
      let actionText = 'Open PrepSkul';

      if (roleRaw === 'student' || roleRaw === 'learner') {
        title = 'Set your learning goals for this month';
        message = 'Open PrepSkul to choose one subject and one topic you want to improve before the end of this month.';
        actionUrl = '/student-nav';
        actionText = 'Set goals';
      } else if (roleRaw === 'parent') {
        title = 'Plan your child’s learning for the month';
        message = 'Open PrepSkul to review your child’s sessions and agree on one clear focus area for this month.';
        actionUrl = '/parent-nav';
        actionText = 'Review plan';
      } else if (roleRaw === 'tutor') {
        title = 'Plan your teaching month';
        message = 'Open PrepSkul to review your students, adjust your availability, and decide what progress you want them to make this month.';
        actionUrl = '/tutor-nav';
        actionText = 'Review students';
      }

      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'monthly_engagement',
            title,
            message,
            priority: 'normal',
            actionUrl,
            actionText,
            sendEmail: false,
            sendPush: true,
          }),
        });

        if (res.ok) {
          processed++;
        } else {
          failed++;
          const text = await res.text();
          console.warn(`monthly-engagement send failed for ${userId}: ${res.status} ${text}`);
        }
      } catch (e: any) {
        failed++;
        console.warn(`monthly-engagement request failed for ${userId}:`, e?.message || e);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: eligible.length,
      message: `Processed ${processed} monthly engagement notifications`,
    });
  } catch (error: any) {
    console.error('monthly-engagement cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}

