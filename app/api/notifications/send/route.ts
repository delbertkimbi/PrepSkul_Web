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

    // Diagnostic log: helps validate "automatic" sends across all triggers.
    // (Safe: no secrets; message is truncated.)
    try {
      const preview = String(message ?? '').slice(0, 120);
      console.log(
        `ℹ️ /api/notifications/send request user=${userId} type=${type || 'general'} sendPush=${!!sendPush} sendEmail=${!!sendEmail} priority=${priority} msg="${preview}"`
      );
    } catch {
      // ignore
    }

    // Stage-specific content for onboarding_reminder (metadata.reminder_stage)
    let effectiveTitle = title;
    let effectiveMessage = message;
    let effectiveSubject = title;
    if (type === 'onboarding_reminder' && metadata?.reminder_stage) {
      const stage = metadata.reminder_stage as string;
      if (stage === 'missing_video') {
        effectiveTitle = 'Add your video intro – PrepSkul';
        effectiveMessage = 'Students love seeing a short video from you. Add your video intro to complete your profile and get verified.';
        effectiveSubject = effectiveTitle;
      } else if (stage === 'missing_id') {
        effectiveTitle = 'Upload your ID – PrepSkul';
        effectiveMessage = 'Complete verification by uploading your ID. Finish this step to get your profile approved and visible to students.';
        effectiveSubject = effectiveTitle;
      } else if (stage === 'missing_statement') {
        effectiveTitle = 'Complete your profile – PrepSkul';
        effectiveMessage = "You're almost there! Add your personal statement to complete your profile and submit for verification.";
        effectiveSubject = effectiveTitle;
      }
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
    console.log(
      `ℹ️ notification channels user=${userId} type=${type || 'general'} shouldSendPush=${shouldSendPush} shouldSendEmail=${shouldSendEmail}`
    );

    // Create in-app notification - using admin client to bypass RLS
    //
    // WhatsApp-style behavior for message notifications:
    // - Avoid spamming multiple in-app rows for the same conversation.
    // - If there is an existing *unread* message notification for the same actionUrl,
    //   update it (and bump created_at) instead of inserting a new row.
    //
    // NOTE: Some environments may not have all optional columns (e.g. `image_url`).
    // We try a rich write first, then gracefully retry without the missing column(s)
    // so push/email still work for "automatic" notifications.
    const notificationData: Record<string, any> = {
      user_id: userId,
      type: type || 'general',
      notification_type: type || 'general',
      title: effectiveTitle,
      message: effectiveMessage,
      priority,
      is_read: false,
      action_url: actionUrl,
      action_text: actionText,
      icon,
      metadata: {
        ...(metadata || {}),
        ...(imageUrl ? { image_url: imageUrl } : {}), // Also store in metadata for easy access
        ...(shouldSendEmail ? { will_send_email: true } : {}), // Track email intent
      },
    };
    if (imageUrl) {
      notificationData.image_url = imageUrl; // optional column in DB
    }

    let notification: any | null = null;
    let notifError: any | null = null;

    const isMissingColumn = (err: any, columnName: string) =>
      err?.code === 'PGRST204' && String(err?.message || '').includes(`'${columnName}'`);

    const tryInsertNotification = async (data: Record<string, any>) =>
      supabaseAdmin.from('notifications').insert(data).select().maybeSingle();

    const tryUpdateNotification = async (id: string, data: Record<string, any>) =>
      supabaseAdmin.from('notifications').update(data).eq('id', id).select().maybeSingle();

    const isMessageConversation = (type || 'general') === 'message' && !!actionUrl;

    // WhatsApp-style merge for message notifications:
    // update existing unread notification for the same actionUrl instead of inserting duplicates.
    if (isMessageConversation) {
      const { data: existing } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'message')
        .eq('action_url', actionUrl)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const updateData: Record<string, any> = {
          title: effectiveTitle,
          message: effectiveMessage,
          priority,
          is_read: false,
          action_url: actionUrl,
          action_text: actionText,
          icon,
          metadata: notificationData.metadata,
          // Bump created_at so the item moves to the top and reads as "now".
          created_at: new Date().toISOString(),
        };
        if (imageUrl) {
          updateData.image_url = imageUrl; // optional column
        }

        const firstUpdate = await tryUpdateNotification(existing.id, updateData);
        notification = firstUpdate.data;
        notifError = firstUpdate.error;

        if (!notification && notifError && isMissingColumn(notifError, 'image_url')) {
          console.warn(
            "⚠️ notifications.image_url missing in DB schema; retrying notification update without image_url"
          );
          const retryData = { ...updateData };
          delete retryData.image_url;
          const retryUpdate = await tryUpdateNotification(existing.id, retryData);
          notification = retryUpdate.data;
          notifError = retryUpdate.error;
        }
      }
    }

    // If we didn't update an existing row, insert a new one.
    if (!notification && !notifError) {
      const firstAttempt = await tryInsertNotification(notificationData);
      notification = firstAttempt.data;
      notifError = firstAttempt.error;

      if (!notification && notifError && isMissingColumn(notifError, 'image_url')) {
        console.warn(
          "⚠️ notifications.image_url missing in DB schema; retrying notification insert without image_url"
        );
        const retryData = { ...notificationData };
        delete retryData.image_url;
        const retryAttempt = await tryInsertNotification(retryData);
        notification = retryAttempt.data;
        notifError = retryAttempt.error;
      }
    }

    if (notifError || !notification) {
      console.error('Error creating in-app notification:', notifError);
      // If caller only wanted in-app (no email/push), fail hard.
      if (!shouldSendEmail && !shouldSendPush) {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
      }
      // Otherwise continue: we can still send email/push even if in-app insert failed.
    }

    const results: {
      inApp: { success: boolean; notificationId?: string; error?: string };
      email: { success: boolean; sent: boolean; error?: string };
      push: { success: boolean; sent: number; errors: number; error?: string };
    } = {
      inApp: notification?.id
        ? { success: true, notificationId: notification.id }
        : { success: false, error: notifError?.message || 'Failed to create in-app notification' },
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
            subject: effectiveSubject,
            title: effectiveTitle,
            message: effectiveMessage,
            actionUrl,
            actionText,
            senderName: (type === 'message' && senderName) ? senderName : undefined,
            senderAvatarUrl: (type === 'message' && senderAvatarUrl) ? senderAvatarUrl : undefined,
            messagePreview: (type === 'message' && messagePreview) ? messagePreview : undefined,
          });
          
          // Mark email as sent in notification metadata (only if in-app notification exists)
          if (notification?.id) {
            await supabaseAdmin
              .from('notifications')
              .update({
                metadata: {
                  ...notificationData.metadata,
                  sent_email_at: new Date().toISOString(),
                },
              })
              .eq('id', notification.id);
          }
          
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
            title: effectiveTitle,
            body: effectiveMessage,
            data: {
              type: type || 'general',
              ...(notification?.id ? { notificationId: notification.id } : {}),
              ...(actionUrl ? { actionUrl } : {}),
              ...(metadata || {}),
            },
            priority: priority === 'urgent' || priority === 'high' ? 'high' : 'normal',
            imageUrl: imageUrl, // Pass rich image (e.g., sender avatar) for push notifications
          });
          // Assign push result (it doesn't have error property, which is fine)
          results.push = { ...pushResult };
          console.log(
            `✅ push result user=${userId} type=${type || 'general'} sent=${results.push.sent} errors=${results.push.errors}`
          );
        } else {
          results.push = { success: false, sent: 0, errors: 0, error: 'Push notification function not available' };
          console.warn(`⚠️ push not available user=${userId} type=${type || 'general'}`);
        }
      } catch (e: any) {
        console.error('Error sending push notification:', e);
        // When error occurs, include error message
        results.push = { success: false, sent: 0, errors: 0, error: e.message };
      }
    }

    return NextResponse.json({
      success: true,
      notificationId: notification?.id,
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
