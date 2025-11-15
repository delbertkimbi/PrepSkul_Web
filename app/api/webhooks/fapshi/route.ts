import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/// Fapshi Payment Webhook Handler
/// 
/// Receives payment status updates from Fapshi
/// Handles all payment types:
/// - trial_* → Trial session payments
/// - payment_request_* → Payment request payments
/// - session_* → Session payments
/// 
/// Documentation: docs/FAPSHI_API_DOCUMENTATION.md

export async function POST(request: Request) {
  const startTime = Date.now();
  let transactionId: string | null = null;
  let externalId: string | null = null;
  
  try {
    const payload = await request.json();
    
    // Verify webhook (if Fapshi provides signature verification)
    // TODO: Implement webhook signature verification if available
    // const signature = request.headers.get('x-fapshi-signature');
    // if (!verifySignature(payload, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    const { transId, status, externalId: extId, userId, amount, failureReason } = payload;
    
    transactionId = transId;
    externalId = extId;
    
    if (!transId || !status || !extId) {
      console.error('❌ Webhook missing required fields:', { transId, status, externalId: extId });
      return NextResponse.json(
        { error: 'Missing required fields: transId, status, and externalId are required' },
        { status: 400 }
      );
    }

    // Normalize status
    const normalizedStatus = status.toUpperCase();
    const isSuccess = normalizedStatus === 'SUCCESS' || normalizedStatus === 'SUCCESSFUL';
    const isFailed = normalizedStatus === 'FAILED' || normalizedStatus === 'FAILURE';
    const isExpired = normalizedStatus === 'EXPIRED' || normalizedStatus === 'TIMEOUT';
    const isPending = normalizedStatus === 'PENDING' || normalizedStatus === 'PROCESSING';

    console.log(`🔔 Fapshi webhook received: ${transId}, status: ${normalizedStatus}, externalId: ${extId}`);

    const supabase = createServerSupabaseClient();

    // Handle trial session payments (format: "trial_<sessionId>")
    if (extId.startsWith('trial_')) {
      const trialSessionId = extId.replace('trial_', '');

      // Get trial session
      const { data: trialSession, error: fetchError } = await supabase
        .from('trial_sessions')
        .select('*')
        .eq('id', trialSessionId)
        .maybeSingle();

      if (fetchError || !trialSession) {
        console.error('❌ Error fetching trial session:', fetchError);
        return NextResponse.json(
          { error: 'Trial session not found' },
          { status: 404 }
        );
      }

      const now = new Date().toISOString();

      // Update payment status based on normalized status
      if (isSuccess) {
        // Payment successful - update payment status and status
        const { error: updateError } = await supabase
          .from('trial_sessions')
          .update({
            payment_status: 'paid',
            fapshi_trans_id: transId,
            status: 'scheduled',
            payment_confirmed_at: now,
            updated_at: now,
          })
          .eq('id', trialSessionId);

        if (updateError) {
          console.error('❌ Error updating trial session:', updateError);
          throw updateError;
        }

        console.log('✅ Payment completed for trial:', trialSessionId);
      } else if (isFailed || isExpired) {
        // Payment failed or expired
        const { error: updateError } = await supabase
          .from('trial_sessions')
          .update({
            payment_status: 'unpaid',
            fapshi_trans_id: transId,
            updated_at: now,
          })
          .eq('id', trialSessionId);

        if (updateError) {
          console.error('❌ Error updating trial session:', updateError);
          throw updateError;
        }

        console.log(`❌ Payment ${isExpired ? 'expired' : 'failed'} for trial:`, trialSessionId);
      } else if (isPending) {
        // Payment still pending - update transaction ID if not set
        const { error: updateError } = await supabase
          .from('trial_sessions')
          .update({
            payment_status: 'pending',
            fapshi_trans_id: transId,
            updated_at: now,
          })
          .eq('id', trialSessionId);

        if (updateError) {
          console.error('❌ Error updating trial session:', updateError);
          throw updateError;
        }

        console.log('⏳ Payment pending for trial:', trialSessionId);
      }
    }
    // Handle payment request payments (format: "payment_request_<paymentRequestId>")
    else if (extId.startsWith('payment_request_')) {
      const paymentRequestId = extId.replace('payment_request_', '');

      // Get payment request
      const { data: paymentRequest, error: fetchError } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('id', paymentRequestId)
        .maybeSingle();

      if (fetchError || !paymentRequest) {
        console.error('❌ Error fetching payment request:', fetchError);
        return NextResponse.json(
          { error: 'Payment request not found' },
          { status: 404 }
        );
      }

      const now = new Date().toISOString();

      if (isSuccess) {
        // Payment successful
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'paid',
            fapshi_trans_id: transId,
            paid_at: now,
            updated_at: now,
          })
          .eq('id', paymentRequestId);

        if (updateError) {
          console.error('❌ Error updating payment request:', updateError);
          throw updateError;
        }

        console.log('✅ Payment completed for payment request:', paymentRequestId);
      } else if (isFailed || isExpired) {
        // Payment failed
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'failed',
            fapshi_trans_id: transId,
            failed_at: now,
            updated_at: now,
          })
          .eq('id', paymentRequestId);

        if (updateError) {
          console.error('❌ Error updating payment request:', updateError);
          throw updateError;
        }

        console.log(`❌ Payment ${isExpired ? 'expired' : 'failed'} for payment request:`, paymentRequestId);
      } else if (isPending) {
        // Payment pending
        const { error: updateError } = await supabase
          .from('payment_requests')
          .update({
            status: 'pending',
            fapshi_trans_id: transId,
            updated_at: now,
          })
          .eq('id', paymentRequestId);

        if (updateError) {
          console.error('❌ Error updating payment request:', updateError);
          throw updateError;
        }

        console.log('⏳ Payment pending for payment request:', paymentRequestId);
      }
    }
    // Handle normal session payments (format: "session_<sessionId>")
    else if (extId.startsWith('session_')) {
      const sessionId = extId.replace('session_', '');

      // Find payment by Fapshi transaction ID
      const { data: payment, error: paymentError } = await supabase
        .from('session_payments')
        .select(`
          id,
          session_id,
          tutor_earnings,
          payment_status,
          individual_sessions!inner(
            tutor_id
          )
        `)
        .eq('fapshi_trans_id', transId)
        .maybeSingle();

      if (paymentError || !payment) {
        console.error('❌ Error fetching session payment:', paymentError);
        return NextResponse.json(
          { error: 'Session payment not found' },
          { status: 404 }
        );
      }

      const paymentId = payment.id;
      const tutorId = payment.individual_sessions.tutor_id;
      const tutorEarnings = parseFloat(payment.tutor_earnings);

      if (isSuccess) {
        // Payment successful
        const now = new Date().toISOString();

        // Update payment status
        await supabase
          .from('session_payments')
          .update({
            payment_status: 'paid',
            payment_confirmed_at: now,
            updated_at: now,
          })
          .eq('id', paymentId);

        // Update tutor earnings to active
        await supabase
          .from('tutor_earnings')
          .update({
            earnings_status: 'active',
            added_to_active_balance: true,
            active_balance_added_at: now,
            updated_at: now,
          })
          .eq('session_payment_id', paymentId);

        // Update session_payments wallet status
        await supabase
          .from('session_payments')
          .update({
            earnings_added_to_wallet: true,
            wallet_updated_at: now,
            updated_at: now,
          })
          .eq('id', paymentId);

        console.log('✅ Payment confirmed for session:', sessionId);
      } else if (isFailed || isExpired) {
        // Payment failed
        await supabase
          .from('session_payments')
          .update({
            payment_status: 'failed',
            payment_failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        console.log('❌ Payment failed for session:', sessionId);
      } else if (isPending) {
        // Payment still pending - already set during initiation
        console.log('⏳ Payment pending for session:', sessionId);
      }
    } else {
      console.log('⚠️ Unknown external ID format:', extId);
      // Try to find by transaction ID as fallback
      const { data: trialByTransId } = await supabase
        .from('trial_sessions')
        .select('id')
        .eq('fapshi_trans_id', transId)
        .maybeSingle();

      if (trialByTransId) {
        console.log('🔍 Found trial session by transaction ID, processing...');
        // Recursively handle as trial payment
        const recursivePayload = { ...payload, externalId: `trial_${trialByTransId.id}` };
        return POST(new Request(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(recursivePayload),
        }));
      }

      // Try payment_requests
      const { data: paymentRequestByTransId } = await supabase
        .from('payment_requests')
        .select('id')
        .eq('fapshi_trans_id', transId)
        .maybeSingle();

      if (paymentRequestByTransId) {
        console.log('🔍 Found payment request by transaction ID, processing...');
        const recursivePayload = { ...payload, externalId: `payment_request_${paymentRequestByTransId.id}` };
        return POST(new Request(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(recursivePayload),
        }));
      }

      // Try session_payments
      const { data: sessionPaymentByTransId } = await supabase
        .from('session_payments')
        .select('session_id')
        .eq('fapshi_trans_id', transId)
        .maybeSingle();

      if (sessionPaymentByTransId) {
        console.log('🔍 Found session payment by transaction ID, processing...');
        const recursivePayload = { ...payload, externalId: `session_${sessionPaymentByTransId.session_id}` };
        return POST(new Request(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(recursivePayload),
        }));
      }

      return NextResponse.json(
        { message: 'Unknown payment type, transaction not found' },
        { status: 200 }
      );
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Webhook processed successfully in ${processingTime}ms: ${transId}`);
    
    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      transactionId: transId,
      externalId: extId,
      status: normalizedStatus,
      processingTime: `${processingTime}ms`,
    }, { status: 200 });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error processing Fapshi webhook (${processingTime}ms):`, {
      transactionId,
      externalId,
      error: error.message,
      stack: error.stack,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        transactionId,
        externalId,
        processingTime: `${processingTime}ms`,
      },
      { status: 500 }
    );
  }
}
