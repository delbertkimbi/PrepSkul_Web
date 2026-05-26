import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOpsAlertEmail } from '@/lib/ops-email';
import { sendCustomEmail } from '@/lib/notifications';
import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email_templates/branded-layout';

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

export async function notifyOpsLearnerFeedbackSubmitted(opts: {
  sessionId: string;
  rating: number;
  comment: string;
}) {
  const html = `
    <p>A learner left feedback on an offline session. Please review when you can.</p>
    <div class="detail-box">
      <p><strong>Session ID:</strong> ${escapeHtml(opts.sessionId)}</p>
      <p><strong>Rating:</strong> ${opts.rating} / 5</p>
      <p><strong>Comment:</strong> ${escapeHtml(opts.comment || '—')}</p>
    </div>`;
  return sendOpsAlertEmail(`Learner feedback: session ${opts.sessionId.slice(0, 8)}`, html, {
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
}) {
  const html = `
    <p>A tutor submitted a session report through the portal.</p>
    <div class="detail-box">
      <p><strong>Session ID:</strong> ${escapeHtml(opts.sessionId)}</p>
      <p><strong>Reported attended:</strong> ${opts.attended ? 'Yes' : 'No'}</p>
      <p><strong>Topics covered:</strong> ${escapeHtml(opts.topicsCovered || '—')}</p>
      <p><strong>Learner engagement:</strong> ${escapeHtml(opts.learnerEngagement || '—')}</p>
      <p><strong>Issues noted:</strong> ${escapeHtml(opts.issues || '—')}</p>
    </div>
    <p style="font-size:13px;color:#64748b;">Family/tutor confirmation emails go out after you mark attendance in admin.</p>`;
  return sendOpsAlertEmail(`Tutor report submitted: session ${opts.sessionId.slice(0, 8)}`, html, {
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
  if (!opts.attended) {
    const html = `<p>Session <code>${escapeHtml(opts.sessionId)}</code> was marked <strong>not attended</strong> by an admin.</p>`;
    const ops = await sendOpsAlertEmail(`Session not attended (admin): ${opts.sessionId.slice(0, 8)}`, html);
    return { recipientEmails: [] as string[], opsEmails: ops.ok && ops.to ? [...ops.to] : [] };
  }

  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from('individual_sessions')
    .select('id, tutor_id, learner_id, parent_id, scheduled_date, scheduled_time, subject')
    .eq('id', opts.sessionId)
    .maybeSingle();
  if (!session) return { recipientEmails: [] as string[], opsEmails: [] as string[] };

  const ids = [session.tutor_id, session.learner_id, session.parent_id].filter(Boolean) as string[];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, phone_number').in('id', ids);
  const byId = new Map((profiles || []).map((p: any) => [p.id, p]));

  const tutor = byId.get(session.tutor_id);
  const familyRecipient = familyNotifyProfile(session, byId);

  const when = [session.scheduled_date, session.scheduled_time].filter(Boolean).join(' ') || 'your session';
  const subjLine = session.subject || 'PrepSkul session';

  const emailsSent: string[] = [];

  if (tutor?.email) {
    const body = `<p>Hi ${escapeHtml(tutor.full_name || 'Tutor')},</p>
      <p>An admin has confirmed attendance for your <strong>${escapeHtml(subjLine)}</strong> session scheduled for <strong>${escapeHtml(when)}</strong>.</p>
      <p>Thank you for teaching with PrepSkul.</p>`;
    const r = await sendCustomEmail(tutor.email, tutor.full_name || 'Tutor', 'Session attendance confirmed – PrepSkul', body);
    if (r.success) emailsSent.push(tutor.email);
  }

  if (familyRecipient?.email) {
    const body = `<p>Hi ${escapeHtml(familyRecipient.full_name || 'there')},</p>
      <p>An admin has confirmed that your <strong>${escapeHtml(subjLine)}</strong> session (${escapeHtml(when)}) took place as scheduled.</p>
      <p>If you have any questions, reply to this email or contact PrepSkul support.</p>`;
    const r = await sendCustomEmail(
      familyRecipient.email,
      familyRecipient.full_name || 'Learner',
      'Your session was confirmed – PrepSkul',
      body
    );
    if (r.success) emailsSent.push(familyRecipient.email);
  }

  const opsHtml = `
    <p>An admin marked session <strong>${escapeHtml(opts.sessionId)}</strong> as <strong>attended / completed</strong>.</p>
    <ul>
      <li>Subject: ${escapeHtml(subjLine)}</li>
      <li>When: ${escapeHtml(when)}</li>
      <li>Tutor email: ${escapeHtml(tutor?.email || '—')}</li>
      <li>Family email: ${escapeHtml(familyRecipient?.email || '—')}</li>
    </ul>
    <p>Emails attempted to recipients: ${emailsSent.length ? emailsSent.map(escapeHtml).join(', ') : 'none (missing profile emails or send failed)'}</p>
  `;
  const ops = await sendOpsAlertEmail(`Admin confirmed attendance: ${opts.sessionId.slice(0, 8)}`, opsHtml);

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

  const html = `<p>Hi ${escapeHtml(profile.full_name || '')},</p>
    <p>${escapeHtml(opts.message).replace(/\n/g, '<br/>')}</p>
    <hr/><p style="font-size:12px;color:#666">Session ID: ${escapeHtml(opts.sessionId)}<br/>
    Sent by PrepSkul admin${opts.adminName ? `: ${escapeHtml(opts.adminName)}` : ''}.</p>`;

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
  const byId = new Map((profiles || []).map((p: any) => [p.id, p]));

  const tutor = byId.get(session.tutor_id);
  const family = familyNotifyProfile(session, byId);

  const when = [session.scheduled_date, session.scheduled_time].filter(Boolean).join(' ') || 'scheduled time';
  const subjectName = session.subject || 'PrepSkul session';

  const sentTo: string[] = [];

  const brandedReminder = (name: string) =>
    buildBrandedEmailHtml({
      recipientName: name,
      title: 'Session reminder',
      bodyHtml: `<p>Our team wanted to remind you about your upcoming <strong>${escapeHtml(subjectName)}</strong> session.</p>
        <div class="detail-box"><p><strong>When:</strong> ${escapeHtml(when)}</p></div>
        <p>Please be ready to join on time. If you have any trouble, reply to us on WhatsApp and we'll help.</p>`,
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
