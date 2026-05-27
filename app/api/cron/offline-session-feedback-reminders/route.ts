import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth';
import {
  sendOfflineSessionFeedbackOpsReminder,
  sessionEndTimestamp,
  type OfflineSessionFeedbackGap,
} from '@/lib/offline-session-feedback-reminders';

export const runtime = 'nodejs';

const JOB_NAME = 'offline-session-feedback-reminders';
const REMINDER_EVENT = 'offline_session_feedback_ops_reminder';
const ONE_HOUR_MS = 60 * 60 * 1000;

const CLOSED_STATUSES = new Set(['evaluated', 'completed', 'not_attended', 'cancelled']);

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
    const oneHourAgo = new Date(now - ONE_HOUR_MS).toISOString();

    const { data: sessions, error: sessionsError } = await supabase
      .from('individual_sessions')
      .select(
        'id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time, duration_minutes, status, offline_scheduling_period_id'
      )
      .not('offline_scheduling_period_id', 'is', null)
      .limit(500);

    if (sessionsError) throw sessionsError;

    const openSessions = (sessions || []).filter((s) => {
      const st = String(s.status || '').toLowerCase();
      return !CLOSED_STATUSES.has(st);
    });

    if (!openSessions.length) {
      runStatus = 'success';
      return NextResponse.json({ success: true, processed: 0, skipped: 0, message: 'No open offline sessions' });
    }

    const sessionIds = openSessions.map((s) => s.id);
    const periodIds = [
      ...new Set(openSessions.map((s) => s.offline_scheduling_period_id).filter(Boolean) as string[]),
    ];

    const [{ data: reports }, { data: feedbacks }, { data: periods }] = await Promise.all([
      supabase
        .from('session_tutor_completion_reports')
        .select('individual_session_id')
        .in('individual_session_id', sessionIds),
      supabase
        .from('session_learner_feedback')
        .select('individual_session_id')
        .in('individual_session_id', sessionIds),
      periodIds.length
        ? supabase
            .from('offline_scheduling_periods')
            .select('id, offline_operation_id')
            .in('id', periodIds)
        : Promise.resolve({ data: [] as Array<{ id: string; offline_operation_id: string | null }> }),
    ]);

    const reportSet = new Set((reports || []).map((r) => r.individual_session_id));
    const feedbackSet = new Set((feedbacks || []).map((f) => f.individual_session_id));
    const opByPeriod = new Map(
      (periods || []).map((p) => [p.id, p.offline_operation_id as string | null])
    );

    const profileIds = [
      ...new Set(
        openSessions.flatMap((s) => [s.tutor_id, s.learner_id, s.parent_id].filter(Boolean) as string[])
      ),
    ];
    const { data: profiles } = profileIds.length
      ? await supabase.from('profiles').select('id, full_name').in('id', profileIds)
      : { data: [] as Array<{ id: string; full_name: string | null }> };
    const nameById = new Map((profiles || []).map((p) => [p.id, p.full_name || 'Participant']));

    for (const s of openSessions) {
      const endMs = sessionEndTimestamp(s.scheduled_date, s.scheduled_time, s.duration_minutes);
      if (!endMs || endMs > now) {
        skippedCount += 1;
        continue;
      }

      const missingTutorReport = !reportSet.has(s.id);
      const missingLearnerFeedback = !feedbackSet.has(s.id);
      if (!missingTutorReport && !missingLearnerFeedback) {
        skippedCount += 1;
        continue;
      }

      const { data: recentReminder } = await supabase
        .from('admin_operational_events')
        .select('id')
        .eq('event_type', REMINDER_EVENT)
        .contains('payload', { session_id: s.id })
        .gte('created_at', oneHourAgo)
        .limit(1);

      if (recentReminder?.length) {
        skippedCount += 1;
        continue;
      }

      const familyId = s.parent_id || s.learner_id;
      const gap: OfflineSessionFeedbackGap = {
        sessionId: s.id,
        subject: s.subject,
        scheduledDate: s.scheduled_date,
        scheduledTime: s.scheduled_time,
        tutorName: nameById.get(s.tutor_id) || 'Tutor',
        learnerName: familyId ? nameById.get(familyId) || 'Learner / parent' : 'Learner / parent',
        missingTutorReport,
        missingLearnerFeedback,
        offlineOperationId: opByPeriod.get(s.offline_scheduling_period_id) || null,
      };

      const mail = await sendOfflineSessionFeedbackOpsReminder(gap);
      await supabase.from('admin_operational_events').insert({
        event_type: REMINDER_EVENT,
        subject: `Feedback reminder: ${s.subject || 'session'}`,
        payload: {
          session_id: s.id,
          offline_operation_id: gap.offlineOperationId,
          missing_tutor_report: missingTutorReport,
          missing_learner_feedback: missingLearnerFeedback,
          emails_sent: mail.ok && mail.to ? mail.to : [],
        },
        emails_sent: mail.ok && mail.to ? [...mail.to] : [],
      });

      processedCount += 1;
    }

    runStatus = 'success';
    return NextResponse.json({
      success: true,
      processed: processedCount,
      skipped: skippedCount,
      scanned: openSessions.length,
    });
  } catch (e: unknown) {
    runError = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: runError }, { status: 500 });
  } finally {
    await persistCronHeartbeat(supabase, {
      jobName: JOB_NAME,
      status: runStatus,
      processedCount,
      failedCount: runStatus === 'failed' ? 1 : 0,
      error: runError,
      metadata: { skipped: skippedCount },
    });
  }
}
