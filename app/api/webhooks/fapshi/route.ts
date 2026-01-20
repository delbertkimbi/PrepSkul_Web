import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateTrialMeetLink } from '@/lib/services/meet-service';
import { createPaymentNotification } from '@/lib/services/webhook-notifications';

/**
 * Fapshi Payment Webhook Handler
 * 
 * Handles payment status updates from Fapshi
 * Routes to appropriate handler based on externalId pattern:
 * - trial_* → Trial session payment
 * - payment_request_* → Payment request payment
 * - session_* → Session payment
 * 
 * Webhook URL: https://www.prepskul.com/api/webhooks/fapshi
 * Configure this URL in Fapshi dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Parse webhook payload
    const body = await request.json();
    
    // Extract webhook data
    const {
      transId,           // Fapshi transaction ID
      status,            // Payment status (SUCCESS, SUCCESSFUL, FAILED, EXPIRED, etc.)
      externalId,         // External ID used when initiating payment (e.g., "trial_123")
      userId,             // User ID from Fapshi (optional)
      amount,             // Payment amount (optional, for verification)
      failureReason,      // Reason for failure (optional)
      timestamp,          // Webhook timestamp
    } = body;

    // Validate required fields
    if (!transId || !status || !externalId) {
      console.error('❌ Invalid webhook payload:', body);
      return NextResponse.json(
        { error: 'Missing required fields: transId, status, externalId' },
        { status: 400 }
      );
    }

    console.log(`🔔 Fapshi webhook received: ${transId}, status: ${status}, externalId: ${externalId}`);

    // Normalize status
    const normalizedStatus = normalizeStatus(status);

    // Get Supabase client
    const supabase = await createServerSupabaseClient();

    // Route to appropriate handler based on externalId pattern
    if (externalId.startsWith('trial_')) {
      await handleTrialSessionPayment({
        supabase,
        transactionId: transId,
        status: normalizedStatus,
        trialSessionId: externalId.replace('trial_', ''),
        failureReason: failureReason || undefined,
      });
    } else if (externalId.startsWith('payment_request_')) {
      await handlePaymentRequestPayment({
        supabase,
        transactionId: transId,
        status: normalizedStatus,
        paymentRequestId: externalId.replace('payment_request_', ''),
        failureReason: failureReason || undefined,
      });
    } else if (externalId.startsWith('session_')) {
      await handleSessionPayment({
        supabase,
        transactionId: transId,
        status: normalizedStatus,
        sessionId: externalId.replace('session_', ''),
        failureReason: failureReason || undefined,
      });
    } else {
      // Try to find by transaction ID in any payment table
      console.log(`⚠️ Unknown externalId pattern: ${externalId}, trying to find by transaction ID`);
      await handleByTransactionId({
        supabase,
        transactionId: transId,
        status: normalizedStatus,
        failureReason: failureReason || undefined,
      });
    }

    console.log(`✅ Webhook processed successfully: ${transId}`);
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });

  } catch (error: any) {
    console.error('❌ Error processing Fapshi webhook:', error);
    
    // Return error but don't fail the webhook (Fapshi will retry)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Normalize payment status from Fapshi
 * 
 * Status values from Fapshi:
 * - CREATED: Payment not yet attempted (initial state for direct pay)
 * - PENDING: User is in process of payment
 * - SUCCESSFUL: Payment completed successfully
 * - FAILED: Payment failed
 * - EXPIRED: Payment link expired (only for initiate-pay, not direct-pay)
 */
function normalizeStatus(status: string): 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'PENDING' {
  const upperStatus = status.toUpperCase();
  if (upperStatus === 'SUCCESS' || upperStatus === 'SUCCESSFUL') {
    return 'SUCCESS';
  } else if (upperStatus === 'FAILED' || upperStatus === 'FAILURE') {
    return 'FAILED';
  } else if (upperStatus === 'EXPIRED' || upperStatus === 'TIMEOUT') {
    return 'EXPIRED';
  } else if (upperStatus === 'PENDING' || upperStatus === 'PROCESSING' || upperStatus === 'CREATED') {
    // CREATED is initial state for direct pay - treat as pending
    return 'PENDING';
  }
  // Default to PENDING for unknown statuses (don't mark as failed)
  console.warn(`⚠️ Unknown payment status: ${status}, treating as PENDING`);
  return 'PENDING';
}

/**
 * Handle trial session payment webhook
 */
async function handleTrialSessionPayment({
  supabase,
  transactionId,
  status,
  trialSessionId,
  failureReason,
}: {
  supabase: any;
  transactionId: string;
  status: string;
  trialSessionId: string;
  failureReason?: string;
}) {
  try {
    console.log(`📝 Processing trial session payment: ${trialSessionId}`);

    if (status === 'SUCCESS') {
      // Payment successful - update trial session
      const { error: updateError } = await supabase
        .from('trial_sessions')
        .update({
          payment_status: 'paid',
          status: 'scheduled', // Update status to scheduled
          fapshi_trans_id: transactionId,
          payment_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', trialSessionId);

      if (updateError) {
        throw updateError;
      }

      // Generate Meet link for online trials
      try {
        const { data: trial, error: fetchError } = await supabase
          .from('trial_sessions')
          .select('location, tutor_id, learner_id, scheduled_date, scheduled_time, duration_minutes, subject')
          .eq('id', trialSessionId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!trial) throw new Error(`Trial session not found: ${trialSessionId}`);

        if (trial && trial.location === 'online') {
          // Generate Meet link
          const meetLink = await generateTrialMeetLink({
            trialSessionId,
            tutorId: trial.tutor_id,
            studentId: trial.learner_id,
            scheduledDate: new Date(trial.scheduled_date),
            scheduledTime: trial.scheduled_time,
            durationMinutes: trial.duration_minutes || 60,
            subject: trial.subject || 'Trial Session',
          });

          // Update trial with Meet link
          await supabase
            .from('trial_sessions')
            .update({ meet_link: meetLink })
            .eq('id', trialSessionId);
        }
      } catch (meetError) {
        console.error('⚠️ Error generating Meet link:', meetError);
        // Don't fail the webhook if Meet link generation fails
      }

      // Send success notifications
      await createPaymentNotification({
        supabase,
        type: 'trial_payment_success',
        trialSessionId,
      });

      console.log(`✅ Trial session payment confirmed: ${trialSessionId}`);
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      // Payment failed
      await supabase
        .from('trial_sessions')
        .update({
          payment_status: 'unpaid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', trialSessionId);

      // Send failure notification
      await createPaymentNotification({
        supabase,
        type: 'trial_payment_failed',
        trialSessionId,
        failureReason: failureReason || 'Payment failed',
      });

      console.log(`⚠️ Trial session payment failed: ${trialSessionId}`);
    }
  } catch (error) {
    console.error('❌ Error handling trial session payment webhook:', error);
    throw error;
  }
}

/**
 * Handle payment request payment webhook
 */
async function handlePaymentRequestPayment({
  supabase,
  transactionId,
  status,
  paymentRequestId,
  failureReason,
}: {
  supabase: any;
  transactionId: string;
  status: string;
  paymentRequestId: string;
  failureReason?: string;
}) {
  try {
    console.log(`💰 Processing payment request payment: ${paymentRequestId}, status: ${status}`);

    // Get current payment request status (idempotency check)
    const { data: currentPaymentRequest } = await supabase
      .from('payment_requests')
      .select('status, fapshi_trans_id')
      .eq('id', paymentRequestId)
      .maybeSingle();

    if (!currentPaymentRequest) {
      console.error(`❌ Payment request not found: ${paymentRequestId}`);
      return;
    }

    const currentStatus = currentPaymentRequest.status;

    // Idempotency: If already paid and webhook says SUCCESS, skip (webhook may be called multiple times)
    if (currentStatus === 'paid' && status === 'SUCCESS') {
      console.log(`ℹ️ Payment request already paid: ${paymentRequestId}. Skipping duplicate webhook.`);
      return;
    }

    // Don't process FAILED webhooks if payment is already paid (idempotency)
    if (currentStatus === 'paid' && (status === 'FAILED' || status === 'EXPIRED')) {
      console.log(`ℹ️ Payment request already paid, ignoring FAILED/EXPIRED webhook: ${paymentRequestId}`);
      return;
    }

    if (status === 'SUCCESS') {
      // Payment successful
      const { error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'paid',
          fapshi_trans_id: transactionId,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRequestId);

      if (updateError) throw updateError;

      // Get payment request details for notifications
      const { data: paymentRequest, error: fetchError } = await supabase
        .from('payment_requests')
        .select('booking_request_id, student_id, tutor_id, amount')
        .eq('id', paymentRequestId)
        .maybeSingle();

      if (!fetchError && paymentRequest) {
        // Send success notifications
        await createPaymentNotification({
          supabase,
          type: 'payment_request_paid',
          paymentRequestId,
          bookingRequestId: paymentRequest.booking_request_id,
          studentId: paymentRequest.student_id,
          tutorId: paymentRequest.tutor_id,
          amount: paymentRequest.amount,
        });
      }

      console.log(`✅ Payment request payment confirmed: ${paymentRequestId}`);
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      // Only update to failed if not already paid (idempotency)
      if (currentStatus !== 'paid') {
        // Payment failed
        await supabase
          .from('payment_requests')
          .update({
            status: 'failed',
            fapshi_trans_id: transactionId,
            failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRequestId);

        // Send failure notification
        const { data: paymentRequest } = await supabase
          .from('payment_requests')
          .select('student_id')
          .eq('id', paymentRequestId)
          .maybeSingle();

        if (paymentRequest) {
          await createPaymentNotification({
            supabase,
            type: 'payment_request_failed',
            paymentRequestId,
            studentId: paymentRequest.student_id,
            failureReason: failureReason || 'Payment failed',
          });
        }

        console.log(`⚠️ Payment request payment failed: ${paymentRequestId}`);
      } else {
        console.log(`ℹ️ Payment request already paid, ignoring FAILED webhook: ${paymentRequestId}`);
      }
    } else if (status === 'PENDING') {
      // Payment is still pending - don't update status, just log and update transaction ID if needed
      console.log(`⏳ Payment request still pending: ${paymentRequestId}`);
      // Update fapshi_trans_id if not set yet
      if (!currentPaymentRequest.fapshi_trans_id) {
        await supabase
          .from('payment_requests')
          .update({
            fapshi_trans_id: transactionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRequestId);
      }
    } else {
      console.log(`⚠️ Unknown payment status received: ${status} for payment request: ${paymentRequestId}`);
    }
  } catch (error) {
    console.error('❌ Error handling payment request payment webhook:', error);
    throw error;
  }
}

/**
 * Handle session payment webhook
 */
async function handleSessionPayment({
  supabase,
  transactionId,
  status,
  sessionId,
  failureReason,
}: {
  supabase: any;
  transactionId: string;
  status: string;
  sessionId: string; // This is the individual_session_id from externalId
  failureReason?: string;
}) {
  try {
    console.log(`📚 Processing session payment for session: ${sessionId}`);

    // First, try to find payment by transaction ID (most reliable)
    let { data: payment, error: findError } = await supabase
      .from('session_payments')
      .select(`
        id,
        session_id,
        tutor_earnings,
        payment_status,
        individual_sessions!inner(
          tutor_id,
          learner_id,
          parent_id
        )
      `)
      .eq('fapshi_trans_id', transactionId)
      .maybeSingle();

    // If not found by transaction ID, find by session_id
    if (!payment && !findError) {
      const result = await supabase
        .from('session_payments')
        .select(`
          id,
          session_id,
          tutor_earnings,
          payment_status,
          individual_sessions!inner(
            tutor_id,
            learner_id,
            parent_id
          )
        `)
        .eq('session_id', sessionId)
        .maybeSingle();
      
      payment = result.data;
      findError = result.error;
    }

    if (findError) throw findError;
    if (!payment) {
      console.log(`⚠️ Session payment not found for session: \${sessionId} or transaction: \${transactionId}`);
      return;
    }

    const paymentId = payment.id;
    const tutorId = payment.individual_sessions.tutor_id;
    const tutorEarnings = payment.tutor_earnings as number;
    const learnerId = payment.individual_sessions.learner_id as string | null;
    const parentId = payment.individual_sessions.parent_id as string | null;

    if (status === 'SUCCESS') {
      // Update session payment status
      const { error: updateError } = await supabase
        .from('session_payments')
        .update({
          payment_status: 'paid',
          fapshi_trans_id: transactionId,
          paid_at: new Date().toISOString(),
          payment_confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Update tutor earnings status to 'active'
      const { error: earningsError } = await supabase
        .from('tutor_earnings')
        .update({
          earnings_status: 'active',
          added_to_active_balance: true,
          active_balance_added_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_payment_id', paymentId);

      if (earningsError) {
        console.error('⚠️ Error updating tutor earnings:', earningsError);
        // Don't throw - continue with other updates
      }

      // Update session_payments to mark earnings added to wallet
      await supabase
        .from('session_payments')
        .update({
          earnings_added_to_wallet: true,
          wallet_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      // Send notifications to tutor and student/parent
      try {
        // Notify tutor
        await supabase.from('notifications').insert({
          user_id: tutorId,
          type: 'payment_confirmed',
          notification_type: 'payment_confirmed',
          title: 'Payment Received',
          message: `Payment of \${tutorEarnings.toFixed(0)} XAF has been confirmed. Earnings are now available.`,
          priority: 'normal',
          action_url: '/earnings',
          action_text: 'View Earnings',
          icon: 'payment',
          metadata: {
            session_id: sessionId,
            payment_id: paymentId,
            earnings: tutorEarnings,
          },
          is_read: false,
        });

        // Notify student/parent
        const studentUserId = learnerId || parentId;
        if (studentUserId) {
          await supabase.from('notifications').insert({
            user_id: studentUserId,
            type: 'payment_confirmed',
            notification_type: 'payment_confirmed',
            title: 'Payment Confirmed',
            message: 'Your session payment has been confirmed.',
            priority: 'normal',
            action_url: `/sessions/\${sessionId}`,
            action_text: 'View Session',
            icon: 'check_circle',
            metadata: {
              session_id: sessionId,
              payment_id: paymentId,
              user_type: parentId ? 'parent' : 'student',
            },
            is_read: false,
          });
        }
      } catch (notifError) {
        console.error('⚠️ Error sending notifications:', notifError);
        // Don't fail the webhook if notifications fail
      }

      console.log(`✅ Session payment confirmed: \${paymentId} for session: \${sessionId}`);
    } else if (status === 'FAILED' || status === 'EXPIRED') {
      // Payment failed
      const { error: failError } = await supabase
        .from('session_payments')
        .update({
          payment_status: 'failed',
          payment_failed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (failError) throw failError;

      // Send failure notification to student/parent
      try {
        const studentUserId = learnerId || parentId;
        if (studentUserId) {
          await supabase.from('notifications').insert({
            user_id: studentUserId,
            type: 'payment_failed',
            notification_type: 'payment_failed',
            title: '⚠️ Payment Failed',
            message: `Your session payment failed.${failureReason ? ` Reason: ${failureReason}` : ''} Please try again.`,
            priority: 'high',
            action_url: `/sessions/\${sessionId}/payment`,
            action_text: 'Retry Payment',
            icon: '⚠️',
            metadata: {
              session_id: sessionId,
              payment_id: paymentId,
              failure_reason: failureReason,
              user_type: parentId ? 'parent' : 'student',
            },
            is_read: false,
          });
        }
      } catch (notifError) {
        console.error('⚠️ Error sending failure notification:', notifError);
      }

      console.log(`⚠️ Session payment failed: \${paymentId} for session: \${sessionId}`);
    }
  } catch (error) {
    console.error('❌ Error handling session payment webhook:', error);
    throw error;
  }
}

/**
 * Handle webhook by transaction ID (fallback)
 * Tries to find the payment in any table by transaction ID
 */
async function handleByTransactionId({
  supabase,
  transactionId,
  status,
  failureReason,
}: {
  supabase: any;
  transactionId: string;
  status: string;
  failureReason?: string;
}) {
  try {
    // Try trial_sessions
    const { data: trial } = await supabase
      .from('trial_sessions')
      .select('id')
      .eq('fapshi_trans_id', transactionId)
      .maybeSingle();

    if (trial) {
      await handleTrialSessionPayment({
        supabase,
        transactionId,
        status,
        trialSessionId: trial.id,
        failureReason,
      });
      return;
    }

    // Try payment_requests
    const { data: paymentRequest } = await supabase
      .from('payment_requests')
      .select('id')
      .eq('fapshi_trans_id', transactionId)
      .maybeSingle();

    if (paymentRequest) {
      await handlePaymentRequestPayment({
        supabase,
        transactionId,
        status,
        paymentRequestId: paymentRequest.id,
        failureReason,
      });
      return;
    }

    // Try session_payments
    const { data: sessionPayment } = await supabase
      .from('session_payments')
      .select('id')
      .eq('fapshi_trans_id', transactionId)
      .maybeSingle();

    if (sessionPayment) {
      await handleSessionPayment({
        supabase,
        transactionId,
        status,
        sessionId: sessionPayment.id,
        failureReason,
      });
      return;
    }

    console.log(`⚠️ Payment not found for transaction: ${transactionId}`);
  } catch (error) {
    console.error('❌ Error handling by transaction ID:', error);
  }
}



