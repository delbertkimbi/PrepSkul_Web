import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();
    
    // Get custom email content from request body
    let customSubject: string | undefined;
    let customBody: string | undefined;
    try {
      const body = await request.json();
      customSubject = body.subject;
      customBody = body.body;
    } catch (e) {
      // Request body might be empty, use defaults
    }

    // Fetch ambassador data
    const { data: ambassador, error: fetchError } = await adminSupabase
      .from('ambassadors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !ambassador) {
      return NextResponse.json(
        { error: 'Ambassador not found' },
        { status: 404 }
      );
    }

    if (ambassador.application_status === 'approved') {
      return NextResponse.json(
        { error: 'Ambassador is already approved' },
        { status: 400 }
      );
    }

    // Update application_status to approved
    const { error: updateError } = await adminSupabase
      .from('ambassadors')
      .update({
        application_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Ambassadors] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update ambassador status', details: updateError.message },
        { status: 500 }
      );
    }

    // Send approval email
    try {
      const { Resend } = await import('resend');
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not set - email not sent');
        return NextResponse.json({ 
          error: 'Email service not configured. Ambassador approved but email not sent.',
          success: true,
          emailSent: false
        }, { status: 200 });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Format from email correctly
      let fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mail.prepskul.com';
      // If it doesn't already include the name, add it
      if (!fromEmail.includes('<')) {
        fromEmail = `PrepSkul <${fromEmail}>`;
      }
      const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com';
      
      // Use custom email content if provided, otherwise use default
      const subject = customSubject || '🎉 Congratulations! Your PrepSkul Ambassador Application Has Been Approved';
      const emailBody = customBody || `Dear ${ambassador.full_name},

We are thrilled to inform you that your application to become a PrepSkul Ambassador has been approved! 🎊

You are now officially a PrepSkul Ambassador, and we're excited to have you join our growing community of passionate individuals helping PrepSkul expand access to learning opportunities.

What's Next?

You will receive a WhatsApp message from our team within the next few days with more details about your ambassador journey. We'll share information about exclusive ambassador resources, opportunities, and how you can start making an impact.

Keep an eye on your email for updates and ambassador portal access information.

As a PrepSkul Ambassador, you play a crucial role in:
• Representing PrepSkul's mission in your school, community, and online
• Helping students, parents, and tutors discover meaningful opportunities
• Building trust in education and expanding access to learning

We believe in your passion for education and community, and we're confident you'll do well in representing PrepSkul and helping us grow.

Welcome to the PrepSkul Ambassador family! 🌟

Best regards,
The PrepSkul Team`;

      console.log('[Ambassadors] Sending approval email:', {
        from: fromEmail,
        to: ambassador.email,
        subject: subject,
        hasBody: !!emailBody,
      });

      // Convert plain text to HTML (preserve line breaks)
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ambassador Application Approved</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="color: #374151; white-space: pre-wrap; line-height: 1.8;">${emailBody.replace(/\n/g, '<br />')}</div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>For inquiries, contact us at <a href="mailto:info@prepskul.com" style="color: #667eea;">info@prepskul.com</a></p>
          </div>
        </body>
        </html>
      `;

      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: ambassador.email,
        replyTo: replyTo,
        subject: subject,
        html: html,
      });

      // Check if Resend actually succeeded
      if (emailResult.error) {
        console.error('❌ [Ambassadors] Resend API error:', emailResult.error);
        const errorMessage = emailResult.error.message || JSON.stringify(emailResult.error);
        
        // Check for domain verification error
        const requiresDomainVerification = 
          errorMessage.toLowerCase().includes('domain') ||
          errorMessage.toLowerCase().includes('verify') ||
          errorMessage.toLowerCase().includes('not verified');
        
        return NextResponse.json({
          success: true,
          emailSent: false,
          error: 'Ambassador approved but email failed to send',
          emailError: errorMessage,
          requiresDomainVerification,
          message: requiresDomainVerification 
            ? 'Email failed: Domain not verified in Resend. Please verify mail.prepskul.com at resend.com/domains'
            : `Email failed: ${errorMessage}`,
        });
      }

      if (!emailResult.data || !emailResult.data.id) {
        console.error('❌ [Ambassadors] Resend returned no data:', emailResult);
        return NextResponse.json({
          success: true,
          emailSent: false,
          error: 'Ambassador approved but email service returned no confirmation',
          emailError: 'No email ID returned from Resend',
        });
      }

      console.log('✅ [Ambassadors] Approval email sent successfully:', {
        emailId: emailResult.data.id,
        to: ambassador.email,
        subject: subject,
        from: fromEmail,
      });

      return NextResponse.json({
        success: true,
        emailSent: true,
        message: 'Ambassador approved and email sent successfully',
        emailId: emailResult.data.id,
      });
    } catch (emailError: any) {
      console.error('[Ambassadors] Email error:', emailError);
      // Still return success since the approval was successful
      return NextResponse.json({
        success: true,
        emailSent: false,
        error: 'Ambassador approved but email failed to send',
        emailError: emailError.message,
      });
    }
  } catch (error: any) {
    console.error('[Ambassadors] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

