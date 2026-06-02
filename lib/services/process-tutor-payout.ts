import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type ProcessTutorPayoutResult =
  | {
      ok: true;
      payoutRequestId: string;
      transId: string;
      dateInitiated: string;
      status: string;
    }
  | { ok: false; status: number; error: string; details?: unknown };

async function assertAdmin(adminId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', adminId)
    .maybeSingle();
  return data?.is_admin === true;
}

/**
 * Reserve tutor earnings and initiate Fapshi disbursement (service role — bypasses RLS).
 */
export async function processTutorPayout(
  payoutRequestId: string,
  adminId: string
): Promise<ProcessTutorPayoutResult> {
  if (!payoutRequestId || !adminId) {
    return { ok: false, status: 400, error: 'Missing payoutRequestId or adminId' };
  }

  const adminOk = await assertAdmin(adminId);
  if (!adminOk) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  const supabase = getSupabaseAdmin();

  const { data: payoutRequest, error: fetchError } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('id', payoutRequestId)
    .single();

  if (fetchError || !payoutRequest) {
    console.error('❌ Error fetching payout request:', fetchError);
    return { ok: false, status: 404, error: 'Payout request not found' };
  }

  if (payoutRequest.status !== 'pending') {
    return {
      ok: false,
      status: 400,
      error: `Payout request is not pending. Current status: ${payoutRequest.status}`,
    };
  }

  const { data: reserveData, error: reserveError } = await supabase.rpc(
    'reserve_tutor_payout_earnings',
    { p_payout_request_id: payoutRequestId }
  );

  if (reserveError) {
    console.error('❌ reserve_tutor_payout_earnings failed:', reserveError);
    return {
      ok: false,
      status: 400,
      error: reserveError.message || 'Could not reserve earnings for payout',
      details: reserveError,
    };
  }

  console.log(`✅ Earnings reserved for payout ${payoutRequestId}:`, reserveData);

  const amount = payoutRequest.amount as number;
  const phoneNumber = payoutRequest.phone_number as string;
  const tutorId = payoutRequest.tutor_id as string;

  const { data: tutorProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', tutorId)
    .single();

  const tutorName = tutorProfile?.full_name || 'Tutor';
  const tutorEmail = tutorProfile?.email;

  const fapshiBaseUrl =
    process.env.FAPSHI_BASE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://live.fapshi.com'
      : 'https://sandbox.fapshi.com');

  const fapshiApiUser =
    process.env.FAPSHI_DISBURSE_API_USER_LIVE || process.env.FAPSHI_SANDBOX_API_USER;
  const fapshiApiKey =
    process.env.FAPSHI_DISBURSE_API_KEY_LIVE || process.env.FAPSHI_SANDBOX_API_KEY;

  if (!fapshiApiUser || !fapshiApiKey) {
    console.error('❌ Fapshi disbursement credentials not configured');
    return {
      ok: false,
      status: 500,
      error: 'Payment service not configured. Please contact support.',
    };
  }

  const normalizedPhone = phoneNumber.replace(/[^\d]/g, '').replace(/^237/, '');

  const fapshiPayload = {
    amount: Math.round(amount),
    phone: normalizedPhone,
    name: tutorName,
    email: tutorEmail,
    userId: tutorId,
    externalId: `payout_${payoutRequestId}`,
    message: `PrepSkul tutor payout - ${tutorName}`,
  };

  console.log(
    `📤 Processing Fapshi disbursement: ${JSON.stringify({
      ...fapshiPayload,
      phone: `${normalizedPhone.substring(0, 3)}******`,
    })}`
  );

  const fapshiResponse = await fetch(`${fapshiBaseUrl}/payout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apiuser: fapshiApiUser,
      apikey: fapshiApiKey,
    },
    body: JSON.stringify(fapshiPayload),
  });

  const fapshiData = await fapshiResponse.json();

  if (!fapshiResponse.ok) {
    console.error('❌ Fapshi disbursement failed:', fapshiData);

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

    return {
      ok: false,
      status: fapshiResponse.status,
      error: fapshiData.message || 'Payout processing failed',
      details: fapshiData,
    };
  }

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

  void (async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com';
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
          metadata: {
            payout_request_id: payoutRequestId,
            amount,
            status: 'processing',
          },
          sendEmail: true,
          sendPush: false,
        }),
      }).catch((err) => console.error('⚠️ Failed to send payout notification:', err));
    } catch (err) {
      console.error('⚠️ Failed to send payout notification:', err);
    }
  })();

  return {
    ok: true,
    payoutRequestId,
    transId,
    dateInitiated,
    status: 'processing',
  };
}
