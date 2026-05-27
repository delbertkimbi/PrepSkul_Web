import { escapeHtml } from '@/lib/email_templates/branded-layout';
import { sendOpsAlertEmail } from '@/lib/ops-email';

export type OfflineSessionFeedbackGap = {
  sessionId: string;
  subject: string | null;
  scheduledDate: string;
  scheduledTime: string;
  tutorName: string;
  learnerName: string;
  missingTutorReport: boolean;
  missingLearnerFeedback: boolean;
  offlineOperationId: string | null;
};

export function sessionEndTimestamp(
  scheduledDate: string,
  scheduledTime: string | null,
  durationMinutes?: number | null
) {
  const start = new Date(`${scheduledDate}T${String(scheduledTime || '00:00:00').slice(0, 8)}`);
  if (Number.isNaN(start.getTime())) return 0;
  const mins = Number(durationMinutes || 60);
  return start.getTime() + mins * 60 * 1000;
}

export function formatSessionWhenForEmail(date: string, time?: string | null) {
  const timeStr = time ? String(time).slice(0, 5) : '';
  try {
    const parsed = new Date(`${date}T${timeStr || '09:00'}:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  } catch {
    /* fall through */
  }
  return timeStr ? `${date} ${timeStr}` : date;
}

function missingPartyLines(gap: OfflineSessionFeedbackGap) {
  const lines: string[] = [];
  if (gap.missingTutorReport) lines.push(`Tutor report missing (${escapeHtml(gap.tutorName)})`);
  if (gap.missingLearnerFeedback) lines.push(`Learner / parent feedback missing (${escapeHtml(gap.learnerName)})`);
  return lines;
}

export async function sendOfflineSessionFeedbackOpsReminder(gap: OfflineSessionFeedbackGap) {
  const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com';
  const detailsUrl = gap.offlineOperationId
    ? `${appBase}/admin/offline-ops/${gap.offlineOperationId}`
    : `${appBase}/admin/offline-ops`;

  const when = formatSessionWhenForEmail(gap.scheduledDate, gap.scheduledTime);
  const missingHtml = missingPartyLines(gap)
    .map((line) => `<li>${line}</li>`)
    .join('');

  const bodyHtml = `
    <p>A past offline session still needs participant feedback before you can close it out in admin.</p>
    <div class="detail-box">
      <p><strong>Subject:</strong> ${escapeHtml(gap.subject || 'PrepSkul session')}</p>
      <p><strong>When:</strong> ${escapeHtml(when)}</p>
      <p><strong>Tutor:</strong> ${escapeHtml(gap.tutorName)}</p>
      <p><strong>Learner / parent:</strong> ${escapeHtml(gap.learnerName)}</p>
      <p><strong>Still waiting on:</strong></p>
      <ul>${missingHtml}</ul>
    </div>
    <p>We send this reminder about once per hour until feedback is received or attendance is marked in admin.</p>`;

  return sendOpsAlertEmail('Offline session feedback reminder', bodyHtml, {
    title: 'Session feedback pending',
    actionUrl: detailsUrl,
    actionText: 'Open operation details',
  });
}
