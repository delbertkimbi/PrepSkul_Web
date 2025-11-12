import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/// Fathom AI Webhook Handler
/// 
/// Receives meeting content updates from Fathom
/// Documentation: docs/FATHOM_API_DOCUMENTATION.md

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Verify webhook signature (if Fathom provides it)
    // TODO: Implement webhook signature verification
    // const isValid = verifyWebhookSignature(payload, request.headers);
    // if (!isValid) return new NextResponse('Unauthorized', { status: 401 });
    
    const { event, recording_id, meeting_title, calendar_invitees, url, share_url } = payload;
    
    if (event !== 'new_meeting_content_ready') {
      console.log('⚠️ Unknown Fathom event:', event);
      return NextResponse.json({ message: 'Event not handled' }, { status: 200 });
    }

    if (!recording_id || !calendar_invitees) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find trial session by matching calendar invitees (tutor and student emails)
    // PrepSkul VA email is always included, so we match by tutor + student
    const tutorEmail = calendar_invitees.find(
      (invitee: any) => invitee.email !== process.env.PREPSKUL_VA_EMAIL
    )?.email;

    if (!tutorEmail) {
      console.log('⚠️ Could not identify tutor email from invitees');
      return NextResponse.json({ message: 'Tutor email not found' }, { status: 200 });
    }

    // Get tutor profile to find trial sessions
    const { data: tutorProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', tutorEmail)
      .maybeSingle();

    if (!tutorProfile) {
      console.log('⚠️ Tutor profile not found for email:', tutorEmail);
      return NextResponse.json({ message: 'Tutor not found' }, { status: 200 });
    }

    // Find trial session by tutor_id and scheduled date/time
    // Match by meeting title or scheduled date
    const { data: trialSessions } = await supabase
      .from('trial_sessions')
      .select('*')
      .eq('tutor_id', tutorProfile.id)
      .eq('status', 'scheduled')
      .order('scheduled_date', { ascending: false })
      .limit(5);

    if (!trialSessions || trialSessions.length === 0) {
      console.log('⚠️ No trial sessions found for tutor:', tutorProfile.id);
      return NextResponse.json({ message: 'Trial session not found' }, { status: 200 });
    }

    // Match by meeting title or use most recent
    const trialSession = trialSessions.find(
      (ts) => meeting_title?.includes(ts.subject) || meeting_title?.includes('Trial')
    ) || trialSessions[0];

    // Store transcript and summary in database
    // First, fetch from Fathom API (we'll need to implement this)
    // For now, store the recording ID and URLs

    await supabase
      .from('session_transcripts')
      .upsert({
        session_id: trialSession.id,
        session_type: 'trial',
        recording_id: recording_id, // Column name in database
        fathom_url: url,
        fathom_share_url: share_url,
        transcript: null, // Will be fetched via Fathom API
        summary: null, // Will be fetched via Fathom API
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'session_id,session_type',
      });

    // Create summary entry (will be populated when we fetch from Fathom)
    // Note: session_summaries table references session_transcripts
    // We'll create it after fetching the transcript

    // TODO: Fetch actual transcript and summary from Fathom API
    // For now, we'll analyze with placeholder data
    // Once we have real transcript/summary, uncomment below:
    
    // Import session monitoring service
    const { analyzeSessionForFlags } = await import('@/lib/services/session-monitoring');
    
    // Analyze for admin flags (when transcript/summary are available)
    // await analyzeSessionForFlags(supabase, {
    //   sessionId: trialSession.id,
    //   sessionType: 'trial',
    //   transcript: transcriptText, // From Fathom API
    //   summary: summaryText, // From Fathom API
    // });

    // TODO: Extract action items
    // TODO: Distribute summary to tutor, student, and parent

    console.log('✅ Fathom webhook processed for trial:', trialSession.id);

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error processing Fathom webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

