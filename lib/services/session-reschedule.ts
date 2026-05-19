import type { SupabaseClient } from '@supabase/supabase-js';

export type PendingRescheduleRow = {
  id: string;
  individual_session_id?: string;
  session_id?: string;
  requested_by_user_id: string;
  reason: string;
  proposed_date: string;
  proposed_time: string;
  status: string;
  created_at?: string;
};

type SessionParties = {
  tutor_id: string | null;
  learner_id: string | null;
  parent_id: string | null;
};

function normId(id: string | null | undefined) {
  return id ? String(id).toLowerCase() : '';
}

export function isTutorRescheduleRequest(session: SessionParties, pending: PendingRescheduleRow) {
  return normId(pending.requested_by_user_id) === normId(session.tutor_id);
}

export function isFamilyRescheduleRequest(session: SessionParties, pending: PendingRescheduleRow) {
  const req = normId(pending.requested_by_user_id);
  return req === normId(session.parent_id) || req === normId(session.learner_id);
}

export function getReschedulePortalFlags(
  session: SessionParties,
  pending: PendingRescheduleRow | null,
  portalRole: 'tutor' | 'learner'
) {
  if (!pending || pending.status !== 'pending') {
    return { canRespondToReschedule: false, awaitingRescheduleApproval: false };
  }

  const tutorRequested = isTutorRescheduleRequest(session, pending);
  const familyRequested = isFamilyRescheduleRequest(session, pending);

  if (portalRole === 'learner') {
    return {
      canRespondToReschedule: tutorRequested,
      awaitingRescheduleApproval: familyRequested,
    };
  }

  return {
    canRespondToReschedule: familyRequested,
    awaitingRescheduleApproval: tutorRequested,
  };
}

export async function fetchPendingRescheduleRequest(
  admin: SupabaseClient,
  sessionId: string
): Promise<{ row: PendingRescheduleRow | null; error: string | null }> {
  const base = () =>
    admin
      .from('session_reschedule_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);

  let { data, error } = await base().eq('individual_session_id', sessionId).maybeSingle();

  if (error && /individual_session_id|column/i.test(error.message || '')) {
    const legacy = await base().eq('session_id', sessionId).maybeSingle();
    data = legacy.data;
    error = legacy.error;
  }

  if (error) {
    console.error('fetchPendingRescheduleRequest', sessionId, error.message);
    return { row: null, error: error.message };
  }

  return { row: (data as PendingRescheduleRow | null) || null, error: null };
}

export async function insertPendingRescheduleRequest(
  admin: SupabaseClient,
  row: {
    sessionId: string;
    requestedByUserId: string;
    reason: string;
    proposedDate: string;
    proposedTime: string;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const payload = {
    individual_session_id: row.sessionId,
    requested_by_user_id: row.requestedByUserId,
    reason: row.reason,
    proposed_date: row.proposedDate,
    proposed_time: row.proposedTime,
    status: 'pending' as const,
  };

  let { error } = await admin.from('session_reschedule_requests').insert(payload);

  if (error && /individual_session_id|column/i.test(error.message || '')) {
    const legacy = await admin.from('session_reschedule_requests').insert({
      session_id: row.sessionId,
      requested_by_user_id: row.requestedByUserId,
      reason: row.reason,
      proposed_date: row.proposedDate,
      proposed_time: row.proposedTime,
      status: 'pending',
    });
    error = legacy.error;
  }

  if (error) {
    console.error('insertPendingRescheduleRequest', row.sessionId, error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
