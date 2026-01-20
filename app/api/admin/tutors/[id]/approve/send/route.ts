import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { profileApprovedEmail } from '@/lib/email_templates/tutor_profile_templates';
import { sendCustomEmail } from '@/lib/notifications';

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
    const body = await request.json();
    const { subject, body: emailBody } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Fetch tutor profile and user profile
    const { data: tutor } = await supabase
      .from('tutor_profiles')
      .select('user_id, admin_approved_rating, base_session_price, pricing_tier')
      .eq('id', id)
      .maybeSingle();

    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    // Fetch user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', tutor.user_id)
      .maybeSingle();

    if (!profile?.email) {
      return NextResponse.json(
        { error: 'Tutor email not found' },
        { status: 404 }
      );
    }

    // Generate branded email using template
    const emailHtml = profileApprovedEmail(
      profile.full_name || 'Tutor',
      tutor.admin_approved_rating ?? undefined,
      tutor.base_session_price ?? undefined,
      tutor.pricing_tier ?? undefined,
      emailBody // Pass custom body as admin notes
    );

    // Send using branded template
    const emailResult = await sendCustomEmail(
      profile.email,
      profile.full_name || 'Tutor',
      subject || 'Your PrepSkul Tutor Profile Has Been Approved! 🎉',
      emailHtml
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          message: emailResult.error || 'An error occurred while sending the email',
        },
        { status: 500 }
      );
    }

    // Update tutor status to approved and clear pending update flag
    await supabase
      .from('tutor_profiles')
      .update({
        status: 'approved',
        has_pending_update: false, // Clear pending update flag when approving
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Send in-app notification to tutor
    try {
      // Call the notification send API
      const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tutor.user_id,
          type: 'profile_approved',
          title: 'Profile Approved! 🎉',
          message: 'Your PrepSkul tutor profile has been approved. Your profile is now live and students can book sessions with you!',
          priority: 'high',
          sendEmail: false, // Email already sent above
        }),
      });

      if (!notificationResponse.ok) {
        console.error('❌ Failed to send in-app notification:', await notificationResponse.text());
      } else {
        console.log('✅ In-app notification sent successfully');
      }
    } catch (notifError) {
      console.error('❌ Error sending in-app notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending approval email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
