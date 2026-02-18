import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail } from '@/lib/notifications';

// Uses firebase-admin for push; ensure Node.js runtime on Vercel.
export const runtime = 'nodejs';

/**
 * Process Scheduled Notifications Cron Job
 *
 * Uses Supabase admin client so external cron (e.g. cron-job.org) can run
 * without a user session. RLS would block anon client.
 *
 * Vercel free tier: ~10s timeout; we process a small batch per run.
 */
const BATCH_SIZE = 50; // Safe for Vercel free tier timeout

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const isVercelCron =
        request.headers.get('user-agent')?.includes('vercel-cron') ||
        request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized. Please provide Authorization: Bearer YOUR_CRON_SECRET header.' },
          { status: 401 }
        );
      }
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('❌ Error fetching scheduled notifications:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled notifications', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No scheduled notifications to process',
      });
    }

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each scheduled notification
    for (const scheduled of scheduledNotifications) {
      try {
        const metadata = scheduled.metadata as Record<string, any> || {};
        
        // Determine notification channels from metadata or defaults
        const shouldSendEmail = metadata.sendEmail !== false; // Default to true if not specified
        const shouldSendPush = metadata.sendPush === true; // Default to false unless specified

        // Create in-app notification
        const notificationData = {
          user_id: scheduled.user_id,
          type: scheduled.notification_type || 'general',
          notification_type: scheduled.notification_type || 'general',
          title: scheduled.title,
          message: scheduled.message,
          priority: metadata.priority || 'normal',
          is_read: false,
          action_url: metadata.action_url,
          action_text: metadata.action_text || 'View',
          icon: metadata.icon,
          metadata: metadata,
          related_id: scheduled.related_id,
        };

        const { data: notification, error: notifError } = await supabase
          .from('notifications')
          .insert(notificationData)
          .select()
          .maybeSingle();

        if (notifError) {
          throw new Error(`Failed to create in-app notification: ${notifError.message}`);
        }

        // Send email notification if enabled (use branded template)
        if (shouldSendEmail && notification) {
          try {
            // Check if email was already sent (deduplication)
            if (metadata.sent_email_at) {
              console.log(`ℹ️ Email already sent for scheduled notification ${scheduled.id}, skipping`);
            } else {
              // Get user email
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', scheduled.user_id)
                .maybeSingle();

              if (userProfile?.email) {
                await sendNotificationEmail({
                  recipientEmail: userProfile.email,
                  recipientName: userProfile.full_name || 'User',
                  subject: scheduled.title,
                  title: scheduled.title,
                  message: scheduled.message,
                  actionUrl: metadata.action_url,
                  actionText: metadata.action_text || 'View Details',
                });

                // Mark email as sent in metadata to prevent duplicates
                await supabase
                  .from('notifications')
                  .update({
                    metadata: {
                      ...metadata,
                      sent_email_at: new Date().toISOString(),
                    },
                  })
                  .eq('id', notification.id);
              }
            }
          } catch (emailError: any) {
            console.error(`⚠️ Failed to send email for scheduled notification ${scheduled.id}:`, emailError);
            // Don't fail the whole process if email fails
          }
        }

        // Send push notification if enabled (for high-priority reminders)
        if (shouldSendPush && notification) {
          try {
            // Only send push for high-priority reminders (1h, 15m)
            const isHighPriorityReminder = metadata.reminder_type === '1_hour' || metadata.reminder_type === '15_minutes';
            if (isHighPriorityReminder || metadata.priority === 'urgent' || metadata.priority === 'high') {
              // Dynamically import firebase-admin to avoid build errors if not available
              const { sendPushNotification } = await import('@/lib/services/firebase-admin');
              await sendPushNotification({
                userId: scheduled.user_id,
                title: scheduled.title,
                body: scheduled.message,
                data: {
                  notificationId: notification.id,
                  type: scheduled.notification_type || 'general',
                  actionUrl: metadata.action_url || '',
                },
                priority: (metadata.priority === 'urgent' || metadata.priority === 'high') ? 'high' : 'normal',
              });
            }
          } catch (pushError: any) {
            console.error(`⚠️ Failed to send push notification for scheduled notification ${scheduled.id}:`, pushError);
            // Don't fail the whole process if push fails
          }
        }

        // Mark scheduled notification as sent
        await supabase
          .from('scheduled_notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduled.id);

        processed++;
      } catch (error: any) {
        console.error(`❌ Error processing scheduled notification ${scheduled.id}:`, error);
        failed++;
        errors.push(`Notification ${scheduled.id}: ${error.message}`);

        // Mark as failed (but don't retry immediately - could be a permanent issue)
        await supabase
          .from('scheduled_notifications')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            error_message: error.message,
          })
          .eq('id', scheduled.id);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      failed,
      total: scheduledNotifications.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('❌ Error in process-scheduled-notifications cron:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process scheduled notifications' },
      { status: 500 }
    );
  }
}
