import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { persistCronHeartbeat, verifyCronAuth } from '@/lib/cron/persist-cron-heartbeat';
import { sendEngagementToUser } from '@/lib/notifications/send-engagement';

const JOB_NAME = 'behavioural-engagement';
const MAX_USERS_PER_RUN = 300;

/** Users who viewed tutors recently but have no open booking request. */
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
    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: views, error: viewsError } = await supabaseAdmin
      .from('tutor_profile_views')
      .select('user_id')
      .gte('created_at', sinceIso)
      .limit(MAX_USERS_PER_RUN * 3);

    if (viewsError) {
      runError = viewsError.message;
      return NextResponse.json(
        { error: 'Failed to fetch tutor profile views', details: viewsError.message },
        { status: 500 }
      );
    }

    if (!views?.length) {
      runStatus = 'success';
      return NextResponse.json({ success: true, processed: 0, message: 'No recent tutor profile views' });
    }

    const candidateUserIds = [...new Set(views.map((v: { user_id: string }) => v.user_id).filter(Boolean))];

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin, full_name, last_seen')
      .in('id', candidateUserIds)
      .limit(MAX_USERS_PER_RUN * 2);

    if (profilesError) {
      runError = profilesError.message;
      return NextResponse.json({ error: 'Failed to fetch profiles', details: profilesError.message }, { status: 500 });
    }

    const eligible = (profiles || [])
      .filter((p) => {
        if (p.is_admin) return false;
        const role = (p.user_type || '').toLowerCase();
        return ['student', 'learner', 'parent'].includes(role);
      })
      .slice(0, MAX_USERS_PER_RUN);

    for (const profile of eligible) {
      const result = await sendEngagementToUser({
        userId: profile.id,
        profile,
        mode: 'behaviour_only',
      });
      if (result.sent) processedCount++;
      else if (result.skipped?.startsWith('send_failed')) failedCount++;
    }

    runStatus = 'success';
    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failedCount,
      eligible: eligible.length,
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
      metadata: { endpoint: '/api/cron/behavioural-engagement' },
    });
  }
}
