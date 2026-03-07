import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Daily Inactivity Nudge Cron
 *
 * Goal: once per day, send at most one high-value push notification
 * to users who have not received any notifications today.
 *
 * - Runs via external or Vercel cron (e.g. daily in the evening).
 * - Uses global notification strategy (no emojis, per-role copy).
 * - Respects per-user notification preferences and quiet hours
 *   via /api/notifications/send.
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

    // Compute start of "today" in UTC. If you want Cameroon-local days,
    // adjust by timezone offset before truncating to midnight.
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const startOfDayIso = startOfDay.toISOString();

    // 1. Fetch non-admin users (students, parents, tutors) in batches.
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin')
      .limit(MAX_USERS_PER_RUN * 2);

    if (profilesError) {
      console.error('daily-inactivity cron: error fetching profiles', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 },
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, processed: 0, message: 'No profiles found' });
    }

    // Filter to end-user roles only (skip admins and unknown roles)
    const candidateProfiles = profiles.filter((p: any) => {
      if (p.is_admin === true) return false;
      const role = (p.user_type || '').toString().toLowerCase();
      return role === 'student' || role === 'learner' || role === 'parent' || role === 'tutor';
    });

    if (!candidateProfiles.length) {
      return NextResponse.json({ success: true, processed: 0, message: 'No eligible profiles' });
    }

    const userIds = candidateProfiles.map((p: any) => p.id as string);

    // 2. Find users who already received any notification today.
    const { data: notifiedToday, error: notifiedError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .in('user_id', userIds)
      .gte('created_at', startOfDayIso);

    if (notifiedError) {
      console.error('daily-inactivity cron: error fetching notifications', notifiedError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: notifiedError.message },
        { status: 500 },
      );
    }

    const alreadyNotified = new Set((notifiedToday || []).map((row: any) => row.user_id as string));

    // 3. Eligible users: no notifications of any type today.
    const eligibleUsers = candidateProfiles
      .filter((p: any) => !alreadyNotified.has(p.id as string))
      .slice(0, MAX_USERS_PER_RUN);

    if (!eligibleUsers.length) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'All users already contacted today (no inactivity nudges sent)',
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      console.warn('daily-inactivity cron: no NEXT_PUBLIC_APP_URL or VERCEL_URL, skipping send');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No app URL configured; cannot call /api/notifications/send',
      });
    }

    let processed = 0;
    let failed = 0;

    for (const profile of eligibleUsers) {
      const userId = profile.id as string;
      const roleRaw = (profile.user_type || '').toString().toLowerCase();

      let title = 'Stay on track with your learning';
      let message = 'Open PrepSkul to review your sessions and continue where you left off.';
      let actionUrl = '/';
      let actionText = 'Open PrepSkul';

      if (roleRaw === 'student' || roleRaw === 'learner') {
        title = 'Pick up where you left off';
        message = 'Open PrepSkul to continue learning or play a short quiz game on your main subject.';
        actionUrl = '/student-nav';
        actionText = 'Continue learning';
      } else if (roleRaw === 'parent') {
        title = 'Review your child’s learning';
        message = 'Open PrepSkul to look at upcoming sessions and choose one topic to focus on this week.';
        actionUrl = '/parent-nav';
        actionText = 'Review sessions';
      } else if (roleRaw === 'tutor') {
        title = 'Keep your schedule up to date';
        message = 'Open PrepSkul to review your requests, sessions, and availability for the week.';
        actionUrl = '/tutor-nav';
        actionText = 'View schedule';
      }

      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'daily_inactivity_nudge',
            title,
            message,
            priority: 'normal',
            actionUrl,
            actionText,
            // No emojis; text-only.
            sendEmail: false,
            sendPush: true,
          }),
        });

        if (res.ok) {
          processed++;
        } else {
          failed++;
          const text = await res.text();
          console.warn(`daily-inactivity send failed for ${userId}: ${res.status} ${text}`);
        }
      } catch (e: any) {
        failed++;
        console.warn(`daily-inactivity request failed for ${userId}:`, e?.message || e);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: eligibleUsers.length,
      message: `Processed ${processed} daily inactivity nudges`,
    });
  } catch (error: any) {
    console.error('daily-inactivity cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}

