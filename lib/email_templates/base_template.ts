/**
 * Base Email Template
 * 
 * Provides a consistent base template for all PrepSkul email notifications
 */

export interface EmailTemplateData {
  userName: string;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  secondaryActionUrl?: string;
  secondaryActionText?: string;
  footerNote?: string;
}

/**
 * Convert action URL to deep link
 * Uses universal links (https://app.prepskul.com) which work on both web and mobile
 * Mobile apps configured with universal links will open the app automatically
 */
function _getDeepLinkUrl(actionUrl: string): string {
  // Remove leading slash if present
  const cleanUrl = actionUrl.startsWith('/') ? actionUrl.substring(1) : actionUrl;
  
  // Use universal link format (works on web and mobile via app links)
  // Mobile apps with universal links configured will open the app
  // Web users will be taken to the web app
  return `https://app.prepskul.com/${cleanUrl}`;
}

export function generateEmailTemplate(data: EmailTemplateData): string {
  const {
    userName,
    title,
    message,
    icon = '🔔',
    actionUrl,
    actionText,
    secondaryActionUrl,
    secondaryActionText,
    footerNote,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: white;
    }
    .logo {
      max-width: 120px;
      height: auto;
      margin: 0 auto 20px;
      display: block;
    }
    .icon {
      font-size: 64px;
      text-align: center;
      margin: 20px 0;
    }
    .content {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 16px;
      color: #666666;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #333333;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%);
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px;
      transition: opacity 0.3s;
    }
    .button:hover {
      opacity: 0.9;
    }
    .button-secondary {
      display: inline-block;
      background: #f5f5f5;
      color: #1B2C4F;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 15px;
      margin: 8px;
      border: 2px solid #1B2C4F;
    }
    .info-box {
      background: #f0f7ff;
      border-left: 4px solid #4A6FBF;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #1B2C4F;
      display: block;
      margin-bottom: 8px;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 30px;
      text-align: center;
      color: #666666;
      font-size: 13px;
      border-top: 1px solid #eeeeee;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #4A6FBF;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 30px 20px;
      }
      .button {
        display: block;
        margin: 8px 0;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://prepskul.com/logo-white.png" alt="PrepSkul" class="logo" />
      <h1>${title}</h1>
    </div>
    <div class="content">
      <div class="icon">${icon}</div>
      <p class="greeting">Hi <strong>${userName}</strong>,</p>
      <div class="message">
        ${message.replace(/\n/g, '<br>')}
      </div>
      ${actionUrl && actionText ? `
      <div class="button-container">
        <a href="${_getDeepLinkUrl(actionUrl)}" class="button">${actionText}</a>
        ${secondaryActionUrl && secondaryActionText ? `
        <a href="${_getDeepLinkUrl(secondaryActionUrl)}" class="button-secondary">${secondaryActionText}</a>
        ` : ''}
      </div>
      ` : ''}
      ${footerNote ? `
      <div class="info-box">
        <strong>ℹ️ Note:</strong>
        <p style="margin: 0; color: #666666;">${footerNote}</p>
      </div>
      ` : ''}
      <p style="margin-top: 30px; color: #666666;">
        Best regards,<br>
        <strong style="color: #1B2C4F;">The PrepSkul Team</strong>
      </p>
    </div>
    <div class="footer">
      <p><strong>PrepSkul</strong> - Your trusted tutoring platform</p>
      <p>
        <a href="https://app.prepskul.com">Visit App</a> |
        <a href="https://prepskul.com">Website</a> |
        <a href="mailto:info@prepskul.com">Contact Support</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #999999;">
        © ${new Date().getFullYear()} PrepSkul. All rights reserved.<br>
        This is an automated email. Please do not reply directly to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
