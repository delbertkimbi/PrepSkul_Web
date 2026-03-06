import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Monday Evening Engagement Broadcast
 *
 * Intended to be called once per week (e.g. Mondays at 20:00 local time)
 * by an external cron (or Vercel cron where available).
 *
 * Sends at most one high-value push notification per eligible user:
 * - Different copy per role (student / parent / tutor)
 * - Skips admins
 * - Skips users who already received any notification today
 * - Relies on /api/notifications/send to enforce preferences and quiet hours
 *
 * NOTE: No emojis in title/body to keep tone neutral and professional.
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
      console.error('monday-engagement cron: error fetching profiles', profilesError);
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
      console.error('monday-engagement cron: error fetching notifications', notifiedError);
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
        message: 'All users already contacted today; no Monday broadcast sent',
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      console.warn('monday-engagement cron: no NEXT_PUBLIC_APP_URL or VERCEL_URL, skipping send');
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

      let title = 'Plan your week with PrepSkul';
      let message = 'Open PrepSkul to review your sessions and set one clear goal for this week.';
      let actionUrl = '/';
      let actionText = 'Open PrepSkul';

      if (roleRaw === 'student' || roleRaw === 'learner') {
        title = 'Start your learning week strong';
        message = 'Open PrepSkul to review your subjects and choose one topic to focus on first this week.';
        actionUrl = '/student-nav';
        actionText = 'Review subjects';
      } else if (roleRaw === 'parent') {
        title = 'Set up your child’s learning week';
        message = 'Open PrepSkul to look at your child’s sessions and confirm the days and times that work best.';
        actionUrl = '/parent-nav';
        actionText = 'Review schedule';
      } else if (roleRaw === 'tutor') {
        title = 'Organise your teaching week';
        message = 'Open PrepSkul to review requests, sessions, and availability so students can find the right time with you.';
        actionUrl = '/tutor-nav';
        actionText = 'Review availability';
      }

      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'weekly_monday_engagement',
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
          console.warn(`monday-engagement send failed for ${userId}: ${res.status} ${text}`);
        }
      } catch (e: any) {
        failed++;
        console.warn(`monday-engagement request failed for ${userId}:`, e?.message || e);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: eligible.length,
      message: `Processed ${processed} Monday engagement notifications`,
    });
  } catch (error: any) {
    console.error('monday-engagement cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}

