/**
 * Stop Agora Cloud Recording
 * POST /api/agora/recording/stop
 * 
 * Stops recording for a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RecordingService, RECORDER_UID } from '@/lib/services/agora/recording.service';
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
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get session and recording details
    const { data: session, error: sessionError } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, agora_channel_name, recording_resource_id, recording_sid')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Verify user is part of the session
    if (session.tutor_id !== user.id && session.learner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a participant in this session' },
        { status: 403, headers: corsHeaders }
      );
    }

    // Check if recording exists
    if (!session.recording_resource_id || !session.recording_sid) {
      return NextResponse.json(
        { error: 'No active recording found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Log and verify session_recordings row exists before stopping
    const { data: existingRecording } = await supabase
      .from('session_recordings')
      .select('session_id, recording_status')
      .eq('session_id', sessionId)
      .maybeSingle();
    console.log('[Recording Stop] sessionId=', sessionId, 'recording_resource_id=', session.recording_resource_id, 'recording_sid=', session.recording_sid, 'session_recordings row exists=', !!existingRecording, 'current status=', existingRecording?.recording_status);

    // Stop recording - use RECORDER_UID (same as start)
    const recordingService = new RecordingService();
    const channelName = session.agora_channel_name || `session_${sessionId}`;

    try {
      await recordingService.stopRecording(
        sessionId,
        session.recording_resource_id,
        session.recording_sid,
        channelName,
        RECORDER_UID
      );
    } catch (stopError: any) {
      console.error('[Recording Stop] Agora/stopRecording failed:', stopError?.message ?? stopError, stopError);
      // Still mark session as stopped so UI/DB does not stay "recording" forever
    }

    // Always update recording status so it never stays "recording" after session end
    const updatePayload = { recording_status: 'stopped', updated_at: new Date().toISOString() };
    const { error: updSessionErr } = await supabase.from('individual_sessions').update(updatePayload).eq('id', sessionId);
    const { error: updRecErr } = await supabase.from('session_recordings').update(updatePayload).eq('session_id', sessionId);
    console.log('[Recording Stop] DB updates: individual_sessions', updSessionErr ? 'error=' + String(updSessionErr) : 'OK', 'session_recordings', updRecErr ? 'error=' + String(updRecErr) : 'OK');

    // Set left_at for all session_participants when recording stops
    const now = new Date().toISOString();
    const { data: participantsUpdated, error: participantsErr } = await supabase
      .from('session_participants')
      .update({ left_at: now, updated_at: now })
      .eq('session_id', sessionId)
      .select('id');
    if (participantsErr) {
      console.warn('[Recording Stop] session_participants left_at update error:', participantsErr);
    } else {
      console.log('[Recording Stop] session_participants left_at set for session', sessionId, 'rows=', participantsUpdated?.length ?? 0);
    }

    return NextResponse.json({
      message: 'Recording stopped successfully',
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('[Recording Stop] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop recording' },
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
