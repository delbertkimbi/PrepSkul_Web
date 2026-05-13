import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOpsAlertEmail } from '@/lib/ops-email';
import { sendCustomEmail } from '@/lib/notifications';

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

export async function notifyOpsLearnerFeedbackSubmitted(opts: {
  sessionId: string;
  rating: number;
  comment: string;
}) {
  const html = `
    <p>New <strong>learner session feedback</strong> was submitted.</p>
    <ul>
      <li><strong>Session:</strong> ${escapeHtml(opts.sessionId)}</li>
      <li><strong>Rating:</strong> ${opts.rating}</li>
      <li><strong>Comment:</strong> ${escapeHtml(opts.comment)}</li>
    </ul>
    <p>Open the offline operation detail page in admin to review and follow up.</p>
  `;
  return sendOpsAlertEmail(`Learner feedback: session ${opts.sessionId.slice(0, 8)}`, html);
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
    <p>A <strong>tutor session report</strong> was submitted via the tutor portal.</p>
    <ul>
      <li><strong>Session:</strong> ${escapeHtml(opts.sessionId)}</li>
      <li><strong>Tutor user:</strong> ${escapeHtml(opts.tutorId)}</li>
      <li><strong>Reported attended:</strong> ${opts.attended ? 'yes' : 'no'}</li>
      <li><strong>Topics:</strong> ${escapeHtml(opts.topicsCovered || '—')}</li>
      <li><strong>Engagement:</strong> ${escapeHtml(opts.learnerEngagement || '—')}</li>
      <li><strong>Issues:</strong> ${escapeHtml(opts.issues || '—')}</li>
    </ul>
    <p><em>Learner/tutor confirmation emails are sent only after an admin marks the session attended in the offline ops detail view.</em></p>
  `;
  return sendOpsAlertEmail(`Tutor report submitted: session ${opts.sessionId.slice(0, 8)}`, html);
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
  const learner = session.learner_id ? byId.get(session.learner_id) : null;
  const parent = session.parent_id ? byId.get(session.parent_id) : null;
  const familyRecipient = learner || parent;

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

  const targetId = opts.target === 'tutor' ? session.tutor_id : session.learner_id || session.parent_id;
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
  const opsHtml = `<p>Admin follow-up email sent for session <code>${escapeHtml(opts.sessionId)}</code> to <strong>${opts.target}</strong> (${escapeHtml(profile.email)}).</p>
    <p><strong>Subject:</strong> ${escapeHtml(opts.subject)}</p>
    <p><strong>Message:</strong></p><pre style="white-space:pre-wrap">${escapeHtml(opts.message)}</pre>
    ${wa ? `<p><a href="${wa}">Open WhatsApp with this message</a> (recipient phone on file)</p>` : '<p>No phone on file for WhatsApp deep link.</p>'}`;

  await sendOpsAlertEmail(`Admin follow-up (${opts.target}): ${opts.sessionId.slice(0, 8)}`, opsHtml);

  return { ok: true as const, email: profile.email, whatsappUrl: wa };
}
