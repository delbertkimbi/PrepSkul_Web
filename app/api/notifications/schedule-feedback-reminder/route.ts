import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Schedule Feedback Reminder API
 *
 * Called by the Flutter app when a session ends. Inserts a row into
 * scheduled_notifications for 24 hours after session end. The
 * process-scheduled-notifications cron job will send the notification
 * at the scheduled time.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, reminderTime } = body;

    if (!userId || !sessionId || !reminderTime) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, sessionId, reminderTime' },
        { status: 400 }
      );
    }

    const reminderDate = new Date(reminderTime);
    if (isNaN(reminderDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid reminderTime format' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    await supabase.from('scheduled_notifications').insert({
      user_id: userId,
      notification_type: 'feedback_reminder',
      title: 'Feedback Reminder',
      message: 'Please provide feedback for your completed session. It helps your tutor improve!',
      scheduled_for: reminderDate.toISOString(),
      status: 'pending',
      related_id: sessionId,
      metadata: {
        session_id: sessionId,
        reminder_time: reminderTime,
        action_url: `/sessions/${sessionId}/feedback`,
        action_text: 'Provide Feedback',
        icon: '💬',
        priority: 'normal',
        sendEmail: true,
        sendPush: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback reminder scheduled',
      reminderTime: reminderDate.toISOString(),
    });
  } catch (error: any) {
    console.error('Error scheduling feedback reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule feedback reminder' },
      { status: 500 }
    );
  }
}
