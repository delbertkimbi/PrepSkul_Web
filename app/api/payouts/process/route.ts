import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Process Tutor Payout via Fapshi Disbursement
 * 
 * This endpoint processes a payout request by:
 * 1. Validating the payout request
 * 2. Calling Fapshi disbursement API
 * 3. Updating payout status in database
 * 4. Notifying tutor of payout status
 * 
 * POST /api/payouts/process
 * 
 * Body:
 * - payoutRequestId: UUID of the payout request
 * - adminId: UUID of the admin processing the payout
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutRequestId, adminId } = body;

    if (!payoutRequestId || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields: payoutRequestId, adminId' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get payout request
    const { data: payoutRequest, error: fetchError } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('id', payoutRequestId)
      .single();

    if (fetchError || !payoutRequest) {
      console.error('❌ Error fetching payout request:', fetchError);
      return NextResponse.json(
        { error: 'Payout request not found' },
        { status: 404 }
      );
    }

    if (payoutRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Payout request is not pending. Current status: ${payoutRequest.status}` },
        { status: 400 }
      );
    }

    // Reserve active tutor_earnings (FIFO) before Fapshi — balance drops only on admin approval.
    const { data: reserveData, error: reserveError } = await supabase.rpc(
      'reserve_tutor_payout_earnings',
      { p_payout_request_id: payoutRequestId }
    );

    if (reserveError) {
      console.error('❌ reserve_tutor_payout_earnings failed:', reserveError);
      return NextResponse.json(
        {
          error: reserveError.message || 'Could not reserve earnings for payout',
          code: reserveError.code,
        },
        { status: 400 }
      );
    }

    console.log(`✅ Earnings reserved for payout ${payoutRequestId}:`, reserveData);

    const amount = payoutRequest.amount as number;
    const phoneNumber = payoutRequest.phone_number as string;
    const tutorId = payoutRequest.tutor_id as string;

    // Get tutor profile for name/email
    const { data: tutorProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', tutorId)
      .single();

    const tutorName = tutorProfile?.full_name || 'Tutor';
    const tutorEmail = tutorProfile?.email;

    // Prepare Fapshi disbursement request
    const fapshiBaseUrl = process.env.FAPSHI_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://live.fapshi.com' 
        : 'https://sandbox.fapshi.com');
    
    const fapshiApiUser = process.env.FAPSHI_DISBURSE_API_USER_LIVE || 
      process.env.FAPSHI_SANDBOX_API_USER;
    const fapshiApiKey = process.env.FAPSHI_DISBURSE_API_KEY_LIVE || 
      process.env.FAPSHI_SANDBOX_API_KEY;

    if (!fapshiApiUser || !fapshiApiKey) {
      console.error('❌ Fapshi disbursement credentials not configured');
      return NextResponse.json(
        { error: 'Payment service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Normalize phone number (remove +237, spaces, etc.)
    const normalizedPhone = phoneNumber.replace(/[^\d]/g, '').replace(/^237/, '');

    // Call Fapshi disbursement API
    const fapshiPayload = {
      amount: Math.round(amount), // Fapshi expects integer
      phone: normalizedPhone,
      name: tutorName,
      email: tutorEmail,
      userId: tutorId,
      externalId: `payout_${payoutRequestId}`,
      message: `PrepSkul tutor payout - ${tutorName}`,
    };

    console.log(`📤 Processing Fapshi disbursement: ${JSON.stringify({
      ...fapshiPayload,
      phone: `${normalizedPhone.substring(0, 3)}******`, // Mask phone for logs
    })}`);

    const fapshiResponse = await fetch(`${fapshiBaseUrl}/payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiuser': fapshiApiUser,
        'apikey': fapshiApiKey,
      },
      body: JSON.stringify(fapshiPayload),
    });

    const fapshiData = await fapshiResponse.json();

    if (!fapshiResponse.ok) {
      console.error('❌ Fapshi disbursement failed:', fapshiData);
      
      // Update payout request status to failed
      await supabase
        .from('payout_requests')
        .update({
          status: 'failed',
          processed_by: adminId,
          processed_at: new Date().toISOString(),
          admin_notes: `Fapshi API error: ${fapshiData.message || 'Unknown error'}`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payoutRequestId);

      return NextResponse.json(
        { 
          error: fapshiData.message || 'Payout processing failed',
          details: fapshiData 
        },
        { status: fapshiResponse.status }
      );
    }

    // Success - update payout request
    const transId = fapshiData.transId;
    const dateInitiated = fapshiData.dateInitiated;

    await supabase
      .from('payout_requests')
      .update({
        status: 'processing',
        processed_by: adminId,
        processed_at: new Date().toISOString(),
        fapshi_trans_id: transId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payoutRequestId);

    console.log(`✅ Payout processing initiated: ${payoutRequestId}, Fapshi transId: ${transId}`);

    // Notify tutor (async - don't wait) with email and push
    void (async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await fetch(`${apiUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: tutorId,
            type: 'payout_processing',
            title: 'Payout Processing',
            message: `Your payout request of ${amount.toFixed(0)} XAF is being processed. You will receive a notification once it's completed.`,
            priority: 'normal',
            actionUrl: '/earnings',
            actionText: 'View Earnings',
            icon: undefined,
            metadata: {
              payout_request_id: payoutRequestId,
              amount: amount,
              status: 'processing',
            },
            sendEmail: true,
            sendPush: false, // Normal priority - no push needed
          }),
        }).catch(err => console.error('⚠️ Failed to send payout notification:', err));
        console.log(`✅ Payout notification sent to tutor: ${tutorId}`);
      } catch (err) {
        console.error('⚠️ Failed to send payout notification:', err);
      }
    })();

    return NextResponse.json({
      success: true,
      message: 'Payout processing initiated',
      data: {
        payoutRequestId,
        transId,
        dateInitiated,
        status: 'processing',
      },
    });

  } catch (error: any) {
    console.error('❌ Error processing payout:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
