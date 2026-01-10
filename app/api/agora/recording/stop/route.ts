import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { stopRecording, getAgoraRecordingConfig } from '@/lib/services/agora/recording-service';
import { getAgoraConfig } from '@/lib/services/agora/token-generator';
import { validateSessionAccess, getUserRoleInSession } from '@/lib/services/agora/session-service';

/**
 * Stop Agora Cloud Recording API
 * 
 * POST /api/agora/recording/stop
 * Body: { sessionId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // Validate user access (only tutor can stop recording)
    const hasAccess = await validateSessionAccess(sessionId, user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const role = await getUserRoleInSession(sessionId, user.id);
    if (role !== 'tutor') {
      return NextResponse.json(
        { error: 'Only tutors can stop recording' },
        { status: 403 }
      );
    }

    // Get session recording metadata
    const { data: session, error: sessionError } = await supabase
      .from('individual_sessions')
      .select('recording_resource_id, recording_sid, agora_channel_name')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.recording_resource_id || !session.recording_sid) {
      return NextResponse.json(
        { error: 'Recording not started for this session' },
        { status: 400 }
      );
    }

    // Get Agora configuration
    const agoraConfig = getAgoraConfig();
    const recordingConfig = getAgoraRecordingConfig();

    // Stop recording
    await stopRecording(
      agoraConfig.appId,
      session.recording_resource_id,
      session.recording_sid,
      session.agora_channel_name || `session_${sessionId}`,
      user.id,
      recordingConfig.customerId,
      recordingConfig.customerSecret,
      'individual' // Individual mode
    );

    // Update recording status in database
    await supabase
      .from('individual_sessions')
      .update({
        recording_status: 'stopped',
      })
      .eq('id', sessionId);

    await supabase
      .from('session_recordings')
      .update({
        recording_status: 'stopped',
      })
      .eq('session_id', sessionId);

    return NextResponse.json({
      success: true,
      message: 'Recording stopped',
    });
  } catch (error: any) {
    console.error('Error stopping recording:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop recording' },
      { status: 500 }
    );
  }
}

