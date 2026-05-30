import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth';

export const runtime = 'nodejs';

const JOB_NAME = 'tutor-onsite-attendance-reminders';
const REMINDER_EVENT = 'tutor_onsite_attendance_reminder';

function sessionEndMs(
  scheduledDate: string,
  scheduledTime: string,
  durationMinutes: number
): number {
  const [h, m] = scheduledTime.split(':').map((x) => parseInt(x, 10));
  const d = new Date(scheduledDate);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime() + durationMinutes * 60 * 1000;
}

export async function GET(request: NextRequest) {
  const authError = verifyExternalCron(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  let runStatus: 'success' | 'failed' = 'failed';
  let processedCount = 0;
  let skippedCount = 0;
  let runError: string | null = null;

  try {
    const now = Date.now();
    const graceMs = 30 * 60 * 1000;

    const { data: sessions, error } = await supabase
      .from('individual_sessions')
      .select(
        'id, tutor_id, subject, scheduled_date, scheduled_time, duration_minutes, location, status'
      )
      .in('location', ['onsite', 'hybrid'])
      .eq('status', 'scheduled')
      .limit(300);

    if (error) throw error;

    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com';

    for (const s of sessions || []) {
      const duration = Number(s.duration_minutes || 60);
      const endMs = sessionEndMs(
        s.scheduled_date as string,
        s.scheduled_time as string,
        duration
      );

      if (now < endMs + graceMs) {
        skippedCount++;
        continue;
      }

      const { data: attendance } = await supabase
        .from('session_attendance')
        .select('id, check_in_time')
        .eq('session_id', s.id)
        .eq('user_type', 'tutor')
        .maybeSingle();

      if (attendance?.check_in_time) {
        skippedCount++;
        continue;
      }

      const { data: prior } = await supabase
        .from('admin_operational_events')
        .select('id')
        .eq('event_type', REMINDER_EVENT)
        .contains('payload', { session_id: s.id })
        .limit(1);

      if (prior && prior.length > 0) {
        skippedCount++;
        continue;
      }

      await fetch(`${apiUrl}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: s.tutor_id,
          type: 'tutor_attendance_reminder',
          title: 'Submit onsite session check-in',
          message: `Please check in and upload your selfie for "${s.subject || 'your session'}" so your earnings can be reviewed.`,
          priority: 'high',
          actionUrl: '/tutor-nav?tab=sessions',
          actionText: 'Open Sessions',
          metadata: { session_id: s.id, scheduled_date: s.scheduled_date },
          sendEmail: true,
          sendPush: true,
        }),
      });

      await supabase.from('admin_operational_events').insert({
        event_type: REMINDER_EVENT,
        subject: `Onsite attendance reminder for session ${s.id}`,
        payload: { session_id: s.id, tutor_id: s.tutor_id },
        emails_sent: [],
      });

      processedCount++;
    }

    runStatus = 'success';
    return NextResponse.json({ success: true, processed: processedCount, skipped: skippedCount });
  } catch (e: unknown) {
    runError = e instanceof Error ? e.message : 'cron failed';
    return NextResponse.json({ error: runError }, { status: 500 });
  } finally {
    await persistCronHeartbeat(supabase, JOB_NAME, runStatus, {
      processed: processedCount,
      skipped: skippedCount,
      error: runError,
    });
  }
}
