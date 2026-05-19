import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Schedule Session Reminders API (called from PrepSkul mobile app when a session is booked)
 *
 * Matches mobile NotificationHelperService.scheduleSessionReminders payload and metadata.
 * Rows are processed by GET /api/cron/process-scheduled-notifications (external cron).
 *
 * Uses admin client because the mobile app calls this without a web session cookie.
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

    const supabase = getSupabaseAdmin();
    const sessionStartTime = new Date(sessionStart);
    const now = new Date();

    const twentyFourHoursBefore = new Date(sessionStartTime.getTime() - 24 * 60 * 60 * 1000);
    const oneHourBefore = new Date(sessionStartTime.getTime() - 60 * 60 * 1000);
    const fifteenMinutesBefore = new Date(sessionStartTime.getTime() - 15 * 60 * 1000);

    const reminders: Array<{
      time: Date;
      type: string;
      title: string;
      tutorMessage: string;
      studentMessage: string;
      priority: string;
    }> = [];

    if (twentyFourHoursBefore > now) {
      reminders.push({
        time: twentyFourHoursBefore,
        type: '24_hours',
        title: 'Session Reminder',
        tutorMessage:
          sessionType === 'trial'
            ? `Your trial session with ${studentName} is tomorrow!`
            : `Your session with ${studentName} is tomorrow!`,
        studentMessage:
          sessionType === 'trial'
            ? `Your trial session with ${tutorName} is tomorrow!`
            : `Your session with ${tutorName} is tomorrow!`,
        priority: 'normal',
      });
    }

    if (oneHourBefore > now) {
      reminders.push({
        time: oneHourBefore,
        type: '1_hour',
        title: 'Session Starting Soon',
        tutorMessage:
          sessionType === 'trial'
            ? `Your trial session with ${studentName} starts in 1 hour!`
            : `Your session with ${studentName} starts in 1 hour!`,
        studentMessage:
          sessionType === 'trial'
            ? `Your trial session with ${tutorName} starts in 1 hour!`
            : `Your session with ${tutorName} starts in 1 hour!`,
        priority: 'high',
      });
    }

    if (fifteenMinutesBefore > now) {
      reminders.push({
        time: fifteenMinutesBefore,
        type: '15_minutes',
        title: 'Join Session Now',
        tutorMessage:
          sessionType === 'trial'
            ? `Your trial session with ${studentName} starts in 15 minutes! Join now.`
            : `Your session with ${studentName} starts in 15 minutes! Join now.`,
        studentMessage:
          sessionType === 'trial'
            ? `Your trial session with ${tutorName} starts in 15 minutes! Join now.`
            : `Your session with ${tutorName} starts in 15 minutes! Join now.`,
        priority: 'urgent',
      });
    }

    const scheduledNotifications: Record<string, unknown>[] = [];

    for (const reminder of reminders) {
      scheduledNotifications.push({
        user_id: tutorId,
        notification_type: 'session_reminder',
        title: reminder.title,
        message: reminder.tutorMessage.replace('Your', 'Your upcoming'),
        scheduled_for: reminder.time.toISOString(),
        status: 'pending',
        related_id: sessionId,
        metadata: {
          session_id: sessionId,
          session_type: sessionType,
          reminder_type: reminder.type,
          session_start: sessionStartTime.toISOString(),
          subject: subject || undefined,
          priority: reminder.priority,
          action_url: `/sessions/${sessionId}`,
          action_text: 'View Session',
          sendEmail: true,
          sendPush: true,
        },
      });

      scheduledNotifications.push({
        user_id: studentId,
        notification_type: 'session_reminder',
        title: reminder.title,
        message: reminder.studentMessage,
        scheduled_for: reminder.time.toISOString(),
        status: 'pending',
        related_id: sessionId,
        metadata: {
          session_id: sessionId,
          session_type: sessionType,
          reminder_type: reminder.type,
          session_start: sessionStartTime.toISOString(),
          subject: subject || undefined,
          priority: reminder.priority,
          action_url: `/sessions/${sessionId}`,
          action_text: 'View Session',
          sendEmail: true,
          sendPush: true,
        },
      });
    }

    if (scheduledNotifications.length > 0) {
      const { error } = await supabase.from('scheduled_notifications').insert(scheduledNotifications);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      remindersScheduled: reminders.length,
      reminders: reminders.map((r) => ({
        type: r.type,
        scheduledFor: r.time.toISOString(),
      })),
    });
  } catch (error: unknown) {
    console.error('Error scheduling session reminders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to schedule session reminders' },
      { status: 500 }
    );
  }
}
