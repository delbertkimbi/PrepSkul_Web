import type { SupabaseClient } from '@supabase/supabase-js';
import { buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import { sendRescheduleRequestEmail } from '@/lib/offline-session-emails';

export type SessionParties = {
  id: string;
  tutor_id: string | null;
  learner_id: string | null;
  parent_id: string | null;
  subject?: string | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
};

export async function resolveParticipantContact(
  admin: SupabaseClient,
  userId: string
): Promise<{ email: string; fullName: string } | null> {
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  const email = profile?.email?.trim();
  if (email) {
    return { email, fullName: profile?.full_name?.trim() || 'there' };
  }

  const { data: tutorRow } = await admin
    .from('tutor_profiles')
    .select('email')
    .eq('user_id', userId)
    .maybeSingle();

  const tutorEmail = tutorRow?.email?.trim();
  if (tutorEmail) {
    return { email: tutorEmail, fullName: profile?.full_name?.trim() || 'Tutor' };
  }

  return null;
}

export function counterpartyUserId(
  session: Pick<SessionParties, 'tutor_id' | 'learner_id' | 'parent_id'>,
  requesterRole: 'tutor' | 'learner'
) {
  return requesterRole === 'tutor' ? session.parent_id || session.learner_id : session.tutor_id;
}

export async function emailRescheduleRequestToCounterparty(
  admin: SupabaseClient,
  opts: {
    session: SessionParties;
    requesterRole: 'tutor' | 'learner';
    requesterName: string;
    reason: string;
    proposedDate: string;
    proposedTime: string;
  }
): Promise<{ sent: boolean; error?: string }> {
  const counterpartyRole = opts.requesterRole === 'tutor' ? ('learner' as const) : ('tutor' as const);
  const counterpartyId = counterpartyUserId(opts.session, opts.requesterRole);
  if (!counterpartyId) {
    return { sent: false, error: 'Counterparty user id missing on session' };
  }

  const contact = await resolveParticipantContact(admin, counterpartyId);
  if (!contact) {
    return { sent: false, error: 'Counterparty has no email on file' };
  }

  const urls = buildSessionPortalUrls(opts.session.id);
  const portalUrl = counterpartyRole === 'tutor' ? urls.tutorRescheduleUrl : urls.learnerRescheduleUrl;

  const result = await sendRescheduleRequestEmail({
    to: contact.email,
    recipientName: contact.fullName,
    requesterName: opts.requesterName,
    reason: opts.reason,
    proposedDate: opts.proposedDate,
    proposedTime: opts.proposedTime,
    portalUrl,
    recipientRole: counterpartyRole,
    sessionSubject: opts.session.subject,
    currentDate: opts.session.scheduled_date,
    currentTime: opts.session.scheduled_time,
  });

  if (!result.success) {
    console.error('emailRescheduleRequestToCounterparty', opts.session.id, result.error);
    return { sent: false, error: result.error || 'Failed to send email' };
  }

  return { sent: true };
}
