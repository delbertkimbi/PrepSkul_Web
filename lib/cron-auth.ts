import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates external cron requests (cron-job.org, etc.).
 * Requires Authorization: Bearer CRON_SECRET — Vercel Cron is not used.
 */
export function verifyExternalCron(request: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn('[cron] CRON_SECRET is not set — cron endpoints are unprotected');
    return null;
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        error: 'Unauthorized. Provide Authorization: Bearer YOUR_CRON_SECRET header.',
        hint: 'Configure your external cron provider (e.g. cron-job.org) with this header.',
      },
      { status: 401 }
    );
  }

  return null;
}

export async function persistCronHeartbeat(
  supabase: ReturnType<typeof import('@/lib/supabase-admin').getSupabaseAdmin>,
  opts: {
    jobName: string;
    status: 'success' | 'failed';
    processedCount?: number;
    failedCount?: number;
    error?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await supabase.from('cron_job_heartbeats').upsert(
      {
        job_name: opts.jobName,
        last_status: opts.status,
        last_run_at: new Date().toISOString(),
        last_success_at: opts.status === 'success' ? new Date().toISOString() : null,
        last_error: opts.status === 'failed' ? opts.error ?? 'Unknown error' : null,
        processed_count: opts.processedCount ?? 0,
        failed_count: opts.failedCount ?? 0,
        metadata: {
          source: 'external-cron',
          ...opts.metadata,
        },
      },
      { onConflict: 'job_name' }
    );
  } catch (e) {
    console.warn(`Could not persist cron heartbeat (${opts.jobName}):`, e);
  }
}
