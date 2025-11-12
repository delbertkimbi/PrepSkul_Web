/**
 * Payment Notification Email Templates
 */

import { generateEmailTemplate } from './base_template';

export function paymentReceivedEmail(
  tutorName: string,
  studentName: string,
  amount: number,
  currency: string,
  paymentId: string,
  sessionType?: string,
): string {
  return generateEmailTemplate({
    userName: tutorName,
    title: '💰 Payment Received',
    icon: '💰',
    message: `
      You received <strong>${amount.toLocaleString('en-US')} ${currency}</strong> from <strong>${studentName}</strong>
      ${sessionType ? `for ${sessionType}` : ''}.
      <br><br>
      This payment has been processed and added to your earnings.
    `,
    actionUrl: `/payments/${paymentId}`,
    actionText: 'View Payment',
    secondaryActionUrl: '/earnings',
    secondaryActionText: 'View Earnings',
    footerNote: 'Payments are processed securely and added to your account balance.',
  });
}

export function paymentSuccessfulEmail(
  studentName: string,
  amount: number,
  currency: string,
  paymentId: string,
  sessionType?: string,
): string {
  return generateEmailTemplate({
    userName: studentName,
    title: '✅ Payment Successful',
    icon: '✅',
    message: `
      Your payment of <strong>${amount.toLocaleString('en-US')} ${currency}</strong> was successful!
      ${sessionType ? `<br><br>Your ${sessionType} session is now confirmed!` : ''}
      <br><br>
      You can view the payment receipt and session details below.
    `,
    actionUrl: `/payments/${paymentId}`,
    actionText: 'View Receipt',
    secondaryActionUrl: sessionType?.includes('trial') ? '/trials' : '/bookings',
    secondaryActionText: 'View Sessions',
    footerNote: 'Your payment has been processed securely. A receipt has been sent to your email.',
  });
}

export function paymentFailedEmail(
  studentName: string,
  amount: number,
  currency: string,
  paymentId: string,
  errorMessage?: string,
): string {
  return generateEmailTemplate({
    userName: studentName,
    title: '❌ Payment Failed',
    icon: '❌',
    message: `
      Your payment of <strong>${amount.toLocaleString('en-US')} ${currency}</strong> could not be processed.
      ${errorMessage ? `<br><br><strong>Error:</strong> ${errorMessage}` : ''}
      <br><br>
      Please try again or use a different payment method. If the problem persists, contact support.
    `,
    actionUrl: `/payments/${paymentId}/retry`,
    actionText: 'Retry Payment',
    secondaryActionUrl: '/support',
    secondaryActionText: 'Contact Support',
    footerNote: 'Common issues: insufficient funds, network error, or expired card. Please check and try again.',
  });
}
