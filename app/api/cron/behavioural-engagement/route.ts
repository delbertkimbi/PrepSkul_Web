import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Behaviour-based Engagement Nudges
 *
 * Intended to run periodically (e.g. every few hours) via external cron.
 *
 * Current behaviors:
 * - Tutor discovery without request:
 *   Users who recently viewed tutors but did not send any booking request.
 *
 * Safeguards:
 * - Skips admins
 * - At most one behaviour-based nudge per user per day
 * - Skips users who already received any notification today (to respect global caps)
 * - No emojis, neutral and helpful tone
 */

const MAX_USERS_PER_RUN = 300;

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
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const startOfDayIso = startOfDay.toISOString();

    // Look back over the last 24 hours for tutor profile visits.
    const sinceIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1) Find users who viewed tutor profiles recently.
    const { data: views, error: viewsError } = await supabaseAdmin
      .from('tutor_profile_views')
      .select('user_id')
      .gte('created_at', sinceIso)
      .limit(MAX_USERS_PER_RUN * 3);

    if (viewsError) {
      console.error('behavioural-engagement cron: error fetching tutor_profile_views', viewsError);
      return NextResponse.json(
        { error: 'Failed to fetch tutor profile views', details: viewsError.message },
        { status: 500 },
      );
    }

    if (!views || views.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No recent tutor profile views found',
      });
    }

    const candidateUserIds = Array.from(
      new Set(views.map((v: any) => v.user_id as string).filter(Boolean)),
    );

    if (!candidateUserIds.length) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No candidate users from tutor_profile_views',
      });
    }

    // 2) Fetch candidate user profiles and filter roles.
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin')
      .in('id', candidateUserIds)
      .limit(MAX_USERS_PER_RUN * 2);

    if (profilesError) {
      console.error('behavioural-engagement cron: error fetching profiles', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 },
      );
    }

    const candidateProfiles = (profiles || []).filter((p: any) => {
      if (p.is_admin === true) return false;
      const role = (p.user_type || '').toString().toLowerCase();
      return role === 'student' || role === 'learner' || role === 'parent';
    });

    if (!candidateProfiles.length) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No eligible learner/parent profiles for behavioural nudges',
      });
    }

    const userIdsForProfiles = candidateProfiles.map((p: any) => p.id as string);

    // 3) Skip users who already received any notification today
    const { data: notifiedToday, error: notifiedError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .in('user_id', userIdsForProfiles)
      .gte('created_at', startOfDayIso);

    if (notifiedError) {
      console.error('behavioural-engagement cron: error fetching notifications', notifiedError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications', details: notifiedError.message },
        { status: 500 },
      );
    }

    const alreadyNotifiedToday = new Set((notifiedToday || []).map((row: any) => row.user_id as string));

    // 4) Also ensure they have not already received a behaviour-based nudge today.
    const { data: behaviourNotifs, error: behaviourError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .in('user_id', userIdsForProfiles)
      .in('type', ['behaviour_tutor_browse', 'behaviour_booking_abandoned'])
      .gte('created_at', startOfDayIso);

    if (behaviourError) {
      console.error('behavioural-engagement cron: error fetching behaviour notifications', behaviourError);
      return NextResponse.json(
        { error: 'Failed to fetch behaviour notifications', details: behaviourError.message },
        { status: 500 },
      );
    }

    const behaviourAlreadySent = new Set(
      (behaviourNotifs || []).map((row: any) => row.user_id as string),
    );

    const eligibleProfiles = candidateProfiles
      .filter((p: any) => {
        const id = p.id as string;
        if (alreadyNotifiedToday.has(id)) return false;
        if (behaviourAlreadySent.has(id)) return false;
        return true;
      })
      .slice(0, MAX_USERS_PER_RUN);

    if (!eligibleProfiles.length) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No eligible users after applying daily caps',
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      console.warn('behavioural-engagement cron: no NEXT_PUBLIC_APP_URL or VERCEL_URL, skipping send');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No app URL configured; cannot call /api/notifications/send',
      });
    }

    let processed = 0;
    let failed = 0;

    for (const profile of eligibleProfiles) {
      const userId = profile.id as string;
      const roleRaw = (profile.user_type || '').toString().toLowerCase();

      let title = 'Continue where you left off';
      let message =
        'You recently looked at tutors on PrepSkul. Open the app to send a request or shortlist the tutors you like.';
      let actionUrl = '/find-tutors';
      let actionText = 'View tutors';
      let type = 'behaviour_tutor_browse';

      if (roleRaw === 'student' || roleRaw === 'learner') {
        title = 'Finish choosing your tutor';
        message =
          'You recently viewed tutors but did not send a request. Open PrepSkul to pick one tutor and request a trial session.';
        actionUrl = '/find-tutors';
        actionText = 'Choose tutor';
      } else if (roleRaw === 'parent') {
        title = 'Complete your tutor search';
        message =
          'You recently looked at tutors for your child. Open PrepSkul to compare a few options and send a request when you are ready.';
        actionUrl = '/find-tutors';
        actionText = 'Review tutors';
      }

      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type,
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
          console.warn(`behavioural-engagement send failed for ${userId}: ${res.status} ${text}`);
        }
      } catch (e: any) {
        failed++;
        console.warn(`behavioural-engagement request failed for ${userId}:`, e?.message || e);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: eligibleProfiles.length,
      message: `Processed ${processed} behaviour-based engagement notifications`,
    });
  } catch (error: any) {
    console.error('behavioural-engagement cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: error?.message || String(error) },
      { status: 500 },
    );
  }
}

