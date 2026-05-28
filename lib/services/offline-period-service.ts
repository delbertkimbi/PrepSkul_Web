import type { SupabaseClient } from '@supabase/supabase-js';
import {
  enumerateSessionOccurrences,
  enumerateSessionOccurrencesForBillingMonth,
  type OfflineScheduleInputV2,
  type SessionOccurrence,
} from '@/lib/services/offline-schedule';
import { buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import { scheduleSessionNotifications } from '@/lib/services/session-notification-scheduler';
import { sendSessionStartEmail, sendOfflineReminderEmail } from '@/lib/offline-session-emails';
import { deliverOfflineMatchWelcomeEmails, scheduleOfflineMatchInAppNotifications } from '@/lib/services/offline-match-notify';

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

function monthLabelFromDate(dateLike?: string | null) {
  return dateLike ? dateLike.slice(0, 7) : null;
}

export async function scheduleOfflinePeriod(admin: SupabaseClient, params: SchedulePeriodParams) {
  const billingMonthKey = params.schedule.startDate.slice(0, 7);
  const occurrences = params.isHistoricalImport
    ? enumerateSessionOccurrencesForBillingMonth(params.schedule, billingMonthKey)
    : enumerateSessionOccurrences(params.schedule);

  if (params.isHistoricalImport && !occurrences.length) {
    throw new Error(
      `No session dates fall in billing month ${billingMonthKey}. Check weekdays and month selection.`
    );
  }
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
    operation_state:
      params.commercial?.operationState ||
      (params.isHistoricalImport ? 'paused' : 'active'),
    period_start: periodStart,
    period_end: periodEnd,
    start_month_label: params.commercial?.startMonthLabel || monthLabelFromDate(periodStart),
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

    if (!params.skipReminders && !params.isHistoricalImport) {
      await scheduleSessionNotifications(admin, {
        sessionId,
        occurrence: occ,
        subject: primarySubject,
        tutorUserId: params.tutorUserId,
        familyUserId,
        deliveryMode: params.schedule.deliveryMode,
        meetLink: params.schedule.meetLink,
        onsiteLocation: params.schedule.onsiteLocation,
        urls,
      });
    }
  }

  if (params.sendWelcomeEmail && sessionIds.length && !params.isHistoricalImport) {
    const firstOcc = occurrences[0];
    const learnerDisplayName =
      params.learnerDisplayNames?.split(',')[0]?.trim() ||
      learnerProfile?.full_name ||
      parentProfile?.full_name ||
      null;
    const matchOpts = {
      primaryUserId: params.primaryUserId,
      learnerUserId: params.learnerUserId,
      tutorUserId: params.tutorUserId,
      tutorName: params.tutorName,
      learnerName: learnerDisplayName,
      firstSessionId: sessionIds[0],
      subject: primarySubject,
      nextDate: firstOcc?.date,
      nextTime: firstOcc?.time,
      deliveryMode: params.schedule.deliveryMode,
      meetLink: params.schedule.meetLink,
      onsiteLocation: params.schedule.onsiteLocation,
    };
    await deliverOfflineMatchWelcomeEmails(admin, matchOpts);
    await scheduleOfflineMatchInAppNotifications(admin, matchOpts);
  }

  return { periodId, sessionIds, occurrences };
}
