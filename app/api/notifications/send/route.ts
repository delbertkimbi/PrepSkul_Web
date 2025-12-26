import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendCustomEmail } from '@/lib/notifications';

/**
 * Send Notification API
 * 
 * Sends notifications via multiple channels:
 * - In-app notifications (always)
 * - Email notifications (if enabled)
 * - Push notifications (if enabled and FCM tokens available)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      priority = 'normal',
      actionUrl,
      actionText,
      icon,
      metadata,
      sendEmail = false,
      sendPush = false,
    } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check user notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Determine which channels to use
    const shouldSendEmail = sendEmail && (preferences?.channels?.email !== false);
    const shouldSendPush = sendPush && (preferences?.channels?.push !== false);

    // Create in-app notification (always)
    const notificationData = {
      user_id: userId,
      type: type || 'general',
      notification_type: type || 'general',
      title,
      message,
      priority,
      is_read: false,
      action_url: actionUrl,
      action_text: actionText,
      icon,
      metadata: metadata || {},
    };

    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .maybeSingle();

    if (notifError) {
      console.error('Error creating in-app notification:', notifError);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    const results: {
      inApp: { success: boolean; notificationId: string };
      email: { success: boolean; sent: boolean; error?: string };
      push: { success: boolean; sent: number; errors: number; error?: string };
    } = {
      inApp: { success: true, notificationId: notification.id },
      email: { success: false, sent: false },
      push: { success: false, sent: 0, errors: 0 },
    };

    // Send email notification
    if (shouldSendEmail) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          await sendCustomEmail(
            profile.email,
            profile.full_name || 'User',
            title,
            `
              <h2>${title}</h2>
              <p>${message}</p>
              ${actionUrl ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}${actionUrl}">${actionText || 'View Details'}</a></p>` : ''}
            `,
          );
          results.email = { success: true, sent: true };
        }
      } catch (e: any) {
        console.error('Error sending email notification:', e);
        results.email = { success: false, sent: false, error: e.message };
      }
    }

    // Send push notification
    if (shouldSendPush) {
      try {
        // Dynamically import firebase-admin to avoid build errors if not available
        const { sendPushNotification } = await import('@/lib/services/firebase-admin');
        const pushResult = await sendPushNotification({
          userId,
          title,
          body: message,
          data: {
            type: type || 'general',
            notificationId: notification.id,
            ...(actionUrl ? { actionUrl } : {}),
            ...(metadata || {}),
          },
          priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal',
        });
        // Assign push result (it doesn't have error property, which is fine)
        results.push = { ...pushResult };
      } catch (e: any) {
        console.error('Error sending push notification:', e);
        // When error occurs, include error message
        results.push = { success: false, sent: 0, errors: 0, error: e.message };
      }
    }

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      channels: results,
    });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}















