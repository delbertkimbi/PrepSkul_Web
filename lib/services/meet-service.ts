import { google } from 'googleapis';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Google Calendar & Meet Service
 * 
 * Handles calendar event creation and Meet link generation
 * Uses Google Calendar API with service account authentication
 */

const PREPSKUL_VA_EMAIL = process.env.PREPSKUL_VA_EMAIL || 'deltechhub237@gmail.com';

/**
 * Generate Meet link for trial session
 * 
 * Creates calendar event and generates Meet link
 * Adds PrepSkul VA as attendee for Fathom auto-join
 */
export async function generateTrialMeetLink({
  trialSessionId,
  tutorId,
  studentId,
  scheduledDate,
  scheduledTime,
  durationMinutes,
  subject,
}: {
  trialSessionId: string;
  tutorId: string;
  studentId: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
  subject: string;
}): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get tutor and student emails
    const { data: tutorProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', tutorId)
      .maybeSingle();

    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', studentId)
      .maybeSingle();

    const tutorEmail = tutorProfile?.email;
    const studentEmail = studentProfile?.email;

    if (!tutorEmail || !studentEmail) {
      throw new Error('Tutor or student email not found');
    }

    // Parse scheduled time
    const timeParts = scheduledTime.split(':');
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1].split(' ')[0]);
    const isPM = scheduledTime.toUpperCase().includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);

    const startTime = new Date(
      scheduledDate.getFullYear(),
      scheduledDate.getMonth(),
      scheduledDate.getDate(),
      hour24,
      minute
    );

    // Create calendar event with Meet link
    const calendarEvent = await createSessionEvent({
      title: `Trial Session: ${subject}`,
      startTime,
      durationMinutes,
      attendeeEmails: [tutorEmail, studentEmail],
      description: 'PrepSkul trial tutoring session',
    });

    // Update trial session with Meet link and calendar event ID
    await supabase
      .from('trial_sessions')
      .update({
        meet_link: calendarEvent.meetLink,
        calendar_event_id: calendarEvent.id,
        meet_link_generated_at: new Date().toISOString(),
      })
      .eq('id', trialSessionId);

    return calendarEvent.meetLink;
  } catch (error: any) {
    console.error('❌ Error generating trial Meet link:', error);
    throw error;
  }
}

/**
 * Create calendar event with Meet link
 * 
 * Creates a Google Calendar event and auto-generates a Meet link
 * Adds PrepSkul VA as attendee to trigger Fathom auto-join
 */
async function createSessionEvent({
  title,
  startTime,
  durationMinutes,
  attendeeEmails,
  description,
}: {
  title: string;
  startTime: Date;
  durationMinutes: number;
  attendeeEmails: string[];
  description?: string;
}): Promise<{ id: string; meetLink: string; htmlLink: string }> {
  try {
    // Initialize Google Calendar API with service account
    const auth = await getGoogleCalendarAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    // Ensure PrepSkul VA is in attendees
    const allAttendees = [...attendeeEmails];
    if (!allAttendees.includes(PREPSKUL_VA_EMAIL)) {
      allAttendees.push(PREPSKUL_VA_EMAIL);
    }

    // Calculate end time
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    // Create event
    const event = {
      summary: title,
      description: description || 'PrepSkul tutoring session',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Africa/Douala',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Africa/Douala',
      },
      attendees: allAttendees.map(email => ({
        email,
        responseStatus: 'needsAction',
      })),
      conferenceData: {
        createRequest: {
          requestId: `prepskul-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    // Insert event with conference data
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1, // Required for Meet link generation
    });

    const createdEvent = response.data;

    // Extract Meet link
    const meetLink =
      createdEvent.conferenceData?.entryPoints?.find(
        (ep: any) => ep.entryPointType === 'video'
      )?.uri ||
      createdEvent.hangoutLink ||
      '';

    if (!meetLink) {
      throw new Error('Meet link not generated for event');
    }

    console.log(`✅ Calendar event created: ${createdEvent.id}`);
    console.log(`✅ Meet link: ${meetLink}`);

    return {
      id: createdEvent.id || '',
      meetLink,
      htmlLink: createdEvent.htmlLink || '',
    };
  } catch (error: any) {
    console.error('❌ Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Get Google Calendar authentication
 * Uses service account credentials from environment variables
 */
async function getGoogleCalendarAuth() {
  try {
    const serviceAccountEmail = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!serviceAccountEmail || !privateKey) {
      throw new Error('Google Calendar service account credentials not configured');
    }

    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    return auth;
  } catch (error: any) {
    console.error('❌ Error initializing Google Calendar auth:', error);
    throw error;
  }
}

