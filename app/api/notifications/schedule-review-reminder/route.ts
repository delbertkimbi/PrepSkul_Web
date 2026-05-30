import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Schedule Review Reminder API
 *
 * Inserts a scheduled_notifications row for 24 hours after session end.
 * Processed by process-scheduled-notifications cron.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, otherPartyName, subject, sessionType, sessionEndTime } =
      body;

    if (!sessionId || !userId || !sessionEndTime) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, userId, sessionEndTime' },
        { status: 400 }
      );
    }

    const sessionEnd = new Date(sessionEndTime);
    if (isNaN(sessionEnd.getTime())) {
      return NextResponse.json(
        { error: 'Invalid sessionEndTime format' },
        { status: 400 }
      );
    }

    const reminderTime = new Date(sessionEnd.getTime() + 24 * 60 * 60 * 1000);
    const party = otherPartyName || 'your tutor';
    const topic = subject || 'your session';
    const kind = sessionType || 'session';

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('scheduled_notifications').insert({
      user_id: userId,
      notification_type: 'review_reminder',
      title: 'Leave a Review',
      message: `Your ${kind} with ${party} for ${topic} has been completed. Please leave a review!`,
      scheduled_for: reminderTime.toISOString(),
      status: 'pending',
      related_id: sessionId,
      metadata: {
        session_id: sessionId,
        session_type: sessionType,
        other_party_name: otherPartyName,
        subject,
        action_url: `/sessions/${sessionId}/review`,
        action_text: 'Leave Review',
        priority: 'normal',
        sendEmail: true,
        sendPush: true,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to schedule review reminder', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review reminder scheduled',
      reminderTime: reminderTime.toISOString(),
    });
  } catch (error: any) {
    console.error('Error scheduling review reminder:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule review reminder' },
      { status: 500 }
    );
  }
}
