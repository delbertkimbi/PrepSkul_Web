import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    // Get tutor profile
    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();
    
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Get tutor email from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', tutor.user_id)
      .maybeSingle();

    if (!profile?.email) {
      return NextResponse.json({ error: 'Tutor email not found' }, { status: 404 });
    }

    // Send email using Resend
    try {
      const { Resend } = await import('resend');
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not set - email not sent');
        return NextResponse.json({ 
          error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.',
          success: false 
        }, { status: 500 });
      }

      const resend = new Resend(process.env.RESEND_API_KEY);
      const emailResult = await resend.emails.send({
        from: 'PrepSkul <info@prepskul.com>',
        to: profile.email,
        subject: subject,
        html: body.replace(/\n/g, '<br />'),
      });

      console.log('📧 Custom email sent:', emailResult);

      return NextResponse.json({ 
        success: true,
        message: 'Email sent successfully',
        emailId: emailResult.id 
      });
    } catch (emailError: any) {
      console.error('❌ Error sending email:', emailError);
      return NextResponse.json({ 
        error: emailError.message || 'Failed to send email',
        success: false 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('❌ Error in send-email route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

