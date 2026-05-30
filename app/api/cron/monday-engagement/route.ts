import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { persistCronHeartbeat, verifyCronAuth } from '@/lib/cron/persist-cron-heartbeat';
import { isMondayInWat } from '@/lib/notifications/timezone-wat';
import { runEngagementBatch } from '@/lib/notifications/send-engagement';

const JOB_NAME = 'monday-engagement';
const MAX_USERS_PER_RUN = 500;

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

    if (!isMondayInWat()) {
      runStatus = 'success';
      return NextResponse.json({ success: true, processed: 0, message: 'Not Monday in WAT' });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, user_type, is_admin, full_name, last_seen')
      .limit(MAX_USERS_PER_RUN * 2);

    if (error) {
      runError = error.message;
      return NextResponse.json({ error: 'Failed to fetch profiles', details: error.message }, { status: 500 });
    }

    const result = await runEngagementBatch({
      profiles: profiles || [],
      mode: 'monday_only',
      maxUsers: MAX_USERS_PER_RUN,
    });

    processedCount = result.processed;
    failedCount = result.failed;
    runStatus = 'success';

    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      skipped: result.skipped,
    });
  } catch (error: any) {
    runError = error?.message || String(error);
    return NextResponse.json({ error: 'Cron failed', details: runError }, { status: 500 });
  } finally {
    await persistCronHeartbeat({
      jobName: JOB_NAME,
      status: runStatus,
      processedCount,
      failedCount,
      error: runError,
      metadata: { endpoint: '/api/cron/monday-engagement' },
    });
  }
}
