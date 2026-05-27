import { ADMIN_WHATSAPP } from '@/lib/offline-ops-constants';

function whatsappDigits() {
  return ADMIN_WHATSAPP.replace(/\D/g, '');
}

function formatTimeForMessage(time?: string | null) {
  if (!time) return '';
  return String(time).slice(0, 5);
}

/** Prefilled WhatsApp message to PrepSkul admin for manual reschedule assistance. */
export function buildRescheduleAdminWhatsAppUrl(opts: {
  sessionSubject?: string | null;
  originalDate: string;
  originalTime: string;
  proposedDate: string;
  proposedTime: string;
  reason: string;
  requesterName?: string | null;
  requesterRole?: 'tutor' | 'learner' | string;
}) {
  const lines = [
    'Hello PrepSkul, I would like help rescheduling a session.',
    '',
    opts.sessionSubject ? `Subject: ${opts.sessionSubject}` : null,
    `Original session: ${opts.originalDate} at ${formatTimeForMessage(opts.originalTime)}`,
    `Requested new time: ${opts.proposedDate} at ${formatTimeForMessage(opts.proposedTime)}`,
    `Reason: ${opts.reason}`,
    opts.requesterName
      ? `Requested by: ${opts.requesterName}${opts.requesterRole ? ` (${opts.requesterRole})` : ''}`
      : null,
    '',
    'The reschedule request has also been sent to the other participant on PrepSkul. Please assist if needed. Thank you.',
  ].filter(Boolean) as string[];

  return `https://wa.me/${whatsappDigits()}?text=${encodeURIComponent(lines.join('\n'))}`;
}
