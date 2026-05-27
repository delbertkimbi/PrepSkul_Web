import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendNotificationEmail } from '@/lib/notifications';
import {
  sendOfflineMatchNotificationEmail,
  sendOfflineReminderEmail,
  sendSessionStartEmail,
} from '@/lib/offline-session-emails';
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth';

export const runtime = 'nodejs';

/**
 * Process Scheduled Notifications Cron Job
 *
 * Trigger via external cron (cron-job.org): GET with Authorization: Bearer CRON_SECRET
 * Recommended: every 1–5 minutes.
 */
const BATCH_SIZE = 50;
const JOB_NAME = 'process-scheduled-notifications';

export async function GET(request: NextRequest) {
  let runStatus: 'success' | 'failed' = 'failed';
  let processedCount = 0;
  let failedCount = 0;
  let runError: string | null = null;

  const authError = verifyExternalCron(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();

  try {    const now = new Date().toISOString();

    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
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
      runStatus = 'success';
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
                if (metadata.offline_match_email) {
                  await sendOfflineMatchNotificationEmail({
                    to: userProfile.email,
                    recipientName: userProfile.full_name || 'there',
                    tutorName: metadata.tutor_name || 'your tutor',
                    learnerName: metadata.learner_name || undefined,
                    nextDate: metadata.next_date,
                    nextTime: metadata.next_time,
                    subject: metadata.subject,
                    deliveryMode: metadata.delivery_mode,
                    meetLink: metadata.meet_link,
                    onsiteLocation: metadata.onsite_location,
                    portalUrl: metadata.portal_url,
                    rescheduleUrl: metadata.reschedule_url,
                    role: metadata.recipient_role === 'tutor' ? 'tutor' : 'learner',
                  });
                } else if (metadata.offline_email && metadata.session_id) {
                  const { data: sess } = await supabase
                    .from('individual_sessions')
                    .select('scheduled_date, scheduled_time, subject, delivery_mode, meet_link, onsite_location, tutor_id, learner_id, parent_id')
                    .eq('id', metadata.session_id)
                    .maybeSingle();
                  const isTutor = scheduled.user_id === sess?.tutor_id;
                  const portalUrl = isTutor ? metadata.tutor_portal_url : metadata.learner_portal_url;
                  const rescheduleUrl = isTutor
                    ? metadata.tutor_reschedule_url
                    : metadata.learner_reschedule_url;
                  if (metadata.reminder_type === 'session_start' && portalUrl) {
                    const { data: tutorP } = await supabase.from('profiles').select('full_name').eq('id', sess?.tutor_id).maybeSingle();
                    const { data: learnerP } = await supabase.from('profiles').select('full_name').eq('id', sess?.learner_id).maybeSingle();
                    await sendSessionStartEmail({
                      to: userProfile.email,
                      recipientName: userProfile.full_name || 'there',
                      tutorName: tutorP?.full_name || undefined,
                      learnerName: learnerP?.full_name || undefined,
                      scheduledDate: sess?.scheduled_date,
                      scheduledTime: sess?.scheduled_time,
                      subject: sess?.subject,
                      deliveryMode: sess?.delivery_mode,
                      meetLink: sess?.meet_link,
                      onsiteLocation: sess?.onsite_location,
                      portalUrl,
                      role: scheduled.user_id === sess?.tutor_id ? 'tutor' : 'learner',
                    });
                  } else {
                    await sendOfflineReminderEmail({
                      to: userProfile.email,
                      recipientName: userProfile.full_name || 'there',
                      reminderLabel: metadata.reminder_label || scheduled.title,
                      scheduledDate: sess?.scheduled_date,
                      scheduledTime: sess?.scheduled_time,
                      subject: sess?.subject,
                      deliveryMode: sess?.delivery_mode,
                      meetLink: sess?.meet_link,
                      onsiteLocation: sess?.onsite_location,
                      rescheduleUrl:
                        metadata.reminder_type === '24_hours' || metadata.reminder_type === '1_hour'
                          ? rescheduleUrl
                          : undefined,
                      feedbackUrl: portalUrl,
                    });
                  }
                } else {
                  await sendNotificationEmail({
                    recipientEmail: userProfile.email,
                    recipientName: userProfile.full_name || 'User',
                    subject: scheduled.title,
                    title: scheduled.title,
                    message: scheduled.message,
                    actionUrl: metadata.action_url,
                    actionText: metadata.action_text || 'View Details',
                  });
                }

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
          })
          .eq('id', scheduled.id);
      }
    }

    runStatus = 'success';
    processedCount = processed;
    failedCount = failed;
    return NextResponse.json({
      success: true,
      processed,
      failed,
      total: scheduledNotifications.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('❌ Error in process-scheduled-notifications cron:', error);
    runError = error.message || 'Failed to process scheduled notifications';
    return NextResponse.json(
      { error: error.message || 'Failed to process scheduled notifications' },
      { status: 500 }
    );
  } finally {
    try {
      const supabase = getSupabaseAdmin();
      await persistCronHeartbeat(supabase, {
        jobName: JOB_NAME,
        status: runStatus,
        processedCount,
        failedCount,
        error: runError,
        metadata: { endpoint: '/api/cron/process-scheduled-notifications' },
      });
    } catch (heartbeatError) {
      console.warn('Could not persist cron heartbeat (process-scheduled-notifications):', heartbeatError);
    }
  }
}
