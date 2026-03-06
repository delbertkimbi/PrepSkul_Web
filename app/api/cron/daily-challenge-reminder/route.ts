import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Daily Challenge Reminder Cron (SkulMate)
 *
 * User-specific: sends one push per learner who has used SkulMate (has user_game_stats)
 * and has not received a daily_challenge_reminder today.
 *
 * - Run once per day (e.g. morning or early evening) via external cron.
 * - Message: "Your daily SkulMate challenge is ready. One short round to keep your streak."
 * - No emojis. Deep link to open app / SkulMate.
 * - /api/notifications/send enforces preferences and quiet hours.
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

    const now = new Date();
    const startOfDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );
    const startOfDayIso = startOfDay.toISOString();

    // 1. Users who have played at least one SkulMate game (user_game_stats)
    const { data: statsRows, error: statsError } = await supabaseAdmin
      .from('user_game_stats')
      .select('user_id')
      .limit(MAX_USERS_PER_RUN * 2);

    if (statsError) {
      console.error('daily-challenge-reminder: error fetching user_game_stats', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch game stats', details: statsError.message },
        { status: 500 },
      );
    }

    if (!statsRows || statsRows.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No users with SkulMate activity',
      });
    }

    const candidateUserIds = [...new Set((statsRows as { user_id: string }[]).map((r) => r.user_id))];

    // 2. Profiles: only students/learners, not admins
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin')
      .in('id', candidateUserIds);

    if (profilesError) {
      console.error('daily-challenge-reminder: error fetching profiles', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 },
      );
    }

    const learnerIds = (profiles || []).filter((p: any) => {
      if (p.is_admin === true) return false;
      const role = (p.user_type || '').toString().toLowerCase();
      return role === 'student' || role === 'learner';
    }).map((p: any) => p.id as string);

    if (learnerIds.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No learner profiles with SkulMate activity',
      });
    }

    // 3. Exclude users who already received daily_challenge_reminder today
    const { data: notifiedToday, error: notifiedError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .in('user_id', learnerIds)
      .gte('created_at', startOfDayIso)
      .eq('type', 'daily_challenge_reminder');

    if (notifiedError) {
      console.error('daily-challenge-reminder: error fetching notifications', notifiedError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: notifiedError.message },
        { status: 500 },
      );
    }

    const alreadySent = new Set(
      (notifiedToday || []).map((row: { user_id: string }) => row.user_id),
    );
    const eligible = learnerIds.filter((id) => !alreadySent.has(id)).slice(0, MAX_USERS_PER_RUN);

    if (eligible.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No eligible users (all already received daily challenge reminder today)',
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      console.warn('daily-challenge-reminder: no base URL; skipping send');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No app URL configured',
      });
    }

    let processed = 0;
    let failed = 0;

    const title = 'Your daily SkulMate challenge is ready';
    const message =
      'One short round to keep your streak. Open the app and tap Today\'s Challenge in SkulMate.';

    for (const userId of eligible) {
      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'daily_challenge_reminder',
            title,
            message,
            priority: 'normal',
            actionUrl: '/student-nav',
            actionText: 'Open SkulMate',
            sendEmail: false,
            sendPush: true,
          }),
        });

        if (res.ok) {
          processed++;
        } else {
          failed++;
          const text = await res.text();
          console.warn(`daily-challenge-reminder send failed for ${userId}: ${res.status} ${text}`);
        }
      } catch (e: unknown) {
        failed++;
        console.warn(
          'daily-challenge-reminder request failed for',
          userId,
          (e as Error)?.message || e,
        );
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: eligible.length,
      message: `Sent ${processed} daily challenge reminders`,
    });
  } catch (error: unknown) {
    console.error('daily-challenge-reminder cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: (error as Error)?.message ?? String(error) },
      { status: 500 },
    );
  }
}
