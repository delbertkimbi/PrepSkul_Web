/**
 * Notify parent/learner when admin approves or rejects identity verification (KYC).
 */
async function sendIdentityVerificationNotification(payload: {
  userId: string;
  type: string;
  title: string;
  message: string;
  sendEmail: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
}) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${apiUrl}/api/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      priority: 'high',
      sendEmail: payload.sendEmail,
      sendPush: true,
      actionUrl: payload.actionUrl,
      actionText: payload.actionText,
      metadata: payload.metadata ?? {},
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(
      `Failed to send ${payload.type} notification for ${payload.userId}:`,
      text
    );
    return { success: false, error: text };
  }

  return { success: true };
}

export async function notifyIdentityVerificationApproved(
  accountId: string,
  options?: {
    verificationId?: string;
    paymentRequestId?: string;
    bookingRequestId?: string;
  }
) {
  const paymentRequestId = options?.paymentRequestId;
  const actionUrl = paymentRequestId
    ? `/payments/${paymentRequestId}`
    : '/student/requests';

  return sendIdentityVerificationNotification({
    userId: accountId,
    type: 'identity_verification_approved',
    title: 'Identity verified',
    message:
      'Your identity verification was approved. You can now pay for onsite and hybrid sessions on PrepSkul.',
    sendEmail: true,
    actionUrl,
    actionText: paymentRequestId ? 'Pay now' : 'View requests',
    metadata: {
      source: 'admin_kyc_approve',
      ...(options?.verificationId
        ? { verification_id: options.verificationId }
        : {}),
      ...(paymentRequestId ? { payment_request_id: paymentRequestId } : {}),
      ...(options?.bookingRequestId
        ? { booking_request_id: options.bookingRequestId }
        : {}),
    },
  });
}

export async function notifyIdentityVerificationRejected(
  accountId: string,
  rejectionReason: string,
  options?: { verificationId?: string }
) {
  const reason =
    rejectionReason.trim() ||
    'Please resubmit clearer photos of your ID and tutoring location.';
  return sendIdentityVerificationNotification({
    userId: accountId,
    type: 'identity_verification_rejected',
    title: 'Verification needs resubmission',
    message: `Your identity verification was not approved. ${reason} Open My Requests and tap Pay to resubmit.`,
    sendEmail: true,
    actionUrl: '/student/requests',
    actionText: 'View requests',
    metadata: {
      source: 'admin_kyc_reject',
      rejection_reason: reason,
      ...(options?.verificationId
        ? { verification_id: options.verificationId }
        : {}),
    },
  });
}
