import type { SupabaseClient } from '@supabase/supabase-js';

const COMPLETED_STATUSES = ['completed', 'evaluated'];

export type TutorPublicStats = {
  tutorUserId: string;
  totalSessions: number;
  totalStudents: number;
  offlineEarningsXaf: number;
};

/** Recompute denormalized tutor_profiles stats (on + off platform). */
export async function refreshTutorPublicStats(
  admin: SupabaseClient,
  tutorUserId: string
): Promise<void> {
  const { error } = await admin.rpc('refresh_tutor_public_stats', {
    p_tutor_user_id: tutorUserId,
  });
  if (error) throw error;
}

export async function refreshAllTutorPublicStats(admin: SupabaseClient): Promise<number> {
  const { data: tutors, error } = await admin
    .from('tutor_profiles')
    .select('user_id')
    .not('user_id', 'is', null);
  if (error) throw error;

  let count = 0;
  for (const row of tutors || []) {
    if (!row.user_id) continue;
    await refreshTutorPublicStats(admin, row.user_id);
    count += 1;
  }
  return count;
}

/** Compute stats in-process when RPC is unavailable (fallback for admin tools). */
export async function computeTutorPublicStats(
  admin: SupabaseClient,
  tutorUserId: string
): Promise<TutorPublicStats> {
  const { data: sessions } = await admin
    .from('individual_sessions')
    .select('id, learner_id, parent_id, status')
    .eq('tutor_id', tutorUserId);

  const completed = (sessions || []).filter((s) =>
    COMPLETED_STATUSES.includes(String(s.status || '').toLowerCase())
  );

  const learnerKeys = new Set<string>();
  for (const s of completed) {
    const key = (s.learner_id || s.parent_id) as string | null;
    if (key) learnerKeys.add(key);
  }

  const { data: trials } = await admin
    .from('trial_sessions')
    .select('learner_id, status')
    .eq('tutor_id', tutorUserId)
    .in('status', ['completed', 'no_show_tutor', 'no_show_learner', 'missed']);

  for (const t of trials || []) {
    if (t.learner_id) learnerKeys.add(t.learner_id as string);
  }

  const { data: periods } = await admin
    .from('offline_scheduling_periods')
    .select('expected_period_revenue_xaf, operation_state')
    .eq('tutor_user_id', tutorUserId);

  const offlineEarnings = (periods || []).reduce((sum, p) => {
    if (String(p.operation_state || 'active').toLowerCase() !== 'active') return sum;
    return sum + Math.round(Number(p.expected_period_revenue_xaf || 0) * 0.85);
  }, 0);

  return {
    tutorUserId,
    totalSessions: completed.length,
    totalStudents: learnerKeys.size,
    offlineEarningsXaf: offlineEarnings,
  };
}
