import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  buildSessionPortalUrls,
  createSessionPortalToken,
  verifySessionPortalAccessToken,
} from '@/lib/services/session-portal-access';
import {
  fetchPendingRescheduleRequest,
  getReschedulePortalFlags,
} from '@/lib/services/session-reschedule';

export { buildSessionPortalUrls, createSessionPortalToken };

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function ensureSessionPortalTokens(sessionId: string, expiresInDays = 90) {
  const urls = buildSessionPortalUrls(sessionId, expiresInDays);
  return {
    expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
    ...urls,
    tutorRawToken: urls.tutorToken,
    learnerRawToken: urls.learnerToken,
  };
}

export async function verifyPortalToken(
  rawToken: string,
  purpose: 'tutor_report' | 'learner_feedback'
) {
  if (rawToken.includes('.')) {
    try {
      const access = verifySessionPortalAccessToken(rawToken);
      if (access.purpose !== purpose) throw new Error('Invalid token for this portal');
      return {
        id: 'signed',
        individual_session_id: access.sessionId,
        purpose,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        used_at: null as string | null,
        is_persistent: true,
      };
    } catch {
      /* fall through to legacy DB token */
    }
  }

  const supabase = getSupabaseAdmin();
  const tokenHash = sha256(rawToken);
  const { data, error } = await supabase
    .from('session_portal_tokens')
    .select('id, individual_session_id, purpose, expires_at, used_at, is_persistent')
    .eq('token_hash', tokenHash)
    .eq('purpose', purpose)
    .maybeSingle();
  if (error || !data) throw new Error('Invalid token');
  if (data.is_persistent !== true && data.used_at) throw new Error('Token already used');
  if (new Date(data.expires_at).getTime() < Date.now()) throw new Error('Token expired');
  return data;
}

export function verifyPortalTokenAny(rawToken: string) {
  if (rawToken.includes('.')) {
    const access = verifySessionPortalAccessToken(rawToken);
    return {
      id: 'signed',
      individual_session_id: access.sessionId,
      purpose: access.purpose,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      used_at: null as string | null,
      is_persistent: true,
    };
  }
  throw new Error('Invalid token');
}

export async function markTokenUsed(_tokenId: string) {
  /* Signed tokens remain valid for portal hub; submission guarded by DB */
}

export async function getSessionPortalContext(rawToken: string, purpose?: 'tutor_report' | 'learner_feedback') {
  const verified = purpose
    ? await verifyPortalToken(rawToken, purpose)
    : verifyPortalTokenAny(rawToken);
  const resolvedPurpose = (verified.purpose || purpose) as 'tutor_report' | 'learner_feedback';
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('individual_sessions')
    .select(
      'id, tutor_id, learner_id, parent_id, scheduled_date, scheduled_time, subject, status, delivery_mode, meet_link, onsite_location, offline_scheduling_period_id'
    )
    .eq('id', verified.individual_session_id)
    .maybeSingle();
  if (!session) throw new Error('Session not found');

  let subjects: string[] = [];
  if (session.offline_scheduling_period_id) {
    const { data: period } = await supabase
      .from('offline_scheduling_periods')
      .select('subjects')
      .eq('id', session.offline_scheduling_period_id)
      .maybeSingle();
    if (Array.isArray(period?.subjects)) subjects = period.subjects as string[];
  }
  if (!subjects.length && session.subject) subjects = [session.subject];

  const { row: pendingReschedule, error: rescheduleLookupError } = await fetchPendingRescheduleRequest(
    supabase,
    session.id
  );

  const { data: tutorReport } = await supabase
    .from('session_tutor_completion_reports')
    .select('id')
    .eq('individual_session_id', session.id)
    .maybeSingle();

  const { data: learnerFeedback } = await supabase
    .from('session_learner_feedback')
    .select('id')
    .eq('individual_session_id', session.id)
    .maybeSingle();

  const portalRole = resolvedPurpose === 'tutor_report' ? ('tutor' as const) : ('learner' as const);
  const participantUserId =
    portalRole === 'tutor' ? session.tutor_id : session.parent_id || session.learner_id;

  const pending = pendingReschedule || null;
  const { canRespondToReschedule, awaitingRescheduleApproval } = getReschedulePortalFlags(
    session,
    pending,
    portalRole
  );

  const urls = buildSessionPortalUrls(session.id);
  const rescheduleUrl = portalRole === 'tutor' ? urls.tutorRescheduleUrl : urls.learnerRescheduleUrl;
  const feedbackUrl = portalRole === 'tutor' ? urls.tutorReportUrl : urls.learnerFeedbackUrl;

  return {
    token: verified,
    session,
    subjects,
    pendingReschedule: pending,
    canRespondToReschedule,
    awaitingRescheduleApproval,
    participantUserId,
    hasSubmittedReport: !!tutorReport,
    hasSubmittedFeedback: !!learnerFeedback,
    portalRole,
    rescheduleLookupError,
    rescheduleUrl,
    feedbackUrl,
  };
}
