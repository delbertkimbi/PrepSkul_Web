/**
 * Trial Session Notification Email Templates
 */

import { generateEmailTemplate } from './base_template';

export function trialRequestEmail(
  tutorName: string,
  studentName: string,
  subject: string,
  scheduledDate: string,
  scheduledTime: string,
  trialId: string,
): string {
  return generateEmailTemplate({
    userName: tutorName,
    title: '🎯 New Trial Session Request',
    icon: '🎯',
    message: `
      <strong>${studentName}</strong> wants to book a trial session for <strong>${subject}</strong>.
      <br><br>
      <strong>Scheduled:</strong> ${scheduledDate} at ${scheduledTime}
      <br><br>
      Please review and respond to this trial request. Once approved, the student will proceed with payment.
    `,
    actionUrl: `/trials/${trialId}`,
    actionText: 'Review Request',
    footerNote: 'You have 24 hours to respond to this trial request.',
  });
}

export function trialAcceptedEmail(
  studentName: string,
  tutorName: string,
  subject: string,
  scheduledDate: string,
  scheduledTime: string,
  trialId: string,
  trialFee: number,
): string {
  return generateEmailTemplate({
    userName: studentName,
    title: '✅ Trial Session Confirmed!',
    icon: '✅',
    message: `
      <strong>${tutorName}</strong> has accepted your trial session request for <strong>${subject}</strong>.
      <br><br>
      <strong>Scheduled:</strong> ${scheduledDate} at ${scheduledTime}
      <br><strong>Trial Fee:</strong> ${trialFee.toLocaleString('en-US')} XAF
      <br><br>
      Please proceed with payment to confirm your trial session. Your session will be confirmed once payment is received.
    `,
    actionUrl: `/trials/${trialId}/payment`,
    actionText: 'Pay Now',
    secondaryActionUrl: `/trials/${trialId}`,
    secondaryActionText: 'View Details',
    footerNote: 'Payment must be completed before the scheduled session time.',
  });
}

export function trialRejectedEmail(
  studentName: string,
  tutorName: string,
  rejectionReason: string | null,
): string {
  return generateEmailTemplate({
    userName: studentName,
    title: '⚠️ Trial Session Declined',
    icon: '⚠️',
    message: `
      <strong>${tutorName}</strong> has declined your trial session request.
      ${rejectionReason ? `<br><br><strong>Reason:</strong> ${rejectionReason}` : ''}
      <br><br>
      Don't worry! You can book a trial session with another tutor or try a different time.
    `,
    actionUrl: '/tutors',
    actionText: 'Find Another Tutor',
    secondaryActionUrl: '/trials',
    secondaryActionText: 'My Trial Sessions',
    footerNote: 'You can create a new trial session request anytime.',
  });
}
