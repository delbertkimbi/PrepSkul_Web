/**
 * Fathom AI Service
 * 
 * Handles Fathom API interactions for meeting data
 */

const FATHOM_API_BASE_URL = 'https://api.fathom.ai/external/v1';
const FATHOM_API_KEY = process.env.FATHOM_API_KEY;

/**
 * Fetch meeting data from Fathom API
 */
export async function fetchFathomMeetingData(recordingId: number): Promise<any> {
  try {
    if (!FATHOM_API_KEY) {
      throw new Error('FATHOM_API_KEY not configured');
    }

    // Fetch meeting with transcript, summary, and action items
    const response = await fetch(
      `${FATHOM_API_BASE_URL}/meetings?recording_id=${recordingId}&include_transcript=true&include_summary=true&include_action_items=true`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': FATHOM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      const errorData = await response.json();
      throw new Error(`Fathom API Error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Extract meeting from items array
    const meeting = data.items?.[0] || data;
    
    return {
      recordingId: meeting.recording_id || recordingId,
      title: meeting.title || 'Session',
      startTime: meeting.start_time,
      endTime: meeting.end_time,
      durationMinutes: meeting.duration_minutes,
      transcript: meeting.transcript,
      summary: meeting.summary?.text || meeting.summary,
      summaryTemplate: meeting.summary?.template || 'general',
      actionItems: meeting.action_items || [],
      url: meeting.url,
      shareUrl: meeting.share_url,
      attendees: meeting.attendees || [],
      calendarLink: meeting.calendar_link,
    };
  } catch (error: any) {
    console.error('❌ Error fetching Fathom meeting data:', error);
    throw error;
  }
}

/**
 * Get summary for a recording
 */
export async function getFathomSummary(recordingId: number): Promise<any> {
  try {
    if (!FATHOM_API_KEY) {
      throw new Error('FATHOM_API_KEY not configured');
    }

    const response = await fetch(
      `${FATHOM_API_BASE_URL}/recordings/${recordingId}/summary`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': FATHOM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Fathom API Error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error: any) {
    console.error('❌ Error fetching Fathom summary:', error);
    throw error;
  }
}

