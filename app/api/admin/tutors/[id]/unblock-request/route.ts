import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getServerSession } from '@/lib/supabase-server';

/**
 * Request Unblock/Unhide API Route
 * 
 * POST: Creates a request from tutor to unblock/unhide their account
 * Sends notification to all admins
 */

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { requestType, reason } = body; // 'unblock' or 'unhide'

    const supabase = createServerSupabaseClient();

    // Get tutor profile
    const { data: tutorProfile, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('user_id, status')
      .eq('id', params.id)
      .single();

    if (tutorError || !tutorProfile) {
      return NextResponse.json(
        { error: 'Tutor profile not found' },
        { status: 404 }
      );
    }

    // Verify status matches request type
    if (requestType === 'unblock' && tutorProfile.status !== 'blocked') {
      return NextResponse.json(
        { error: 'Tutor account is not blocked' },
        { status: 400 }
      );
    }

    if (requestType === 'unhide' && tutorProfile.status !== 'hidden') {
      return NextResponse.json(
        { error: 'Tutor account is not hidden' },
        { status: 400 }
      );
    }

    // Create unblock request record
    const { data: requestRecord, error: requestError } = await supabase
      .from('tutor_unblock_requests')
      .insert({
        tutor_id: params.id,
        tutor_user_id: tutorProfile.user_id,
        request_type: requestType,
        reason: reason || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating unblock request:', requestError);
      return NextResponse.json(
        { error: 'Failed to create request' },
        { status: 500 }
      );
    }

    // Get all admin users
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    if (admins && admins.length > 0) {
      // Create notifications for all admins
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'tutor_unblock_request',
        title: `Tutor ${requestType === 'unblock' ? 'Unblock' : 'Unhide'} Request`,
        message: `A tutor has requested to ${requestType === 'unblock' ? 'unblock' : 'unhide'} their account. Review the request in the admin dashboard.`,
        data: {
          tutor_id: params.id,
          request_id: requestRecord.id,
          request_type: requestType,
        },
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      await supabase.from('notifications').insert(notifications);
    }

    console.log(`✅ Unblock request created: ${requestRecord.id}`);

    return NextResponse.json({
      success: true,
      request: requestRecord,
      message: 'Your request has been submitted. Admins will review it shortly.',
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/tutors/[id]/unblock-request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}






