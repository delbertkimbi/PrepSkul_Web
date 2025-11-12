/**
 * Notification Send API
 * 
 * Sends in-app and email notifications to users
 * Checks user preferences before sending
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendCustomEmail } from '@/lib/notifications';
import { generateEmailTemplate } from '@/lib/email_templates/base_template';
import { sendPushNotificationToMultiple } from '@/lib/services/firebase-admin';
import {
  bookingRequestEmail,
  bookingAcceptedEmail,
  bookingRejectedEmail,
} from '@/lib/email_templates/booking_templates';
import {
  trialRequestEmail,
  trialAcceptedEmail,
  trialRejectedEmail,
} from '@/lib/email_templates/trial_templates';
import {
  paymentReceivedEmail,
  paymentSuccessfulEmail,
  paymentFailedEmail,
} from '@/lib/email_templates/payment_templates';
import {
  sessionReminderEmail,
  sessionCompletedEmail,
  reviewReminderEmail,
} from '@/lib/email_templates/session_templates';
import {
  profileApprovedEmail,
  profileNeedsImprovementEmail,
  profileRejectedEmail,
} from '@/lib/email_templates/tutor_profile_templates';

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
      expiresAt,
      metadata,
      sendEmail = true, // Whether to send email (still checks preferences)
    } = body;

    // Validate required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Check if user preferences allow sending
    // First, check in-app notification preference
    const shouldSendInApp = await supabase.rpc('should_send_notification', {
      p_user_id: userId,
      p_notification_type: type,
      p_channel: 'in_app',
    });

    // Create in-app notification if allowed
    if (shouldSendInApp.data) {
      const notificationData: any = {
        user_id: userId,
        type: type,
        notification_type: type,
        title: title,
        message: message,
        priority: priority,
        is_read: false,
      };

      if (actionUrl) notificationData.action_url = actionUrl;
      if (actionText) notificationData.action_text = actionText;
      if (icon) notificationData.icon = icon;
      if (expiresAt) notificationData.expires_at = expiresAt;
      if (metadata) notificationData.metadata = metadata;

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (notificationError) {
        console.error('❌ Error creating in-app notification:', notificationError);
      } else {
        console.log('✅ In-app notification created for user:', userId);
      }
    }

    // Send push notification if enabled
    let pushSent = false;
    try {
      // Check push notification preference
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', userId)
        .maybeSingle();

      const pushEnabled = prefs?.push_enabled !== false; // Default to true if no preferences

      if (pushEnabled) {
        // Get user's active FCM tokens
        const { data: tokensData, error: tokensError } = await supabase.rpc('get_active_fcm_tokens', {
          p_user_id: userId,
        });

        if (tokensError) {
          console.error('❌ Error fetching FCM tokens:', tokensError);
        } else if (tokensData && tokensData.length > 0) {
          const fcmTokens = tokensData.map((t: any) => t.token);
          
          // Determine sound and priority
          const sound = 'default'; // Can be customized per notification type
          const fcmPriority = priority === 'urgent' || priority === 'high' ? 'high' : 'normal';

          // Send push notification
          try {
            await sendPushNotificationToMultiple(
              fcmTokens,
              {
                title: title,
                body: message,
              },
              {
                type: type,
                actionUrl: actionUrl || '',
                ...(metadata ? Object.fromEntries(
                  Object.entries(metadata).map(([k, v]) => [k, String(v)])
                ) : {}),
              },
              {
                sound: sound,
                priority: fcmPriority as 'normal' | 'high',
              },
            );
            pushSent = true;
            console.log(`✅ Push notification sent to ${fcmTokens.length} device(s) for user: ${userId}`);
          } catch (pushError: any) {
            console.error('❌ Error sending push notification:', pushError);
            
            // Handle invalid tokens (will be handled by firebase-admin service)
            if (pushError.message === 'INVALID_TOKEN') {
              console.log('⚠️ Some FCM tokens are invalid and should be deactivated');
            }
            
            // Don't fail the entire request if push fails
          }
        } else {
          console.log(`ℹ️ No active FCM tokens found for user: ${userId}`);
        }
      }
    } catch (pushError) {
      console.error('❌ Error checking push notification preferences:', pushError);
      // Don't fail the entire request if push check fails
    }

    // Send email if enabled and requested
    let emailSent = false;
    if (sendEmail) {
      // Check email preference
      const shouldSendEmail = await supabase.rpc('should_send_notification', {
        p_user_id: userId,
        p_notification_type: type,
        p_channel: 'email',
      });

      if (shouldSendEmail.data) {
        // Get user email and name
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.email) {
          try {
            // Generate email template based on notification type
            let emailBody: string;
            const userName = profile.full_name || 'User';

            // Use specific templates for known notification types
            switch (type) {
              case 'booking_request':
                emailBody = bookingRequestEmail(
                  userName,
                  metadata?.student_name as string || 'Student',
                  metadata?.subject as string || 'Tutoring Sessions',
                  metadata?.request_id as string || '',
                );
                break;

              case 'booking_accepted':
                emailBody = bookingAcceptedEmail(
                  userName,
                  metadata?.tutor_name as string || 'Tutor',
                  metadata?.subject as string || 'Tutoring Sessions',
                  metadata?.request_id as string || '',
                );
                break;

              case 'booking_rejected':
                emailBody = bookingRejectedEmail(
                  userName,
                  metadata?.tutor_name as string || 'Tutor',
                  metadata?.rejection_reason as string || null,
                  metadata?.request_id as string || '',
                );
                break;

              case 'trial_request':
                emailBody = trialRequestEmail(
                  userName,
                  metadata?.student_name as string || 'Student',
                  metadata?.subject as string || 'Subject',
                  metadata?.scheduled_date as string || '',
                  metadata?.scheduled_time as string || '',
                  metadata?.trial_id as string || '',
                );
                break;

              case 'trial_accepted':
                emailBody = trialAcceptedEmail(
                  userName,
                  metadata?.tutor_name as string || 'Tutor',
                  metadata?.subject as string || 'Subject',
                  metadata?.scheduled_date as string || '',
                  metadata?.scheduled_time as string || '',
                  metadata?.trial_id as string || '',
                  (metadata?.trial_fee as number) || 0,
                );
                break;

              case 'trial_rejected':
                emailBody = trialRejectedEmail(
                  userName,
                  metadata?.tutor_name as string || 'Tutor',
                  metadata?.rejection_reason as string || null,
                );
                break;

              case 'payment_received':
                emailBody = paymentReceivedEmail(
                  userName,
                  metadata?.student_name as string || 'Student',
                  (metadata?.amount as number) || 0,
                  metadata?.currency as string || 'XAF',
                  metadata?.payment_id as string || '',
                  metadata?.session_type as string,
                );
                break;

              case 'payment_successful':
                emailBody = paymentSuccessfulEmail(
                  userName,
                  (metadata?.amount as number) || 0,
                  metadata?.currency as string || 'XAF',
                  metadata?.payment_id as string || '',
                  metadata?.session_type as string,
                );
                break;

              case 'payment_failed':
                emailBody = paymentFailedEmail(
                  userName,
                  (metadata?.amount as number) || 0,
                  metadata?.currency as string || 'XAF',
                  metadata?.payment_id as string || '',
                  metadata?.error_message as string,
                );
                break;

              case 'session_reminder':
              case 'session_starting_soon':
                emailBody = sessionReminderEmail(
                  userName,
                  metadata?.other_party_name as string || 'Tutor',
                  metadata?.subject as string || 'Subject',
                  metadata?.session_type as string || 'session',
                  metadata?.session_start as string || '',
                  metadata?.session_id as string || '',
                  (metadata?.minutes_until as number) || 30,
                );
                break;

              case 'session_completed':
                emailBody = sessionCompletedEmail(
                  userName,
                  metadata?.other_party_name as string || 'Tutor',
                  metadata?.subject as string || 'Subject',
                  metadata?.session_type as string || 'session',
                  metadata?.session_id as string || '',
                );
                break;

              case 'review_reminder':
                emailBody = reviewReminderEmail(
                  userName,
                  metadata?.other_party_name as string || 'Tutor',
                  metadata?.subject as string || 'Subject',
                  metadata?.session_type as string || 'session',
                  metadata?.session_id as string || '',
                );
                break;

              case 'profile_approved':
                emailBody = profileApprovedEmail(
                  userName,
                  metadata?.rating as number,
                  metadata?.session_price as number,
                  metadata?.pricing_tier as string,
                  metadata?.admin_notes as string,
                );
                break;

              case 'profile_improvement':
                emailBody = profileNeedsImprovementEmail(
                  userName,
                  (metadata?.improvement_requests as string[]) || [],
                );
                break;

              case 'profile_rejected':
                emailBody = profileRejectedEmail(
                  userName,
                  metadata?.rejection_reason as string || 'Application does not meet our current requirements.',
                );
                break;

              default:
                // Fallback to base template for unknown types
                emailBody = generateEmailTemplate({
                  userName: userName,
                  title: title,
                  message: message,
                  icon: icon,
                  actionUrl: actionUrl,
                  actionText: actionText,
                });
                break;
            }

            const emailResult = await sendCustomEmail(
              profile.email,
              userName,
              title,
              emailBody
            );

            if (emailResult.success) {
              emailSent = true;
              console.log('✅ Email notification sent to:', profile.email);
            }
          } catch (emailError) {
            console.error('❌ Error sending email notification:', emailError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      inAppSent: shouldSendInApp.data || false,
      emailSent: emailSent,
      pushSent: pushSent,
    });
  } catch (error: any) {
    console.error('❌ Error in notification send API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

