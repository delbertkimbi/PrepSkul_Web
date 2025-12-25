import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendCustomEmail } from '@/lib/notifications';
import { sendPushNotification } from '@/lib/services/firebase-admin';

/**
 * Process Scheduled Notifications Cron Job
 * 
 * This endpoint should be called periodically (e.g., every 5 minutes) to process
 * scheduled notifications that are due to be sent.
 * 
 * In Vercel, configure this as a cron job in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-scheduled-notifications",
 *     "schedule": "*/5 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString();

    // Fetch pending scheduled notifications that are due
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(100); // Process up to 100 at a time

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
          .single();

        if (notifError) {
          throw new Error(`Failed to create in-app notification: ${notifError.message}`);
        }

        // Send email notification if enabled
        if (shouldSendEmail && notification) {
          try {
            // Get user email
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', scheduled.user_id)
              .maybeSingle();

            if (userProfile?.email) {
              await sendCustomEmail({
                to: userProfile.email,
                subject: scheduled.title,
                html: `
                  <h2>${scheduled.title}</h2>
                  <p>${scheduled.message}</p>
                  ${metadata.action_url ? `<p><a href="${process.env.NEXT_PUBLIC_APP_URL}${metadata.action_url}">${metadata.action_text || 'View Details'}</a></p>` : ''}
                `,
              });
            }
          } catch (emailError: any) {
            console.error(`⚠️ Failed to send email for scheduled notification ${scheduled.id}:`, emailError);
            // Don't fail the whole process if email fails
          }
        }

        // Send push notification if enabled
        if (shouldSendPush && notification) {
          try {
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

