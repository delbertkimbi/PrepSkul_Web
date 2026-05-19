import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { scheduleOfflinePeriod } from '@/lib/services/offline-period-service';
import type { DayTimeSlot } from '@/lib/services/offline-schedule';

const WEEKDAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function mondayOfWeekContaining(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

/** PostgREST when a column is absent from the table / API schema cache */
function isPostgrestMissingColumnError(error: { message?: string; code?: string } | null | undefined) {
  const m = String(error?.message || '');
  const c = String(error?.code || '');
  return c === 'PGRST204' || m.includes('Could not find the') || m.includes('schema cache');
}

async function insertRecurringSessionCompat(
  admin: SupabaseClient,
  payload: Record<string, unknown>
): Promise<{ id: string | null; error: { message?: string; code?: string } | null }> {
  let { data, error } = await admin.from('recurring_sessions').insert(payload).select('id').maybeSingle();
  if (error && isPostgrestMissingColumnError(error) && 'parent_id' in payload) {
    const { parent_id: _p, ...rest } = payload;
    const r2 = await admin.from('recurring_sessions').insert(rest).select('id').maybeSingle();
    data = r2.data;
    error = r2.error;
  }
  return { id: (data as { id?: string } | null)?.id ?? null, error };
}

async function insertOfflineOnboardingRunCompat(
  admin: SupabaseClient,
  row: Record<string, unknown>
): Promise<{ id: string | null; error: { message?: string; code?: string } | null }> {
  let { data, error } = await admin.from('offline_onboarding_runs').insert(row).select('id').maybeSingle();
  if (error && isPostgrestMissingColumnError(error) && 'idempotency_key' in row) {
    const { idempotency_key: _ik, ...rest } = row;
    const r2 = await admin.from('offline_onboarding_runs').insert(rest).select('id').maybeSingle();
    data = r2.data;
    error = r2.error;
  }
  return { id: (data as { id?: string } | null)?.id ?? null, error };
}

async function findOfflineRunByIdempotencyKeyCompat(
  admin: SupabaseClient,
  key: string | null | undefined
): Promise<{
  id: string;
  primary_user_id: string;
  learner_user_id: string | null;
  tutor_user_id: string;
  recurring_session_id: string | null;
  metadata: unknown;
} | null> {
  if (!key) return null;
  const { data, error } = await admin
    .from('offline_onboarding_runs')
    .select('id, primary_user_id, learner_user_id, tutor_user_id, recurring_session_id, metadata')
    .eq('idempotency_key', key)
    .maybeSingle();
  if (error && isPostgrestMissingColumnError(error)) {
    console.warn(
      '[offline-onboarding] idempotency_key column missing on offline_onboarding_runs; idempotent replay disabled'
    );
    return null;
  }
  if (error) throw new Error(error.message || 'Failed to look up offline onboarding run');
  return data as {
    id: string;
    primary_user_id: string;
    learner_user_id: string | null;
    tutor_user_id: string;
    recurring_session_id: string | null;
    metadata: unknown;
  } | null;
}

export type OfflineScheduleInput = {
  weeks: number;
  sessionsPerWeek: number;
  /** e.g. ['mon','wed'] */
  weekDays?: string[];
  /** HH:mm — used when dayTimeSlots omitted */
  sessionTime?: string;
  /** Per-day times (preferred) */
  dayTimeSlots?: DayTimeSlot[];
  durationMinutes: number;
  startDate: string;
  deliveryMode: 'online' | 'onsite' | 'hybrid';
  /** Primary subject (legacy single) */
  subject: string;
  /** All subjects for the period */
  subjects?: string[];
  meetLink?: string | null;
  onsiteLocation?: string | null;
  onsitePhotoUrl?: string | null;
  payPerMonthXaf?: number | null;
  payMonthsCount?: number | null;
  operationState?: 'active' | 'paused' | 'stopped';
  startMonthLabel?: string | null;
};

type OfflineOnboardingTrackingInput = {
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  paymentEnvironment: 'real' | 'sandbox';
  amountPaid: number;
  packageTotalAmount?: number;
  nextFollowupAt?: string;
};

function toScheduleV2(schedule: OfflineScheduleInput) {
  const subjects =
    schedule.subjects?.length ? schedule.subjects : [schedule.subject].filter(Boolean);
  const dayTimeSlots =
    schedule.dayTimeSlots?.length ?
      schedule.dayTimeSlots
    : (schedule.weekDays || []).map((day) => ({ day, time: schedule.sessionTime || '16:00' }));
  if (!dayTimeSlots.length) throw new Error('Provide session days and times');
  return {
    weeks: schedule.weeks,
    sessionsPerWeek: schedule.sessionsPerWeek,
    dayTimeSlots,
    durationMinutes: schedule.durationMinutes,
    startDate: schedule.startDate,
    deliveryMode: schedule.deliveryMode,
    subjects,
    meetLink: schedule.meetLink,
    onsiteLocation: schedule.onsiteLocation,
    onsitePhotoUrl: schedule.onsitePhotoUrl,
  };
}

function parseTime(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  return { h: h || 9, m: m || 0 };
}

async function findAuthUserByEmail(admin: SupabaseClient, email: string): Promise<{ id: string } | null> {
  // Compatibility helper: some Supabase client versions don't expose getUserByEmail.
  const adminApi = (admin as any)?.auth?.admin;
  if (!adminApi) return null;

  const normalized = email.trim().toLowerCase();

  if (typeof adminApi.getUserByEmail === 'function') {
    const { data, error } = await adminApi.getUserByEmail(normalized);
    if (!error && data?.user?.id) return { id: data.user.id };
  }

  // Newer GoTrue admin APIs accept an email filter on listUsers (avoids full pagination).
  if (typeof adminApi.listUsers === 'function') {
    try {
      const { data: filtered } = await adminApi.listUsers({ page: 1, perPage: 2, email: normalized });
      const users: Array<{ id: string; email?: string | null }> = filtered?.users || [];
      const match = users.find((u) => (u.email || '').trim().toLowerCase() === normalized);
      if (match) return { id: match.id };
    } catch {
      /* older servers ignore unknown listUsers keys */
    }

    let page = 1;
    const perPage = 200;
    while (page <= 20) {
      const { data, error } = await adminApi.listUsers({ page, perPage });
      if (error) break;
      const users: Array<{ id: string; email?: string | null }> = data?.users || [];
      const match = users.find((u) => (u.email || '').trim().toLowerCase() === normalized);
      if (match) return { id: match.id };
      if (users.length < perPage) break;
      page += 1;
    }
  }

  return null;
}

/** profiles.email and tutor_profiles.email are case-sensitive in Postgres; auth email is usually lowercase. */
async function collectProfilesByEmailLoose(
  admin: SupabaseClient,
  normalizedEmail: string
): Promise<Array<{ id: string; full_name: string | null }>> {
  const { data: exact } = await admin.from('profiles').select('id, full_name, email').eq('email', normalizedEmail);
  if (exact?.length) {
    return exact.map(({ id, full_name }) => ({ id, full_name }));
  }
  const { data: ci } = await admin.from('profiles').select('id, full_name, email').ilike('email', normalizedEmail);
  return (ci || [])
    .filter((r) => r?.id && r.email && r.email.trim().toLowerCase() === normalizedEmail)
    .map(({ id, full_name }) => ({ id, full_name }));
}

async function collectTutorRowsByEmailLoose(
  admin: SupabaseClient,
  normalizedEmail: string
): Promise<Array<{ user_id: string; status: string | null }>> {
  // Not all deployments have tutor_profiles.email; keep this best-effort and non-fatal.
  const { data: exact, error: exactErr } = await admin
    .from('tutor_profiles')
    .select('user_id, status, email')
    .eq('email', normalizedEmail);
  if (!exactErr && exact?.length) {
    return exact.map((r) => ({ user_id: r.user_id, status: r.status }));
  }
  const { data: ci, error: ciErr } = await admin
    .from('tutor_profiles')
    .select('user_id, status, email')
    .ilike('email', normalizedEmail);
  if (ciErr) return [];
  return (ci || [])
    .filter((r) => r?.user_id && r.email && r.email.trim().toLowerCase() === normalizedEmail)
    .map((r) => ({ user_id: r.user_id, status: r.status }));
}

/** Enumerate session dates: for each week 0..weeks-1, for each weekday label, produce one local calendar date */
export function enumerateSessionDates(input: OfflineScheduleInput): string[] {
  const anchor = new Date(`${input.startDate}T12:00:00`);
  const weekDays = input.weekDays?.length
    ? input.weekDays
    : (input.dayTimeSlots || []).map((slot) => slot.day);
  const tokens = weekDays.map((d) => d.trim().toLowerCase().slice(0, 3));
  if (tokens.some((t) => WEEKDAY_MAP[t] === undefined)) {
    const bad = weekDays.find((d) => WEEKDAY_MAP[d.trim().toLowerCase().slice(0, 3)] === undefined);
    throw new Error(`Invalid weekday token: ${bad}. Use mon, tue, wed, thu, fri, sat, sun`);
  }

  const monday0 = mondayOfWeekContaining(anchor);
  const out: string[] = [];

  for (let w = 0; w < input.weeks; w++) {
    const weekStart = new Date(monday0);
    weekStart.setDate(weekStart.getDate() + w * 7);
    for (const wd of weekDays) {
      const targetDow = WEEKDAY_MAP[wd.trim().toLowerCase().slice(0, 3)];
      const d = new Date(weekStart);
      d.setDate(d.getDate() + ((targetDow + 7 - d.getDay()) % 7));
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      out.push(`${y}-${mo}-${da}`);
    }
  }
  return [...new Set(out)].sort();
}

export async function resolveTutorUserId(
  admin: SupabaseClient,
  opts: { tutorUserId?: string | null; tutorEmail?: string | null }
): Promise<{ tutorUserId: string; tutorName: string }> {
  const isApproved = (status: unknown) => String(status || '').trim().toLowerCase() === 'approved';
  /** Match learner-facing discovery: approved tutors who are not hidden (see app/tutor/[id]/page.tsx). */
  const isMatchableTutorRow = (row: { status?: string | null; is_hidden?: boolean | null }) =>
    isApproved(row.status) && row.is_hidden !== true;

  if (opts.tutorUserId) {
    const { data: profile } = await admin.from('profiles').select('id, full_name, user_type').eq('id', opts.tutorUserId).maybeSingle();
    if (!profile) throw new Error('Tutor user id not found in profiles');
    if (profile.user_type && profile.user_type !== 'tutor') {
      throw new Error('This user id is not a tutor account. Use the tutor’s auth user id or their login email.');
    }
    const { data: tp } = await admin
      .from('tutor_profiles')
      .select('status, is_hidden')
      .eq('user_id', opts.tutorUserId)
      .maybeSingle();
    if (!tp || !isMatchableTutorRow(tp)) {
      if (tp && isApproved(tp.status) && tp.is_hidden === true) {
        throw new Error(
          'This tutor is approved but their profile is hidden, so they do not appear in Find a tutor. Unhide the profile in admin or pick a visible tutor.'
        );
      }
      throw new Error('This tutor is not verified (approved) on PrepSkul. Only approved tutors can be matched.');
    }
    return { tutorUserId: opts.tutorUserId, tutorName: profile.full_name || 'Tutor' };
  }
  if (opts.tutorEmail) {
    const normalizedEmail = opts.tutorEmail.trim().toLowerCase();
    const candidateUserIds = new Set<string>();
    const candidateNames = new Map<string, string>();

    const profilesByEmail = await collectProfilesByEmailLoose(admin, normalizedEmail);
    for (const p of profilesByEmail) {
      candidateUserIds.add(p.id);
      if (p.full_name) candidateNames.set(p.id, p.full_name);
    }

    const authUser = await findAuthUserByEmail(admin, normalizedEmail);
    const authUserId = authUser?.id;
    if (authUserId) {
      candidateUserIds.add(authUserId);
      const { data: profileById } = await admin.from('profiles').select('id, full_name').eq('id', authUserId).maybeSingle();
      if (profileById?.full_name) candidateNames.set(authUserId, profileById.full_name);
    }

    const tutorRowsByEmail = await collectTutorRowsByEmailLoose(admin, normalizedEmail);
    for (const row of tutorRowsByEmail) {
      candidateUserIds.add(row.user_id);
    }

    if (candidateUserIds.size === 0) {
      throw new Error('No profile found for tutor email');
    }

    const { data: candidateTutorRows } = await admin
      .from('tutor_profiles')
      .select('user_id, status, is_hidden')
      .in('user_id', Array.from(candidateUserIds));

    const approvedVisible = (candidateTutorRows || []).find((row) => row?.user_id && isMatchableTutorRow(row));
    if (approvedVisible?.user_id) {
      const { data: prof } = await admin.from('profiles').select('user_type').eq('id', approvedVisible.user_id).maybeSingle();
      if (prof?.user_type && prof.user_type !== 'tutor') {
        throw new Error(
          'That email matched an account that is not a tutor. Use the same email the tutor uses to log in (see Admin → Tutors → profile email).'
        );
      }
      return {
        tutorUserId: approvedVisible.user_id,
        tutorName: candidateNames.get(approvedVisible.user_id) || 'Tutor',
      };
    }

    const anyApproved = (candidateTutorRows || []).some((row) => row?.user_id && isApproved(row.status));
    const approvedButHidden = (candidateTutorRows || []).some(
      (row) => row?.user_id && isApproved(row.status) && row.is_hidden === true
    );
    if (approvedButHidden) {
      throw new Error(
        'This tutor is approved but their profile is hidden, so they do not appear in Find a tutor. Unhide the profile in admin or pick a visible tutor.'
      );
    }
    if (anyApproved) {
      throw new Error('This tutor could not be matched (profile state mismatch). Check tutor user id and visibility in admin.');
    }
    throw new Error(
      'This tutor is not approved or not visible for matching. Only tutors who are approved and shown to learners can be matched.'
    );
  }
  throw new Error('Provide tutor user id or tutor email');
}

async function createAuthUserWithProfile(
  admin: SupabaseClient,
  input: { email: string; fullName: string; phone?: string; userType: string }
): Promise<{ userId: string; isNew: boolean }> {
  const email = input.email.trim().toLowerCase();
  const existing = await findAuthUserByEmail(admin, email);
  if (existing?.id) {
    const { error: pErr } = await admin.from('profiles').upsert(
      {
        id: existing.id,
        email,
        full_name: input.fullName,
        phone_number: null,
        user_type: input.userType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (pErr) {
      throw new Error(pErr.message || 'Failed to upsert profile');
    }

    // Extra safety: ensure the profile row actually exists (FKs may target profiles.id).
    const { data: profileRow, error: checkErr } = await admin
      .from('profiles')
      .select('id')
      .eq('id', existing.id)
      .maybeSingle();
    if (checkErr) throw new Error(checkErr.message || 'Failed to verify profile row');
    if (!profileRow) throw new Error('Profile row missing after upsert');
    return { userId: existing.id, isNew: false };
  }
  const password = crypto.randomBytes(18).toString('base64url');
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName, phone_number: input.phone || null },
  });
  if (error || !data.user) {
    if (/already|exist|registered/i.test(error?.message || '')) {
      const recovered = await findAuthUserByEmail(admin, email);
      if (recovered?.id) {
        const { error: recoverErr } = await admin.from('profiles').upsert(
          {
            id: recovered.id,
            email,
            full_name: input.fullName,
            phone_number: null,
            user_type: input.userType,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
        if (recoverErr) throw new Error(recoverErr.message || 'Failed to recover existing auth profile');
        return { userId: recovered.id, isNew: false };
      }
    }
    throw new Error(error?.message || 'Failed to create auth user');
  }
  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: input.fullName,
    phone_number: null,
    user_type: input.userType,
  });
  if (pErr) {
    console.error('[offline-onboarding] profile insert', pErr);
    throw new Error(pErr.message || 'Failed to create profile');
  }
  return { userId: data.user.id, isNew: true };
}

/** Primary contact email must not already exist on any profile (avoids wrong identity merges). */
async function assertPrimaryEmailAvailableForOfflineOnboarding(admin: SupabaseClient, email: string) {
  const normalized = email.trim().toLowerCase();
  const { data: exact } = await admin.from('profiles').select('id, email').eq('email', normalized).maybeSingle();
  if (exact) {
    throw new Error(
      'This email is already registered on PrepSkul (profiles table). If a previous enrollment failed partway, use "Existing PrepSkul account" or remove the test profile in Supabase, then try again.'
    );
  }
  const { data: loose } = await admin.from('profiles').select('id, email').ilike('email', normalized);
  const dup = (loose || []).find((r: any) => r.email && String(r.email).trim().toLowerCase() === normalized);
  if (dup) {
    throw new Error(
      'This email is already registered on PrepSkul (profiles table). If a previous enrollment failed partway, use "Existing PrepSkul account" or remove the test profile in Supabase, then try again.'
    );
  }

  const authUser = await findAuthUserByEmail(admin, normalized);
  if (authUser?.id) {
    // A previous failed offline onboarding may have created auth.users but failed
    // before profiles insert. Let createAuthUserWithProfile reclaim that auth user.
    const { data: profileById } = await admin.from('profiles').select('id').eq('id', authUser.id).maybeSingle();
    if (profileById?.id) {
      throw new Error(
        'This email is already registered on PrepSkul. If a previous enrollment failed partway, use "Existing PrepSkul account" or remove the test profile in Supabase, then try again.'
      );
    }
  }
}

function generatedOfflineLearnerEmail() {
  return `offline.learner.${crypto.randomBytes(16).toString('hex')}@account.prepskul.com`;
}

async function createOfflineOperationForEnrollment(
  admin: SupabaseClient,
  input: {
    agentName: string;
    sourceChannel: string;
    enrollmentKind: 'new' | 'existing';
    primaryUserId: string;
    primaryRole: 'parent' | 'student';
    primaryFullName: string;
    primaryPhone?: string | null;
    learnerUserId: string;
    tutorUserId: string;
    recurringSessionId?: string | null;
    offlineRunId?: string | null;
    schedule: OfflineScheduleInput;
    notes: string;
    tracking?: OfflineOnboardingTrackingInput;
  }
) {
  const expectedTotal =
    input.tracking?.packageTotalAmount !== undefined
      ? input.tracking.packageTotalAmount
      : input.tracking?.amountPaid;

  const { data: inserted, error } = await admin
    .from('offline_operations')
    .insert({
      agent_name: input.agentName,
      source_channel: input.sourceChannel,
      customer_name: input.primaryFullName,
      customer_whatsapp: input.primaryPhone || '',
      origin_kind: input.enrollmentKind,
      customer_role: input.primaryRole === 'parent' ? 'Parent' : 'Student',
      number_of_learners: 1,
      learner_educational_level: 'Captured in onboarding notes',
      subjects_of_interest: (input.schedule.subjects || [input.schedule.subject]).join(', '),
      tutor_match_type: 'platform_tutor',
      delivery_mode: input.schedule.deliveryMode,
      onboarding_stage: 'matched',
      sessions_completed: 0,
      payment_status: input.tracking?.paymentStatus || 'unpaid',
      payment_environment: input.tracking?.paymentEnvironment || 'real',
      amount_paid: input.tracking?.amountPaid || 0,
      started_at: `${input.schedule.startDate}T00:00:00.000Z`,
      next_followup_at: input.tracking?.nextFollowupAt
        ? new Date(input.tracking.nextFollowupAt).toISOString()
        : null,
      converted_to_platform: true,
      notes: input.notes,
    })
    .select('id')
    .maybeSingle();

  if (error || !inserted?.id) {
    throw new Error(error?.message || 'Failed to create offline operation');
  }

  const linkagePatch: Record<string, unknown> = {
    offline_run_id: input.offlineRunId || null,
    primary_user_id: input.primaryUserId,
    learner_user_id: input.learnerUserId,
    tutor_user_id: input.tutorUserId,
    recurring_session_id: input.recurringSessionId || null,
    expected_total_amount: expectedTotal,
  };
  const { error: linkErr } = await admin
    .from('offline_operations')
    .update(linkagePatch)
    .eq('id', inserted.id);
  if (linkErr) {
    console.warn('[offline-onboarding] offline_operations linkage update skipped', linkErr.message);
  }

  return inserted.id as string;
}

async function findLatestOfflineOperationId(admin: SupabaseClient, primaryUserId: string) {
  const { data } = await admin
    .from('offline_operations')
    .select('id')
    .eq('primary_user_id', primaryUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

/**
 * Onboard a learner who already has a PrepSkul account. We skip auth.user creation
 * and email-uniqueness checks; we just link the existing primary user (and optional
 * existing child) into the offline scheduling pipeline.
 */
export async function runOfflineOnboardingForExistingUser(admin: SupabaseClient, params: {
  idempotencyKey?: string;
  adminUserId: string;
  agentName: string;
  sourceChannel: string;
  primaryUserId: string;
  primaryRole: 'parent' | 'student';
  childUserId?: string | null;
  childFullName?: string | null;
  tutor: { tutorUserId?: string | null; tutorEmail?: string | null };
  schedule: OfflineScheduleInput;
  notes: string;
  tracking?: OfflineOnboardingTrackingInput;
}) {
  if (params.idempotencyKey) {
    const existing = await findOfflineRunByIdempotencyKeyCompat(admin, params.idempotencyKey);
    if (existing) {
      return {
        runId: existing.id,
        primaryUserId: existing.primary_user_id,
        learnerUserId: existing.learner_user_id,
        tutorUserId: existing.tutor_user_id,
        tutorName: (existing.metadata as any)?.tutor_name || 'Tutor',
        recurringSessionId: existing.recurring_session_id,
        individualSessionIds: ((existing.metadata as any)?.session_ids || []) as string[],
        offlineOperationId: await findLatestOfflineOperationId(admin, params.primaryUserId),
        idempotentReplay: true,
      };
    }
  }

  const { data: primaryProfile } = await admin
    .from('profiles')
    .select('id, full_name, email, user_type')
    .eq('id', params.primaryUserId)
    .maybeSingle();
  if (!primaryProfile) throw new Error('Existing PrepSkul account not found.');

  const tutorResolved = await resolveTutorUserId(admin, params.tutor);

  let learnerUserId = params.primaryUserId;
  if (params.primaryRole === 'parent') {
    if (params.childUserId) {
      learnerUserId = params.childUserId;
    } else if (params.childFullName?.trim()) {
      const { data: existingLink } = await admin
        .from('parent_learners')
        .select('learner_user_id')
        .eq('parent_user_id', params.primaryUserId)
        .limit(1)
        .maybeSingle();
      if (existingLink?.learner_user_id) {
        learnerUserId = existingLink.learner_user_id;
      } else {
        const generatedEmail = generatedOfflineLearnerEmail();
        const child = await createAuthUserWithProfile(admin, {
          email: generatedEmail,
          fullName: params.childFullName.trim(),
          userType: 'learner',
        });
        learnerUserId = child.userId;
      }
    } else {
      throw new Error('For parent accounts, provide the learner full name or pick an existing child.');
    }
  }

  const scheduleV2 = toScheduleV2(params.schedule);
  const recurringPayload: Record<string, unknown> = {
    tutor_id: tutorResolved.tutorUserId,
    learner_id: learnerUserId,
    parent_id: params.primaryRole === 'parent' ? params.primaryUserId : null,
    status: 'pending',
    subject: scheduleV2.subjects[0] || params.schedule.subject,
    updated_at: new Date().toISOString(),
  };
  const { id: recurringId, error: recErr } = await insertRecurringSessionCompat(admin, recurringPayload);
  if (recErr) {
    console.warn('[offline-onboarding] recurring_sessions insert failed, continuing with null FK', recErr);
  }

  const offlineOperationId = await createOfflineOperationForEnrollment(admin, {
    agentName: params.agentName,
    sourceChannel: params.sourceChannel,
    enrollmentKind: 'existing',
    primaryUserId: params.primaryUserId,
    primaryRole: params.primaryRole,
    primaryFullName: primaryProfile.full_name || 'Offline user',
    primaryPhone: null,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    recurringSessionId: recurringId,
    schedule: params.schedule,
    notes: params.notes,
    tracking: params.tracking,
  });

  const periodResult = await scheduleOfflinePeriod(admin, {
    adminUserId: params.adminUserId,
    primaryUserId: params.primaryUserId,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    tutorName: tutorResolved.tutorName,
    learnerDisplayNames:
      params.primaryRole === 'parent'
        ? params.childFullName?.trim() || null
        : primaryProfile.full_name,
    schedule: scheduleV2,
    offlineOperationId,
    commercial: {
      payPerMonthXaf: params.schedule.payPerMonthXaf,
      payMonthsCount: params.schedule.payMonthsCount,
      operationState: params.schedule.operationState,
      startMonthLabel: params.schedule.startMonthLabel,
    },
    sendWelcomeEmail: true,
  });

  const sessionIds = periodResult.sessionIds;
  const dates = periodResult.occurrences.map((o) => o.date);

  const { id: runId, error: runErr } = await insertOfflineOnboardingRunCompat(admin, {
    idempotency_key: params.idempotencyKey || null,
    created_by_admin_id: params.adminUserId,
    agent_name: params.agentName,
    source_channel: params.sourceChannel,
    primary_user_id: params.primaryUserId,
    primary_role: params.primaryRole,
    learner_user_id: learnerUserId,
    tutor_user_id: tutorResolved.tutorUserId,
    recurring_session_id: recurringId,
    scheduling: { ...params.schedule, sessionDates: dates, notes: params.notes },
    status: 'completed',
    metadata: {
      session_ids: sessionIds,
      tutor_name: tutorResolved.tutorName,
      existing_user: true,
    },
  });
  if (runErr) {
    console.warn('[offline-onboarding] offline_onboarding_runs insert failed (existing user path)', runErr);
  }

  if (runId) {
    const { error: opRunLinkErr } = await admin
      .from('offline_operations')
      .update({ offline_run_id: runId })
      .eq('id', offlineOperationId);
    if (opRunLinkErr) {
      console.warn('[offline-onboarding] offline operation run link update skipped', opRunLinkErr.message);
    }
  }

  return {
    runId: runId || null,
    primaryUserId: params.primaryUserId,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    tutorName: tutorResolved.tutorName,
    recurringSessionId: recurringId,
    individualSessionIds: sessionIds,
    offlineOperationId,
  };
}

export async function runOfflineOnboarding(admin: SupabaseClient, params: {
  idempotencyKey?: string;
  adminUserId: string;
  agentName: string;
  sourceChannel: string;
  primary: { fullName: string; email: string; phone?: string; role: 'parent' | 'student' };
  child?: { fullName: string; email?: string; phone?: string } | null;
  tutor: { tutorUserId?: string | null; tutorEmail?: string | null };
  schedule: OfflineScheduleInput;
  notes: string;
  tracking?: OfflineOnboardingTrackingInput;
}) {
  if (params.idempotencyKey) {
    const existing = await findOfflineRunByIdempotencyKeyCompat(admin, params.idempotencyKey);
    if (existing) {
      return {
        runId: existing.id,
        primaryUserId: existing.primary_user_id,
        learnerUserId: existing.learner_user_id,
        tutorUserId: existing.tutor_user_id,
        tutorName: (existing.metadata as any)?.tutor_name || 'Tutor',
        recurringSessionId: existing.recurring_session_id,
        individualSessionIds: ((existing.metadata as any)?.session_ids || []) as string[],
        offlineOperationId: await findLatestOfflineOperationId(admin, existing.primary_user_id),
        idempotentReplay: true,
      };
    }
  }

  await assertPrimaryEmailAvailableForOfflineOnboarding(admin, params.primary.email);

  const tutorResolved = await resolveTutorUserId(admin, params.tutor);

  let primaryUserId: string;
  let learnerUserId: string;

  if (params.primary.role === 'student') {
    const u = await createAuthUserWithProfile(admin, {
      email: params.primary.email,
      fullName: params.primary.fullName,
      phone: params.primary.phone,
      userType: 'learner',
    });
    primaryUserId = u.userId;
    learnerUserId = u.userId;
  } else {
    const parent = await createAuthUserWithProfile(admin, {
      email: params.primary.email,
      fullName: params.primary.fullName,
      phone: params.primary.phone,
      userType: 'parent',
    });
    primaryUserId = parent.userId;
    if (!params.child?.fullName?.trim()) {
      throw new Error('For parent accounts, provide the learner full name.');
    }
    const learnerEmail = params.child.email?.trim()
      ? params.child.email.trim().toLowerCase()
      : generatedOfflineLearnerEmail();
    if (params.child.email?.trim()) {
      await assertPrimaryEmailAvailableForOfflineOnboarding(admin, learnerEmail);
    }
    const child = await createAuthUserWithProfile(admin, {
      email: learnerEmail,
      fullName: params.child.fullName.trim(),
      phone: params.child.phone?.trim() || undefined,
      userType: 'learner',
    });
    learnerUserId = child.userId;
    await admin.from('parent_learners').upsert(
      { parent_user_id: primaryUserId, learner_user_id: learnerUserId },
      { onConflict: 'parent_user_id,learner_user_id' }
    );
  }

  const scheduleV2 = toScheduleV2(params.schedule);

  const recurringPayload: Record<string, unknown> = {
    tutor_id: tutorResolved.tutorUserId,
    learner_id: learnerUserId,
    parent_id: params.primary.role === 'parent' ? primaryUserId : null,
    status: 'pending',
    subject: scheduleV2.subjects[0] || params.schedule.subject,
    updated_at: new Date().toISOString(),
  };

  const { id: recurringId, error: recErr } = await insertRecurringSessionCompat(admin, recurringPayload);
  if (recErr) {
    console.warn('[offline-onboarding] recurring_sessions insert failed, continuing with null FK', recErr);
  }

  const offlineOperationId = await createOfflineOperationForEnrollment(admin, {
    agentName: params.agentName,
    sourceChannel: params.sourceChannel,
    enrollmentKind: 'new',
    primaryUserId,
    primaryRole: params.primary.role,
    primaryFullName: params.primary.fullName,
    primaryPhone: params.primary.phone || null,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    recurringSessionId: recurringId,
    schedule: params.schedule,
    notes: params.notes,
    tracking: params.tracking,
  });

  const periodResult = await scheduleOfflinePeriod(admin, {
    adminUserId: params.adminUserId,
    primaryUserId,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    tutorName: tutorResolved.tutorName,
    learnerDisplayNames:
      params.primary.role === 'parent' ? params.child?.fullName?.trim() || null : params.primary.fullName,
    schedule: scheduleV2,
    offlineOperationId,
    commercial: {
      payPerMonthXaf: params.schedule.payPerMonthXaf,
      payMonthsCount: params.schedule.payMonthsCount,
      operationState: params.schedule.operationState,
      startMonthLabel: params.schedule.startMonthLabel,
    },
    sendWelcomeEmail: true,
  });

  const sessionIds = periodResult.sessionIds;
  const dates = periodResult.occurrences.map((o) => o.date);

  const { id: runId, error: runErr } = await insertOfflineOnboardingRunCompat(admin, {
    idempotency_key: params.idempotencyKey || null,
    created_by_admin_id: params.adminUserId,
    agent_name: params.agentName,
    source_channel: params.sourceChannel,
    primary_user_id: primaryUserId,
    primary_role: params.primary.role,
    learner_user_id: learnerUserId,
    tutor_user_id: tutorResolved.tutorUserId,
    recurring_session_id: recurringId,
    scheduling: { ...params.schedule, sessionDates: dates, notes: params.notes },
    status: 'completed',
    metadata: { session_ids: sessionIds, tutor_name: tutorResolved.tutorName },
  });

  if (runErr) {
    console.warn('[offline-onboarding] run log insert failed; operation and sessions were created', runErr);
  }

  if (runId) {
    const { error: opRunLinkErr } = await admin
      .from('offline_operations')
      .update({ offline_run_id: runId })
      .eq('id', offlineOperationId);
    if (opRunLinkErr) {
      console.warn('[offline-onboarding] offline operation run link update skipped', opRunLinkErr.message);
    }
  }

  return {
    runId: runId || null,
    primaryUserId,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    tutorName: tutorResolved.tutorName,
    recurringSessionId: recurringId,
    individualSessionIds: sessionIds,
    offlineOperationId,
  };
}
