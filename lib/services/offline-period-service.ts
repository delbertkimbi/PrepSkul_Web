import type { SupabaseClient } from '@supabase/supabase-js';
import {
  enumerateSessionOccurrences,
  type OfflineScheduleInputV2,
  type SessionOccurrence,
} from '@/lib/services/offline-schedule';
import { buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import {
  sendOfflineWelcomeEmail,
  sendSessionStartEmail,
  sendOfflineReminderEmail,
} from '@/lib/offline-session-emails';

export type PeriodCommercial = {
  payPerMonthXaf?: number | null;
  payMonthsCount?: number | null;
  operationState?: 'active' | 'paused' | 'stopped';
  startMonthLabel?: string | null;
};

export type SchedulePeriodParams = {
  adminUserId: string;
  primaryUserId: string;
  learnerUserId: string;
  tutorUserId: string;
  tutorName: string;
  learnerDisplayNames?: string | null;
  schedule: OfflineScheduleInputV2;
  commercial?: PeriodCommercial;
  isHistoricalImport?: boolean;
  offlineOperationId?: string | null;
  offlineRunId?: string | null;
  sendWelcomeEmail?: boolean;
  skipReminders?: boolean;
};

async function insertSessionRow(
  admin: SupabaseClient,
  row: Record<string, unknown>
): Promise<string | null> {
  let { data: ins, error: insErr } = await admin.from('individual_sessions').insert(row).select('id').maybeSingle();
  if (insErr && row.parent_id && /parent_id/i.test(insErr.message || '')) {
    const retry = await admin
      .from('individual_sessions')
      .insert({ ...row, parent_id: null })
      .select('id')
      .maybeSingle();
    ins = retry.data;
    insErr = retry.error;
  }
  if (insErr) throw new Error(insErr.message || 'Failed to create session');
  return ins?.id || null;
}

async function scheduleSessionNotifications(
  admin: SupabaseClient,
  opts: {
    sessionId: string;
    occurrence: SessionOccurrence;
    subject: string;
    tutorUserId: string;
    familyUserId: string;
    deliveryMode?: string;
    meetLink?: string | null;
    onsiteLocation?: string | null;
    tutorPortalUrl: string;
    learnerPortalUrl: string;
    skipReminders?: boolean;
  }
) {
  if (opts.skipReminders) return;

  const start = new Date(`${opts.occurrence.date}T${opts.occurrence.time}`);
  const now = Date.now();
  const familyIds = [opts.tutorUserId, opts.familyUserId];

  const reminders: Array<{ type: string; when: Date; title: string; label: string }> = [
    { type: '24_hours', when: new Date(start.getTime() - 24 * 60 * 60 * 1000), title: 'Session reminder', label: '24 hours before your session' },
    { type: '1_hour', when: new Date(start.getTime() - 60 * 60 * 1000), title: 'Session starts in 1 hour', label: '1 hour before your session' },
    { type: 'session_start', when: start, title: 'Your session is starting now', label: 'Starting now' },
  ].filter((r) => r.when.getTime() > now - 60_000);

  const rows: Record<string, unknown>[] = [];
  for (const uid of familyIds) {
    for (const r of reminders) {
      rows.push({
        user_id: uid,
        notification_type: r.type === 'session_start' ? 'session_start' : 'session_reminder',
        title: r.title,
        message:
          r.type === 'session_start'
            ? 'Your PrepSkul session is starting now. Open your session page to join and submit feedback after class.'
            : `Reminder: your ${opts.subject || 'PrepSkul'} session is upcoming.`,
        scheduled_for: r.when.toISOString(),
        status: 'pending',
        related_id: opts.sessionId,
        metadata: {
          session_id: opts.sessionId,
          reminder_type: r.type,
          session_start: start.toISOString(),
          sendEmail: true,
          sendPush: r.type === '1_hour' || r.type === 'session_start',
          offline_email: true,
          delivery_mode: opts.deliveryMode,
          meet_link: opts.meetLink,
          onsite_location: opts.onsiteLocation,
          tutor_portal_url: opts.tutorPortalUrl,
          learner_portal_url: opts.learnerPortalUrl,
          reminder_label: r.label,
        },
      });
    }
  }
  if (rows.length) await admin.from('scheduled_notifications').insert(rows);
}

export async function scheduleOfflinePeriod(admin: SupabaseClient, params: SchedulePeriodParams) {
  const occurrences = enumerateSessionOccurrences(params.schedule);
  const primarySubject = params.schedule.subjects[0] || 'PrepSkul session';
  const payPerMonth = params.commercial?.payPerMonthXaf ?? null;
  const payMonths = params.commercial?.payMonthsCount ?? null;
  const expectedRevenue =
    payPerMonth != null && payMonths != null ? Number(payPerMonth) * Number(payMonths) : null;

  const periodStart = occurrences[0]?.date || params.schedule.startDate;
  const periodEnd = occurrences[occurrences.length - 1]?.date || periodStart;

  const periodPayload: Record<string, unknown> = {
    offline_operation_id: params.offlineOperationId || null,
    offline_run_id: params.offlineRunId || null,
    primary_user_id: params.primaryUserId,
    learner_user_id: params.learnerUserId,
    tutor_user_id: params.tutorUserId,
    learner_display_names: params.learnerDisplayNames || null,
    sessions_per_week: params.schedule.sessionsPerWeek ?? params.schedule.dayTimeSlots?.length ?? null,
    subjects: params.schedule.subjects,
    scheduling: {
      weeks: params.schedule.weeks,
      dayTimeSlots: params.schedule.dayTimeSlots,
      durationMinutes: params.schedule.durationMinutes,
      startDate: params.schedule.startDate,
      occurrences,
    },
    delivery_mode: params.schedule.deliveryMode,
    meet_link: params.schedule.meetLink || null,
    onsite_location: params.schedule.onsiteLocation || null,
    onsite_photo_url: params.schedule.onsitePhotoUrl || null,
    pay_per_month_xaf: payPerMonth,
    pay_months_count: payMonths,
    expected_period_revenue_xaf: expectedRevenue,
    operation_state: params.commercial?.operationState || (params.isHistoricalImport ? 'stopped' : 'active'),
    period_start: periodStart,
    period_end: periodEnd,
    start_month_label: params.commercial?.startMonthLabel || null,
    is_historical_import: params.isHistoricalImport ?? false,
    source: 'admin_form',
    created_by_admin_id: params.adminUserId,
    updated_at: new Date().toISOString(),
  };

  let periodId: string | null = null;
  const { data: period, error: periodErr } = await admin
    .from('offline_scheduling_periods')
    .insert(periodPayload)
    .select('id')
    .maybeSingle();
  if (!periodErr && period?.id) {
    periodId = period.id;
  } else {
    console.warn('[offline-period] period insert skipped', periodErr?.message);
  }

  const { data: learnerProfile } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', params.learnerUserId)
    .maybeSingle();
  const { data: parentProfile } = await admin
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', params.primaryUserId)
    .maybeSingle();

  let parentId: string | null = null;
  if (parentProfile?.id && parentProfile.id !== params.learnerUserId) {
    parentId = parentProfile.id;
    await admin.from('parent_learners').upsert(
      { parent_user_id: parentId, learner_user_id: params.learnerUserId },
      { onConflict: 'parent_user_id,learner_user_id' }
    );
  }

  const sessionIds: string[] = [];
  const locationLabel = params.schedule.deliveryMode === 'online' ? 'online' : 'onsite';

  for (const occ of occurrences) {
    const row: Record<string, unknown> = {
      tutor_id: params.tutorUserId,
      learner_id: params.learnerUserId,
      parent_id: parentId,
      offline_scheduling_period_id: periodId,
      scheduled_date: occ.date,
      scheduled_time: occ.time,
      duration_minutes: params.schedule.durationMinutes,
      status: params.isHistoricalImport ? 'evaluated' : 'pending',
      location: locationLabel,
      subject: primarySubject,
      delivery_mode: params.schedule.deliveryMode,
      meet_link: params.schedule.meetLink || null,
      onsite_location: params.schedule.onsiteLocation || null,
      onsite_photo_url: params.schedule.onsitePhotoUrl || null,
      created_at: new Date().toISOString(),
    };

    const sessionId = await insertSessionRow(admin, row);
    if (!sessionId) continue;
    sessionIds.push(sessionId);

    const urls = buildSessionPortalUrls(sessionId);
    const familyUserId = parentId || params.learnerUserId;

    await scheduleSessionNotifications(admin, {
      sessionId,
      occurrence: occ,
      subject: primarySubject,
      tutorUserId: params.tutorUserId,
      familyUserId,
      deliveryMode: params.schedule.deliveryMode,
      meetLink: params.schedule.meetLink,
      onsiteLocation: params.schedule.onsiteLocation,
      tutorPortalUrl: urls.tutorReportUrl,
      learnerPortalUrl: urls.learnerFeedbackUrl,
      skipReminders: params.skipReminders || params.isHistoricalImport,
    });
  }

  if (params.sendWelcomeEmail && sessionIds.length && !params.isHistoricalImport) {
    const firstOcc = occurrences[0];
    const familyEmail = parentProfile?.email || learnerProfile?.email;
    const familyName = parentProfile?.full_name || learnerProfile?.full_name || 'there';
    if (familyEmail) {
      const urls = buildSessionPortalUrls(sessionIds[0]);
      await sendOfflineWelcomeEmail({
        to: familyEmail,
        recipientName: familyName,
        tutorName: params.tutorName,
        nextDate: firstOcc?.date,
        nextTime: firstOcc?.time,
        subject: primarySubject,
        deliveryMode: params.schedule.deliveryMode,
        meetLink: params.schedule.meetLink,
        onsiteLocation: params.schedule.onsiteLocation,
        learnerPortalUrl: urls.learnerFeedbackUrl,
      });
    }
    const { data: tutorProf } = await admin.from('profiles').select('email, full_name').eq('id', params.tutorUserId).maybeSingle();
    if (tutorProf?.email) {
      const urls = buildSessionPortalUrls(sessionIds[0]);
      await sendOfflineWelcomeEmail({
        to: tutorProf.email,
        recipientName: tutorProf.full_name || 'Tutor',
        tutorName: params.tutorName,
        nextDate: firstOcc?.date,
        nextTime: firstOcc?.time,
        subject: primarySubject,
        deliveryMode: params.schedule.deliveryMode,
        meetLink: params.schedule.meetLink,
        onsiteLocation: params.schedule.onsiteLocation,
        learnerPortalUrl: urls.tutorReportUrl,
      });
    }
  }

  return { periodId, sessionIds, occurrences };
}
