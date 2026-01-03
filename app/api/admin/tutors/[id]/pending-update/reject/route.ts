import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

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
    const { reason } = body || {};

    const supabase = await createServerSupabaseClient();

    // Fetch tutor profile
    const { data: tutor, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('user_id, pending_changes, has_pending_update')
      .eq('id', id)
      .maybeSingle();

    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    if (!tutor.has_pending_update || !tutor.pending_changes) {
      return NextResponse.json(
        { error: 'No pending update found' },
        { status: 400 }
      );
    }

    const pendingChanges = tutor.pending_changes as Record<string, any>;
    
    // Get list of rejected fields for notification
    const rejectedFields = Object.keys(pendingChanges);
    const fieldNames: Record<string, string> = {
      highest_education_level: 'Highest Education Level',
      bio: 'Bio',
      availability_schedule: 'Availability Schedule',
      subjects: 'Subjects',
      years_of_experience: 'Years of Experience',
      tutoring_availability: 'Tutoring Availability',
      test_session_availability: 'Test Session Availability',
      hourly_rate: 'Hourly Rate',
      certificates_urls: 'Certificates',
      social_media_links: 'Social Media Links',
      video_link: 'Video Link',
      languages: 'Languages',
      specializations: 'Specializations',
      education_background: 'Education Background',
      professional_experience: 'Professional Experience',
      teaching_approach: 'Teaching Approach',
      full_name: 'Full Name',
      city: 'City',
      tutoring_areas: 'Tutoring Areas',
    };
    const rejectedFieldNames = rejectedFields.map(f => fieldNames[f] || f).join(', ');

    // Clear pending changes and update flag
    const { error: updateError } = await supabase
      .from('tutor_profiles')
      .update({
        pending_changes: null,
        has_pending_update: false,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Optionally add rejection reason to admin_review_notes
        admin_review_notes: reason 
          ? `Update rejected: ${reason}` 
          : 'Update rejected by admin',
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error rejecting pending update:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject changes', details: updateError.message },
        { status: 500 }
      );
    }

    // Fetch user profile for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', tutor.user_id)
      .maybeSingle();

    // Send in-app notification to tutor - brief message for all rejected
    try {
      const notificationMessage = reason
        ? `All your profile updates were rejected. Reason: ${reason}`
        : `All your profile updates were rejected. Please review your changes and try again.`;

      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const notificationUrl = `${apiUrl}/api/notifications/send`;
      
      console.log('📤 Sending notification to:', notificationUrl);

      const notificationResponse = await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tutor.user_id,
          type: 'profile_update_rejected',
          title: '❌ All Updates Rejected',
          message: notificationMessage,
            metadata: {
              rejected_fields: rejectedFields,
              rejected_field_names: rejectedFieldNames,
              rejection_reason: reason || null,
              all_rejected: true,
            },
            priority: 'high',
            sendEmail: false,
          }),
      });

      const responseText = await notificationResponse.text();
      
      if (!notificationResponse.ok) {
        console.error('❌ Failed to send notification:', {
          status: notificationResponse.status,
          statusText: notificationResponse.statusText,
          response: responseText,
        });
        
        // Try to create notification directly in Supabase as fallback
        try {
          const { error: directNotifError } = await supabase
            .from('notifications')
            .insert({
              user_id: tutor.user_id,
              type: 'profile_update_rejected',
              notification_type: 'profile_update_rejected',
              title: '❌ All Updates Rejected',
              message: notificationMessage,
              priority: 'high',
              metadata: {
                rejected_fields: rejectedFields,
                rejected_field_names: rejectedFieldNames,
                rejection_reason: reason || null,
                all_rejected: true,
              },
              is_read: false,
              created_at: new Date().toISOString(),
            });
          
          if (directNotifError) {
            console.error('❌ Failed to create notification directly:', directNotifError);
          } else {
            console.log('✅ Notification created directly in Supabase (fallback)');
          }
        } catch (fallbackError) {
          console.error('❌ Fallback notification creation failed:', fallbackError);
        }
      } else {
        console.log('✅ Notification sent successfully:', responseText);
      }
    } catch (notifError) {
      console.error('❌ Error sending notification:', notifError);
      
      // Try to create notification directly in Supabase as fallback
      try {
        const notificationMessage = reason
          ? `All your profile updates were rejected. Reason: ${reason}`
          : `All your profile updates were rejected. Please review your changes and try again.`;
          
        const { error: directNotifError } = await supabase
          .from('notifications')
          .insert({
            user_id: tutor.user_id,
            type: 'profile_update_rejected',
            notification_type: 'profile_update_rejected',
            title: '❌ All Updates Rejected',
            message: notificationMessage,
            priority: 'high',
            action_url: '/tutor/dashboard',
            action_text: 'View Dashboard',
            metadata: {
              rejected_fields: rejectedFields,
              rejected_field_names: rejectedFieldNames,
              rejection_reason: reason || null,
              all_rejected: true,
            },
            is_read: false,
            created_at: new Date().toISOString(),
          });
        
        if (directNotifError) {
          console.error('❌ Failed to create notification directly:', directNotifError);
        } else {
          console.log('✅ Notification created directly in Supabase (fallback)');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback notification creation failed:', fallbackError);
      }
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Changes rejected successfully'
    });
  } catch (error: any) {
    console.error('Error rejecting pending update:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

