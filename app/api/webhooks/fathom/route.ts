import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { fetchFathomMeetingData } from '@/lib/services/fathom-service';
import { createAssignmentsFromActionItems } from '@/lib/services/assignment-service';
import { analyzeSessionForFlags } from '@/lib/services/admin-flag-service';
import { distributeSummaryToParticipants } from '@/lib/services/fathom-summary-service';

/**
 * Fathom AI Webhook Handler
 * 
 * Handles meeting content ready notifications from Fathom
 * Processes transcripts, summaries, and action items
 * 
 * Webhook URL: https://www.prepskul.com/api/webhooks/fathom
 * Configure this URL in Fathom dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const body = await request.json();
    
    // Extract webhook data
    const {
      event_type,        // Event type (e.g., "recording.ready", "summary.ready")
      recording_id,      // Fathom recording ID
      meeting_id,        // Fathom meeting ID
      timestamp,         // Webhook timestamp
      data,             // Additional event data
    } = body;

    // Validate required fields
    if (!event_type || !recording_id) {
      console.error('❌ Invalid webhook payload:', body);
      return NextResponse.json(
        { error: 'Missing required fields: event_type, recording_id' },
        { status: 400 }
      );
    }

    console.log(`🔔 Fathom webhook received: ${event_type}, recording_id: ${recording_id}`);

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Handle different event types
    if (event_type === 'recording.ready' || event_type === 'summary.ready') {
      await handleRecordingReady({
        supabase,
        recordingId: recording_id,
        meetingId: meeting_id,
      });
    } else {
      console.log(`⚠️ Unhandled event type: ${event_type}`);
    }

    console.log(`✅ Fathom webhook processed successfully: ${recording_id}`);
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error: any) {
    console.error('❌ Error processing Fathom webhook:', error);
    
    // Return error but don't fail the webhook (Fathom will retry)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle recording ready event
 * Fetches transcript, summary, and action items from Fathom
 */
async function handleRecordingReady({
  supabase,
  recordingId,
  meetingId,
}: {
  supabase: any;
  recordingId: number;
  meetingId?: string;
}) {
  try {
    console.log(`📹 Processing recording ready: ${recordingId}`);

    // Fetch meeting data from Fathom
    const meetingData = await fetchFathomMeetingData(recordingId);

    if (!meetingData) {
      throw new Error('Failed to fetch meeting data from Fathom');
    }

    // Find matching session in database
    const sessionMatch = await findSessionByFathomData({
      supabase,
      recordingId,
      meetingId,
      meetingData,
    });

    if (!sessionMatch) {
      console.log(`⚠️ No matching session found for recording ${recordingId}`);
      return;
    }

        const { sessionId, sessionType } = sessionMatch;

    // Detect and update student attendance from Fathom attendee data
    await detectAndUpdateStudentAttendance({
      supabase,
      sessionId,
      sessionType,
      meetingData,
    });



    // Store transcript and summary
    const transcriptId = await storeTranscriptAndSummary({
      supabase,
      sessionId,
      sessionType,
      recordingId,
      meetingData,
    });

    // Create assignments from action items
    if (meetingData.actionItems && meetingData.actionItems.length > 0) {
      await createAssignmentsFromActionItems({
        supabase,
        sessionId,
        sessionType,
        actionItems: meetingData.actionItems,
      });
    }

    // Analyze for admin flags
    const flags = await analyzeSessionForFlags({
      supabase,
      sessionId,
      sessionType,
      transcript: meetingData.transcript || '',
      summary: meetingData.summary || '',
    });

    if (flags.length > 0) {
      console.log(`🚩 ${flags.length} admin flag(s) detected for session ${sessionId}`);
    }

    // Distribute summary to participants
    await distributeSummaryToParticipants({
      supabase,
      sessionId,
      sessionType,
      summaryText: meetingData.summary || '',
      meetingTitle: meetingData.title || 'Session',
    });

    console.log(`✅ Recording processed successfully: ${recordingId}`);
  } catch (error: any) {
    console.error('❌ Error handling recording ready:', error);
    throw error;
  }
}

/**
 * Find session by Fathom data
 * Matches recording to trial_sessions or recurring_sessions
 */
async function findSessionByFathomData({
  supabase,
  recordingId,
  meetingId,
  meetingData,
}: {
  supabase: any;
  recordingId: number;
  meetingId?: string;
  meetingData: any;
}): Promise<{ sessionId: string; sessionType: 'trial' | 'recurring' } | null> {
  try {
    // Try to find by calendar event ID (if meeting has calendar link)
    if (meetingData.calendarLink) {
      // Extract calendar event ID from link or metadata
      // This would need to be stored when creating the calendar event
    }

    // Try to find by recording ID in session_transcripts
    const { data: existingTranscript } = await supabase
      .from('session_transcripts')
      .select('session_id, session_type')
      .eq('recording_id', recordingId)
      .maybeSingle();

    if (existingTranscript) {
      return {
        sessionId: existingTranscript.session_id,
        sessionType: existingTranscript.session_type as 'trial' | 'recurring',
      };
    }

    // Try to find by meeting time and participants
    // Match by scheduled date/time and tutor/student emails
    if (meetingData.startTime && meetingData.attendees) {
      const startTime = new Date(meetingData.startTime);
      const scheduledDate = startTime.toISOString().split('T')[0];
      const scheduledTime = startTime.toTimeString().split(' ')[0].substring(0, 5);

      // Get attendee emails (excluding PrepSkul VA)
      const attendeeEmails = meetingData.attendees
        .filter((a: any) => !a.email?.includes('prepskul') && !a.email?.includes('deltechhub'))
        .map((a: any) => a.email);

      if (attendeeEmails.length >= 2) {
        // Try trial_sessions
        const { data: trialSession } = await supabase
          .from('trial_sessions')
          .select(`
            id,
            tutor_id,
            learner_id,
            profiles!trial_sessions_tutor_id_fkey(email),
            profiles!trial_sessions_learner_id_fkey(email)
          `)
          .eq('scheduled_date', scheduledDate)
          .eq('scheduled_time', scheduledTime)
          .maybeSingle();

        if (trialSession) {
          const tutorEmail = (trialSession.profiles as any)?.email;
          const studentEmail = (trialSession.profiles as any)?.email;
          
          if (attendeeEmails.includes(tutorEmail) && attendeeEmails.includes(studentEmail)) {
            return {
              sessionId: trialSession.id,
              sessionType: 'trial',
            };
          }
        }

        // Try individual_sessions if trial_sessions didn't match
        const { data: individualSessions } = await supabase
          .from('individual_sessions')
          .select(`
            id,
            tutor_id,
            learner_id,
            parent_id,
            scheduled_date,
            scheduled_time,
            profiles!individual_sessions_tutor_id_fkey(email),
            profiles!individual_sessions_learner_id_fkey(email)
          `)
          .eq('scheduled_date', scheduledDate)
          .eq('scheduled_time', scheduledTime)
          .limit(10);

        if (individualSessions && individualSessions.length > 0) {
          // Find matching session by tutor and student emails
          for (const session of individualSessions) {
            const tutorEmail = session.profiles?.email;
            // Get student email (learner or parent)
            const { data: learnerProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', session.learner_id || session.parent_id)
              .maybeSingle();
            
            const studentEmail = learnerProfile?.email;
            
            if (tutorEmail && studentEmail && 
                attendeeEmails.includes(tutorEmail.toLowerCase()) && 
                attendeeEmails.includes(studentEmail.toLowerCase())) {
              return {
                sessionId: session.id,
                sessionType: 'recurring',
              };
            }
          }
        }
      }
    }

    return null;
  } catch (error: any) {
    console.error('❌ Error finding session by Fathom data:', error);
    return null;
  }
}

/**
 * Store transcript and summary in database
 */
async function storeTranscriptAndSummary({
  supabase,
  sessionId,
  sessionType,
  recordingId,
  meetingData,
}: {
  supabase: any;
  sessionId: string;
  sessionType: 'trial' | 'recurring';
  recordingId: number;
  meetingData: any;
}): Promise<string> {
  try {
    // Insert or update transcript
    const { data: transcript, error: transcriptError } = await supabase
      .from('session_transcripts')
      .upsert({
        session_id: sessionId,
        session_type: sessionType,
        recording_id: recordingId,
        transcript: meetingData.transcript || null,
        summary: meetingData.summary || null,
        summary_template: meetingData.summaryTemplate || 'general',
        fathom_url: meetingData.url || null,
        fathom_share_url: meetingData.shareUrl || null,
        duration_minutes: meetingData.durationMinutes || null,
        recording_start_time: meetingData.startTime ? new Date(meetingData.startTime).toISOString() : null,
        recording_end_time: meetingData.endTime ? new Date(meetingData.endTime).toISOString() : null,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'session_id,session_type',
      })
      .select('id')
      .maybeSingle();

    if (transcriptError) throw transcriptError;

    console.log(`✅ Transcript stored: ${transcript.id}`);

    // If summary has detailed data, store in session_summaries
    if (meetingData.summaryData) {
      await supabase
        .from('session_summaries')
        .upsert({
          transcript_id: transcript.id,
          session_id: sessionId,
          session_type: sessionType,
          key_points: meetingData.summaryData.keyPoints || [],
          student_progress: meetingData.summaryData.studentProgress || null,
          tutor_feedback: meetingData.summaryData.tutorFeedback || null,
          action_items_summary: meetingData.summaryData.actionItemsSummary || null,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id,session_type',
        });
    }

    return transcript.id;
  } catch (error: any) {
    console.error('❌ Error storing transcript and summary:', error);
    throw error;
  }
}

/**
 * Detect and update student attendance from Fathom attendee data
 * 
 * When Fathom records a meeting, it provides attendee information.
 * We can use this to detect when students joined and update attendance records.
 */
async function detectAndUpdateStudentAttendance({
  supabase,
  sessionId,
  sessionType,
  meetingData,
}: {
  supabase: any;
  sessionId: string;
  sessionType: 'trial' | 'recurring';
  meetingData: any;
}) {
  try {
    if (!meetingData.attendees || meetingData.attendees.length === 0) {
      console.log('⚠️ No attendees data in meeting');
      return;
    }

    // Get attendee emails (excluding PrepSkul VA)
    const attendeeEmails = meetingData.attendees
      .filter((a: any) => 
        a.email && 
        !a.email.toLowerCase().includes('prepskul') && 
        !a.email.toLowerCase().includes('deltechhub') &&
        !a.email.toLowerCase().includes('fathom')
      )
      .map((a: any) => a.email.toLowerCase());

    if (attendeeEmails.length === 0) {
      console.log('⚠️ No valid attendee emails found');
      return;
    }

    console.log(`👥 Detected ${attendeeEmails.length} attendees: ${attendeeEmails.join(', ')}`);

    // Get session details to find learner/parent emails
    let sessionData: any;
    let learnerId: string | null = null;
    let parentId: string | null = null;
    let tutorId: string | null = null;

    if (sessionType === 'trial') {
      const { data: trialSession } = await supabase
        .from('trial_sessions')
        .select(`
          id,
          tutor_id,
          learner_id,
          parent_id,
          scheduled_date,
          scheduled_time
        `)
        .eq('id', sessionId)
        .maybeSingle();

      if (!trialSession) {
        console.log(`⚠️ Trial session not found: ${sessionId}`);
        return;
      }

      sessionData = trialSession;
      learnerId = trialSession.learner_id;
      parentId = trialSession.parent_id;
      tutorId = trialSession.tutor_id;
    } else {
      // For recurring sessions, find the individual session
      const { data: individualSession } = await supabase
        .from('individual_sessions')
        .select(`
          id,
          tutor_id,
          learner_id,
          parent_id,
          scheduled_date,
          scheduled_time
        `)
        .eq('id', sessionId)
        .maybeSingle();

      if (!individualSession) {
        console.log(`⚠️ Individual session not found: ${sessionId}`);
        return;
      }

      sessionData = individualSession;
      learnerId = individualSession.learner_id;
      parentId = individualSession.parent_id;
      tutorId = individualSession.tutor_id;
    }

    // Get emails for learner and parent
    const emailPromises = [];
    if (learnerId) {
      emailPromises.push(
        supabase
          .from('profiles')
          .select('email')
          .eq('id', learnerId)
          .maybeSingle()
          .then(({ data }: any) => ({ type: 'learner', id: learnerId, email: data?.email }))
      );
    }
    if (parentId) {
      emailPromises.push(
        supabase
          .from('profiles')
          .select('email')
          .eq('id', parentId)
          .maybeSingle()
          .then(({ data }: any) => ({ type: 'parent', id: parentId, email: data?.email }))
      );
    }

    const emailResults = await Promise.all(emailPromises);
    const studentEmails = emailResults
      .filter((r: any) => r && r.email)
      .map((r: any) => ({ ...r, email: r.email.toLowerCase() }));

    // Check which students are in the attendee list
    const joinedStudents = studentEmails.filter((s: any) => 
      attendeeEmails.includes(s.email)
    );

    if (joinedStudents.length === 0) {
      console.log('⚠️ No students detected in meeting attendees');
      return;
    }

    console.log(`✅ Detected ${joinedStudents.length} student(s) in meeting: ${joinedStudents.map((s: any) => s.email).join(', ')}`);

    // Use recording start time as join time (approximation)
    const joinTime = meetingData.startTime 
      ? new Date(meetingData.startTime).toISOString()
      : new Date().toISOString();

    // Update individual_sessions if this is a recurring session
    if (sessionType === 'recurring') {
      // Find or create individual session record
      const { data: existingSession } = await supabase
        .from('individual_sessions')
        .select('id, learner_joined_at')
        .eq('id', sessionId)
        .maybeSingle();

      if (existingSession && !existingSession.learner_joined_at) {
        // Update learner_joined_at for the first joined student
        const firstStudent = joinedStudents[0];
        await supabase
          .from('individual_sessions')
          .update({
            learner_joined_at: joinTime,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        console.log(`✅ Updated learner_joined_at for session ${sessionId}`);
      }
    }

    // Create or update attendance records for each joined student
    for (const student of joinedStudents) {
      // Check if attendance record exists
      const { data: existingAttendance } = await supabase
        .from('session_attendance')
        .select('id, joined_at')
        .eq('session_id', sessionId)
        .eq('user_id', student.id)
        .maybeSingle();

      if (existingAttendance) {
        // Update existing record if join time not set
        if (!existingAttendance.joined_at) {
          await supabase
            .from('session_attendance')
            .update({
              joined_at: joinTime,
              attendance_status: 'present',
              meet_link_used: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAttendance.id);

          console.log(`✅ Updated attendance record for ${student.email}`);
        }
      } else {
        // Create new attendance record
        await supabase
          .from('session_attendance')
          .insert({
            session_id: sessionId,
            user_id: student.id,
            user_type: student.type === 'learner' ? 'student' : 'parent',
            joined_at: joinTime,
            attendance_status: 'present',
            meet_link_used: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        console.log(`✅ Created attendance record for ${student.email}`);
      }
    }

    console.log(`✅ Student attendance detection completed for session ${sessionId}`);
  } catch (error: any) {
    console.error('❌ Error detecting student attendance:', error);
    // Don't throw - this is a non-critical operation
  }
}



