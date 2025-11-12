/**
 * Schedule Review Reminder API
 * 
 * Schedules a review reminder notification (24 hours after session)
 */

import { NextRequest, NextResponse } from 'next/server';
import { scheduleReviewReminder } from '@/lib/services/scheduler_service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userId,
      otherPartyName,
      subject,
      sessionType, // 'trial' or 'recurring'
      sessionEndTime, // ISO 8601 string
    } = body;

    // Validate required fields
    if (!sessionId || !userId || !otherPartyName || !subject || !sessionType || !sessionEndTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse session end time
    const sessionEndDate = new Date(sessionEndTime);
    if (isNaN(sessionEndDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid sessionEndTime date' },
        { status: 400 }
      );
    }

    // Schedule review reminder
    await scheduleReviewReminder(
      sessionId,
      userId,
      otherPartyName,
      subject,
      sessionType,
      sessionEndDate,
    );

    return NextResponse.json({
      success: true,
      message: 'Review reminder scheduled successfully',
    });
  } catch (error: any) {
    console.error('❌ Error in schedule-review-reminder API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}






