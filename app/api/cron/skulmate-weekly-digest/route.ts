import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * SkulMate Weekly Learning Digest (email + in-app, no push)
 *
 * - At most ~1× per week per user: excludes anyone who already received `skulmate_weekly_digest`
 *   in the last 6 days.
 * - Targets learners/parents with SkulMate activity (`user_game_stats.games_played` > 0).
 * - Calls `/api/notifications/send` with `sendEmail: true`, `sendPush: false`, `type: skulmate_weekly_digest`.
 *
 * Schedule: weekly via external cron (cron-job.org or your API scheduler) hitting GET with
 * Authorization: Bearer CRON_SECRET. Vercel Cron is optional and requires a paid plan — not required.
 */
const MAX_USERS_PER_RUN = 400;
const JOB_NAME = 'skulmate-weekly-digest';
const DIGEST_COOLDOWN_DAYS = 6;

export async function GET(request: NextRequest) {
  let runStatus: 'success' | 'failed' = 'failed';
  let processedCount = 0;
  let failedCount = 0;
  let runError: string | null = null;

  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const isVercelCron =
        request.headers.get('user-agent')?.includes('vercel-cron') ||
        request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
        runError = 'Unauthorized cron request';
        return NextResponse.json(
          { error: 'Unauthorized. Provide Authorization: Bearer YOUR_CRON_SECRET.' },
          { status: 401 },
        );
      }
    }

    const supabaseAdmin = getSupabaseAdmin();
    const cooldownIso = new Date(
      Date.now() - DIGEST_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: statsRows, error: statsError } = await supabaseAdmin
      .from('user_game_stats')
      .select(
        'user_id, total_xp, level, current_streak, games_played, last_played_date',
      )
      .gt('games_played', 0)
      .limit(MAX_USERS_PER_RUN * 3);

    if (statsError) {
      console.error('skulmate-weekly-digest: user_game_stats', statsError);
      return NextResponse.json(
        { error: 'Failed to fetch game stats', details: statsError.message },
        { status: 500 },
      );
    }

    if (!statsRows?.length) {
      runStatus = 'success';
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No users with SkulMate plays',
      });
    }

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin')
      .in(
        'id',
        statsRows.map((r: { user_id: string }) => r.user_id),
      );

    if (profilesError) {
      console.error('skulmate-weekly-digest: profiles', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch profiles', details: profilesError.message },
        { status: 500 },
      );
    }

    const playableRoles = new Set(
      (profiles || [])
        .filter((p: { is_admin?: boolean; user_type?: string }) => {
          if (p.is_admin === true) return false;
          const role = (p.user_type || '').toString().toLowerCase();
          return (
            role === 'student' ||
            role === 'learner' ||
            role === 'parent'
          );
        })
        .map((p: { id: string }) => p.id),
    );

    const candidateIds = [
      ...new Set(
        statsRows
          .filter((r: { user_id: string }) => playableRoles.has(r.user_id))
          .map((r: { user_id: string }) => r.user_id),
      ),
    ];

    if (candidateIds.length === 0) {
      runStatus = 'success';
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No eligible learner/parent profiles',
      });
    }

    const { data: recentDigests, error: digestErr } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .in('user_id', candidateIds)
      .eq('type', 'skulmate_weekly_digest')
      .gte('created_at', cooldownIso);

    if (digestErr) {
      console.error('skulmate-weekly-digest: notifications query', digestErr);
      return NextResponse.json(
        { error: 'Failed to check recent digests', details: digestErr.message },
        { status: 500 },
      );
    }

    const recentlyNotified = new Set(
      (recentDigests || []).map((r: { user_id: string }) => r.user_id),
    );

    const statsByUser = new Map(
      statsRows.map((r: any) => [r.user_id as string, r]),
    );

    const eligible = candidateIds
      .filter((id) => !recentlyNotified.has(id))
      .slice(0, MAX_USERS_PER_RUN);

    if (eligible.length === 0) {
      runStatus = 'success';
      return NextResponse.json({
        success: true,
        processed: 0,
        message: `No users due for digest (all notified in last ${DIGEST_COOLDOWN_DAYS} days)`,
      });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

    if (!baseUrl) {
      runError = 'Missing NEXT_PUBLIC_APP_URL or VERCEL_URL';
      return NextResponse.json({
        success: false,
        processed: 0,
        message: 'No app URL configured for internal notification POST',
      });
    }

    let processed = 0;
    let failed = 0;

    for (const userId of eligible) {
      const row = statsByUser.get(userId) as {
        total_xp?: number;
        level?: number;
        current_streak?: number;
        games_played?: number;
        last_played_date?: string | null;
      } | undefined;

      const xp = row?.total_xp ?? 0;
      const level = row?.level ?? 1;
      const streak = row?.current_streak ?? 0;
      const played = row?.games_played ?? 0;
      const lastPlayed = row?.last_played_date
        ? new Date(row.last_played_date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : '—';

      const title = 'Your SkulMate week in review';
      const message = [
        `Level ${level} · ${xp.toLocaleString()} XP · ${streak} day streak · ${played} games played.`,
        `Last played: ${lastPlayed}.`,
        `Open SkulMate to keep your progress going.`,
      ].join(' ');

      try {
        const res = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            type: 'skulmate_weekly_digest',
            title,
            message,
            priority: 'normal',
            actionUrl: '/skulmate',
            actionText: 'View progress',
            sendEmail: true,
            sendPush: false,
            metadata: {
              skulmate_digest: true,
              total_xp: xp,
              level,
              current_streak: streak,
              games_played: played,
              last_played_date: row?.last_played_date ?? null,
            },
          }),
        });

        if (res.ok) {
          processed++;
        } else {
          failed++;
          const text = await res.text();
          console.warn(
            `skulmate-weekly-digest send failed for ${userId}: ${res.status} ${text}`,
          );
        }
      } catch (e: unknown) {
        failed++;
        console.warn(
          'skulmate-weekly-digest request failed for',
          userId,
          (e as Error)?.message || e,
        );
      }
    }

    runStatus = 'success';
    processedCount = processed;
    failedCount = failed;
    return NextResponse.json({
      success: true,
      processed,
      failed,
      eligible: eligible.length,
      message: `Sent ${processed} weekly SkulMate digests`,
    });
  } catch (error: unknown) {
    console.error('skulmate-weekly-digest cron error:', error);
    runError = (error as Error)?.message ?? String(error);
    return NextResponse.json(
      { error: 'Cron failed', details: (error as Error)?.message ?? String(error) },
      { status: 500 },
    );
  } finally {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.from('cron_job_heartbeats').upsert(
        {
          job_name: JOB_NAME,
          last_status: runStatus,
          last_run_at: new Date().toISOString(),
          last_success_at: runStatus === 'success' ? new Date().toISOString() : null,
          last_error: runStatus === 'failed' ? runError : null,
          processed_count: processedCount,
          failed_count: failedCount,
          metadata: {
            source: 'cron',
            endpoint: '/api/cron/skulmate-weekly-digest',
          },
        },
        { onConflict: 'job_name' },
      );
    } catch (heartbeatError) {
      console.warn('Could not persist cron heartbeat (skulmate-weekly-digest):', heartbeatError);
    }
  }
}
