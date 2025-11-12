/**
 * Schedule Session Reminders API
 * 
 * Schedules reminder notifications for sessions (30 min and 24 hour reminders)
 */

import { NextRequest, NextResponse } from 'next/server';
import { scheduleSessionReminders } from '@/lib/services/scheduler_service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      tutorId,
      studentId,
      sessionStart, // ISO 8601 string
      sessionType, // 'trial' or 'recurring'
      tutorName,
      studentName,
      subject,
    } = body;

    // Validate required fields
    if (!sessionId || !tutorId || !studentId || !sessionStart || !sessionType || !tutorName || !studentName || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse session start time
    const sessionStartDate = new Date(sessionStart);
    if (isNaN(sessionStartDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid sessionStart date' },
        { status: 400 }
      );
    }

    // Schedule reminders
    await scheduleSessionReminders(
      sessionId,
      tutorId,
      studentId,
      sessionStartDate,
      sessionType,
      tutorName,
      studentName,
      subject,
    );

    return NextResponse.json({
      success: true,
      message: 'Session reminders scheduled successfully',
    });
  } catch (error: any) {
    console.error('❌ Error in schedule-session-reminders API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}






