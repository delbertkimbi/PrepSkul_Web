import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendCustomEmail } from '@/lib/notifications';

/**
 * Schedule Session Reminders API
 * 
 * Creates scheduled notification records in database for:
 * - 24 hours before: "Session reminder"
 * - 1 hour before: "Session starting soon"
 * - 15 minutes before: "Join now"
 * 
 * A separate cron job or scheduled task should process these and send notifications
 * For now, creates in-app notifications that will be sent immediately as fallback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      tutorId,
      studentId,
      sessionStart,
      sessionType,
      tutorName,
      studentName,
      subject,
    } = body;

    if (!sessionId || !tutorId || !studentId || !sessionStart) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, tutorId, studentId, sessionStart' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const sessionStartTime = new Date(sessionStart);
    const now = new Date();

    // Calculate reminder times
    const twentyFourHoursBefore = new Date(sessionStartTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(sessionStartTime.getTime() - 60 * 60 * 1000);
    const fifteenMinutesBefore = new Date(sessionStartTime.getTime() - 15 * 60 * 1000);

    const reminders = [];

    // 24 hours before reminder
    if (twentyFourHoursBefore > now) {
      reminders.push({
        time: twentyFourHoursBefore,
        type: '24_hours',
        title: 'Session Reminder',
        message: sessionType === 'trial'
          ? `Your trial session with ${tutorName} is tomorrow!`
          : `Your session with ${tutorName} is tomorrow!`,
        priority: 'normal',
      });
    }

    // 1 hour before reminder
    if (oneHourBefore > now) {
      reminders.push({
        time: oneHourBefore,
        type: '1_hour',
        title: 'Session Starting Soon',
        message: sessionType === 'trial'
          ? `Your trial session with ${tutorName} starts in 1 hour!`
          : `Your session with ${tutorName} starts in 1 hour!`,
        priority: 'high',
      });
    }

    // 15 minutes before reminder
    if (fifteenMinutesBefore > now) {
      reminders.push({
        time: fifteenMinutesBefore,
        type: '15_minutes',
        title: 'Join Session Now',
        message: sessionType === 'trial'
          ? `Your trial session with ${tutorName} starts in 15 minutes! Join now.`
          : `Your session with ${tutorName} starts in 15 minutes! Join now.`,
        priority: 'urgent',
      });
    }

    // Create scheduled notification records in database
    // These will be processed by a cron job or scheduled task
    const scheduledNotifications = [];

    for (const reminder of reminders) {
      // For tutor
      scheduledNotifications.push({
        user_id: tutorId,
        notification_type: 'session_reminder',
        title: reminder.title,
        message: reminder.message.replace('Your', 'Your upcoming'),
        scheduled_for: reminder.time.toISOString(),
        status: 'pending',
        related_id: sessionId,
        metadata: {
          session_id: sessionId,
          session_type: sessionType,
          reminder_type: reminder.type,
          session_start: sessionStartTime.toISOString(),
          priority: reminder.priority,
          action_url: `/sessions/${sessionId}`,
          action_text: 'View Session',
          icon: undefined,
          sendEmail: true, // Enable email for all session reminders
          sendPush: true, // Enable push notifications for all session reminders
        },
      });

      // For student
      scheduledNotifications.push({
        user_id: studentId,
        notification_type: 'session_reminder',
        title: reminder.title,
        message: reminder.message,
        scheduled_for: reminder.time.toISOString(),
        status: 'pending',
        related_id: sessionId,
        metadata: {
          session_id: sessionId,
          session_type: sessionType,
          reminder_type: reminder.type,
          session_start: sessionStartTime.toISOString(),
          priority: reminder.priority,
          action_url: `/sessions/${sessionId}`,
          action_text: 'View Session',
          icon: undefined,
          sendEmail: true, // Enable email for all session reminders
          sendPush: true, // Enable push notifications for all session reminders
        },
      });
    }

    // Insert scheduled notifications
    if (scheduledNotifications.length > 0) {
      await supabase.from('scheduled_notifications').insert(scheduledNotifications);
    }

    return NextResponse.json({
      success: true,
      remindersScheduled: reminders.length,
      reminders: reminders.map(r => ({
        type: r.type,
        scheduledFor: r.time.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Error scheduling session reminders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule session reminders' },
      { status: 500 }
    );
  }
}


























