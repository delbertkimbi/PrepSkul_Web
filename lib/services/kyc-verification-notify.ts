/**
 * Notify learners/parents when admin approves or rejects KYC.
 */

function apiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL_PROD ||
    'https://www.prepskul.com'
  ).replace(/\/$/, '');
}

async function sendNotification(payload: Record<string, unknown>) {
  const url = `${apiBaseUrl()}/api/notifications/send`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[kyc-notify] send failed:', res.status, text.slice(0, 400));
    }
  } catch (err) {
    console.error('[kyc-notify] send error:', err);
  }
}

export async function notifyKycApproved(params: {
  accountId: string;
  verificationId: string;
  bookingRequestId?: string | null;
  paymentRequestId?: string | null;
}) {
  const actionUrl = params.paymentRequestId
    ? `/payments/${params.paymentRequestId}`
    : '/bookings/requests';

  await sendNotification({
    userId: params.accountId,
    type: 'identity_verification_approved',
    title: 'Identity verified',
    message:
      'Your identity verification was approved. You can now complete payment for your onsite session.',
    priority: 'high',
    actionUrl,
    actionText: params.paymentRequestId ? 'Pay now' : 'My requests',
    icon: '✅',
    metadata: {
      verification_id: params.verificationId,
      ...(params.bookingRequestId ? { booking_request_id: params.bookingRequestId } : {}),
      ...(params.paymentRequestId ? { payment_request_id: params.paymentRequestId } : {}),
    },
    sendEmail: true,
    sendPush: true,
  });
}

export async function notifyKycRejected(params: {
  accountId: string;
  verificationId: string;
  reason: string;
  bookingRequestId?: string | null;
  paymentRequestId?: string | null;
}) {
  const actionUrl = params.paymentRequestId
    ? `/payments/${params.paymentRequestId}`
    : '/bookings/requests';

  await sendNotification({
    userId: params.accountId,
    type: 'identity_verification_rejected',
    title: 'Identity verification needs resubmission',
    message: `Your verification was not approved. Reason: ${params.reason}. Open Pay now to submit again.`,
    priority: 'high',
    actionUrl,
    actionText: 'Resubmit verification',
    icon: '⚠️',
    metadata: {
      verification_id: params.verificationId,
      rejection_reason: params.reason,
      ...(params.bookingRequestId ? { booking_request_id: params.bookingRequestId } : {}),
      ...(params.paymentRequestId ? { payment_request_id: params.paymentRequestId } : {}),
    },
    sendEmail: true,
    sendPush: true,
  });
}

/** Resolve latest pending payment_request for a booking (if any). */
export async function resolvePaymentRequestIdForBooking(
  admin: ReturnType<typeof import('@/lib/supabase-admin').getSupabaseAdmin>,
  bookingRequestId: string | null | undefined
): Promise<string | null> {
  if (!bookingRequestId) return null;
  const { data } = await admin
    .from('payment_requests')
    .select('id')
    .eq('booking_request_id', bookingRequestId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.id as string) || null;
}
