import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail } from '@/lib/notifications';
import { shouldReceiveNotification } from '@/lib/services/notification-permission-service';
import { checkRateLimit } from '@/lib/services/rate-limiter';

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
      imageUrl, // Rich preview image URL
      sendEmail = false,
      sendPush = false,
    } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message' },
        { status: 400 }
      );
    }

    // Check rate limits (per-user: 10/min, global: 1000/min)
    const rateLimitCheck = checkRateLimit(userId, 10, 1000);
    if (!rateLimitCheck.allowed) {
      const resetSeconds = Math.ceil((rateLimitCheck.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many notifications sent. Please try again later.',
          retryAfter: resetSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(resetSeconds),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitCheck.resetAt).toISOString(),
          },
        }
      );
    }

    // Use admin client to bypass RLS for notification creation
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = await createServerSupabaseClient();

    // Check if user should receive this notification (permission check)
    const permissionCheck = await shouldReceiveNotification({
      userId,
      type: type || 'general',
      metadata,
      actionUrl,
    });

    if (!permissionCheck.allowed) {
      console.log(`Notification blocked for user ${userId}: ${permissionCheck.reason}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Notification not allowed',
          reason: permissionCheck.reason,
        },
        { status: 403 }
      );
    }

    // Check user notification preferences
    const { data: preferences } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Helper function to parse TIME string to minutes since midnight
    function parseTimeToMinutes(timeString: string): number {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    }

    // Check quiet hours (skip non-urgent notifications during quiet hours)
    const isInQuietHours = (() => {
      if (!preferences?.quiet_hours_start || !preferences?.quiet_hours_end) {
        return false;
      }
      if (priority === 'urgent') {
        return false; // Urgent notifications bypass quiet hours
      }
      
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
      const quietStart = parseTimeToMinutes(preferences.quiet_hours_start);
      const quietEnd = parseTimeToMinutes(preferences.quiet_hours_end);
      
      // Handle midnight-spanning quiet hours (e.g., 22:00 to 08:00)
      if (quietStart > quietEnd) {
        return currentTime >= quietStart || currentTime <= quietEnd;
      } else {
        return currentTime >= quietStart && currentTime <= quietEnd;
      }
    })();

    // Skip notification if in quiet hours
    if (isInQuietHours) {
      console.log(`Notification skipped for user ${userId}: quiet hours (${preferences.quiet_hours_start} - ${preferences.quiet_hours_end})`);
      return NextResponse.json({
        success: false,
        skipped: true,
        reason: 'quiet_hours',
      });
    }

    // Check for duplicate notification (deduplication)
    // If a similar notification was sent recently (within last hour) with same type and actionUrl, skip email to avoid spam
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    let alreadyEmailed = false;
    
    if (sendEmail && actionUrl) {
      // Check for recent notification with same type and actionUrl that already had email sent
      const { data: recentNotification } = await supabaseAdmin
        .from('notifications')
        .select('id, metadata')
        .eq('user_id', userId)
        .eq('type', type || 'general')
        .eq('action_url', actionUrl)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check if email was already sent for this notification
      if (recentNotification?.metadata) {
        const recentMeta = recentNotification.metadata as Record<string, any>;
        if (recentMeta.sent_email_at) {
          const emailSentAt = new Date(recentMeta.sent_email_at);
          if (emailSentAt > new Date(oneHourAgo)) {
            alreadyEmailed = true;
            console.log(`ℹ️ Duplicate email prevented for user ${userId}, type ${type}, actionUrl ${actionUrl}`);
          }
        }
      }
    }

    // Determine which channels to use
    const shouldSendEmail = sendEmail && (preferences?.channels?.email !== false) && !alreadyEmailed;
    const shouldSendPush = sendPush && (preferences?.channels?.push !== false);

    // Create in-app notification (always) - using admin client to bypass RLS
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
      image_url: imageUrl, // Rich preview image URL
      metadata: {
        ...(metadata || {}),
        ...(imageUrl ? { image_url: imageUrl } : {}), // Also store in metadata for easy access
        ...(shouldSendEmail ? { will_send_email: true } : {}), // Track email intent
      },
    };

    const { data: notification, error: notifError } = await supabaseAdmin
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
          // Extract sender info from metadata for message-type notifications
          const metadataObj = metadata as Record<string, any> || {};
          const senderName = metadataObj.sender_name;
          const senderAvatarUrl = metadataObj.sender_avatar_url;
          const messagePreview = metadataObj.message_preview;
          
          await sendNotificationEmail({
            recipientEmail: profile.email,
            recipientName: profile.full_name || 'User',
            subject: title,
            title,
            message,
            actionUrl,
            actionText,
            senderName: (type === 'message' && senderName) ? senderName : undefined,
            senderAvatarUrl: (type === 'message' && senderAvatarUrl) ? senderAvatarUrl : undefined,
            messagePreview: (type === 'message' && messagePreview) ? messagePreview : undefined,
          });
          
          // Mark email as sent in notification metadata
          await supabaseAdmin
            .from('notifications')
            .update({
              metadata: {
                ...notificationData.metadata,
                sent_email_at: new Date().toISOString(),
              },
            })
            .eq('id', notification.id);
          
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
        // Use a function that checks if the module exists before importing
        let firebaseAdminModule;
        try {
          firebaseAdminModule = await import('@/lib/services/firebase-admin');
        } catch (importError: any) {
          // If firebase-admin is not installed or not available, skip push notifications
          console.warn('Firebase Admin not available, skipping push notification:', importError.message);
          results.push = { success: false, sent: 0, errors: 0, error: 'Firebase Admin not configured' };
          return NextResponse.json({
            success: true,
            notificationId: notification.id,
            channels: results,
          });
        }
        
        if (firebaseAdminModule && firebaseAdminModule.sendPushNotification) {
          const pushResult = await firebaseAdminModule.sendPushNotification({
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
            imageUrl: imageUrl, // Pass rich image (e.g., sender avatar) for push notifications
          });
          // Assign push result (it doesn't have error property, which is fine)
          results.push = { ...pushResult };
        } else {
          results.push = { success: false, sent: 0, errors: 0, error: 'Push notification function not available' };
        }
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
