/**
 * Shared PrepSkul branded HTML email layout (header, CTA, footer).
 * Used by notification emails and offline-operations session emails.
 */

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type BrandedEmailParams = {
  recipientName: string;
  title: string;
  /** Plain text or safe HTML paragraphs (already escaped if needed). */
  bodyHtml: string;
  actionUrl?: string;
  actionText?: string;
};

export function buildBrandedEmailHtml({
  recipientName,
  title,
  bodyHtml,
  actionUrl,
  actionText,
}: BrandedEmailParams): string {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com';
  const resolvedActionUrl = actionUrl
    ? actionUrl.startsWith('http')
      ? actionUrl
      : `${appBaseUrl}${actionUrl}`
    : undefined;
  const buttonText = actionText || 'Open PrepSkul';
  const year = new Date().getFullYear();

  const ctaBlock = resolvedActionUrl
    ? `
            <p style="text-align: center; margin: 28px 0 8px;">
              <a href="${resolvedActionUrl}" class="button">${escapeHtml(buttonText)}</a>
            </p>
            <p class="link-note">
              If the button doesn't work, copy and paste this link into your browser:<br />
              <a href="${resolvedActionUrl}">${resolvedActionUrl}</a>
            </p>`
    : '';

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f2f4f8; }
      .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
      .header { background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%); color: white; padding: 32px 28px; text-align: center; }
      .logo { max-width: 120px; height: auto; margin: 0 auto 16px; display: block; }
      .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
      .content { padding: 32px 28px; background: #ffffff; }
      .title { color: #1B2C4F; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
      .body p { font-size: 15px; margin: 0 0 14px; color: #333; }
      .detail-box { background: #f8f9fa; border-left: 3px solid #4A6FBF; padding: 14px 16px; margin: 18px 0; border-radius: 4px; font-size: 14px; color: #333; }
      .detail-box p { margin: 6px 0; }
      .button { display: inline-block; background: #4A6FBF; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
      .link-note { font-size: 12px; color: #666; margin-top: 16px; word-break: break-all; }
      .footer { background: #f9f9f9; padding: 20px 28px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://prepskul.com/logo-white.png" alt="PrepSkul" class="logo" />
        <h1>PrepSkul</h1>
      </div>
      <div class="content">
        <p style="margin: 0 0 12px;">Hi <strong>${escapeHtml(recipientName)}</strong>,</p>
        <h2 class="title">${escapeHtml(title)}</h2>
        <div class="body">
          ${bodyHtml}
        </div>
        ${ctaBlock}
      </div>
      <div class="footer">
        © ${year} PrepSkul. All rights reserved.<br />
        This is an automated email. Please do not reply.
      </div>
    </div>
  </body>
</html>`;
}

/** Session details block for offline / session emails. */
export function sessionDetailsBox(opts: {
  subject?: string | null;
  when: string;
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
  extraLines?: string[];
}) {
  const mode = (opts.deliveryMode || 'online').toLowerCase();
  const lines: string[] = [
    opts.subject ? `<p><strong>Subject:</strong> ${escapeHtml(opts.subject)}</p>` : '',
    `<p><strong>When:</strong> ${escapeHtml(opts.when)}</p>`,
  ];
  if ((mode === 'online' || mode === 'hybrid') && opts.meetLink) {
    lines.push(
      `<p><strong>Join online:</strong> <a href="${escapeHtml(opts.meetLink)}">${escapeHtml(opts.meetLink)}</a></p>`
    );
  }
  if ((mode === 'onsite' || mode === 'hybrid') && opts.onsiteLocation) {
    lines.push(`<p><strong>Location:</strong> ${escapeHtml(opts.onsiteLocation)}</p>`);
  }
  for (const line of opts.extraLines || []) {
    lines.push(line);
  }
  return `<div class="detail-box">${lines.filter(Boolean).join('')}</div>`;
}
