import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOpsAlertEmail } from '@/lib/ops-email';
import { sendCustomEmail } from '@/lib/notifications';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email_templates/branded-layout';

function waLink(phoneDigits: string, text: string) {
  const d = phoneDigits.replace(/\D/g, '');
  if (!d) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

/** Family-facing emails go to primary contact: parent when present, else learner (direct student uses their own email). */
function familyNotifyProfile(
  session: { parent_id?: string | null; learner_id?: string | null },
  byId: Map<string, { id: string; full_name?: string | null; email?: string | null; phone_number?: string | null }>
) {
  if (session.parent_id) {
    const p = byId.get(session.parent_id);
    if (p) return p;
  }
  if (session.learner_id) return byId.get(session.learner_id) || null;
  return null;
}

function formatWhen(scheduledDate?: string | null, scheduledTime?: string | null) {
  return [scheduledDate, scheduledTime ? String(scheduledTime).slice(0, 5) : null].filter(Boolean).join(' ') || 'your session';
}

export async function notifyOpsLearnerFeedbackSubmitted(opts: {
  sessionId: string;
  rating: number;
  comment: string;
  learnerName?: string | null;
  tutorName?: string | null;
}) {
  const html = `
    <p>A learner left feedback on an offline session.</p>
    <div class="detail-box">
      <p><strong>Learner:</strong> ${escapeHtml(opts.learnerName || 'Learner')}</p>
      <p><strong>Tutor:</strong> ${escapeHtml(opts.tutorName || 'Tutor')}</p>
      <p><strong>Rating:</strong> ${opts.rating} / 5</p>
      <p><strong>Comment:</strong> ${escapeHtml(opts.comment || '—')}</p>
    </div>`;
  return sendOpsAlertEmail('New learner feedback', html, {
    title: 'New learner feedback',
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com'}/admin/offline-ops`,
    actionText: 'Review in admin',
  });
}

export async function notifyOpsTutorSessionReportSubmitted(opts: {
  sessionId: string;
  tutorId: string;
  attended: boolean;
  topicsCovered?: string | null;
  learnerEngagement?: string | null;
  issues?: string | null;
  tutorName?: string | null;
  learnerName?: string | null;
}) {
  const html = `
    <p>A tutor submitted a session report.</p>
    <div class="detail-box">
      <p><strong>Tutor:</strong> ${escapeHtml(opts.tutorName || 'Tutor')}</p>
      <p><strong>Learner:</strong> ${escapeHtml(opts.learnerName || 'Learner')}</p>
      <p><strong>Reported attended:</strong> ${opts.attended ? 'Yes' : 'No'}</p>
      <p><strong>Topics covered:</strong> ${escapeHtml(opts.topicsCovered || '—')}</p>
      <p><strong>Learner engagement:</strong> ${escapeHtml(opts.learnerEngagement || '—')}</p>
      <p><strong>Issues noted:</strong> ${escapeHtml(opts.issues || '—')}</p>
    </div>
    <p style="font-size:13px;color:#64748b;">Family and tutor confirmation emails go out after you mark attendance in admin.</p>`;
  return sendOpsAlertEmail('Tutor session report submitted', html, {
    title: 'Tutor session report',
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com'}/admin/offline-ops`,
    actionText: 'Open offline ops',
  });
}

/** After admin marks attended — notify tutor, learner/parent, and ops. */
export async function notifyPartiesAfterAdminMarkedAttendance(opts: {
  sessionId: string;
  attended: boolean;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  subject?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('individual_sessions')
    .select('id, tutor_id, learner_id, parent_id, scheduled_date, scheduled_time, subject')
    .eq('id', opts.sessionId)
    .maybeSingle();

  const ids = session
    ? ([session.tutor_id, session.learner_id, session.parent_id].filter(Boolean) as string[])
    : [];
  const { data: profiles } = ids.length
    ? await supabase.from('profiles').select('id, full_name, email, phone_number').in('id', ids)
    : { data: [] as Array<{ id: string; full_name?: string | null; email?: string | null; phone_number?: string | null }> };
  const byId = new Map((profiles || []).map((p) => [p.id, p]));

  const tutor = session ? byId.get(session.tutor_id) : null;
  const familyRecipient = session ? familyNotifyProfile(session, byId) : null;
  const learner = session?.learner_id ? byId.get(session.learner_id) : null;
  const when = formatWhen(opts.scheduledDate ?? session?.scheduled_date, opts.scheduledTime ?? session?.scheduled_time);
  const subjLine = opts.subject || session?.subject || 'PrepSkul session';

  if (!opts.attended) {
    const html = `
      <p>A session was marked <strong>not attended</strong> in admin.</p>
      <ul>
        <li><strong>Learner:</strong> ${escapeHtml(learner?.full_name || familyRecipient?.full_name || '—')}</li>
        <li><strong>Tutor:</strong> ${escapeHtml(tutor?.full_name || '—')}</li>
        <li><strong>When:</strong> ${escapeHtml(when)}</li>
        <li><strong>Subject:</strong> ${escapeHtml(subjLine)}</li>
      </ul>`;
    const ops = await sendOpsAlertEmail('Session marked not attended', html);
    return { recipientEmails: [] as string[], opsEmails: ops.ok && ops.to ? [...ops.to] : [] };
  }

  if (!session) return { recipientEmails: [] as string[], opsEmails: [] as string[] };

  const emailsSent: string[] = [];

  if (tutor?.email) {
    const body = buildBrandedEmailHtml({
      recipientName: tutor.full_name || 'Tutor',
      title: 'Session confirmed',
      bodyHtml: `<p>Thank you — we've confirmed attendance for your <strong>${escapeHtml(subjLine)}</strong> session on <strong>${escapeHtml(when)}</strong>.</p>
        <p>We appreciate you teaching with PrepSkul.</p>`,
    });
    const r = await sendCustomEmail(tutor.email, tutor.full_name || 'Tutor', 'Session attendance confirmed – PrepSkul', body);
    if (r.success) emailsSent.push(tutor.email);
  }

  if (familyRecipient?.email) {
    const body = buildBrandedEmailHtml({
      recipientName: familyRecipient.full_name || 'there',
      title: 'Session confirmed',
      bodyHtml: `<p>We've confirmed that your <strong>${escapeHtml(subjLine)}</strong> session on <strong>${escapeHtml(when)}</strong> took place as scheduled.</p>
        <p>If you have any questions, just reply to this email — we're here to help.</p>`,
    });
    const r = await sendCustomEmail(
      familyRecipient.email,
      familyRecipient.full_name || 'Learner',
      'Your session was confirmed – PrepSkul',
      body
    );
    if (r.success) emailsSent.push(familyRecipient.email);
  }

  const opsHtml = `
    <p>An admin confirmed session attendance.</p>
    <ul>
      <li><strong>Learner:</strong> ${escapeHtml(learner?.full_name || familyRecipient?.full_name || '—')}</li>
      <li><strong>Tutor:</strong> ${escapeHtml(tutor?.full_name || '—')}</li>
      <li><strong>When:</strong> ${escapeHtml(when)}</li>
      <li><strong>Subject:</strong> ${escapeHtml(subjLine)}</li>
    </ul>`;
  const ops = await sendOpsAlertEmail('Session attendance confirmed', opsHtml);

  const opsEmails = ops.ok && ops.to ? [...ops.to] : [];
  return { recipientEmails: emailsSent, opsEmails };
}

export async function sendAdminFollowUpToParty(opts: {
  sessionId: string;
  target: 'tutor' | 'learner';
  subject: string;
  message: string;
  adminName?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('individual_sessions')
    .select('id, tutor_id, learner_id, parent_id')
    .eq('id', opts.sessionId)
    .maybeSingle();
  if (!session) return { ok: false as const, error: 'Session not found' };

  const targetId =
    opts.target === 'tutor'
      ? session.tutor_id
      : session.parent_id || session.learner_id;
  if (!targetId) return { ok: false as const, error: 'Recipient not found for this session' };

  const { data: profile } = await supabase.from('profiles').select('id, full_name, email, phone_number').eq('id', targetId).maybeSingle();
  if (!profile?.email) return { ok: false as const, error: 'Recipient has no email on file' };

  const html = buildBrandedEmailHtml({
    recipientName: profile.full_name || '',
    title: 'Message from PrepSkul',
    bodyHtml: `<p>${escapeHtml(opts.message).replace(/\n/g, '<br/>')}</p>
      <p style="font-size:12px;color:#666;margin-top:20px;">Sent by PrepSkul${opts.adminName ? ` (${escapeHtml(opts.adminName)})` : ''}.</p>`,
  });

  const send = await sendCustomEmail(profile.email, profile.full_name || 'PrepSkul member', opts.subject, html);
  if (!send.success) return { ok: false as const, error: send.error || 'Email failed' };

  const wa = profile.phone_number ? waLink(profile.phone_number, opts.message) : null;

  return { ok: true as const, email: profile.email, whatsappUrl: wa };
}

export async function sendAdminTriggeredSessionReminder(opts: {
  sessionId: string;
  adminName?: string;
}) {
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('individual_sessions')
    .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time')
    .eq('id', opts.sessionId)
    .maybeSingle();
  if (!session) return { ok: false as const, error: 'Session not found' };

  const ids = [session.tutor_id, session.learner_id, session.parent_id].filter(Boolean) as string[];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', ids);
  const byId = new Map((profiles || []).map((p) => [p.id, p]));

  const tutor = byId.get(session.tutor_id);
  const family = familyNotifyProfile(session, byId);

  const when = formatWhen(session.scheduled_date, session.scheduled_time);
  const subjectName = session.subject || 'PrepSkul session';

  const sentTo: string[] = [];

  const brandedReminder = (name: string) =>
    buildBrandedEmailHtml({
      recipientName: name,
      title: 'Session reminder',
      bodyHtml: `<p>Just a friendly reminder about your upcoming <strong>${escapeHtml(subjectName)}</strong> session.</p>
        <div class="detail-box"><p><strong>When:</strong> ${escapeHtml(when)}</p></div>
        <p>Please be ready to join on time. If you need help, reply to us on WhatsApp and we'll assist you.</p>`,
    });

  if (tutor?.email) {
    const html = brandedReminder(tutor.full_name || 'Tutor');
    const r = await sendCustomEmail(
      tutor.email,
      tutor.full_name || 'Tutor',
      `Session reminder: ${subjectName}`,
      html
    );
    if (r.success) sentTo.push(tutor.email);
  }

  if (family?.email) {
    const html = brandedReminder(family.full_name || 'there');
    const r = await sendCustomEmail(
      family.email,
      family.full_name || 'PrepSkul family',
      `Class reminder: ${subjectName}`,
      html
    );
    if (r.success) sentTo.push(family.email);
  }

  return {
    ok: true as const,
    sentTo,
    opsEmails: [] as string[],
  };
}
