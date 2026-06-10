import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { persistCronHeartbeat, verifyCronAuth } from '@/lib/cron/persist-cron-heartbeat';
import { sendEngagementToUser } from '@/lib/notifications/send-engagement';
import { hadSkulMatePlayToday } from '@/lib/notifications/meaningful-activity';

const JOB_NAME = 'daily-challenge-reminder';
const MAX_USERS_PER_RUN = 500;

/**
 * SkulMate daily: streak nudge or notes-to-games when user uploaded notes but no recent play.
 */
export async function GET(request: NextRequest) {
  let runStatus: 'success' | 'failed' = 'failed';
  let processedCount = 0;
  let failedCount = 0;
  let runError: string | null = null;

  try {
    const auth = verifyCronAuth(request);
    if (!auth.ok) {
      runError = auth.error ?? 'Unauthorized';
      return NextResponse.json({ error: runError }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: statsRows, error: statsError } = await supabaseAdmin
      .from('user_game_stats')
      .select('user_id')
      .limit(MAX_USERS_PER_RUN * 2);

    if (statsError) {
      runError = statsError.message;
      return NextResponse.json(
        { error: 'Failed to fetch game stats', details: statsError.message },
        { status: 500 }
      );
    }

    if (!statsRows?.length) {
      runStatus = 'success';
      return NextResponse.json({ success: true, processed: 0, message: 'No SkulMate users' });
    }

    const candidateUserIds = [...new Set(statsRows.map((r: { user_id: string }) => r.user_id))];

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin, full_name, last_seen')
      .in('id', candidateUserIds);

    if (profilesError) {
      runError = profilesError.message;
      return NextResponse.json({ error: 'Failed to fetch profiles', details: profilesError.message }, { status: 500 });
    }

    const learners = (profiles || [])
      .filter((p) => {
        if (p.is_admin) return false;
        const role = (p.user_type || '').toLowerCase();
        return role === 'student' || role === 'learner' || role === 'parent';
      })
      .slice(0, MAX_USERS_PER_RUN);

    for (const profile of learners) {
      if (await hadSkulMatePlayToday(profile.id)) {
        continue;
      }
      const result = await sendEngagementToUser({
        userId: profile.id,
        profile,
        mode: 'skulmate_daily',
        skipMeaningfulActivityCheck: true,
      });
      if (result.sent) processedCount++;
      else if (result.skipped?.startsWith('send_failed')) failedCount++;
    }

    runStatus = 'success';
    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failedCount,
      eligible: learners.length,
    });
  } catch (error: unknown) {
    runError = (error as Error)?.message ?? String(error);
    return NextResponse.json({ error: 'Cron failed', details: runError }, { status: 500 });
  } finally {
    await persistCronHeartbeat({
      jobName: JOB_NAME,
      status: runStatus,
      processedCount,
      failedCount,
      error: runError,
      metadata: { endpoint: '/api/cron/daily-challenge-reminder' },
    });
  }
}
