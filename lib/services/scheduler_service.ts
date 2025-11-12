/**
 * Scheduler Service
 * 
 * Handles scheduling notifications for future delivery
 * Used for reminders, follow-ups, etc.
 */

import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface ScheduleNotificationParams {
  userId: string;
  notificationType: string;
  title: string;
  message: string;
  scheduledFor: Date;
  relatedId?: string;
  metadata?: Record<string, any>;
}

/**
 * Schedule a notification for future delivery
 */
export async function scheduleNotification(params: ScheduleNotificationParams) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('scheduled_notifications')
    .insert({
      user_id: params.userId,
      notification_type: params.notificationType,
      title: params.title,
      message: params.message,
      scheduled_for: params.scheduledFor.toISOString(),
      status: 'pending',
      related_id: params.relatedId,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error scheduling notification:', error);
    throw error;
  }

  console.log('✅ Notification scheduled:', data.id, 'for', params.scheduledFor);
  return data;
}

/**
 * Schedule session reminder notifications
 * 
 * Schedules:
 * - 30 minutes before session
 * - 24 hours before session (optional)
 */
export async function scheduleSessionReminders(
  sessionId: string,
  tutorId: string,
  studentId: string,
  sessionStart: Date,
  sessionType: 'trial' | 'recurring',
  tutorName: string,
  studentName: string,
  subject: string,
) {
  const supabase = await createServerSupabaseClient();

  // Get session details for metadata
  const sessionDetails = {
    session_id: sessionId,
    session_type: sessionType,
    tutor_name: tutorName,
    student_name: studentName,
    subject: subject,
    session_start: sessionStart.toISOString(),
  };

  try {
    // Schedule 30-minute reminder for tutor
    const reminder30Min = new Date(sessionStart.getTime() - 30 * 60 * 1000);
    if (reminder30Min > new Date()) {
      await scheduleNotification({
        userId: tutorId,
        notificationType: 'session_reminder',
        title: '⏰ Session Starting Soon',
        message: `Your ${sessionType} session with ${studentName} for ${subject} starts in 30 minutes.`,
        scheduledFor: reminder30Min,
        relatedId: sessionId,
        metadata: {
          ...sessionDetails,
          minutes_until: 30,
          other_party_name: studentName,
        },
      });
    }

    // Schedule 30-minute reminder for student
    if (reminder30Min > new Date()) {
      await scheduleNotification({
        userId: studentId,
        notificationType: 'session_reminder',
        title: '⏰ Session Starting Soon',
        message: `Your ${sessionType} session with ${tutorName} for ${subject} starts in 30 minutes.`,
        scheduledFor: reminder30Min,
        relatedId: sessionId,
        metadata: {
          ...sessionDetails,
          minutes_until: 30,
          other_party_name: tutorName,
        },
      });
    }

    // Schedule 24-hour reminder (optional, only if session is more than 24 hours away)
    const reminder24Hour = new Date(sessionStart.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24Hour > new Date()) {
      // For tutor
      await scheduleNotification({
        userId: tutorId,
        notificationType: 'session_reminder',
        title: '📅 Session Tomorrow',
        message: `You have a ${sessionType} session with ${studentName} for ${subject} tomorrow.`,
        scheduledFor: reminder24Hour,
        relatedId: sessionId,
        metadata: {
          ...sessionDetails,
          minutes_until: 1440, // 24 hours
          other_party_name: studentName,
        },
      });

      // For student
      await scheduleNotification({
        userId: studentId,
        notificationType: 'session_reminder',
        title: '📅 Session Tomorrow',
        message: `You have a ${sessionType} session with ${tutorName} for ${subject} tomorrow.`,
        scheduledFor: reminder24Hour,
        relatedId: sessionId,
        metadata: {
          ...sessionDetails,
          minutes_until: 1440,
          other_party_name: tutorName,
        },
      });
    }

    console.log('✅ Session reminders scheduled for session:', sessionId);
  } catch (error) {
    console.error('❌ Error scheduling session reminders:', error);
    // Don't throw - scheduling reminders shouldn't fail session creation
  }
}

/**
 * Schedule review reminder (24 hours after session)
 */
export async function scheduleReviewReminder(
  sessionId: string,
  userId: string,
  otherPartyName: string,
  subject: string,
  sessionType: 'trial' | 'recurring',
  sessionEndTime: Date,
) {
  const reminderTime = new Date(sessionEndTime.getTime() + 24 * 60 * 60 * 1000);

  try {
    await scheduleNotification({
      userId: userId,
      notificationType: 'review_reminder',
      title: '📝 Leave a Review',
      message: `How was your ${sessionType} session with ${otherPartyName} for ${subject}? Your feedback helps us improve!`,
      scheduledFor: reminderTime,
      relatedId: sessionId,
      metadata: {
        session_id: sessionId,
        session_type: sessionType,
        other_party_name: otherPartyName,
        subject: subject,
      },
    });

    console.log('✅ Review reminder scheduled for session:', sessionId);
  } catch (error) {
    console.error('❌ Error scheduling review reminder:', error);
  }
}

/**
 * Cancel scheduled notifications for a session
 * (e.g., when session is cancelled)
 */
export async function cancelScheduledNotifications(
  relatedId: string,
) {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('scheduled_notifications')
    .update({ status: 'cancelled' })
    .eq('related_id', relatedId)
    .eq('status', 'pending');

  if (error) {
    console.error('❌ Error cancelling scheduled notifications:', error);
    throw error;
  }

  console.log('✅ Cancelled scheduled notifications for:', relatedId);
}
