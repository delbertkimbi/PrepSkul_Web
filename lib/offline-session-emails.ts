import { sendCustomEmail } from '@/lib/notifications';
import { sendOpsAlertEmail } from '@/lib/ops-email';
import {
  buildBrandedEmailHtml,
  escapeHtml,
  sessionDetailsBox,
} from '@/lib/email_templates/branded-layout';

import { ADMIN_WHATSAPP, COMMISSION_RATE, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';

function formatSessionWhen(date?: string | null, time?: string | null) {
  if (!date) return 'your upcoming session';
  const timeStr = time ? String(time).slice(0, 5) : '';
  try {
    const parsed = new Date(`${date}T${timeStr || '09:00'}:00`);
    if (!Number.isNaN(parsed.getTime())) {
      const datePart = parsed.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!timeStr) return datePart;
      const timePart = parsed.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      return `${datePart} at ${timePart}`;
    }
  } catch {
    /* fall through */
  }
  return timeStr ? `${date} at ${timeStr}` : date;
}

async function sendBrandedOfflineEmail(
  to: string,
  recipientName: string,
  subject: string,
  title: string,
  bodyHtml: string,
  actionUrl?: string,
  actionText?: string
) {
  const html = buildBrandedEmailHtml({
    recipientName,
    title,
    bodyHtml,
    actionUrl,
    actionText,
  });
  return sendCustomEmail(to, recipientName, subject, html);
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

export async function sendOfflineMatchNotificationEmail(opts: {
  to: string;
  recipientName: string;
  tutorName: string;
  nextDate?: string | null;
  nextTime?: string | null;
  subject?: string | null;
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
  portalUrl?: string | null;
  rescheduleUrl?: string | null;
  role: 'tutor' | 'learner';
}) {
  const when = formatSessionWhen(opts.nextDate, opts.nextTime);
  const lessonSubject = opts.subject || 'your lessons';
  const isTutor = opts.role === 'tutor';

  const bodyHtml = isTutor
    ? `<p>You're all set on PrepSkul — we've matched you with a new learner for <strong>${escapeHtml(lessonSubject)}</strong>.</p>
       <p>Your first session is on <strong>${escapeHtml(when)}</strong>. We'll send you a short email before each class so nothing slips through the cracks.</p>
       ${sessionDetailsBox({
         subject: lessonSubject,
         when,
         deliveryMode: opts.deliveryMode,
         meetLink: opts.meetLink,
         onsiteLocation: opts.onsiteLocation,
       })}
       <p>Thanks for teaching with us — we hope you and your learner have a great experience.</p>`
    : `<p>Good news — you're now matched with <strong>${escapeHtml(opts.tutorName)}</strong> on PrepSkul for <strong>${escapeHtml(lessonSubject)}</strong>.</p>
       <p>Your first session is on <strong>${escapeHtml(when)}</strong>. We'll email you ahead of each class with the time and any updates.</p>
       ${sessionDetailsBox({
         subject: lessonSubject,
         when,
         deliveryMode: opts.deliveryMode,
         meetLink: opts.meetLink,
         onsiteLocation: opts.onsiteLocation,
       })}
       <p>If anything changes, you can request a new time from your session page.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    isTutor ? 'You have a new PrepSkul learner match' : 'You are matched on PrepSkul',
    isTutor ? 'New learner match' : "You're matched — here's what's next",
    bodyHtml,
    isTutor ? opts.portalUrl || undefined : opts.rescheduleUrl || opts.portalUrl || undefined,
    isTutor ? 'Open your tutor session page' : 'View or reschedule sessions'
  );
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
  const lessonSubject = opts.subject || 'your lessons';

  const bodyHtml = `
    <p>Welcome to PrepSkul — you've been matched with <strong>${escapeHtml(opts.tutorName)}</strong> for <strong>${escapeHtml(lessonSubject)}</strong>.</p>
    <p>Your next session is on <strong>${escapeHtml(when)}</strong>.</p>
    ${sessionDetailsBox({
      subject: lessonSubject,
      when,
      deliveryMode: opts.deliveryMode,
      meetLink: opts.meetLink,
      onsiteLocation: opts.onsiteLocation,
    })}
    <p>After each class, you can leave quick feedback from your session page — it helps us keep improving your experience.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    `Welcome to PrepSkul — matched with ${opts.tutorName}`,
    'Welcome to PrepSkul',
    bodyHtml,
    opts.learnerPortalUrl || undefined,
    'Open your session page'
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
  const lessonSubject = opts.subject || 'your session';

  const bodyHtml = `
    <p>Your PrepSkul session with <strong>${escapeHtml(counterpart)}</strong> is starting now.</p>
    ${sessionDetailsBox({
      subject: lessonSubject,
      when,
      deliveryMode: opts.deliveryMode,
      meetLink: opts.meetLink,
      onsiteLocation: opts.onsiteLocation,
    })}
    <p>Open your session page below when you're ready — you can submit feedback or request a reschedule there after class if you need to.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    'Your PrepSkul session is starting now',
    'Session starting now',
    bodyHtml,
    opts.portalUrl,
    'Open session page'
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
    opts.recipientRole === 'tutor' ? 'A parent or learner' : 'Your tutor';

  const bodyHtml = `
    <p><strong>${escapeHtml(requesterLabel)}</strong> (${escapeHtml(opts.requesterName)}) asked to move a PrepSkul session to a new time.</p>
    ${sessionDetailsBox({
      subject: opts.sessionSubject,
      when: currentWhen,
      extraLines: [
        `<p><strong>Proposed new time:</strong> ${escapeHtml(proposedWhen)}</p>`,
        `<p><strong>Reason:</strong> ${escapeHtml(opts.reason)}</p>`,
      ],
    })}
    <p>Please review the request and let us know if the new time works for you.</p>
    <p style="font-size:13px;color:#64748b;">This link is personal to you — please don't share it.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    'Someone requested to reschedule your PrepSkul session',
    'Reschedule request',
    bodyHtml,
    opts.portalUrl,
    'Review and respond'
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
    opts.recipientRole === 'tutor' ? 'Open tutor session page' : 'Open your session page';

  const bodyHtml = opts.accepted
    ? `<p>Your reschedule request was <strong>accepted</strong>. The session is now set for <strong>${escapeHtml(proposedWhen)}</strong>.</p>
       <p>We've updated your reminders accordingly. See you then!</p>`
    : `<p>Your reschedule request was <strong>declined</strong>, so the original session time stays as planned.</p>
       <p>If you still need help, reach us on WhatsApp at <strong>${escapeHtml(ADMIN_WHATSAPP)}</strong> and we'll sort it out with you.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    opts.accepted ? 'PrepSkul — reschedule accepted' : 'PrepSkul — reschedule declined',
    opts.accepted ? 'Reschedule accepted' : 'Reschedule declined',
    bodyHtml,
    opts.portalUrl,
    ctaLabel
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
  rescheduleUrl?: string | null;
  feedbackUrl?: string | null;
}) {
  const when = formatSessionWhen(opts.scheduledDate, opts.scheduledTime);
  const lessonSubject = opts.subject || 'PrepSkul';
  const label = (opts.reminderLabel || '').toLowerCase();

  let intro = '';
  if (label.includes('24 hour') || label.includes('24-hour')) {
    intro = `<p>Quick heads-up — your <strong>${escapeHtml(lessonSubject)}</strong> session is tomorrow.</p>`;
  } else if (label.includes('1 hour') || label.includes('hour before')) {
    intro = `<p>Your <strong>${escapeHtml(lessonSubject)}</strong> session is about an hour away — just wanted to give you time to get ready.</p>`;
  } else if (label.includes('starting now') || label.includes('start')) {
    intro = `<p>Your <strong>${escapeHtml(lessonSubject)}</strong> session is starting now.</p>`;
  } else {
    intro = `<p>Just a reminder — your <strong>${escapeHtml(lessonSubject)}</strong> session is coming up soon.</p>`;
  }

  const bodyHtml = `
    ${intro}
    ${sessionDetailsBox({
      subject: lessonSubject,
      when,
      deliveryMode: opts.deliveryMode,
      meetLink: opts.meetLink,
      onsiteLocation: opts.onsiteLocation,
    })}
    ${
      opts.rescheduleUrl
        ? `<p>Need to move this session? You can request a new time from your session page.</p>`
        : ''
    }
    ${
      opts.feedbackUrl && !opts.rescheduleUrl
        ? `<p style="font-size:14px;color:#555;">After class, you can share feedback on your <a href="${escapeHtml(opts.feedbackUrl)}">session page</a>.</p>`
        : ''
    }`;

  const emailTitle =
    label.includes('starting now') || label.includes('start')
      ? 'Session starting now'
      : 'Session reminder';

  const primaryUrl = opts.rescheduleUrl || opts.feedbackUrl;
  const primaryLabel = opts.rescheduleUrl ? 'View or reschedule' : 'View session';

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    'Reminder: your upcoming PrepSkul session',
    emailTitle,
    bodyHtml,
    primaryUrl || undefined,
    primaryLabel
  );
}

export async function notifyOpsWithSessionFooter(subject: string, htmlBody: string, sessionId: string) {
  return sendOpsAlertEmail(subject, htmlBody + adminSessionFooter(sessionId));
}

export { COMMISSION_RATE, ADMIN_WHATSAPP, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';
