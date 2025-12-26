import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

/**
 * Admin Response to Unblock Request API Route
 * 
 * POST: Admin approves or rejects an unblock/unhide request
 * Updates tutor status and sends notification to tutor
 */

export async function POST(
  request: Request,
  { params }: { params: { requestId: string } }
) {
  try {
    // Check admin authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, adminResponse } = body; // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get the request
    const { data: requestRecord, error: requestError } = await supabase
      .from('tutor_unblock_requests')
      .select('*, tutor_profiles!inner(id, user_id, status)')
      .eq('id', params.requestId)
      .maybeSingle();

    if (requestError || !requestRecord) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update request status
    const { error: updateError } = await supabase
      .from('tutor_unblock_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_response: adminResponse || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.requestId);

    if (updateError) {
      console.error('Error updating request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    // If approved, update tutor status
    if (action === 'approve') {
      const newStatus = requestRecord.request_type === 'unblock' ? 'approved' : 'approved';
      
      const { error: tutorUpdateError } = await supabase
        .from('tutor_profiles')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestRecord.tutor_id);

      if (tutorUpdateError) {
        console.error('Error updating tutor status:', tutorUpdateError);
        // Don't fail the request, just log the error
      }
    }

    // Send notification to tutor
    const tutorUserId = requestRecord.tutor_profiles?.user_id || requestRecord.tutor_user_id;
    
    if (tutorUserId) {
      await supabase.from('notifications').insert({
        user_id: tutorUserId,
        type: 'unblock_request_response',
        title: action === 'approve' 
          ? 'Request Approved' 
          : 'Request Rejected',
        message: action === 'approve'
          ? `Your ${requestRecord.request_type === 'unblock' ? 'unblock' : 'unhide'} request has been approved. Your account is now active.`
          : `Your ${requestRecord.request_type === 'unblock' ? 'unblock' : 'unhide'} request has been rejected.${adminResponse ? ` Reason: ${adminResponse}` : ''}`,
        data: {
          request_id: params.requestId,
          action: action,
          request_type: requestRecord.request_type,
        },
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    console.log(`✅ Unblock request ${action}d: ${params.requestId}`);

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`,
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/tutors/unblock-requests/[requestId]/respond:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}






