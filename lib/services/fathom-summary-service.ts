import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Fathom Summary Distribution Service
 * 
 * Distributes meeting summaries to participants
 */

/**
 * Distribute summary to all participants
 */
export async function distributeSummaryToParticipants({
  supabase,
  sessionId,
  sessionType,
  summaryText,
  meetingTitle,
}: {
  supabase: any;
  sessionId: string;
  sessionType: 'trial' | 'recurring';
  summaryText: string;
  meetingTitle: string;
}) {
  try {
    // Get session details
    const session = await getSessionDetails(supabase, sessionId, sessionType);
    if (!session) {
      throw new Error('Session not found');
    }

    const tutorId = session.tutor_id;
    const studentId = session.learner_id || session.student_id;
    const parentId = session.parent_id;

    const summaryPreview = getSummaryPreview(summaryText);

    // Send notification to tutor
    await supabase.from('notifications').insert({
      user_id: tutorId,
      type: 'session_summary_ready',
      notification_type: 'session_summary_ready',
      title: 'Session Summary Available',
      message: `Summary for "${meetingTitle}" is now available.`,
      data: {
        session_id: sessionId,
        session_type: sessionType,
        summary_preview: summaryPreview,
      },
      is_read: false,
    });

    // Send notification to student
    if (studentId) {
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'session_summary_ready',
        notification_type: 'session_summary_ready',
        title: 'Session Summary Available',
        message: `Summary for "${meetingTitle}" is now available.`,
        data: {
          session_id: sessionId,
          session_type: sessionType,
          summary_preview: summaryPreview,
        },
        is_read: false,
      });
    }

    // Send notification to parent (if applicable)
    if (parentId) {
      await supabase.from('notifications').insert({
        user_id: parentId,
        type: 'session_summary_ready',
        notification_type: 'session_summary_ready',
        title: 'Session Summary Available',
        message: `Summary for your child's session "${meetingTitle}" is now available.`,
        data: {
          session_id: sessionId,
          session_type: sessionType,
          summary_preview: summaryPreview,
        },
        is_read: false,
      });
    }

    console.log('✅ Summary notifications sent to all participants');
  } catch (error: any) {
    console.error('❌ Error distributing summary:', error);
    throw error;
  }
}

/**
 * Get session details
 */
async function getSessionDetails(
  supabase: any,
  sessionId: string,
  sessionType: 'trial' | 'recurring'
): Promise<any> {
  try {
    if (sessionType === 'trial') {
      const { data, error } = await supabase
        .from('trial_sessions')
        .select('tutor_id, learner_id, parent_id')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } else if (sessionType === 'recurring') {
      const { data, error } = await supabase
        .from('recurring_sessions')
        .select('tutor_id, student_id, learner_id')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Error getting session details:', error);
    return null;
  }
}

/**
 * Get summary preview (first 100 characters)
 */
function getSummaryPreview(summary: string): string {
  if (summary.length <= 100) return summary;
  return `${summary.substring(0, 100)}...`;
}

