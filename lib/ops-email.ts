import { getOpsAdminEmails } from '@/lib/operational-admin-emails';
import { buildBrandedEmailHtml } from '@/lib/email_templates/branded-layout';

export async function sendOpsAlertEmail(
  subject: string,
  bodyHtml: string,
  opts?: {
    title?: string;
    actionUrl?: string;
    actionText?: string;
  }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[ops-email] RESEND_API_KEY missing; skipping ops alert:', subject);
    return { ok: false, reason: 'no_resend' as const };
  }
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
  const to = getOpsAdminEmails();
  if (!to.length) return { ok: false, reason: 'no_recipients' as const };

  const normalizedFrom = fromEmail.includes('<') ? fromEmail : `PrepSkul Ops <${fromEmail}>`;
  const cleanSubject = subject.replace(/^\[PrepSkul Ops\]\s*/i, '').trim();

  const html = buildBrandedEmailHtml({
    recipientName: 'PrepSkul team',
    title: opts?.title || cleanSubject,
    bodyHtml,
    actionUrl: opts?.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com'}/admin`,
    actionText: opts?.actionText || 'Open admin',
  });

  await resend.emails.send({
    from: normalizedFrom,
    to,
    subject: `[PrepSkul Ops] ${cleanSubject}`,
    html,
  });
  return { ok: true as const, to };
}
