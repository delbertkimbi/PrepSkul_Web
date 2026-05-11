import { sendOpsAlertEmail } from '@/lib/ops-email';

const FROM =
  process.env.RESEND_FROM_EMAIL?.includes('@')
    ? `PrepSkul <${process.env.RESEND_FROM_EMAIL}>`
    : process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';

export type SendResult = { ok: boolean; to: string[]; error?: string };

/** Send one transactional email to specific addresses (not the ops list). */
export async function sendTransactionalEmail(to: string[], subject: string, html: string): Promise<SendResult> {
  const recipients = [...new Set(to.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (!recipients.length) return { ok: false, to: [], error: 'no_recipients' };
  if (!process.env.RESEND_API_KEY) {
    console.warn('[session-email] RESEND_API_KEY missing; skipping:', subject);
    return { ok: false, to: recipients, error: 'no_resend' };
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: recipients,
      subject,
      html,
    });
    return { ok: true, to: recipients };
  } catch (e: any) {
    console.error('[session-email] send failed', e);
    return { ok: false, to: recipients, error: e?.message || 'send_failed' };
  }
}

export async function notifyOpsLearnerFeedbackSubmitted(opts: {
  sessionId: string;
  rating: number;
  comment: string;
}) {
  const html = `<p><strong>Learner feedback submitted</strong></p>
    <ul>
      <li><strong>Session:</strong> ${opts.sessionId}</li>
      <li><strong>Rating:</strong> ${opts.rating}</li>
      <li><strong>Comment:</strong></li>
    </ul>
    <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(opts.comment)}</pre>
    <p>Open the offline operation detail page in admin to review and reply.</p>`;
  return sendOpsAlertEmail(`Learner feedback — session ${opts.sessionId.slice(0, 8)}`, html);
}

export async function notifyOpsTutorReportSubmitted(opts: {
  sessionId: string;
  tutorId: string;
  attended: boolean;
  topicsCovered?: string | null;
  learnerEngagement?: string | null;
  issues?: string | null;
}) {
  const html = `<p><strong>Tutor session report submitted</strong> (no learner emails sent until an admin marks attendance).</p>
    <ul>
      <li><strong>Session:</strong> ${opts.sessionId}</li>
      <li><strong>Tutor:</strong> ${opts.tutorId}</li>
      <li><strong>Reported attended:</strong> ${opts.attended ? 'yes' : 'no'}</li>
    </ul>
    ${opts.topicsCovered ? `<p><strong>Topics:</strong><br/><pre style="white-space:pre-wrap">${escapeHtml(opts.topicsCovered)}</pre></p>` : ''}
    ${opts.learnerEngagement ? `<p><strong>Engagement:</strong><br/><pre style="white-space:pre-wrap">${escapeHtml(opts.learnerEngagement)}</pre></p>` : ''}
    ${opts.issues ? `<p><strong>Issues:</strong><br/><pre style="white-space:pre-wrap">${escapeHtml(opts.issues)}</pre></p>` : ''}`;
  return sendOpsAlertEmail(`Tutor report — session ${opts.sessionId.slice(0, 8)}`, html);
}

export async function notifyPartiesAdminMarkedAttendance(opts: {
  sessionId: string;
  attended: boolean;
  subjectLabel: string;
  scheduledLabel: string;
  tutorEmail: string | null;
  learnerEmail: string | null;
  parentEmail: string | null;
}) {
  if (!opts.attended) return { ops: null as Awaited<ReturnType<typeof sendOpsAlertEmail>>, partyResults: [] as SendResult[] };

  const common = `<p>An administrator marked the following PrepSkul session as <strong>attended</strong>.</p>
    <ul>
      <li><strong>Session ID:</strong> ${opts.sessionId}</li>
      <li><strong>Subject:</strong> ${escapeHtml(opts.subjectLabel)}</li>
      <li><strong>Scheduled:</strong> ${escapeHtml(opts.scheduledLabel)}</li>
    </ul>
    <p style="margin-top:16px;font-size:12px;color:#666">If you have questions, contact PrepSkul support.</p>`;

  const opsHtml = `${common}`;
  const ops = await sendOpsAlertEmail(`Session marked attended — ${opts.sessionId.slice(0, 8)}`, opsHtml);

  const subject = `PrepSkul: session marked attended — ${opts.subjectLabel}`.slice(0, 200);
  const partyResults: SendResult[] = [];
  const sendOne = async (email: string | null) => {
    if (!email) return;
    const r = await sendTransactionalEmail([email], subject, `<p>Hello,</p>${common}`);
    partyResults.push(r);
  };
  await sendOne(opts.tutorEmail);
  await sendOne(opts.learnerEmail);
  if (opts.parentEmail && opts.parentEmail !== opts.learnerEmail) {
    await sendOne(opts.parentEmail);
  }

  return { ops, partyResults };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
