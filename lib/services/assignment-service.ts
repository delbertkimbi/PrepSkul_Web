import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Assignment Service
 * 
 * Handles action items extracted from Fathom summaries
 * Creates assignments for students based on meeting action items
 */

/**
 * Create assignments from Fathom action items
 */
export async function createAssignmentsFromActionItems({
  supabase,
  sessionId,
  sessionType,
  actionItems,
}: {
  supabase: any;
  sessionId: string;
  sessionType: 'trial' | 'recurring';
  actionItems: any[];
}) {
  try {
    // Get session details
    const session = await getSessionDetails(supabase, sessionId, sessionType);
    if (!session) {
      throw new Error('Session not found');
    }

    const tutorId = session.tutor_id;
    const studentId = session.learner_id || session.student_id;

    if (!studentId) {
      throw new Error('Student ID not found');
    }

    // Create assignments for each action item
    const assignments = [];
    for (const item of actionItems) {
      const title = item.title || item.text || 'Action Item';
      const description = item.description || item.text || '';
      const dueDate = item.due_date 
        ? new Date(item.due_date)
        : calculateDefaultDueDate();

      const { data: assignment, error } = await supabase
        .from('assignments')
        .insert({
          session_id: sessionId,
          session_type: sessionType,
          student_id: studentId,
          tutor_id: tutorId,
          title,
          description,
          due_date: dueDate.toISOString(),
          status: 'pending',
          fathom_timestamp: item.timestamp || null,
          fathom_playback_url: item.playback_url || null,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error(`⚠️ Error creating assignment: ${error.message}`);
        continue;
      }

      assignments.push(assignment);

      // Notify student about new assignment
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'new_assignment',
        notification_type: 'new_assignment',
        title: 'New Assignment',
        message: `You have a new assignment: ${title}`,
        data: {
          session_id: sessionId,
          assignment_id: assignment.id,
          assignment_title: title,
        },
        is_read: false,
      });
    }

    console.log(`✅ Created ${assignments.length} assignments from action items`);
    return assignments;
  } catch (error: any) {
    console.error('❌ Error creating assignments:', error);
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
 * Calculate default due date (7 days from now)
 */
function calculateDefaultDueDate(): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  return dueDate;
}

