import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/// Fapshi Payment Webhook Handler
/// 
/// Receives payment status updates from Fapshi
/// Documentation: docs/FAPSHI_API_DOCUMENTATION.md

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Verify webhook (if Fapshi provides signature verification)
    // TODO: Implement webhook signature verification if available
    
    const { transId, status, externalId } = payload;
    
    if (!transId || !status || !externalId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Handle trial session payments (format: "trial_<sessionId>")
    if (externalId.startsWith('trial_')) {
      const trialSessionId = externalId.replace('trial_', '');

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

      // Update payment status
      if (status === 'SUCCESSFUL') {
        // Payment successful - update payment status
        // Note: Meet link generation will be handled by the Flutter app
        await supabase
          .from('trial_sessions')
          .update({
            payment_status: 'paid',
            fapshi_trans_id: transId,
            status: 'scheduled',
          })
          .eq('id', trialSessionId);

        console.log('✅ Payment completed for trial:', trialSessionId);
      } else if (status === 'FAILED') {
        // Payment failed - update status
        await supabase
          .from('trial_sessions')
          .update({
            payment_status: 'failed',
            fapshi_trans_id: transId,
          })
          .eq('id', trialSessionId);

        console.log('❌ Payment failed for trial:', trialSessionId);
      } else if (status === 'PENDING') {
        // Payment still pending - update transaction ID if not set
        await supabase
          .from('trial_sessions')
          .update({
            payment_status: 'pending',
            fapshi_trans_id: transId,
          })
          .eq('id', trialSessionId);

        console.log('⏳ Payment pending for trial:', trialSessionId);
      }
    }
    // Handle normal session payments (format: "session_<sessionId>")
    else if (externalId.startsWith('session_')) {
      const sessionId = externalId.replace('session_', '');

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

      if (status === 'SUCCESSFUL' || status === 'SUCCESS') {
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
      } else if (status === 'FAILED' || status === 'FAIL') {
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
      } else if (status === 'PENDING') {
        // Payment still pending - already set during initiation
        console.log('⏳ Payment pending for session:', sessionId);
      }
    } else {
      console.log('⚠️ Unknown external ID format:', externalId);
      return NextResponse.json(
        { message: 'Unknown payment type' },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Error processing Fapshi webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
