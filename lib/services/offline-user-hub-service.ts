import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { scheduleOfflinePeriod } from '@/lib/services/offline-period-service';
import { resolveTutorUserId } from '@/lib/services/offline-onboarding-service';
import type { OfflineScheduleInputV2 } from '@/lib/services/offline-schedule';
import type { z } from 'zod';
import type { offlineScheduleSchema, schedulePeriodBodySchema } from '@/lib/validators/offline-period-schema';

type ScheduleBody = z.infer<typeof schedulePeriodBodySchema>;
type ScheduleInput = z.infer<typeof offlineScheduleSchema>;

function generatedOfflineLearnerEmail() {
  return `offline.learner.${crypto.randomBytes(16).toString('hex')}@account.prepskul.com`;
}

async function createLearnerProfile(
  admin: SupabaseClient,
  input: { email: string; fullName: string; phone?: string }
): Promise<string> {
  const email = input.email.trim().toLowerCase();
  const password = crypto.randomBytes(18).toString('base64url');
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, phone_number: input.phone || null },
  });
  if (error || !data.user) throw new Error(error?.message || 'Failed to create learner');
  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: input.fullName,
    phone_number: input.phone || null,
    user_type: 'learner',
  });
  if (pErr) throw new Error(pErr.message || 'Failed to create learner profile');
  return data.user.id;
}

export async function getOfflineUserContext(admin: SupabaseClient, primaryUserId: string) {
  const { data: profile } = await admin.from('profiles').select('*').eq('id', primaryUserId).maybeSingle();
  if (!profile) throw new Error('User not found');

  const { data: run } = await admin
    .from('offline_onboarding_runs')
    .select('id, learner_user_id, tutor_user_id, primary_role, metadata')
    .eq('primary_user_id', primaryUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: children } = await admin
    .from('parent_learners')
    .select('learner_user_id')
    .eq('parent_user_id', primaryUserId);

  const { data: op } = await admin
    .from('offline_operations')
    .select('id, customer_name, onboarding_stage, learner_user_id')
    .eq('primary_user_id', primaryUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const learnerIds = [
    run?.learner_user_id,
    op?.learner_user_id,
    ...(children || []).map((c) => c.learner_user_id),
  ].filter(Boolean) as string[];

  const uniqueLearnerIds = [...new Set(learnerIds)];
  let learnerProfiles: Array<{ id: string; full_name?: string | null; email?: string | null }> = [];
  if (uniqueLearnerIds.length) {
    const { data } = await admin.from('profiles').select('id, full_name, email').in('id', uniqueLearnerIds);
    learnerProfiles = data || [];
  }

  return {
    profile,
    run,
    learners: learnerProfiles || [],
    offlineOperationId: op?.id || null,
    operationLearnerUserId: (op?.learner_user_id as string | null) || null,
  };
}

export function resolveLearnerUserIdForOfflineHub(
  ctx: Awaited<ReturnType<typeof getOfflineUserContext>>,
  primaryUserId: string,
  explicitLearnerUserId?: string | null
): string | undefined {
  if (explicitLearnerUserId) return explicitLearnerUserId;
  if (ctx.run?.learner_user_id) return ctx.run.learner_user_id as string;
  if (ctx.operationLearnerUserId) return ctx.operationLearnerUserId;
  const userType = (ctx.profile.user_type || '').toLowerCase();
  if (userType === 'learner' || userType === 'student') return primaryUserId;
  return ctx.learners[0]?.id as string | undefined;
}

function toScheduleV2(schedule: ScheduleInput): OfflineScheduleInputV2 {
  return {
    weeks: schedule.weeks,
    sessionsPerWeek: schedule.sessionsPerWeek,
    dayTimeSlots: schedule.dayTimeSlots,
    durationMinutes: schedule.durationMinutes,
    startDate: schedule.startDate,
    deliveryMode: schedule.deliveryMode,
    subjects: schedule.subjects,
    meetLink: schedule.meetLink,
    onsiteLocation: schedule.onsiteLocation,
    onsitePhotoUrl: schedule.onsitePhotoUrl,
  };
}

export async function schedulePeriodForExistingUser(
  admin: SupabaseClient,
  primaryUserId: string,
  adminUserId: string,
  body: ScheduleBody
) {
  const ctx = await getOfflineUserContext(admin, primaryUserId);
  const learnerUserId = resolveLearnerUserIdForOfflineHub(ctx, primaryUserId, body.learnerUserId);
  if (!learnerUserId) {
    const isParent = (ctx.profile.user_type || '').toLowerCase() === 'parent';
    throw new Error(
      isParent
        ? 'No learner linked to this parent. Use “Add child learner” first, then import the period again.'
        : 'No learner linked to this account. Add a child first or specify learnerUserId.'
    );
  }

  const tutorResolved = await resolveTutorUserId(admin, body.tutor);
  const scheduleV2 = toScheduleV2(body.schedule);
  const isHistorical = body.isHistoricalImport ?? false;

  const { data: learnerProfile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', learnerUserId)
    .maybeSingle();

  const result = await scheduleOfflinePeriod(admin, {
    adminUserId,
    primaryUserId,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    tutorName: tutorResolved.tutorName,
    learnerDisplayNames: learnerProfile?.full_name || null,
    schedule: scheduleV2,
    commercial: {
      payPerMonthXaf: body.schedule.payPerMonthXaf,
      payMonthsCount: body.schedule.payMonthsCount,
      operationState: body.schedule.operationState,
      startMonthLabel: body.schedule.startMonthLabel,
    },
    isHistoricalImport: isHistorical,
    offlineOperationId: ctx.offlineOperationId,
    offlineRunId: ctx.run?.id || null,
    sendWelcomeEmail: body.sendWelcomeEmail ?? !isHistorical,
    skipReminders: isHistorical,
  });

  if (ctx.offlineOperationId && !isHistorical) {
    await admin
      .from('offline_operations')
      .update({
        onboarding_stage: 'active_sessions',
        tutor_user_id: tutorResolved.tutorUserId,
        learner_user_id: learnerUserId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ctx.offlineOperationId);
  }

  return { ...result, tutorUserId: tutorResolved.tutorUserId, learnerUserId };
}

export async function addChildToParent(
  admin: SupabaseClient,
  parentUserId: string,
  input: { fullName: string; email?: string; phone?: string }
) {
  const { data: parent } = await admin.from('profiles').select('id, user_type').eq('id', parentUserId).maybeSingle();
  if (!parent) throw new Error('Parent profile not found');
  if (parent.user_type && parent.user_type !== 'parent') {
    throw new Error('This account is not a parent. Only parent accounts can have children added.');
  }

  const email = input.email?.trim().toLowerCase() || generatedOfflineLearnerEmail();
  let learnerUserId: string;
  if (input.email?.trim()) {
    const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
    if (existing?.id) {
      learnerUserId = existing.id;
    } else {
      learnerUserId = await createLearnerProfile(admin, {
        email,
        fullName: input.fullName.trim(),
        phone: input.phone,
      });
    }
  } else {
    learnerUserId = await createLearnerProfile(admin, {
      email,
      fullName: input.fullName.trim(),
      phone: input.phone,
    });
  }

  await admin.from('parent_learners').upsert(
    { parent_user_id: parentUserId, learner_user_id: learnerUserId },
    { onConflict: 'parent_user_id,learner_user_id' }
  );

  return { learnerUserId, email };
}

export async function softAnonymizeOfflineUser(admin: SupabaseClient, primaryUserId: string) {
  const ctx = await getOfflineUserContext(admin, primaryUserId);
  const tag = crypto.randomBytes(8).toString('hex');
  const stamp = new Date().toISOString();

  const userIds = new Set<string>([primaryUserId]);
  for (const l of ctx.learners) userIds.add(l.id);

  for (const uid of userIds) {
    const removedEmail = `anon-${tag}-${uid.slice(0, 8)}@removed.prepskul.com`;
    await admin
      .from('profiles')
      .update({
        full_name: 'Anonymized user',
        email: removedEmail,
        phone_number: null,
        avatar_url: null,
        updated_at: stamp,
      })
      .eq('id', uid);

    try {
      await admin.auth.admin.updateUserById(uid, {
        email: removedEmail,
        user_metadata: { anonymized: true, anonymized_at: stamp },
      });
    } catch {
      /* auth user may not exist for legacy rows */
    }
  }

  const { data: ops } = await admin
    .from('offline_operations')
    .select('id, notes')
    .eq('primary_user_id', primaryUserId);

  for (const op of ops || []) {
    await admin
      .from('offline_operations')
      .update({
        customer_name: 'Anonymized',
        customer_whatsapp: '',
        notes: `[ANONYMIZED ${stamp}]\n${op.notes || ''}`.trim(),
        onboarding_stage: 'dropped',
        updated_at: stamp,
      })
      .eq('id', op.id);
  }

  return { anonymizedUserIds: [...userIds], stamp };
}

/**
 * Hard-delete an offline-enrolled user (parent or learner) while preserving the rows
 * the platform needs for tutor session counts and feedback ratings:
 * - individual_sessions (kept; learner/parent ids may FK-cascade if schema CASCADEs;
 *   we null them where we can to keep the row visible to tutor stats).
 * - session_learner_feedback / session_tutor_completion_reports (kept).
 * - session_payments / offline_scheduling_periods (kept for revenue).
 *
 * What we remove:
 * - auth.users entry (user can no longer sign in)
 * - profiles row (PII gone)
 *
 * The auth.users CASCADE on individual_sessions.learner_id (and similar) varies by
 * deployment; we therefore *first* null the learner/parent FKs on related rows so a
 * later auth.users delete cannot cascade them away.
 */
export async function hardDeleteOfflineUserKeepingStats(
  admin: SupabaseClient,
  primaryUserId: string
) {
  const ctx = await getOfflineUserContext(admin, primaryUserId);

  const userIdsToDelete = new Set<string>([primaryUserId]);
  for (const l of ctx.learners) userIdsToDelete.add(l.id);

  const stamp = new Date().toISOString();
  const removed: string[] = [];

  for (const uid of userIdsToDelete) {
    try {
      await admin
        .from('individual_sessions')
        .update({ parent_id: null, updated_at: stamp })
        .eq('parent_id', uid);
    } catch {
      /* schema may not support nulling parent_id; leave as-is */
    }
    try {
      await admin
        .from('individual_sessions')
        .update({ learner_id: null, updated_at: stamp })
        .eq('learner_id', uid);
    } catch {
      /* learner_id may be NOT NULL on some deployments; leave intact for tutor count */
    }
    try {
      await admin.from('parent_learners').delete().eq('parent_user_id', uid);
      await admin.from('parent_learners').delete().eq('learner_user_id', uid);
    } catch {
      /* legacy column names already aligned by phase2 fix */
    }

    try {
      await admin
        .from('offline_operations')
        .update({
          customer_name: 'Deleted user',
          customer_whatsapp: '',
          notes: `[DELETED ${stamp}]`,
          onboarding_stage: 'dropped',
          primary_user_id: null,
          learner_user_id: null,
          updated_at: stamp,
        })
        .or(`primary_user_id.eq.${uid},learner_user_id.eq.${uid}`);
    } catch {
      /* analytics row scrub */
    }

    await admin.from('profiles').delete().eq('id', uid);

    try {
      await admin.auth.admin.deleteUser(uid);
      removed.push(uid);
    } catch (err) {
      console.warn('[offline-user-delete] auth delete failed', uid, err);
    }
  }

  return { deletedUserIds: removed, stamp };
}

export function parseHistoricalCsv(text: string): ScheduleInput[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must include a header row and at least one data row');

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  const rows: ScheduleInput[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const get = (...names: string[]) => {
      for (const n of names) {
        const j = headers.indexOf(n);
        if (j >= 0 && cols[j]) return cols[j];
      }
      return '';
    };

    const startDate = get('startdate', 'start_date');
    const weeks = Number(get('weeks') || 4);
    const subjectsRaw = get('subjects');
    const subjects = subjectsRaw.includes('|') ? subjectsRaw.split('|') : subjectsRaw.split(';');
    const daySlotsRaw = get('daytimeslots', 'day_time_slots');
    let dayTimeSlots: { day: string; time: string }[] = [];
    if (daySlotsRaw) {
      dayTimeSlots = daySlotsRaw.split('|').map((pair) => {
        const [day, time] = pair.split(':');
        return { day: day.trim(), time: (time || '16:00').trim() };
      });
    } else {
      const days = get('weekdays', 'week_days').split('|').filter(Boolean);
      const time = get('sessiontime', 'session_time') || '16:00';
      dayTimeSlots = days.map((day) => ({ day, time }));
    }

    rows.push({
      weeks,
      sessionsPerWeek: Number(get('sessionsperweek', 'sessions_per_week') || dayTimeSlots.length || 2),
      dayTimeSlots,
      durationMinutes: Number(get('durationminutes', 'duration_minutes') || 60),
      startDate,
      deliveryMode: (get('deliverymode', 'delivery_mode') || 'online') as ScheduleInput['deliveryMode'],
      subjects: subjects.map((s) => s.trim()).filter(Boolean),
      meetLink: get('meetlink', 'meet_link') || null,
      onsiteLocation: get('onsitelocation', 'onsite_location') || null,
      payPerMonthXaf: get('paypermonth', 'pay_per_month') ? Number(get('paypermonth', 'pay_per_month')) : null,
      payMonthsCount: get('paymonths', 'pay_months') ? Number(get('paymonths', 'pay_months')) : null,
      operationState: (get('state', 'operation_state') || 'stopped') as ScheduleInput['operationState'],
      startMonthLabel: get('startmonth', 'start_month_label') || null,
    });
  }

  if (!rows.length) {
    throw new Error(
      'No valid rows. Headers: startDate, weeks, subjects, dayTimeSlots (mon:16:00|wed:16:00) OR weekdays, sessionTime'
    );
  }

  return rows;
}
