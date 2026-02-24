import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

/**
 * PATCH /api/admin/tutor-requests/[id]
 * Update tutor request (status, matched tutor, admin notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getServerSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, matched_tutor_id, admin_notes, matched_at } = body;

    const supabase = await createServerSupabaseClient();

    // Validate matched tutor if provided
    if (matched_tutor_id) {
      const { data: tutor, error: tutorError } = await supabase
        .from('tutor_profiles')
        .select('id, status')
        .eq('id', matched_tutor_id)
        .maybeSingle();

      if (tutorError) {
        console.error('Error validating tutor:', tutorError);
        return NextResponse.json(
          { error: 'Failed to validate tutor' },
          { status: 500 }
        );
      }

      if (!tutor) {
        return NextResponse.json(
          { error: 'Tutor not found' },
          { status: 404 }
        );
      }

      if (tutor.status !== 'approved') {
        return NextResponse.json(
          { error: 'Tutor must be approved before assignment' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (matched_tutor_id !== undefined) updateData.matched_tutor_id = matched_tutor_id;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (matched_at) updateData.matched_at = matched_at;
    updateData.updated_at = new Date().toISOString();

    // Get current request to check if status is changing
    const { data: currentRequest } = await supabase
      .from('tutor_requests')
      .select('requester_id, status, matched_tutor_id')
      .eq('id', id)
      .maybeSingle();

    const oldStatus = currentRequest?.status;
    const oldMatchedTutorId = currentRequest?.matched_tutor_id;

    const { data, error } = await supabase
      .from('tutor_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating tutor request:', error);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    // Send notification if status changed
    if (status && oldStatus && status !== oldStatus && currentRequest?.requester_id) {
      try {
        let tutorName: string | undefined;
        
        // If status changed to 'matched' and tutor was assigned, get tutor name
        if (status === 'matched' && matched_tutor_id) {
          const { data: tutor } = await supabase
            .from('tutor_profiles')
            .select(`
              profiles:user_id (
                full_name
              )
            `)
            .eq('id', matched_tutor_id)
            .maybeSingle();

          // Handle profiles as either array or object
          const profile = Array.isArray(tutor?.profiles) 
            ? tutor.profiles[0] 
            : tutor?.profiles;
          tutorName = profile?.full_name || 'a tutor';
        }

        // Send notification via API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000');

        let title: string;
        let message: string;
        let priority = 'normal';
        let icon: string | undefined;
        let sendPush = false;

        switch (status) {
          case 'in_progress':
            title = 'Request In Progress';
            message = 'Your tutor request is now being processed by our team. We\'ll keep you updated!';
            priority = 'normal';
            sendPush = true;
            break;
          case 'matched':
            title = 'Tutor Matched';
            message = tutorName 
              ? `Great news! We found a tutor for your request: ${tutorName}. Check the details now!`
              : 'Great news! We found a tutor for your request. Check the details now!';
            priority = 'high';
            sendPush = true;
            break;
          case 'closed':
            title = 'Request Closed';
            message = admin_notes 
              ? `Your tutor request has been closed. Note: ${admin_notes}`
              : 'Your tutor request has been closed.';
            priority = 'normal';
            break;
          default:
            title = 'Request Status Updated';
            message = `Your tutor request status has been updated to: ${status.replace(/_/g, ' ')}.`;
            priority = 'normal';
        }

        await fetch(`${apiUrl}/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentRequest.requester_id,
            type: 'tutor_request_status_changed',
            title: title,
            message: message,
            priority: priority,
            actionUrl: `/requests/${id}`,
            actionText: 'View Details',
            icon: icon,
            metadata: {
              request_id: id,
              old_status: oldStatus,
              new_status: status,
              tutor_id: matched_tutor_id || oldMatchedTutorId,
              tutor_name: tutorName,
              admin_notes: admin_notes,
            },
            sendEmail: true,
            sendPush: sendPush,
          }),
        });
      } catch (notifError) {
        console.warn('Failed to send status change notification:', notifError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/tutor-requests/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}