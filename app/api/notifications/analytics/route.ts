import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Notification Analytics API
 * 
 * Tracks user engagement with notifications:
 * - Notification opened
 * - Action button clicked
 * - Notification dismissed
 * - Time spent viewing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      notificationId,
      notificationType,
      eventType,
      actionUrl,
      timeSpent,
    } = body;

    if (!userId || !notificationId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, notificationId, eventType' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Store analytics event
    const analyticsData = {
      user_id: userId,
      notification_id: notificationId,
      notification_type: notificationType || 'general',
      event_type: eventType,
      metadata: {
        ...(actionUrl ? { action_url: actionUrl } : {}),
        ...(timeSpent ? { time_spent: timeSpent } : {}),
      },
      created_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from('notification_analytics')
      .insert(analyticsData);

    if (error) {
      console.error('Error storing analytics:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded',
    });
  } catch (error: any) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

/**
 * Get user engagement statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get all analytics events for user
    const { data: events, error } = await supabaseAdmin
      .from('notification_analytics')
      .select('notification_type, event_type')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        engagementRates: {},
        totalEvents: 0,
      });
    }

    // Group by notification type
    const typeEvents: Record<string, string[]> = {};
    for (const event of events) {
      const type = event.notification_type || 'general';
      if (!typeEvents[type]) {
        typeEvents[type] = [];
      }
      typeEvents[type].push(event.event_type);
    }

    // Calculate engagement rates
    const engagementRates: Record<string, number> = {};
    for (const [type, events] of Object.entries(typeEvents)) {
      const opens = events.filter((e) => e === 'opened').length;
      const total = events.length;
      engagementRates[type] = total > 0 ? opens / total : 0;
    }

    return NextResponse.json({
      engagementRates,
      totalEvents: events.length,
    });
  } catch (error: any) {
    console.error('Error in analytics GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

