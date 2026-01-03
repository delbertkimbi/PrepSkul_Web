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
    const { field, reason } = body;

    if (!field) {
      return NextResponse.json(
        { error: 'Field name is required' },
        { status: 400 }
      );
    }

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
    
    if (!pendingChanges[field]) {
      return NextResponse.json(
        { error: `Field "${field}" not found in pending changes` },
        { status: 400 }
      );
    }

    const remainingChanges = { ...pendingChanges };
    delete remainingChanges[field];

    // Update pending_changes (remove the rejected field)
    // If there are remaining changes, keep has_pending_update = true
    // Otherwise, clear pending_changes and has_pending_update
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (Object.keys(remainingChanges).length > 0) {
      updateData.pending_changes = remainingChanges;
      updateData.has_pending_update = true;
    } else {
      updateData.pending_changes = null;
      updateData.has_pending_update = false;
    }

    // Update tutor profile
    const { error: updateError } = await supabase
      .from('tutor_profiles')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating tutor profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject field', details: updateError.message },
        { status: 500 }
      );
    }

    // Field name mapping for notification
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
    const fieldName = fieldNames[field] || field;

    // Send in-app notification to tutor - brief message for single field
    // Check if there are remaining fields to determine message
    const hasRemainingFields = Object.keys(remainingChanges).length > 0;
    
    try {
      let notificationMessage: string;
      if (reason) {
        notificationMessage = hasRemainingFields
          ? `"${fieldName}" rejected. Reason: ${reason}. ${Object.keys(remainingChanges).length} update(s) still pending.`
          : `"${fieldName}" rejected. Reason: ${reason}.`;
      } else {
        notificationMessage = hasRemainingFields
          ? `"${fieldName}" rejected. ${Object.keys(remainingChanges).length} update(s) still pending review.`
          : `"${fieldName}" rejected. Please review your changes and try again.`;
      }

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
          title: '❌ Update Rejected',
          message: notificationMessage,
            metadata: {
              rejected_fields: [field],
              rejected_field_names: fieldName,
              rejection_reason: reason || null,
              remaining_fields: Object.keys(remainingChanges),
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
              title: '❌ Update Rejected',
              message: notificationMessage,
              priority: 'high',
              metadata: {
                rejected_fields: [field],
                rejected_field_names: fieldName,
                rejection_reason: reason || null,
                remaining_fields: Object.keys(remainingChanges),
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
        let notificationMessage: string;
        if (reason) {
          notificationMessage = hasRemainingFields
            ? `"${fieldName}" rejected. Reason: ${reason}. ${Object.keys(remainingChanges).length} update(s) still pending.`
            : `"${fieldName}" rejected. Reason: ${reason}.`;
        } else {
          notificationMessage = hasRemainingFields
            ? `"${fieldName}" rejected. ${Object.keys(remainingChanges).length} update(s) still pending review.`
            : `"${fieldName}" rejected. Please review your changes and try again.`;
        }
          
        const { error: directNotifError } = await supabase
          .from('notifications')
          .insert({
            user_id: tutor.user_id,
            type: 'profile_update_rejected',
            notification_type: 'profile_update_rejected',
            title: '❌ Update Rejected',
            message: notificationMessage,
            priority: 'high',
            action_url: '/tutor/dashboard',
            action_text: 'View Dashboard',
            metadata: {
              rejected_fields: [field],
              rejected_field_names: fieldName,
              rejection_reason: reason || null,
              remaining_fields: Object.keys(remainingChanges),
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
      message: `Field "${fieldName}" rejected successfully`,
      remainingChanges: Object.keys(remainingChanges).length,
    });
  } catch (error: any) {
    console.error('Error rejecting field:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

