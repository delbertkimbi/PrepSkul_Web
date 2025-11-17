/**
 * Email Templates for Tutor Profile Actions
 * 
 * Provides branded HTML email templates for:
 * - Profile approval
 * - Profile rejection
 * - Profile improvement requests
 */

/**
 * Generate approval email HTML
 */
export function profileApprovedEmail(
  tutorName: string,
  rating?: number,
  sessionPrice?: number,
  pricingTier?: string,
  adminNotes?: string
): string {
  const formatPrice = (price: number | undefined): string => {
    if (!price) return 'N/A';
    return `${price.toLocaleString('en-US')} XAF`;
  };

  const formatTier = (tier: string | undefined): string => {
    if (!tier) return 'N/A';
    const tierMap: Record<string, string> = {
      'starter': 'Starter',
      'standard': 'Standard',
      'premium': 'Premium',
      'elite': 'Elite',
      'entry': 'Entry Level',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'expert': 'Expert',
    };
    return tierMap[tier] || tier;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .logo { max-width: 120px; height: auto; margin: 0 auto 20px; display: block; }
          .content { padding: 40px 30px; background: #f9f9f9; }
          .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #4A6FBF; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .notes-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .rating-box { background: #fff; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .rating-box h3 { margin: 0 0 15px 0; color: #1B2C4F; font-size: 16px; }
          .rating-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
          .rating-item:last-child { border-bottom: none; }
          .rating-label { color: #666; font-size: 14px; }
          .rating-value { color: #1B2C4F; font-weight: 600; font-size: 14px; }
          .footer { background: #ffffff; padding: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
          .info-note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://prepskul.com/logo-white.png" alt="PrepSkul" class="logo" />
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <div class="success-icon">✅</div>
            <h2 style="color: #1B2C4F; margin-top: 0;">Your Tutor Profile Has Been Approved!</h2>
            <p>Hi <strong>${tutorName}</strong>,</p>
            <p>Great news! Your PrepSkul tutor profile has been reviewed and <strong>approved</strong> by our admin team.</p>
            ${adminNotes ? `
            <div class="notes-box">
              <strong>💬 Admin Note:</strong>
              <p style="margin: 5px 0 0 0;">${adminNotes.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
            ${rating || sessionPrice || pricingTier ? `
            <div class="rating-box">
              <h3>Your Profile Details:</h3>
              ${rating ? `
              <div class="rating-item">
                <span class="rating-label">Your Initial Rating:</span>
                <span class="rating-value">${rating.toFixed(1)} ⭐</span>
              </div>
              ` : ''}
              ${sessionPrice ? `
              <div class="rating-item">
                <span class="rating-label">Your Session Price:</span>
                <span class="rating-value">${formatPrice(sessionPrice)}</span>
              </div>
              ` : ''}
              ${pricingTier ? `
              <div class="rating-item">
                <span class="rating-label">Pricing Tier:</span>
                <span class="rating-value">${formatTier(pricingTier)}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            <div class="info-note">
              <strong>ℹ️ Important Note:</strong> This is your initial rating based on your credentials and qualifications. Starting from your 3rd student review onwards, your rating will be dynamically updated based on actual student feedback and reviews.
            </div>
            <p><strong style="color: #1B2C4F;">What's next?</strong></p>
            <ul>
              <li>Your profile is now <strong>live</strong> and visible to students</li>
              <li>You can start receiving booking requests</li>
              <li>Log in to your dashboard to manage your profile</li>
            </ul>
            <p style="text-align: center;">
              <a href="https://app.prepskul.com/login" class="button">Open Dashboard</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Welcome to the PrepSkul community! 🎓</p>
            <p style="margin-top: 30px;"><strong>The PrepSkul Team</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} PrepSkul. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate rejection email HTML
 */
export function profileRejectedEmail(
  tutorName: string,
  rejectionReason: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: #e57373; color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .logo { max-width: 120px; height: auto; margin: 0 auto 20px; display: block; }
          .content { padding: 40px 30px; background: #f9f9f9; }
          .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .warning-box strong { color: #856404; display: block; margin-bottom: 10px; }
          .button { display: inline-block; background: #1B2C4F; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { background: #ffffff; padding: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://prepskul.com/logo-white.png" alt="PrepSkul" class="logo" />
            <h1>Profile Update Required</h1>
          </div>
          <div class="content">
            <h2 style="color: #1B2C4F; margin-top: 0;">Hi ${tutorName},</h2>
            <p>Thank you for your interest in becoming a PrepSkul tutor. After reviewing your application, we need some additional information or clarifications.</p>
            <div class="warning-box">
              <strong>⚠️ What needs to be addressed:</strong>
              <p style="margin: 5px 0 0 0; color: #856404;">${rejectionReason.replace(/\n/g, '<br>')}</p>
            </div>
            <p><strong style="color: #1B2C4F;">What's next?</strong></p>
            <ul>
              <li>Review the feedback above carefully</li>
              <li>Update your profile with the requested information</li>
              <li>Resubmit your application for review</li>
            </ul>
            <p style="text-align: center;">
              <a href="https://app.prepskul.com/login" class="button">Update Profile & Re-apply</a>
            </p>
            <p>We're here to help! If you have any questions, please reach out to our support team.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The PrepSkul Team</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} PrepSkul. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate improvement request email HTML
 */
export function profileNeedsImprovementEmail(
  tutorName: string,
  improvements: string[]
): string {
  const improvementsList = improvements.length > 0
    ? improvements.map((imp, i) => `<li>${imp}</li>`).join('')
    : '<li>Please review your profile and make necessary improvements.</li>';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%); color: white; padding: 40px 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .logo { max-width: 120px; height: auto; margin: 0 auto 20px; display: block; }
          .content { padding: 40px 30px; background: #f9f9f9; }
          .improvement-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .improvement-box strong { color: #856404; display: block; margin-bottom: 10px; }
          .improvement-box ul { margin: 10px 0 0 0; padding-left: 20px; }
          .improvement-box li { margin: 8px 0; color: #856404; }
          .button { display: inline-block; background: #1B2C4F; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .footer { background: #ffffff; padding: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://prepskul.com/logo-white.png" alt="PrepSkul" class="logo" />
            <h1>📝 Profile Improvement Requested</h1>
          </div>
          <div class="content">
            <h2 style="color: #1B2C4F; margin-top: 0;">Hi ${tutorName},</h2>
            <p>Thank you for your interest in becoming a PrepSkul tutor. We've reviewed your application and would like to request some improvements before we can approve your profile.</p>
            <div class="improvement-box">
              <strong>📋 Areas that need improvement:</strong>
              <ul>
                ${improvementsList}
              </ul>
            </div>
            <p><strong style="color: #1B2C4F;">What's next?</strong></p>
            <ul>
              <li>Review the improvement areas listed above</li>
              <li>Update your profile with the requested changes</li>
              <li>Resubmit your application for review</li>
            </ul>
            <p style="text-align: center;">
              <a href="https://app.prepskul.com/login" class="button">Update Profile</a>
            </p>
            <p>We're here to help! If you have any questions about these improvements, please reach out to our support team.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The PrepSkul Team</strong></p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} PrepSkul. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

