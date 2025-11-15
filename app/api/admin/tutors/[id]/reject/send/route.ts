import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { profileRejectedEmail } from '@/lib/email_templates/tutor_profile_templates';
import { sendCustomEmail } from '@/lib/notifications';

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
    const { subject, body, reasons } = await request.json();

    const supabase = await createServerSupabaseClient();
    const { data: tutor } = await supabase.from('tutor_profiles').select('user_id').eq('id', id).maybeSingle();
    if (!tutor) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });

    const { data: profile } = await supabase.from('profiles').select('email, full_name').eq('id', tutor.user_id).maybeSingle();

    // Send email if email address exists and API key is configured
    if (profile?.email) {
      try {
        // Format rejection reasons from the body or reasons parameter
        let rejectionReason: string;
        if (reasons) {
          // Format comma-separated reasons into a numbered list
          const reasonsList = reasons.split(', ').filter(r => r.trim());
          rejectionReason = reasonsList.length > 0
            ? reasonsList.map((r, i) => `${i + 1}. ${r}`).join('<br>')
            : 'Your application did not meet our current requirements.';
        } else if (body) {
          rejectionReason = body.replace(/\n/g, '<br>');
        } else {
          rejectionReason = 'Your application did not meet our current requirements.';
        }
        
        // Generate branded email using template
        const emailHtml = profileRejectedEmail(
          profile.full_name || 'Tutor',
          rejectionReason
        );

        // Send using branded template
        const emailResult = await sendCustomEmail(
          profile.email,
          profile.full_name || 'Tutor',
          subject || 'Your PrepSkul Tutor Application Status Update',
          emailHtml
        );

        if (!emailResult.success) {
          console.error('❌ Error sending rejection email:', emailResult.error);
        } else {
          console.log('📧 Rejection email sent successfully to:', profile.email);
        }
      } catch (emailError: any) {
        console.error('❌ Error sending email:', emailError);
        // Continue with status update even if email fails
      }
    } else {
      console.warn('⚠️ No email address found for tutor - email not sent');
    }

    await supabase.from('tutor_profiles').update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_review_notes: reasons || body || '',
    }).eq('id', id);

    // Create in-app notification
    try {
      const rejectionReason = reasons || body || 'Your application did not meet our current requirements.';
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: tutor.user_id,
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
      } else {
        console.log('✅ In-app notification created for tutor rejection');
      }
    } catch (notifError) {
      console.error('❌ Error creating in-app notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
