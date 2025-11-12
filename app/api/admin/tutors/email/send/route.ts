import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get email data from request
    const { to, subject, html, tutorId, templateType } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Initialize Resend only at runtime (not during build)
    const { Resend } = await import('resend');
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not set - email not sent');
      return NextResponse.json({ 
        error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.',
        success: false 
      }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Use Resend's default sender for testing, or verified domain
    // For production, you need to verify prepskul.com domain at https://resend.com/domains
    // For now, use onboarding@resend.dev (Resend's test domain) or your verified domain
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    // Set reply-to to business email so replies go to info@prepskul.com
    const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com';

    // Send email via Resend
    const emailResult = await resend.emails.send({
      from: fromEmail.includes('@') ? `PrepSkul <${fromEmail}>` : fromEmail,
      to,
      replyTo: replyTo,
      subject,
      html,
    });

    // Check if Resend actually succeeded
    if (emailResult.error) {
      console.error('❌ Resend API error:', emailResult.error);
      return NextResponse.json(
        { 
          success: false,
          error: emailResult.error.message || 'Failed to send email', 
          details: emailResult.error 
        },
        { status: 500 }
      );
    }

    if (!emailResult.data || !emailResult.data.id) {
      console.error('❌ Resend returned no data:', emailResult);
      return NextResponse.json(
        { 
          success: false,
          error: 'Email service returned no confirmation',
          details: emailResult
        },
        { status: 500 }
      );
    }

    console.log('✅ Custom email sent successfully:', {
      emailId: emailResult.data.id,
      to: to,
      subject: subject
    });

    // Return success
    return NextResponse.json({
      success: true,
      messageId: emailResult.data.id,
      to: to
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



