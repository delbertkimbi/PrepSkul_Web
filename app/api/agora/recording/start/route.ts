/**
 * Start Agora Cloud Recording
 * POST /api/agora/recording/start
 * 
 * Starts recording in Individual Mode (audio only) for a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RecordingService } from '@/lib/services/agora/recording.service';
import { generateSessionUID } from '@/lib/services/agora/token-generator';
import { getCorsHeaders } from '@/lib/utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    console.log('[Recording Start] Incoming request to /api/agora/recording/start');
    console.log('[Recording Start] Request method:', request.method);

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('[Recording Start] Auth error or no user:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    console.log('[Recording Start] Parsed body:', body);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get session details - try individual_sessions first, then trial_sessions
    let session: { id: string; tutor_id: string; learner_id: string | null; parent_id?: string; agora_channel_name?: string } | null = null;
    console.log('[Recording Start] Looking up session in individual_sessions:', sessionId);
    const { data: indSession, error: indError } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, agora_channel_name')
      .eq('id', sessionId)
      .maybeSingle();

    if (indError) {
      console.error('[Recording Start] individual_sessions query error:', indError);
    }

    if (indSession) {
      session = indSession;
    } else {
      console.log('[Recording Start] Session not found in individual_sessions, checking trial_sessions:', sessionId);
      const { data: trialSession, error: trialError } = await supabase
        .from('trial_sessions')
        .select('id, tutor_id, learner_id, parent_id')
        .eq('id', sessionId)
        .maybeSingle();
      if (trialSession) {
        session = { ...trialSession, agora_channel_name: undefined };
      } else if (trialError) {
        console.error('[Recording Start] trial_sessions query error:', trialError);
      }
    }

    if (!session) {
      console.warn('[Recording Start] Session not found in individual_sessions or trial_sessions for id:', sessionId);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Verify user is part of the session
    const parentId = (session as any).parent_id;
    const isParticipant =
      session.tutor_id === user.id ||
      session.learner_id === user.id ||
      parentId === user.id;
    if (!isParticipant) {
      console.warn('[Recording Start] Forbidden: user not participant in session', {
        userId: user.id,
        sessionTutorId: session.tutor_id,
        sessionLearnerId: session.learner_id,
        parentId,
      });
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this session' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Check if recording already exists
    console.log('[Recording Start] Checking existing session_recordings row for session:', sessionId);
    const { data: existingRecording, error: existingRecordingError } = await supabase
      .from('session_recordings')
      .select('recording_resource_id, recording_sid, recording_status')
      .eq('session_id', sessionId)
      .single();

    if (existingRecordingError) {
      console.error('[Recording Start] session_recordings query error:', existingRecordingError);
    }

    if (existingRecording && existingRecording.recording_status === 'recording') {
      console.log('[Recording Start] Recording already in progress for session:', sessionId);
      return NextResponse.json({
        resourceId: existingRecording.recording_resource_id,
        sid: existingRecording.recording_sid,
        message: 'Recording already in progress',
      }, { headers: corsHeaders });
    }

    // Generate channel name if not exists
    const channelName = session.agora_channel_name || `session_${sessionId}`;

    // CRITICAL: Use generateSessionUID to get the SAME numeric UIDs that participants
    // use when joining the channel (from token API). Agora Cloud Recording requires
    // these UIDs to subscribe to the correct audio streams.
    const tutorUid = String(generateSessionUID(sessionId, session.tutor_id, 'tutor'));
    const learnerUid = session.learner_id
      ? String(generateSessionUID(sessionId, session.learner_id, 'learner'))
      : null;

    console.log('[Recording Start] Channel:', channelName, 'tutorUid:', tutorUid, 'learnerUid:', learnerUid);

    // Start recording
    console.log('[Recording Start] Calling RecordingService.startRecording...');
    const recordingService = new RecordingService();
    const { resourceId, sid } = await recordingService.startRecording({
      sessionId,
      channelName,
      tutorUid,
      learnerUid,
    });
    console.log('[Recording Start] Recording started, resourceId:', resourceId, 'sid:', sid);

    // Update session with recording info
    console.log('[Recording Start] Updating individual_sessions with recording metadata for session:', sessionId);
    const updateResult = await supabase
      .from('individual_sessions')
      .update({
        agora_channel_name: channelName,
        recording_resource_id: resourceId,
        recording_sid: sid,
        recording_status: 'recording',
      })
      .eq('id', sessionId);

    if (updateResult.error) {
      console.error('[Recording Start] Failed to update individual_sessions with recording metadata:', updateResult.error);
    } else {
      console.log('[Recording Start] individual_sessions updated with recording metadata for session:', sessionId);
    }

    return NextResponse.json({
      resourceId,
      sid,
      channelName,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[Recording Start] Error starting recording:', error);
    if (error?.stack) {
      console.error('[Recording Start] Stack trace:', error.stack);
    }
    return NextResponse.json(
      { error: error.message || 'Failed to start recording' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// CORS preflight handler
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
