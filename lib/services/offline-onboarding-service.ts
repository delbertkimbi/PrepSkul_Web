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
  if (opts.tutorUserId) {
    const { data: profile } = await admin.from('profiles').select('id, full_name, user_type').eq('id', opts.tutorUserId).maybeSingle();
    if (!profile) throw new Error('Tutor user id not found in profiles');
    const { data: tp } = await admin.from('tutor_profiles').select('status, full_name').eq('user_id', opts.tutorUserId).maybeSingle();
    if (!tp || tp.status !== 'approved') {
      throw new Error('This tutor is not verified (approved) on PrepSkul. Only approved tutors can be matched.');
    }
    return { tutorUserId: opts.tutorUserId, tutorName: (tp as { full_name?: string }).full_name || profile.full_name || 'Tutor' };
  }
  if (opts.tutorEmail) {
    const { data: prof } = await admin.from('profiles').select('id, full_name').ilike('email', opts.tutorEmail.trim()).maybeSingle();
    if (!prof) throw new Error('No profile found for tutor email');
    const { data: tp } = await admin.from('tutor_profiles').select('status, full_name').eq('user_id', prof.id).maybeSingle();
    if (!tp || tp.status !== 'approved') {
      throw new Error('This tutor is not verified (approved) on PrepSkul.');
    }
    return { tutorUserId: prof.id, tutorName: (tp as { full_name?: string }).full_name || prof.full_name || 'Tutor' };
  }
  throw new Error('Provide tutor user id or tutor email');
}

async function createAuthUserWithProfile(
  admin: SupabaseClient,
  input: { email: string; fullName: string; phone?: string; userType: string }
): Promise<{ userId: string; isNew: boolean }> {
  const email = input.email.trim().toLowerCase();
  const existing = await admin.auth.admin.getUserByEmail(email);
  if (existing.data.user) {
    await admin.from('profiles').upsert(
      {
        id: existing.data.user.id,
        email,
        full_name: input.fullName,
        phone_number: input.phone || null,
        user_type: input.userType,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return { userId: existing.data.user.id, isNew: false };
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

export async function runOfflineOnboarding(admin: SupabaseClient, params: {
  idempotencyKey?: string;
  adminUserId: string;
  agentName: string;
  sourceChannel: string;
  primary: { fullName: string; email: string; phone?: string; role: 'parent' | 'student' };
  child?: { fullName: string; email: string; phone?: string } | null;
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
    if (!params.child?.email) {
      throw new Error('For parent accounts, provide learner name and email (child learner account).');
    }
    const child = await createAuthUserWithProfile(admin, {
      email: params.child.email,
      fullName: params.child.fullName,
      phone: params.child.phone,
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
    status: 'pending_tutor_approval',
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
      status: 'pending_tutor_approval',
      location: params.schedule.deliveryMode === 'online' ? 'online' : 'onsite',
      subject: params.schedule.subject,
      created_at: new Date().toISOString(),
    };
    const { data: ins, error: insErr } = await admin.from('individual_sessions').insert(row).select('id').maybeSingle();
    if (insErr) {
      throw new Error(`Failed to create session for ${dateStr}: ${insErr.message}`);
    }
    if (ins?.id) sessionIds.push(ins.id);
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
