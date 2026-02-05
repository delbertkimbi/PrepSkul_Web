import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Onboarding Reminders Cron Job
 *
 * Sends reminder notifications (in-app + email + push) to tutors with
 * incomplete or skipped onboarding. Runs once per day. Anti-spam: at most
 * one reminder per tutor per 24h (we skip if they had one in the last 24h).
 */
const REMINDER_COOLDOWN_HOURS = 24;
const MAX_TUTORS_PER_RUN = 100;

function getNextMissingStage(completedSteps: number[]): string | null {
  const completed = new Set(completedSteps);
  if (!completed.has(11)) return 'missing_id';
  if (!completed.has(12)) return 'missing_video';
  if (!completed.has(13)) return 'missing_statement';
  return null;
}

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
          { status: 401 }
        );
      }
    }

    const supabaseAdmin = getSupabaseAdmin();
    const since = new Date(Date.now() - REMINDER_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();

    // 1. Tutors with incomplete or skipped onboarding
    const { data: progressRows, error: progressError } = await supabaseAdmin
      .from('tutor_onboarding_progress')
      .select('user_id, completed_steps, is_complete, skipped_onboarding')
      .or('is_complete.eq.false,skipped_onboarding.eq.true')
      .limit(MAX_TUTORS_PER_RUN * 2); // fetch extra, we'll filter

    if (progressError) {
      console.error('Onboarding reminders cron: progress fetch error', progressError);
      return NextResponse.json(
        { error: 'Failed to fetch tutor onboarding progress', details: progressError.message },
        { status: 500 }
      );
    }

    if (!progressRows?.length) {
      return NextResponse.json({ success: true, processed: 0, message: 'No incomplete tutors' });
    }

    // 2. User IDs that already received an onboarding_reminder in the last 24h
    const { data: recentReminders } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('type', 'onboarding_reminder')
      .gte('created_at', since);

    const recentlyReminded = new Set((recentReminders || []).map((r) => r.user_id));

    // 3. Eligible tutors: incomplete/skipped and not reminded in last 24h
    const eligible = progressRows.filter((p) => !recentlyReminded.has(p.user_id));
    const toProcess = eligible.slice(0, MAX_TUTORS_PER_RUN);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    if (!baseUrl) {
      console.warn('Onboarding reminders cron: no NEXT_PUBLIC_APP_URL or VERCEL_URL, skipping API calls');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No app URL configured',
        eligible: toProcess.length,
      });
    }

    let processed = 0;
    let failed = 0;

    for (const row of toProcess) {
      const userId = row.user_id as string;
      const completedSteps = (row.completed_steps as number[]) || [];
      const onboardingSkipped = row.skipped_onboarding === true;
      const reminderStage = getNextMissingStage(completedSteps);

      const title = 'Complete Your Profile to Get Verified';
      const message = onboardingSkipped
        ? "Your profile isn't visible to students yet. Complete your onboarding to get verified and start connecting with students who match your expertise."
        : 'Finish your profile setup to get verified and start connecting with students who need your expertise. Complete your onboarding to become visible and start teaching.';

      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'onboarding_reminder',
            title,
            message,
            priority: 'high',
            actionUrl: '/tutor-onboarding',
            actionText: 'Complete Profile',
            icon: '🎓',
            metadata: {
              onboarding_skipped: onboardingSkipped,
              onboarding_complete: false,
              onboarding_reminder_cron: true,
              ...(reminderStage ? { reminder_stage: reminderStage } : {}),
            },
            sendEmail: true,
            sendPush: true,
          }),
        });

        if (res.ok) {
          processed++;
        } else {
          failed++;
          const text = await res.text();
          console.warn(`Onboarding reminder send failed for ${userId}: ${res.status} ${text}`);
        }
      } catch (e: any) {
        failed++;
        console.warn(`Onboarding reminder request failed for ${userId}:`, e?.message || e);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: toProcess.length,
      message: `Processed ${processed} onboarding reminders`,
    });
  } catch (error: any) {
    console.error('Onboarding reminders cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
