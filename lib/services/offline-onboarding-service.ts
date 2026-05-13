import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

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

export type OfflineScheduleInput = {
  weeks: number;
  sessionsPerWeek: number;
  /** e.g. ['mon','wed'] */
  weekDays: string[];
  /** HH:mm */
  sessionTime: string;
  durationMinutes: number;
  /** First session anchor date YYYY-MM-DD */
  startDate: string;
  deliveryMode: 'online' | 'onsite' | 'hybrid';
  subject: string;
};

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
  const tokens = input.weekDays.map((d) => d.trim().toLowerCase().slice(0, 3));
  if (tokens.some((t) => WEEKDAY_MAP[t] === undefined)) {
    const bad = input.weekDays.find((d) => WEEKDAY_MAP[d.trim().toLowerCase().slice(0, 3)] === undefined);
    throw new Error(`Invalid weekday token: ${bad}. Use mon, tue, wed, thu, fri, sat, sun`);
  }

  const monday0 = mondayOfWeekContaining(anchor);
  const out: string[] = [];

  for (let w = 0; w < input.weeks; w++) {
    const weekStart = new Date(monday0);
    weekStart.setDate(weekStart.getDate() + w * 7);
    for (const wd of input.weekDays) {
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
        phone_number: input.phone || null,
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
  if (error || !data.user) throw new Error(error?.message || 'Failed to create auth user');
  const { error: pErr } = await admin.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: input.fullName,
    phone_number: input.phone || null,
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
      'This email is already registered on PrepSkul. Each offline parent/student contact must use a unique email that is not already used by another account.'
    );
  }
  const { data: loose } = await admin.from('profiles').select('id, email').ilike('email', normalized);
  const dup = (loose || []).find((r: any) => r.email && String(r.email).trim().toLowerCase() === normalized);
  if (dup) {
    throw new Error(
      'This email is already registered on PrepSkul. Each offline parent/student contact must use a unique email that is not already used by another account.'
    );
  }
}

function generatedOfflineLearnerEmail() {
  return `offline.learner.${crypto.randomBytes(16).toString('hex')}@account.prepskul.com`;
}

async function scheduleOfflineSessionReminders(
  admin: SupabaseClient,
  opts: {
    sessionId: string;
    sessionStartIso: string;
    subject: string;
    tutorUserId: string;
    learnerUserId: string;
    parentUserId?: string | null;
  }
) {
  const start = new Date(opts.sessionStartIso);
  const now = Date.now();
  const reminders = [
    { type: '24_hours', when: new Date(start.getTime() - 24 * 60 * 60 * 1000), title: 'Session reminder' },
    { type: '1_hour', when: new Date(start.getTime() - 60 * 60 * 1000), title: 'Session starts in 1 hour' },
  ].filter((r) => r.when.getTime() > now);

  if (reminders.length === 0) return;

  // Email/push reminders go to tutor + primary contact only (parent if present, else learner’s own account).
  const familyUserId = opts.parentUserId || opts.learnerUserId;
  const recipientIds = Array.from(new Set([opts.tutorUserId, familyUserId].filter(Boolean) as string[]));
  const rows: Array<Record<string, unknown>> = [];
  for (const recipientId of recipientIds) {
    for (const reminder of reminders) {
      rows.push({
        user_id: recipientId,
        notification_type: 'session_reminder',
        title: reminder.title,
        message: `Reminder: your ${opts.subject || 'PrepSkul'} session is upcoming.`,
        scheduled_for: reminder.when.toISOString(),
        status: 'pending',
        related_id: opts.sessionId,
        metadata: {
          session_id: opts.sessionId,
          reminder_type: reminder.type,
          session_start: start.toISOString(),
          action_url: `/sessions/${opts.sessionId}`,
          action_text: 'View session',
          sendEmail: true,
          sendPush: true,
        },
      });
    }
  }

  await admin.from('scheduled_notifications').insert(rows);
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
}) {
  if (params.idempotencyKey) {
    const { data: existing } = await admin
      .from('offline_onboarding_runs')
      .select('id, primary_user_id, learner_user_id, tutor_user_id, recurring_session_id, metadata')
      .eq('idempotency_key', params.idempotencyKey)
      .maybeSingle();
    if (existing) {
      return {
        runId: existing.id,
        primaryUserId: existing.primary_user_id,
        learnerUserId: existing.learner_user_id,
        tutorUserId: existing.tutor_user_id,
        tutorName: (existing.metadata as any)?.tutor_name || 'Tutor',
        recurringSessionId: existing.recurring_session_id,
        individualSessionIds: ((existing.metadata as any)?.session_ids || []) as string[],
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
  }

  const dates = enumerateSessionDates(params.schedule);
  const { h, m } = parseTime(params.schedule.sessionTime);
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

  const recurringPayload: Record<string, unknown> = {
    tutor_id: tutorResolved.tutorUserId,
    learner_id: learnerUserId,
    parent_id: params.primary.role === 'parent' ? primaryUserId : null,
    status: 'pending',
    subject: params.schedule.subject,
    updated_at: new Date().toISOString(),
  };

  const { data: recurring, error: recErr } = await admin
    .from('recurring_sessions')
    .insert(recurringPayload)
    .select('id')
    .maybeSingle();

  let recurringId: string | null = recurring?.id || null;
  if (recErr) {
    console.warn('[offline-onboarding] recurring_sessions insert failed, continuing with null FK', recErr);
  }

  const sessionIds: string[] = [];
  for (const dateStr of dates) {
    const row: Record<string, unknown> = {
      tutor_id: tutorResolved.tutorUserId,
      learner_id: learnerUserId,
      parent_id: params.primary.role === 'parent' ? primaryUserId : null,
      recurring_session_id: recurringId,
      scheduled_date: dateStr,
      scheduled_time: timeStr,
      duration_minutes: params.schedule.durationMinutes,
      status: 'pending',
      location: params.schedule.deliveryMode === 'online' ? 'online' : 'onsite',
      subject: params.schedule.subject,
      created_at: new Date().toISOString(),
    };
    let { data: ins, error: insErr } = await admin.from('individual_sessions').insert(row).select('id').maybeSingle();
    if (insErr && row.parent_id && /parent_id/i.test(insErr.message || '')) {
      // Some schemas enforce parent_id against a non-profile parent table; retry without parent_id to avoid blocking onboarding.
      const retryRow = { ...row, parent_id: null };
      const retry = await admin.from('individual_sessions').insert(retryRow).select('id').maybeSingle();
      ins = retry.data;
      insErr = retry.error;
    }
    if (insErr) {
      throw new Error(`Failed to create session for ${dateStr}: ${insErr.message}`);
    }
    if (ins?.id) sessionIds.push(ins.id);
    if (ins?.id) {
      await scheduleOfflineSessionReminders(admin, {
        sessionId: ins.id,
        sessionStartIso: `${dateStr}T${timeStr}`,
        subject: params.schedule.subject,
        tutorUserId: tutorResolved.tutorUserId,
        learnerUserId,
        parentUserId: params.primary.role === 'parent' ? primaryUserId : null,
      });
    }
  }

  const { data: run, error: runErr } = await admin
    .from('offline_onboarding_runs')
    .insert({
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
    })
    .select('id')
    .maybeSingle();

  if (runErr) {
    console.error('[offline-onboarding] run log insert failed', runErr);
  }

  return {
    runId: run?.id || null,
    primaryUserId,
    learnerUserId,
    tutorUserId: tutorResolved.tutorUserId,
    tutorName: tutorResolved.tutorName,
    recurringSessionId: recurringId,
    individualSessionIds: sessionIds,
  };
}
