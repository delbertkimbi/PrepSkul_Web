/**
 * Session Notification Email Templates
 */

import { generateEmailTemplate } from './base_template';

export function sessionReminderEmail(
  userName: string,
  otherPartyName: string,
  subject: string,
  sessionType: string,
  sessionStart: string,
  sessionId: string,
  minutesUntil: number = 30,
): string {
  const timeText = minutesUntil === 30 ? '30 minutes' : minutesUntil === 60 ? '1 hour' : `${minutesUntil} minutes`;
  
  return generateEmailTemplate({
    userName: userName,
    title: '⏰ Session Starting Soon',
    icon: '⏰',
    message: `
      Your ${sessionType} session with <strong>${otherPartyName}</strong> for <strong>${subject}</strong> starts in <strong>${timeText}</strong>.
      <br><br>
      <strong>Session Time:</strong> ${sessionStart}
      <br><br>
      Please make sure you're ready and have a stable internet connection if it's an online session.
    `,
    actionUrl: `/sessions/${sessionId}`,
    actionText: 'View Session',
    secondaryActionUrl: `/sessions/${sessionId}/join`,
    secondaryActionText: 'Join Session',
    footerNote: `This is an automatic reminder. The session starts in ${timeText}.`,
  });
}

export function sessionCompletedEmail(
  userName: string,
  otherPartyName: string,
  subject: string,
  sessionType: string,
  sessionId: string,
): string {
  return generateEmailTemplate({
    userName: userName,
    title: '✅ Session Completed',
    icon: '✅',
    message: `
      Your ${sessionType} session with <strong>${otherPartyName}</strong> for <strong>${subject}</strong> has been completed.
      <br><br>
      We hope you had a great learning experience! Please take a moment to leave a review. Your feedback helps us improve and helps other students find the right tutors.
    `,
    actionUrl: `/sessions/${sessionId}/review`,
    actionText: 'Leave Review',
    secondaryActionUrl: `/sessions/${sessionId}`,
    secondaryActionText: 'View Session',
    footerNote: 'Reviews help other students make informed decisions and help tutors improve.',
  });
}

export function reviewReminderEmail(
  userName: string,
  otherPartyName: string,
  subject: string,
  sessionType: string,
  sessionId: string,
): string {
  return generateEmailTemplate({
    userName: userName,
    title: '📝 Leave a Review',
    icon: '📝',
    message: `
      How was your ${sessionType} session with <strong>${otherPartyName}</strong> for <strong>${subject}</strong>?
      <br><br>
      Your feedback helps us improve the PrepSkul experience and helps other students find the right tutors.
      <br><br>
      It only takes a minute to leave a review!
    `,
    actionUrl: `/sessions/${sessionId}/review`,
    actionText: 'Leave Review',
    secondaryActionUrl: '/sessions',
    secondaryActionText: 'My Sessions',
    footerNote: 'Your honest feedback is valuable to us and the PrepSkul community.',
  });
}
