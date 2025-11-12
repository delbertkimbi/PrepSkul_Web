/**
 * Tutor Profile Notification Email Templates
 */

import { generateEmailTemplate } from './base_template';

export function profileApprovedEmail(
  tutorName: string,
  rating?: number,
  sessionPrice?: number,
  pricingTier?: string,
  adminNotes?: string,
): string {
  const ratingText = rating ? `<strong>${rating.toFixed(1)} ⭐</strong>` : 'N/A';
  const priceText = sessionPrice ? `<strong>${sessionPrice.toLocaleString('en-US')} XAF</strong>` : 'N/A';
  const tierText = pricingTier ? formatTier(pricingTier) : 'N/A';

  return generateEmailTemplate({
    userName: tutorName,
    title: '🎉 Profile Approved!',
    icon: '🎉',
    message: `
      Congratulations! Your PrepSkul tutor profile has been reviewed and <strong>approved</strong> by our admin team.
      <br><br>
      <strong>Your Profile Details:</strong>
      <br>• Initial Rating: ${ratingText}
      <br>• Session Price: ${priceText}
      <br>• Pricing Tier: ${tierText}
      ${adminNotes ? `<br><br><strong>Admin Note:</strong> ${adminNotes}` : ''}
      <br><br>
      <strong>What's next?</strong>
      <br>✅ Your profile is now live and visible to students
      <br>✅ You can start receiving booking requests
      <br>✅ Log in to manage your profile and view bookings
    `,
    actionUrl: '/tutor/dashboard',
    actionText: 'Open Dashboard',
    footerNote: 'This is your initial rating based on your credentials. Starting from your 3rd student review onwards, your rating will be dynamically updated based on actual student feedback.',
  });
}

export function profileNeedsImprovementEmail(
  tutorName: string,
  improvementRequests: string[],
): string {
  const requestsList = improvementRequests
    .map((req, idx) => `${idx + 1}. ${req}`)
    .join('<br>');

  return generateEmailTemplate({
    userName: tutorName,
    title: '📝 Profile Needs Improvement',
    icon: '📝',
    message: `
      Thank you for your interest in becoming a PrepSkul tutor!
      <br><br>
      We've reviewed your application and would like to request some improvements before we can approve your profile.
      <br><br>
      <strong>Please review and address the following:</strong>
      <br><br>
      ${requestsList}
      <br><br>
      Once you've made these updates, please resubmit your application. We'll review it again as soon as possible.
    `,
    actionUrl: '/tutor/profile/edit',
    actionText: 'Update Profile',
    secondaryActionUrl: '/tutor/onboarding',
    secondaryActionText: 'Complete Onboarding',
    footerNote: 'If you have any questions, feel free to reach out to our support team.',
  });
}

export function profileRejectedEmail(
  tutorName: string,
  rejectionReason: string,
): string {
  return generateEmailTemplate({
    userName: tutorName,
    title: '⚠️ Profile Rejected',
    icon: '⚠️',
    message: `
      Thank you for your interest in becoming a PrepSkul tutor.
      <br><br>
      After careful review, we regret to inform you that your application has not been approved at this time.
      <br><br>
      <strong>Reason:</strong>
      <br>${rejectionReason}
      <br><br>
      We encourage you to address the points mentioned above and re-apply. Many successful tutors have improved their applications based on our feedback.
    `,
    actionUrl: '/tutor/profile/edit',
    actionText: 'Update Profile',
    secondaryActionUrl: '/support',
    secondaryActionText: 'Contact Support',
    footerNote: 'If you have any questions or need clarification, please don\'t hesitate to contact us.',
  });
}

function formatTier(tier: string): string {
  const tierMap: Record<string, string> = {
    'entry': 'Entry Level',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced',
    'expert': 'Expert',
  };
  return tierMap[tier] || tier;
}
