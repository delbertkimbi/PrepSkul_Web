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

/** One-time welcome copy sent after a new offline match (not on schedule extensions). */
function buildOfflineMatchWelcomeBodyHtml(opts: {
  role: 'tutor' | 'learner';
  tutorName?: string;
  learnerName?: string;
}) {
  const intro =
    opts.role === 'tutor'
      ? `<p>You have been matched with <strong>${escapeHtml(opts.learnerName || 'a new learner')}</strong> on PrepSkul. We're glad to have you on board.</p>`
      : `<p>You have been matched with <strong>${escapeHtml(opts.tutorName || 'your tutor')}</strong> on PrepSkul. We're glad to have you with us.</p>`;

  return `${intro}
    <p>As part of our continued efforts to improve the learning experience on PrepSkul, you will now begin receiving automated email notifications about upcoming learning sessions, schedule reminders, and important session updates.</p>
    <p>We encourage you to check these notifications regularly so you can stay informed and prepared ahead of each session. If any adjustments are needed, sessions can also be rescheduled in advance through the notifications sent to your email.</p>
    <p>At PrepSkul, we are committed to creating the best possible experience for both learners and tutors, and these updates are designed to make session management smoother and more convenient for everyone involved.</p>
    <p>Thank you for being part of the PrepSkul community.</p>
    <p style="margin-top:24px;">Warm regards,<br/>The PrepSkul Team</p>`;
}

/** Brief ops alert when a new offline match is completed — no internal IDs. */
export async function sendOfflineMatchOpsAlert(opts: {
  learnerName: string;
  learnerRole: 'parent' | 'student';
  parentName?: string | null;
  tutorName: string;
  agentName: string;
  operationUrl?: string;
}) {
  const learnerLine =
    opts.learnerRole === 'parent' && opts.parentName
      ? `<strong>${escapeHtml(opts.learnerName)}</strong> (parent: ${escapeHtml(opts.parentName)})`
      : `<strong>${escapeHtml(opts.learnerName)}</strong>`;

  const html = `
    <p>A new offline match is ready.</p>
    <ul>
      <li><strong>Learner:</strong> ${learnerLine}</li>
      <li><strong>Tutor:</strong> ${escapeHtml(opts.tutorName)}</li>
      <li><strong>Matched by:</strong> ${escapeHtml(opts.agentName)}</li>
    </ul>`;

  return sendOpsAlertEmail('New offline match', html, {
    title: 'New offline match',
    actionUrl: opts.operationUrl,
    actionText: 'View in admin',
  });
}

export async function sendOfflineMatchNotificationEmail(opts: {
  to: string;
  recipientName: string;
  tutorName: string;
  learnerName?: string;
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
  const isTutor = opts.role === 'tutor';
  const bodyHtml = buildOfflineMatchWelcomeBodyHtml({
    role: opts.role,
    tutorName: opts.tutorName,
    learnerName: opts.learnerName,
  });

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    'Welcome to PrepSkul session notifications',
    'Welcome to PrepSkul',
    bodyHtml
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
  return sendOfflineMatchNotificationEmail({
    to: opts.to,
    recipientName: opts.recipientName,
    tutorName: opts.tutorName,
    nextDate: opts.nextDate,
    nextTime: opts.nextTime,
    subject: opts.subject,
    deliveryMode: opts.deliveryMode,
    meetLink: opts.meetLink,
    onsiteLocation: opts.onsiteLocation,
    portalUrl: opts.learnerPortalUrl,
    role: 'learner',
  });
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
    <p>When you're ready, open your session page below. After class you can share feedback or request a reschedule there if you need to.</p>`;

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
    opts.recipientRole === 'tutor' ? 'Your learner or their parent' : 'Your tutor';

  const bodyHtml = `
    <p>${escapeHtml(requesterLabel)} (${escapeHtml(opts.requesterName)}) would like to move a PrepSkul session to a new time.</p>
    ${sessionDetailsBox({
      subject: opts.sessionSubject,
      when: currentWhen,
      extraLines: [
        `<p><strong>Proposed new time:</strong> ${escapeHtml(proposedWhen)}</p>`,
        `<p><strong>Reason:</strong> ${escapeHtml(opts.reason)}</p>`,
      ],
    })}
    <p>Please review the request when you have a moment and let us know if the new time works for you.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    'Reschedule request for your PrepSkul session',
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
    ? `<p>Good news — your reschedule request was accepted. Your session is now set for <strong>${escapeHtml(proposedWhen)}</strong>.</p>
       <p>We've updated your reminders. See you then!</p>`
    : `<p>Your reschedule request wasn't accepted, so the original session time stays as planned.</p>
       <p>If you still need help, reach us on WhatsApp at <strong>${escapeHtml(ADMIN_WHATSAPP)}</strong> and we'll work it out with you.</p>`;

  return sendBrandedOfflineEmail(
    opts.to,
    opts.recipientName,
    opts.accepted ? 'PrepSkul — reschedule accepted' : 'PrepSkul — reschedule update',
    opts.accepted ? 'Reschedule accepted' : 'Reschedule update',
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
    intro = `<p>Just a friendly reminder — your <strong>${escapeHtml(lessonSubject)}</strong> session is tomorrow.</p>`;
  } else if (label.includes('1 hour') || label.includes('hour before')) {
    intro = `<p>Your <strong>${escapeHtml(lessonSubject)}</strong> session starts in about an hour. Hope you're all set!</p>`;
  } else if (label.includes('starting now') || label.includes('start')) {
    intro = `<p>Your <strong>${escapeHtml(lessonSubject)}</strong> session is starting now.</p>`;
  } else {
    intro = `<p>A quick reminder — your <strong>${escapeHtml(lessonSubject)}</strong> session is coming up soon.</p>`;
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
  return sendOpsAlertEmail(subject, htmlBody);
}

export { COMMISSION_RATE, ADMIN_WHATSAPP, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';
