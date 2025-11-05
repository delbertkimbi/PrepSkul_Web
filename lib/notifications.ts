/**
 * Notification Service for PrepSkul Admin
 * 
 * Handles email and SMS notifications for tutor approval/rejection
 * Uses Resend for emails and Twilio for SMS (when configured)
 */



// Email notification templates
export async function sendTutorApprovalEmail(
  tutorEmail: string,
  tutorName: string,
  adminNotes?: string
) {
  console.log('📧 Sending approval email to:', tutorEmail);
  
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
            .header { background: linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .logo { max-width: 120px; height: auto; margin: 0 auto 20px; display: block; }
            .content { padding: 40px 30px; background: #f9f9f9; }
            .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #4A6FBF; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .notes-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #ffffff; padding: 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
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
                <p style="margin: 5px 0 0 0;">${adminNotes}</p>
              </div>
              ` : ''}
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

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'PrepSkul <info@prepskul.com>',
      to: tutorEmail,
      subject: 'Your PrepSkul Tutor Profile Has Been Approved! 🎉',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend error:', error);
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
    const { data, error } = await resend.emails.send({
      from: 'PrepSkul <info@prepskul.com>',
      to: tutorEmail,
      subject: 'Your PrepSkul Tutor Profile Needs Updates',
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Resend error:', error);
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
) {
  // TODO: Implement with Twilio
  console.log('📱 Sending approval SMS to:', tutorPhone);
  
  try {
    const message = `PrepSkul: Congratulations ${tutorName}! Your tutor profile has been approved. Students can now book sessions with you. Log in to get started!`;
    console.log(`SMS Template: "${message}"`);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending approval SMS:', error);
    return { success: false, error };
  }
}

export async function sendTutorRejectionSMS(
  tutorPhone: string,
  tutorName: string,
  rejectionReason: string
) {
  // TODO: Implement with Twilio
  console.log('📱 Sending rejection SMS to:', tutorPhone);
  
  try {
    const message = `PrepSkul: Hi ${tutorName}, your profile needs updates. Check email for details. Reason: ${rejectionReason.substring(0, 50)}...`;
    console.log(`SMS Template: "${message}"`);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection SMS:', error);
    return { success: false, error };
  }
}

/**
 * Main notification function - sends both email and SMS
 */
export async function notifyTutorApproval(
  tutorEmail: string | null,
  tutorPhone: string | null,
  tutorName: string,
  adminNotes?: string
) {
  const results = {
    email: { success: false, error: null as any },
    sms: { success: false, error: null as any },
  };
  
  // Send email if available
  if (tutorEmail) {
    const emailResult = await sendTutorApprovalEmail(tutorEmail, tutorName, adminNotes);
    results.email = emailResult;
  }
  
  // Send SMS if available
  if (tutorPhone) {
    const smsResult = await sendTutorApprovalSMS(tutorPhone, tutorName);
    results.sms = smsResult;
  }
  
  return results;
}

export async function notifyTutorRejection(
  tutorEmail: string | null,
  tutorPhone: string | null,
  tutorName: string,
  rejectionReason: string
) {
  const results = {
    email: { success: false, error: null as any },
    sms: { success: false, error: null as any },
  };
  
  // Send email if available
  if (tutorEmail) {
    const emailResult = await sendTutorRejectionEmail(tutorEmail, tutorName, rejectionReason);
    results.email = emailResult;
  }
  
  // Send SMS if available
  if (tutorPhone) {
    const smsResult = await sendTutorRejectionSMS(tutorPhone, tutorName, rejectionReason);
    results.sms = smsResult;
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
    // For now, log to console
    // TODO: Integrate with Resend or Supabase email service
    console.log('Email Details:');
    console.log('  To:', tutorEmail);
    console.log('  Name:', tutorName);
    console.log('  Subject:', subject);
    console.log('  Body:', body);

    // TODO: Replace with actual email sending
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'PrepSkul <info@prepskul.com>',
    //   to: tutorEmail,
    //   subject: subject,
    //   html: body,
    // });

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error sending custom email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}
