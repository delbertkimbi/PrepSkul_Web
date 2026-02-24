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
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Get session details - try individual_sessions first, then trial_sessions
    let session: { id: string; tutor_id: string; learner_id: string | null; parent_id?: string; agora_channel_name?: string } | null = null;
    const { data: indSession } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, agora_channel_name')
      .eq('id', sessionId)
      .maybeSingle();

    if (indSession) {
      session = indSession;
    } else {
      const { data: trialSession } = await supabase
        .from('trial_sessions')
        .select('id, tutor_id, learner_id, parent_id')
        .eq('id', sessionId)
        .maybeSingle();
      if (trialSession) {
        session = { ...trialSession, agora_channel_name: undefined };
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user is part of the session
    const parentId = (session as any).parent_id;
    const isParticipant =
      session.tutor_id === user.id ||
      session.learner_id === user.id ||
      parentId === user.id;
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this session' },
        { status: 403 }
      );
    }

    // Check if recording already exists
    const { data: existingRecording } = await supabase
      .from('session_recordings')
      .select('recording_resource_id, recording_sid, recording_status')
      .eq('session_id', sessionId)
      .single();

    if (existingRecording && existingRecording.recording_status === 'recording') {
      return NextResponse.json({
        resourceId: existingRecording.recording_resource_id,
        sid: existingRecording.recording_sid,
        message: 'Recording already in progress',
      });
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
    const recordingService = new RecordingService();
    const { resourceId, sid } = await recordingService.startRecording({
      sessionId,
      channelName,
      tutorUid,
      learnerUid,
    });

    // Update session with recording info
    await supabase
      .from('individual_sessions')
      .update({
        agora_channel_name: channelName,
        recording_resource_id: resourceId,
        recording_sid: sid,
        recording_status: 'recording',
      })
      .eq('id', sessionId);

    return NextResponse.json({
      resourceId,
      sid,
      channelName,
    });
  } catch (error: any) {
    console.error('[Recording Start] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start recording' },
      { status: 500 }
    );
  }
}
