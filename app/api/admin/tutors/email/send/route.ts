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

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'PrepSkul <info@prepskul.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    console.log('✅ Custom email sent successfully:', data);

    // Return success
    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



