/**
 * Notification Schedule API
 * 
 * Schedules notifications for future delivery (reminders, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      notificationType,
      title,
      message,
      scheduledFor, // ISO 8601 string
      relatedId,
      metadata,
    } = body;

    // Validate required fields
    if (!userId || !notificationType || !title || !message || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, notificationType, title, message, scheduledFor' },
        { status: 400 }
      );
    }

    // Validate scheduledFor is in the future
    const scheduledDate = new Date(scheduledFor);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'scheduledFor must be in the future' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const scheduledData: any = {
      user_id: userId,
      notification_type: notificationType,
      title: title,
      message: message,
      scheduled_for: scheduledFor,
      status: 'pending',
    };

    if (relatedId) scheduledData.related_id = relatedId;
    if (metadata) scheduledData.metadata = metadata;

    const { data, error } = await supabase
      .from('scheduled_notifications')
      .insert(scheduledData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error scheduling notification:', error);
      return NextResponse.json(
        { error: 'Failed to schedule notification' },
        { status: 500 }
      );
    }

    console.log('✅ Notification scheduled for user:', userId, 'at:', scheduledFor);

    return NextResponse.json({
      success: true,
      scheduledNotification: data,
    });
  } catch (error: any) {
    console.error('❌ Error in notification schedule API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}






