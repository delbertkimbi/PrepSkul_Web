import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Webhook Notification Service
 * 
 * Creates in-app notifications for payment and session events
 */

/**
 * Create payment notification
 */
export async function createPaymentNotification({
  supabase,
  type,
  trialSessionId,
  paymentRequestId,
  bookingRequestId,
  studentId,
  tutorId,
  amount,
  failureReason,
}: {
  supabase: any;
  type: 'trial_payment_success' | 'trial_payment_failed' | 'payment_request_paid' | 'payment_request_failed';
  trialSessionId?: string;
  paymentRequestId?: string;
  bookingRequestId?: string;
  studentId?: string;
  tutorId?: string;
  amount?: number;
  failureReason?: string;
}) {
  try {
    if (type === 'trial_payment_success' && trialSessionId) {
      // Get trial session details
      const { data: trial } = await supabase
        .from('trial_sessions')
        .select('learner_id, tutor_id, subject, meet_link')
        .eq('id', trialSessionId)
        .single();

      if (trial) {
        // Notify learner
        await supabase.from('notifications').insert({
          user_id: trial.learner_id,
          type: 'trial_payment_completed',
          notification_type: 'trial_payment_completed',
          title: 'Payment Successful! 🎉',
          message: `Your payment for the trial session in ${trial.subject} has been confirmed. ${trial.meet_link ? 'Your Meet link is ready!' : ''}`,
          data: {
            session_id: trialSessionId,
            session_type: 'trial',
            subject: trial.subject,
            meet_link: trial.meet_link,
          },
          is_read: false,
        });

        // Notify tutor with Meet link
        await supabase.from('notifications').insert({
          user_id: trial.tutor_id,
          type: 'trial_payment_received',
          notification_type: 'trial_payment_received',
          title: 'Trial Payment Received - Session Ready',
          message: `Payment for trial session in ${trial.subject} has been confirmed. ${trial.meet_link ? 'Meet link is ready!' : ''}`,
          data: {
            session_id: trialSessionId,
            session_type: 'trial',
            subject: trial.subject,
            meet_link: trial.meet_link, // Include Meet link for tutor
          },
          is_read: false,
        });
      }
    } else if (type === 'trial_payment_failed' && trialSessionId) {
      // Get trial session details
      const { data: trial } = await supabase
        .from('trial_sessions')
        .select('learner_id, subject')
        .eq('id', trialSessionId)
        .single();

      if (trial) {
        await supabase.from('notifications').insert({
          user_id: trial.learner_id,
          type: 'trial_payment_failed',
          notification_type: 'trial_payment_failed',
          title: 'Payment Failed',
          message: `Your payment for the trial session in ${trial.subject} failed. ${failureReason ? `Reason: ${failureReason}` : 'Please try again.'}`,
          data: {
            session_id: trialSessionId,
            session_type: 'trial',
            subject: trial.subject,
            failure_reason: failureReason,
          },
          is_read: false,
        });
      }
    } else if (type === 'payment_request_paid' && paymentRequestId && studentId && tutorId && amount) {
      // Notify student
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'payment_request_paid',
        notification_type: 'payment_request_paid',
        title: 'Payment Confirmed! ✅',
        message: `Your payment of ${amount.toLocaleString('en-US')} XAF has been confirmed.`,
        data: {
          payment_request_id: paymentRequestId,
          booking_request_id: bookingRequestId,
          amount,
        },
        is_read: false,
      });

      // Notify tutor
      await supabase.from('notifications').insert({
        user_id: tutorId,
        type: 'payment_request_paid',
        notification_type: 'payment_request_paid',
        title: 'Payment Received',
        message: `Payment of ${amount.toLocaleString('en-US')} XAF has been received.`,
        data: {
          payment_request_id: paymentRequestId,
          booking_request_id: bookingRequestId,
          amount,
        },
        is_read: false,
      });
    } else if (type === 'payment_request_failed' && paymentRequestId && studentId) {
      await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'payment_request_failed',
        notification_type: 'payment_request_failed',
        title: 'Payment Failed',
        message: `Your payment failed. ${failureReason ? `Reason: ${failureReason}` : 'Please try again.'}`,
        data: {
          payment_request_id: paymentRequestId,
          failure_reason: failureReason,
        },
        is_read: false,
      });
    }

    console.log(`✅ Payment notification created: ${type}`);
  } catch (error: any) {
    console.error('❌ Error creating payment notification:', error);
    // Don't throw - notification failure shouldn't break webhook
  }
}

