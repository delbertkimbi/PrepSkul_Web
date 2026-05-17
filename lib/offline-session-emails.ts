import { sendCustomEmail } from '@/lib/notifications';
import { sendOpsAlertEmail } from '@/lib/ops-email';

const ADMIN_WHATSAPP = '+237653301997';
const COMMISSION_RATE = Number(process.env.PREPSKUL_COMMISSION_RATE || '0.15');

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatSessionWhen(date?: string | null, time?: string | null) {
  if (!date) return 'your upcoming session';
  const t = time ? String(time).slice(0, 5) : '';
  return `${date}${t ? ` at ${t}` : ''}`;
}

function deliveryBlock(opts: {
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
}) {
  const mode = (opts.deliveryMode || 'online').toLowerCase();
  if (mode === 'online' || mode === 'hybrid') {
    if (opts.meetLink) {
      return `<p><strong>Join online:</strong> <a href="${escapeHtml(opts.meetLink)}">${escapeHtml(opts.meetLink)}</a></p>`;
    }
  }
  if (mode === 'onsite' || mode === 'hybrid') {
    if (opts.onsiteLocation) {
      return `<p><strong>Onsite location:</strong> ${escapeHtml(opts.onsiteLocation)}</p>`;
    }
  }
  return '';
}

async function dispatchEmail(to: string, recipientName: string, subject: string, html: string) {
  return sendCustomEmail(to, recipientName, subject, html);
}

function portalCta(url: string, label: string) {
  return `
    <p style="margin:20px 0;">
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#1B2C4F;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:600;">${escapeHtml(label)}</a>
    </p>
    <p style="font-size:12px;color:#64748b;word-break:break-all;">Or open this link: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p>`;
}

function familyEmailShell(title: string, body: string) {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1B2C4F;">
      <h2 style="margin:0 0 12px;font-size:20px;">${escapeHtml(title)}</h2>
      ${body}
      <p style="margin-top:24px;font-size:13px;color:#64748b;">Warm regards,<br/>The PrepSkul Team</p>
    </div>`;
}

function adminSessionFooter(sessionId: string) {
  return `
    <hr style="margin-top:28px;border:none;border-top:1px solid #e2e8f0;" />
    <p style="font-size:12px;color:#64748b;margin-top:12px;">
      <strong>Session ID (admin):</strong>
      <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;user-select:all;">${escapeHtml(sessionId)}</code><br/>
      Use this ID in Admin → Sessions to locate this session.
    </p>`;
}

export async function sendOfflineWelcomeEmail(opts: {
  to: string;
  recipientName: string;
  tutorName: string;
  nextDate?: string | null;
  nextTime?: string | null;
  subject?: string | null;
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
  learnerPortalUrl?: string | null;
}) {
  const when = formatSessionWhen(opts.nextDate, opts.nextTime);
  const body = `
    <p>Hi ${escapeHtml(opts.recipientName)},</p>
    <p>Welcome to PrepSkul! You have been matched with tutor <strong>${escapeHtml(opts.tutorName)}</strong> for <strong>${escapeHtml(opts.subject || 'your lessons')}</strong>.</p>
    <p>Your next session is scheduled for <strong>${escapeHtml(when)}</strong>.</p>
    ${deliveryBlock(opts)}
    ${opts.learnerPortalUrl ? `<p>After each session, share feedback here: <a href="${escapeHtml(opts.learnerPortalUrl)}">Open your session page</a></p>` : ''}
    <p>We wish you a wonderful learning journey!</p>`;
  return dispatchEmail(
    opts.to,
    opts.recipientName,
    `Welcome to PrepSkul — matched with ${opts.tutorName}`,
    familyEmailShell('Welcome to PrepSkul', body)
  );
}

export async function sendSessionStartEmail(opts: {
  to: string;
  recipientName: string;
  tutorName?: string;
  learnerName?: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  subject?: string | null;
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
  portalUrl: string;
  role: 'tutor' | 'learner';
}) {
  const when = formatSessionWhen(opts.scheduledDate, opts.scheduledTime);
  const counterpart =
    opts.role === 'tutor'
      ? opts.learnerName || 'your learner'
      : opts.tutorName || 'your tutor';
  const body = `
    <p>Hi ${escapeHtml(opts.recipientName)},</p>
    <p>It is time for your PrepSkul session with <strong>${escapeHtml(counterpart)}</strong> (${escapeHtml(opts.subject || 'lesson')}) — <strong>${escapeHtml(when)}</strong>.</p>
    <p>We hope you have a wonderful session!</p>
    ${deliveryBlock(opts)}
    <p><a href="${escapeHtml(opts.portalUrl)}" style="display:inline-block;background:#1B2C4F;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;font-weight:600;">Open session page</a></p>
    <p style="font-size:13px;color:#64748b;">Use this link after class to submit feedback or request a reschedule if needed.</p>`;
  return dispatchEmail(
    opts.to,
    opts.recipientName,
    'Your PrepSkul session is starting now',
    familyEmailShell('Session starting now', body)
  );
}

export async function sendRescheduleRequestEmail(opts: {
  to: string;
  recipientName: string;
  requesterName: string;
  reason: string;
  proposedDate: string;
  proposedTime: string;
  portalUrl: string;
  recipientRole: 'tutor' | 'learner';
  sessionSubject?: string | null;
  currentDate?: string | null;
  currentTime?: string | null;
}) {
  const currentWhen = formatSessionWhen(opts.currentDate, opts.currentTime);
  const proposedWhen = formatSessionWhen(opts.proposedDate, opts.proposedTime);
  const requesterLabel =
    opts.recipientRole === 'tutor' ? 'A parent/learner' : 'Your tutor';
  const ctaLabel =
    opts.recipientRole === 'tutor' ? 'Open tutor session hub' : 'Review reschedule request';
  const body = `
    <p>Hi ${escapeHtml(opts.recipientName)},</p>
    <p><strong>${escapeHtml(requesterLabel)} (${escapeHtml(opts.requesterName)})</strong> requested to reschedule a PrepSkul session.</p>
    ${opts.sessionSubject ? `<p><strong>Subject:</strong> ${escapeHtml(opts.sessionSubject)}</p>` : ''}
    <p><strong>Current time:</strong> ${escapeHtml(currentWhen)}</p>
    <p><strong>Proposed new time:</strong> ${escapeHtml(proposedWhen)}</p>
    <p><strong>Reason:</strong> ${escapeHtml(opts.reason)}</p>
    <p>Please open your session page to <strong>approve or decline</strong> this change.</p>
    ${portalCta(opts.portalUrl, ctaLabel)}
    <p style="font-size:13px;color:#64748b;">This link is personal to you. Do not share it with others.</p>`;
  return dispatchEmail(
    opts.to,
    opts.recipientName,
    'PrepSkul — reschedule request awaiting your response',
    familyEmailShell('Reschedule request', body)
  );
}

export async function sendRescheduleDecisionEmail(opts: {
  to: string;
  recipientName: string;
  accepted: boolean;
  proposedDate: string;
  proposedTime: string;
  portalUrl?: string;
  recipientRole?: 'tutor' | 'learner';
}) {
  const proposedWhen = formatSessionWhen(opts.proposedDate, opts.proposedTime);
  const ctaLabel =
    opts.recipientRole === 'tutor' ? 'Open tutor session hub' : 'Open your session page';
  const body = opts.accepted
    ? `<p>Hi ${escapeHtml(opts.recipientName)},</p>
       <p>Your reschedule request was <strong>accepted</strong>. The session is now scheduled for <strong>${escapeHtml(proposedWhen)}</strong>.</p>
       ${opts.portalUrl ? portalCta(opts.portalUrl, ctaLabel) : ''}`
    : `<p>Hi ${escapeHtml(opts.recipientName)},</p>
       <p>Your reschedule request was <strong>declined</strong>. The original session time is unchanged.</p>
       <p>Please contact PrepSkul admins on WhatsApp: <strong>${escapeHtml(ADMIN_WHATSAPP)}</strong> if you need help.</p>
       ${opts.portalUrl ? portalCta(opts.portalUrl, ctaLabel) : ''}`;
  return dispatchEmail(
    opts.to,
    opts.recipientName,
    opts.accepted ? 'PrepSkul — reschedule accepted' : 'PrepSkul — reschedule declined',
    familyEmailShell(opts.accepted ? 'Reschedule accepted' : 'Reschedule declined', body)
  );
}

export async function sendOfflineReminderEmail(opts: {
  to: string;
  recipientName: string;
  reminderLabel: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  subject?: string | null;
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
}) {
  const when = formatSessionWhen(opts.scheduledDate, opts.scheduledTime);
  const body = `
    <p>Hi ${escapeHtml(opts.recipientName)},</p>
    <p>${escapeHtml(opts.reminderLabel)}: your <strong>${escapeHtml(opts.subject || 'PrepSkul')}</strong> session is on <strong>${escapeHtml(when)}</strong>.</p>
    ${deliveryBlock(opts)}`;
  return dispatchEmail(
    opts.to,
    opts.recipientName,
    `PrepSkul reminder — ${opts.reminderLabel}`,
    familyEmailShell('Session reminder', body)
  );
}

export async function notifyOpsWithSessionFooter(subject: string, htmlBody: string, sessionId: string) {
  return sendOpsAlertEmail(subject, htmlBody + adminSessionFooter(sessionId));
}

export { COMMISSION_RATE, ADMIN_WHATSAPP };
