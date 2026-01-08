import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { startRecording, getAgoraRecordingConfig } from '@/lib/services/agora/recording-service';
import { getAgoraConfig } from '@/lib/services/agora/token-generator';
import { getOrCreateChannelName, validateSessionAccess, getUserRoleInSession } from '@/lib/services/agora/session-service';

/**
 * Start Agora Cloud Recording API
 * 
 * POST /api/agora/recording/start
 * Body: { sessionId: string }
 * 
 * Returns: { resourceId: string, sid: string }
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

    // Validate user access (only tutor can start recording)
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
        { error: 'Only tutors can start recording' },
        { status: 403 }
      );
    }

    // Get or create channel name
    const channelName = await getOrCreateChannelName(sessionId);

    // Get Agora configuration
    const agoraConfig = getAgoraConfig();
    const recordingConfig = getAgoraRecordingConfig();

    // Start recording
    const recording = await startRecording({
      appId: agoraConfig.appId,
      channelName,
      uid: user.id, // Use user ID as UID for recording
      customerId: recordingConfig.customerId,
      customerSecret: recordingConfig.customerSecret,
      recordingMode: 'individual', // Individual mode for separate streams
      videoQuality: '720p', // 720p as per requirements
      audioOnlyFallback: true, // Audio fallback if video fails
    });

    // Store recording metadata in database
    await supabase
      .from('individual_sessions')
      .update({
        recording_resource_id: recording.resourceId,
        recording_sid: recording.sid,
        recording_status: 'recording',
      })
      .eq('id', sessionId);

    // Create recording record
    await supabase
      .from('session_recordings')
      .insert({
        session_id: sessionId,
        recording_resource_id: recording.resourceId,
        recording_sid: recording.sid,
        recording_status: 'recording',
      });

    return NextResponse.json({
      resourceId: recording.resourceId,
      sid: recording.sid,
    });
  } catch (error: any) {
    console.error('Error starting recording:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start recording' },
      { status: 500 }
    );
  }
}

