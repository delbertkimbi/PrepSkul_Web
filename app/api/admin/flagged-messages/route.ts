import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

/**
 * Admin Flagged Messages API
 * 
 * GET: Fetch flagged messages with filters
 * POST: Resolve flagged messages
 */

export async function GET(request: Request) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const senderId = searchParams.get('sender_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from('flagged_messages')
      .select(`
        *,
        sender:profiles!flagged_messages_sender_id_fkey(
          id,
          full_name,
          avatar_url,
          user_type
        ),
        conversation:conversations!flagged_messages_conversation_id_fkey(
          id,
          student_id,
          tutor_id
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (senderId) {
      query = query.eq('sender_id', senderId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching flagged messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flagged messages' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('flagged_messages')
      .select('id', { count: 'exact', head: true });

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (severity) {
      countQuery = countQuery.eq('severity', severity);
    }

    if (senderId) {
      countQuery = countQuery.eq('sender_id', senderId);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      flaggedMessages: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('❌ Error in GET /api/admin/flagged-messages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const isUserAdmin = await isAdmin(user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flaggedMessageId, action, reviewNotes, actionTaken } = body;

    if (!flaggedMessageId || !action) {
      return NextResponse.json(
        { error: 'flaggedMessageId and action are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get the flagged message
    const { data: flaggedMessage, error: fetchError } = await supabase
      .from('flagged_messages')
      .select('*')
      .eq('id', flaggedMessageId)
      .single();

    if (fetchError || !flaggedMessage) {
      return NextResponse.json(
        { error: 'Flagged message not found' },
        { status: 404 }
      );
    }

    // Update flagged message based on action
    const updateData: any = {
      status: action === 'approve' ? 'approved' : action === 'block' ? 'blocked' : 'resolved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes || null,
      action_taken: actionTaken || null,
    };

    const { data: updated, error: updateError } = await supabase
      .from('flagged_messages')
      .update(updateData)
      .eq('id', flaggedMessageId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating flagged message:', updateError);
      return NextResponse.json(
        { error: 'Failed to update flagged message' },
        { status: 500 }
      );
    }

    // If action is to warn/mute/ban, create user violation
    if (actionTaken && ['warning', 'mute_24h', 'mute_7d', 'ban'].includes(actionTaken)) {
      const violationData = {
        user_id: flaggedMessage.sender_id,
        violation_type: (flaggedMessage.flags as any[])?.[0]?.type || 'unknown',
        severity: flaggedMessage.severity,
        flagged_message_id: flaggedMessageId,
        action_taken: actionTaken,
        expires_at: actionTaken === 'mute_24h' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : actionTaken === 'mute_7d'
          ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : null,
      };

      await supabase
        .from('user_violations')
        .insert(violationData);
    }

    return NextResponse.json({
      flaggedMessage: updated,
    });
  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/flagged-messages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

