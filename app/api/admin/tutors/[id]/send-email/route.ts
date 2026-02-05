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

    // Get tutor email and user info from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, id')
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
      
      // Use Resend's verified domain (mail.prepskul.com)
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>';
      
      // Set reply-to to business email so replies go to info@prepskul.com
      const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com';
      
      const emailResult = await resend.emails.send({
        from: fromEmail.includes('@') ? `PrepSkul <${fromEmail}>` : fromEmail,
        to: profile.email,
        replyTo: replyTo,
        subject: subject,
        html: body.replace(/\n/g, '<br />'),
      });

      // Check if Resend actually succeeded
      if (emailResult.error) {
        console.error('❌ Resend API error:', emailResult.error);
        return NextResponse.json({ 
          success: false,
          error: emailResult.error.message || 'Failed to send email',
          details: emailResult.error
        }, { status: 500 });
      }

      if (!emailResult.data || !emailResult.data.id) {
        console.error('❌ Resend returned no data:', emailResult);
        return NextResponse.json({ 
          success: false,
          error: 'Email service returned no confirmation',
          details: emailResult
        }, { status: 500 });
      }

      console.log('📧 Custom email sent successfully:', {
        emailId: emailResult.data.id,
        to: profile.email,
        subject: subject
      });

      // Optionally create in-app notification for custom emails
      // (Admin can choose to notify user about the email)
      try {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            type: 'tutor_message',
            notification_type: 'tutor_message',
            title: 'New Message from PrepSkul',
            message: `You have received a message from PrepSkul admin. Check your email for details.`,
            priority: 'normal',
            is_read: false,
            action_url: '/tutor/profile',
            action_text: 'View Profile',
            icon: undefined,
          });
        
        if (notifError) {
          console.warn('⚠️ Could not create in-app notification:', notifError);
        } else {
          console.log('✅ In-app notification created for custom email');
        }
      } catch (notifError) {
        console.warn('⚠️ Error creating in-app notification:', notifError);
        // Don't fail the request if notification creation fails
      }

      return NextResponse.json({ 
        success: true,
        message: 'Email sent successfully',
        emailId: emailResult.data.id,
        to: profile.email
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





