/**
 * Notification Service for PrepSkul Admin
 * 
 * Handles email and SMS notifications for tutor approval/rejection
 * Uses Resend for emails and Twilio for SMS (when configured)
 */

// Initialize Resend at runtime (not module level) to avoid build-time errors
async function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  // Dynamic import to avoid build-time errors if resend is not installed
  const { Resend } = await import('resend');
  return new Resend(process.env.RESEND_API_KEY);
}

// Email notification templates
export async function sendTutorApprovalEmail(
  tutorEmail: string,
  tutorName: string,
  adminNotes?: string,
  ratingData?: {
    rating?: number;
    sessionPrice?: number;
    pricingTier?: string;
    ratingJustification?: string;
  }
) {
  console.log('📧 Sending approval email to:', tutorEmail);
  
  try {
    // Format rating, price, and tier
    const formatRating = (rating: number | null | undefined): string => {
      if (!rating) return 'N/A';
      return rating.toFixed(1);
    };

    const formatPrice = (price: number | null | undefined): string => {
      if (!price) return 'N/A';
      return `${price.toLocaleString('en-US')} XAF`;
    };

    const formatTier = (tier: string | null | undefined): string => {
      if (!tier) return 'N/A';
      const tierMap: Record<string, string> = {
        'entry': 'Entry Level',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
        'expert': 'Expert',
      };
      return tierMap[tier] || tier;
    };

    const rating = formatRating(ratingData?.rating);
    const sessionPrice = formatPrice(ratingData?.sessionPrice);
    const pricingTier = formatTier(ratingData?.pricingTier);

    // Email template
    const htmlContent = `
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
              <h1>PrepSkul</h1>
            </div>
            <div class="content">
              <h2 style="color: #1B2C4F; margin-top: 0;">Your Tutor Profile Has Been Approved</h2>
              <p>Hi <strong>${tutorName}</strong>,</p>
              <p>Great news! Your PrepSkul tutor profile has been reviewed and <strong>approved</strong> by our admin team.</p>
              ${adminNotes ? `
              <div class="notes-box">
                <strong>💬 Admin Note:</strong>
                <p style="margin: 5px 0 0 0;">${adminNotes}</p>
              </div>
              ` : ''}
              <div class="rating-box">
                <h3>Your Profile Details:</h3>
                <div class="rating-item">
                  <span class="rating-label">Your Initial Rating:</span>
                  <span class="rating-value">${rating}</span>
                </div>
                <div class="rating-item">
                  <span class="rating-label">Your Session Price:</span>
                  <span class="rating-value">${sessionPrice}</span>
                </div>
                <div class="rating-item">
                  <span class="rating-label">Pricing Tier:</span>
                  <span class="rating-value">${pricingTier}</span>
                </div>
              </div>
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
                <a href="https://app.prepskul.com/tutor/profile" class="button">Open Dashboard</a>
              </p>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Welcome to the PrepSkul community!</p>
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

    // Send email via Resend
    const resend = await getResend();
    
    // Get from email from environment variable or use default
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
    
    // Set reply-to to business email so replies go to info@prepskul.com
    const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com';
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: tutorEmail,
      replyTo: replyTo,
      subject: 'Your PrepSkul Tutor Profile Has Been Approved! 🎉',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      
      // Check for rate limit errors
      const errorMsg = error.message || error.toString().toLowerCase();
      if (
        errorMsg.includes('429') ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('too many requests') ||
        errorMsg.includes('quota exceeded')
      ) {
        console.warn('⚠️ Rate limit hit for email sending. User should retry later.');
        return {
          success: false,
          error: {
            ...error,
            isRateLimit: true,
            userMessage: 'Email service is temporarily busy. Please try again in a few minutes.',
          },
        };
      }
      
      return { success: false, error };
    }

    console.log('✅ Approval email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    return { success: false, error };
  }
}

export async function sendTutorRejectionEmail(
  tutorEmail: string,
  tutorName: string,
  rejectionReason: string
) {
  console.log('📧 Sending rejection email to:', tutorEmail);
  
  try {
    // Email template
    const htmlContent = `
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
                <p style="margin: 5px 0 0 0; color: #856404;">${rejectionReason}</p>
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

    // Send email via Resend
        const resend = await getResend();
        
        // Get from email from environment variable or use default
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
        
        // Set reply-to to business email so replies go to info@prepskul.com
        const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com';
        
    const { data, error } = await resend.emails.send({
          from: fromEmail,
      to: tutorEmail,
          replyTo: replyTo,
      subject: 'Your PrepSkul Tutor Profile Needs Updates',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      
      // Check for rate limit errors
      const errorMsg = error.message || error.toString().toLowerCase();
      if (
        errorMsg.includes('429') ||
        errorMsg.includes('rate limit') ||
        errorMsg.includes('too many requests') ||
        errorMsg.includes('quota exceeded')
      ) {
        console.warn('⚠️ Rate limit hit for email sending. User should retry later.');
        return {
          success: false,
          error: {
            ...error,
            isRateLimit: true,
            userMessage: 'Email service is temporarily busy. Please try again in a few minutes.',
          },
        };
      }
      
      return { success: false, error };
    }

    console.log('✅ Rejection email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    return { success: false, error };
  }
}

// SMS notification templates
export async function sendTutorApprovalSMS(
  tutorPhone: string,
  tutorName: string
): Promise<{ success: boolean; error?: any }> {
  // TODO: Implement with Twilio
  console.log('📱 Sending approval SMS to:', tutorPhone);
  
  try {
    const message = `PrepSkul: Congratulations ${tutorName}! Your tutor profile has been approved. Students can now book sessions with you. Log in to get started!`;
    console.log(`SMS Template: "${message}"`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending approval SMS:', error);
    return { success: false, error };
  }
}

export async function sendTutorRejectionSMS(
  tutorPhone: string,
  tutorName: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: any }> {
  // TODO: Implement with Twilio
  console.log('📱 Sending rejection SMS to:', tutorPhone);
  
  try {
    const message = `PrepSkul: Hi ${tutorName}, your profile needs updates. Check email for details. Reason: ${rejectionReason.substring(0, 50)}...`;
    console.log(`SMS Template: "${message}"`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending rejection SMS:', error);
    return { success: false, error };
  }
}

/**
 * Main notification function - sends email, SMS, and creates in-app notification
 */
export async function notifyTutorApproval(
  tutorEmail: string | null,
  tutorPhone: string | null,
  tutorName: string,
  tutorUserId: string, // Add userId for in-app notifications
  adminNotes?: string,
  ratingData?: {
    rating?: number;
    sessionPrice?: number;
    pricingTier?: string;
    ratingJustification?: string;
  }
) {
  const results: {
    email: { success: boolean; error?: any };
    sms: { success: boolean; error?: any };
    inApp: { success: boolean; error?: any };
  } = {
    email: { success: false, error: null },
    sms: { success: false, error: null },
    inApp: { success: false, error: null },
  };
  
  // Send email if available
  if (tutorEmail) {
    try {
      const emailResult = await sendTutorApprovalEmail(
        tutorEmail, 
        tutorName, 
        adminNotes,
        ratingData
      );
    results.email = emailResult;
    } catch (e) {
      console.error('❌ Error sending approval email:', e);
      results.email = { success: false, error: e };
    }
  }
  
  // Send SMS if available
  if (tutorPhone) {
    try {
    const smsResult = await sendTutorApprovalSMS(tutorPhone, tutorName);
    results.sms = smsResult;
    } catch (e) {
      console.error('❌ Error sending approval SMS:', e);
      results.sms = { success: false, error: e };
    }
  }
  
  // Create in-app notification
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    const ratingText = ratingData?.rating 
      ? `\n\nYour Rating: ${ratingData.rating.toFixed(1)}/5.0\nSession Price: ${ratingData.sessionPrice?.toLocaleString('en-US')} XAF`
      : '';
    
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: tutorUserId,
        type: 'profile_approved',
        notification_type: 'profile_approved',
        title: 'Profile Approved',
        message: `Your PrepSkul tutor profile has been approved. Your profile is now live and students can book sessions with you!${ratingText}${adminNotes ? `\n\nAdmin Note: ${adminNotes}` : ''}`,
        priority: 'high',
        is_read: false,
        action_url: '/tutor/dashboard',
        action_text: 'View Dashboard',
        icon: '🎉',
      });
    
    if (notifError) {
      console.error('❌ Error creating in-app notification:', notifError);
      results.inApp = { success: false, error: notifError };
    } else {
      console.log('✅ In-app notification created for tutor approval');
      results.inApp = { success: true };
    }
  } catch (e) {
    console.error('❌ Error creating in-app notification:', e);
    results.inApp = { success: false, error: e };
  }
  
  return results;
}

export async function notifyTutorRejection(
  tutorEmail: string | null,
  tutorPhone: string | null,
  tutorName: string,
  tutorUserId: string, // Add userId for in-app notifications
  rejectionReason: string
) {
  const results: {
    email: { success: boolean; error?: any };
    sms: { success: boolean; error?: any };
    inApp: { success: boolean; error?: any };
  } = {
    email: { success: false, error: null },
    sms: { success: false, error: null },
    inApp: { success: false, error: null },
  };
  
  // Send email if available
  if (tutorEmail) {
    try {
    const emailResult = await sendTutorRejectionEmail(tutorEmail, tutorName, rejectionReason);
    results.email = emailResult;
    } catch (e) {
      console.error('❌ Error sending rejection email:', e);
      results.email = { success: false, error: e };
    }
  }
  
  // Send SMS if available
  if (tutorPhone) {
    try {
    const smsResult = await sendTutorRejectionSMS(tutorPhone, tutorName, rejectionReason);
    results.sms = smsResult;
    } catch (e) {
      console.error('❌ Error sending rejection SMS:', e);
      results.sms = { success: false, error: e };
    }
  }
  
  // Create in-app notification
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: tutorUserId,
        type: 'profile_rejected',
        notification_type: 'profile_rejected',
        title: 'Profile Update Required',
        message: `Your tutor profile application needs updates. Please review the feedback and resubmit.\n\nReason: ${rejectionReason}`,
        priority: 'high',
        is_read: false,
        action_url: '/tutor/profile',
        action_text: 'Update Profile',
        icon: '⚠️',
      });
    
    if (notifError) {
      console.error('❌ Error creating in-app notification:', notifError);
      results.inApp = { success: false, error: notifError };
    } else {
      console.log('✅ In-app notification created for tutor rejection');
      results.inApp = { success: true };
    }
  } catch (e) {
    console.error('❌ Error creating in-app notification:', e);
    results.inApp = { success: false, error: e };
  }
  
  return results;
}

/**
 * Notify tutor that their profile needs improvement
 * Sends email, SMS, and creates in-app notification
 */
export async function notifyTutorImprovement(
  tutorEmail: string | null,
  tutorPhone: string | null,
  tutorName: string,
  tutorUserId: string,
  improvements: string[],
  adminNotes?: string
) {
  const results: {
    email: { success: boolean; error?: any };
    sms: { success: boolean; error?: any };
    inApp: { success: boolean; error?: any };
  } = {
    email: { success: false, error: null },
    sms: { success: false, error: null },
    inApp: { success: false, error: null },
  };
  
  // Send email if available
  if (tutorEmail) {
    try {
      const { profileNeedsImprovementEmail } = await import('@/lib/email_templates/tutor_profile_templates');
      const emailHtml = profileNeedsImprovementEmail(tutorName, improvements);
      const emailResult = await sendCustomEmail(
        tutorEmail,
        tutorName,
        'Your PrepSkul Tutor Profile - Improvement Requests',
        emailHtml
      );
      results.email = emailResult;
    } catch (e) {
      console.error('❌ Error sending improvement email:', e);
      results.email = { success: false, error: e };
    }
  }
  
  // Create in-app notification
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    const improvementsText = improvements.length > 0
      ? `\n\nImprovement Areas:\n${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}`
      : '';
    
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: tutorUserId,
        type: 'profile_improvement',
        notification_type: 'profile_improvement',
        title: 'Profile Improvement Requested',
        message: `Your tutor profile needs some improvements before approval.${improvementsText}${adminNotes ? `\n\nAdmin Notes: ${adminNotes}` : ''}`,
        priority: 'high',
        is_read: false,
        action_url: '/tutor/profile',
        action_text: 'Update Profile',
        icon: '📝',
      });
    
    if (notifError) {
      console.error('❌ Error creating in-app notification:', notifError);
      results.inApp = { success: false, error: notifError };
    } else {
      console.log('✅ In-app notification created for tutor improvement');
      results.inApp = { success: true };
    }
  } catch (e) {
    console.error('❌ Error creating in-app notification:', e);
    results.inApp = { success: false, error: e };
  }
  
  return results;
}

// Email notification templates

/**
 * Send a custom email to a tutor
 * @param tutorEmail - Recipient email address
 * @param tutorName - Recipient name
 * @param subject - Email subject
 * @param body - Email body (HTML supported)
 */
export async function sendCustomEmail(
  tutorEmail: string,
  tutorName: string,
  subject: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  console.log('📧 Sending custom email to:', tutorEmail);
  
  try {
    // Get Resend instance
    const resend = await getResend();
    
    // Get from email from environment variable or use default
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
    
    // Set reply-to to business email so replies go to info@prepskul.com
    const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com';
    
    // Send email via Resend with retry logic for rate limits
    let lastError: any = null;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: tutorEmail,
          replyTo: replyTo,
          subject: subject,
          html: body,
        });

        if (error) {
          lastError = error;
          
          // Check for rate limit errors
          const errorMsg = error.message || error.toString().toLowerCase();
          const isRateLimit = 
            errorMsg.includes('429') ||
            errorMsg.includes('rate limit') ||
            errorMsg.includes('too many requests') ||
            errorMsg.includes('quota exceeded');
          
          if (isRateLimit && attempt < maxRetries - 1) {
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
            console.warn(`⚠️ Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry
          }
          
          // Non-rate-limit error or last attempt
          console.error('❌ Resend error:', error);
          return {
            success: false,
            error: isRateLimit
              ? 'Email service is temporarily busy due to rate limits. Please try again in a few minutes.'
              : (error.message || 'Failed to send email'),
          };
        }

        // Success
        console.log('✅ Custom email sent successfully:', data);
        return { success: true };
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || error.toString().toLowerCase();
        const isRateLimit = 
          errorMsg.includes('429') ||
          errorMsg.includes('rate limit') ||
          errorMsg.includes('too many requests');
        
        if (isRateLimit && attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Last attempt or non-rate-limit error
        console.error('❌ Error sending custom email:', error);
        return {
          success: false,
          error: isRateLimit
            ? 'Email service is temporarily busy. Please try again in a few minutes.'
            : (error.message || 'Failed to send email'),
        };
      }
    }
    
    // Fallback (shouldn't reach here)
    return {
      success: false,
      error: lastError?.message || 'Failed to send email after multiple attempts',
    };
  } catch (error: any) {
    console.error('❌ Error sending custom email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

type NotificationEmailParams = {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  messagePreview?: string;
};

function buildNotificationEmailHtml({
  recipientName,
  title,
  message,
  actionUrl,
  actionText,
  senderName,
  senderAvatarUrl,
  messagePreview,
}: Omit<NotificationEmailParams, 'recipientEmail' | 'subject'>): string {
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com';
  const resolvedActionUrl = actionUrl
    ? (actionUrl.startsWith('http') ? actionUrl : `${appBaseUrl}${actionUrl}`)
    : appBaseUrl;
  const buttonText = actionText || 'Open PrepSkul';
  const isMessageNotification = !!senderName;
  const previewText = messagePreview || message;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f2f4f8; }
          .container { max-width: 640px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%); color: white; padding: 32px 28px; text-align: center; }
          .logo { max-width: 120px; height: auto; margin: 0 auto 16px; display: block; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
          .content { padding: 32px 28px; background: #ffffff; }
          .sender-section { display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
          .sender-avatar { width: 48px; height: 48px; border-radius: 50%; margin-right: 12px; object-fit: cover; background: #e0e0e0; }
          .sender-info { flex: 1; }
          .sender-label { font-size: 12px; color: #666; margin-bottom: 4px; }
          .sender-name { font-size: 16px; font-weight: 600; color: #1B2C4F; margin: 0; }
          .title { color: #1B2C4F; font-size: 20px; font-weight: 700; margin: 0 0 12px; }
          .message { font-size: 15px; margin: 0 0 20px; white-space: pre-wrap; }
          .message-preview { background: #f8f9fa; border-left: 3px solid #4A6FBF; padding: 16px; margin: 20px 0; border-radius: 4px; font-size: 14px; color: #333; line-height: 1.6; }
          .button { display: inline-block; background: #4A6FBF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
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
            <p style="margin: 0 0 12px;">Hi <strong>${recipientName}</strong>,</p>
            ${isMessageNotification && senderName ? `
            <div class="sender-section">
              ${senderAvatarUrl ? `<img src="${senderAvatarUrl}" alt="${senderName}" class="sender-avatar" />` : `<div class="sender-avatar" style="display: flex; align-items: center; justify-content: center; color: #666; font-weight: 600;">${senderName.charAt(0).toUpperCase()}</div>`}
              <div class="sender-info">
                <div class="sender-label">From</div>
                <div class="sender-name">${senderName}</div>
              </div>
            </div>
            ` : ''}
            <h2 class="title">${title}</h2>
            ${isMessageNotification && messagePreview ? `
            <div class="message-preview">${previewText}</div>
            ` : `<p class="message">${message}</p>`}
            <p style="text-align: center; margin: 24px 0;">
              <a href="${resolvedActionUrl}" class="button">${buttonText}</a>
            </p>
            <p class="link-note">
              If the button doesn't work, copy and paste this link into your browser:<br />
              <a href="${resolvedActionUrl}">${resolvedActionUrl}</a>
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} PrepSkul. All rights reserved.<br />
            This is an automated email. Please do not reply.
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendNotificationEmail({
  recipientEmail,
  recipientName,
  subject,
  title,
  message,
  actionUrl,
  actionText,
  senderName,
  senderAvatarUrl,
  messagePreview,
}: NotificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const emailHtml = buildNotificationEmailHtml({
    recipientName,
    title,
    message,
    actionUrl,
    actionText,
    senderName,
    senderAvatarUrl,
    messagePreview,
  });

  return sendCustomEmail(
    recipientEmail,
    recipientName,
    subject,
    emailHtml
  );
}