/**
 * Booking Notification Email Templates
 */

import { generateEmailTemplate } from './base_template';

export function bookingRequestEmail(
  tutorName: string,
  studentName: string,
  subject: string,
  requestId: string,
): string {
  return generateEmailTemplate({
    userName: tutorName,
    title: '🎓 New Booking Request',
    icon: '🎓',
    message: `
      <strong>${studentName}</strong> wants to book tutoring sessions for <strong>${subject}</strong>.
      <br><br>
      Please review the request and respond as soon as possible. Students are waiting for your response!
    `,
    actionUrl: `/bookings/requests/${requestId}`,
    actionText: 'View Request',
    footerNote: 'You have 24 hours to respond to this request.',
  });
}

export function bookingAcceptedEmail(
  studentName: string,
  tutorName: string,
  subject: string,
  requestId: string,
): string {
  return generateEmailTemplate({
    userName: studentName,
    title: '✅ Booking Accepted!',
    icon: '✅',
    message: `
      Great news! <strong>${tutorName}</strong> has accepted your booking request for <strong>${subject}</strong>.
      <br><br>
      Your sessions are now confirmed. You can view the details and manage your booking below.
    `,
    actionUrl: `/bookings/${requestId}`,
    actionText: 'View Booking',
    secondaryActionUrl: '/bookings',
    secondaryActionText: 'All Bookings',
  });
}

export function bookingRejectedEmail(
  studentName: string,
  tutorName: string,
  rejectionReason: string | null,
  requestId: string,
): string {
  return generateEmailTemplate({
    userName: studentName,
    title: '⚠️ Booking Declined',
    icon: '⚠️',
    message: `
      <strong>${tutorName}</strong> has declined your booking request.
      ${rejectionReason ? `<br><br><strong>Reason:</strong> ${rejectionReason}` : ''}
      <br><br>
      Don't worry! There are many other great tutors available. Find another tutor that matches your needs.
    `,
    actionUrl: '/tutors',
    actionText: 'Find Another Tutor',
    secondaryActionUrl: '/bookings/requests',
    secondaryActionText: 'My Requests',
    footerNote: 'You can create a new booking request anytime.',
  });
}
