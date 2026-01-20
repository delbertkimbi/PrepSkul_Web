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
    const supabase = await createServerSupabaseClient();

    // Fetch tutor profile with pending_changes
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
        { error: 'No pending changes found' },
        { status: 400 }
      );
    }

    const pendingChanges = tutor.pending_changes as Record<string, any>;
    
    // Get list of approved fields for notification
    const approvedFields = Object.keys(pendingChanges);
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
    const approvedFieldNames = approvedFields.map(f => fieldNames[f] || f).join(', ');

    // Apply all pending changes to the profile
    const updateData: Record<string, any> = {
      ...pendingChanges,
      pending_changes: null, // Clear pending changes
      has_pending_update: false, // Clear pending update flag
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update tutor profile with approved changes
    const { error: updateError } = await supabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating tutor profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to apply changes', details: updateError.message },
        { status: 500 }
      );
    }

    // Fetch user profile for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', tutor.user_id)
      .maybeSingle();

    // Send in-app notification to tutor - brief message for all approved
    try {
      const notificationMessage = `All your profile updates have been approved and are now live on your profile.`;

      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const notificationUrl = `${apiUrl}/api/notifications/send`;
      
      console.log('📤 Sending notification to:', notificationUrl);
      console.log('📤 Notification payload:', {
        userId: tutor.user_id,
        type: 'profile_update_approved',
        title: 'All Updates Approved',
        message: notificationMessage,
      });

      const notificationResponse = await fetch(notificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: tutor.user_id,
          type: 'profile_update_approved',
          title: 'All Updates Approved',
          message: notificationMessage,
            metadata: {
              approved_fields: approvedFields,
              approved_field_names: approvedFieldNames,
              all_approved: true,
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
              type: 'profile_update_approved',
              notification_type: 'profile_update_approved',
              title: 'All Updates Approved',
              message: notificationMessage,
              priority: 'high',
              metadata: {
                approved_fields: approvedFields,
                approved_field_names: approvedFieldNames,
                all_approved: true,
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
        const { error: directNotifError } = await supabase
          .from('notifications')
          .insert({
            user_id: tutor.user_id,
            type: 'profile_update_approved',
            notification_type: 'profile_update_approved',
            title: 'All Updates Approved',
            message: 'All your profile updates have been approved and are now live on your profile.',
            priority: 'high',
            action_url: '/tutor/dashboard',
            action_text: 'View Dashboard',
            metadata: {
              approved_fields: approvedFields,
              approved_field_names: approvedFieldNames,
              all_approved: true,
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
      message: 'Changes approved and applied successfully'
    });
  } catch (error: any) {
    console.error('Error approving pending update:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

