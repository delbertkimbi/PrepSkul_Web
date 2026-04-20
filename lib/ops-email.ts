import { getOpsAdminEmails } from '@/lib/operational-admin-emails';

export async function sendOpsAlertEmail(subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[ops-email] RESEND_API_KEY missing; skipping ops alert:', subject);
    return { ok: false, reason: 'no_resend' as const };
  }
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
  const to = getOpsAdminEmails();
  if (!to.length) return { ok: false, reason: 'no_recipients' as const };

  await resend.emails.send({
    from: fromEmail.includes('@') ? `PrepSkul Ops <${fromEmail}>` : fromEmail,
    to,
    subject: `[PrepSkul Ops] ${subject}`,
    html,
  });
  return { ok: true as const, to };
}
