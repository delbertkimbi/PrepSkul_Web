import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function persistCronHeartbeat(params: {
  jobName: string;
  status: 'success' | 'failed';
  processedCount?: number;
  failedCount?: number;
  error?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    await supabase.from('cron_job_heartbeats').upsert(
      {
        job_name: params.jobName,
        last_status: params.status,
        last_run_at: now,
        last_success_at: params.status === 'success' ? now : null,
        last_error: params.status === 'failed' ? params.error ?? 'unknown' : null,
        processed_count: params.processedCount ?? 0,
        failed_count: params.failedCount ?? 0,
        metadata: {
          source: 'external-cron',
          ...params.metadata,
        },
      },
      { onConflict: 'job_name' }
    );
  } catch (e) {
    console.warn(`Could not persist cron heartbeat (${params.jobName}):`, e);
  }
}

export function verifyCronAuth(request: Request): { ok: boolean; error?: string } {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return { ok: true };
  const authHeader = request.headers.get('authorization');
  const isVercelCron =
    request.headers.get('user-agent')?.includes('vercel-cron') ||
    request.headers.get('x-vercel-cron') === '1';
  if (isVercelCron || authHeader === `Bearer ${cronSecret}`) {
    return { ok: true };
  }
  return { ok: false, error: 'Unauthorized. Provide Authorization: Bearer YOUR_CRON_SECRET.' };
}
