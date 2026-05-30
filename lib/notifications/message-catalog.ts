import type { UserEngagementContext } from './user-context';
import type { CampaignId } from './engagement-types';
import type { CalendarDayEvent } from './calendar-cm';

export interface EngagementMessage {
  title: string;
  message: string;
  actionUrl: string;
  actionText: string;
  notificationType: string;
}

function primarySubject(ctx: UserEngagementContext): string {
  return ctx.subjects[0] || 'your subjects';
}

function pathTheme(ctx: UserEngagementContext): 'studies' | 'career' | 'exams' {
  const path = (ctx.learningPath || ctx.goals || '').toLowerCase();
  if (path.includes('career') || path.includes('job')) return 'career';
  if (path.includes('exam') || path.includes('gce') || path.includes('bac')) return 'exams';
  return 'studies';
}

export function resolveEngagementMessage(
  campaignId: CampaignId,
  ctx: UserEngagementContext,
  calendarEvent?: CalendarDayEvent
): EngagementMessage {
  const subject = primarySubject(ctx);
  const theme = pathTheme(ctx);
  const child = ctx.childName ? ctx.childName : 'your child';

  if (campaignId === 'calendar_special' && calendarEvent) {
    return {
      title: calendarEvent.title,
      message: calendarEvent.messageFor(ctx.role, theme, subject, child),
      actionUrl: calendarEvent.actionUrl(ctx.role),
      actionText: calendarEvent.actionText,
      notificationType: 'calendar_engagement',
    };
  }

  if (campaignId === 'monday_week_start') {
    if (ctx.role === 'tutor') {
      return {
        title: 'Plan your teaching week',
        message:
          'Review your session requests and update availability so students can book you this week.',
        actionUrl: '/tutor-nav',
        actionText: 'View schedule',
        notificationType: 'monday_engagement',
      };
    }
    if (ctx.role === 'parent') {
      const focus =
        theme === 'exams'
          ? `exam prep in ${subject}`
          : theme === 'career'
            ? 'career skills'
            : `lessons in ${subject}`;
      return {
        title: 'New week for learning',
        message: `Set one goal with ${child} for ${focus} this week on PrepSkul.`,
        actionUrl: '/parent-nav',
        actionText: 'Review sessions',
        notificationType: 'monday_engagement',
      };
    }
    const studentMsg =
      theme === 'exams'
        ? `Pick one ${subject} topic to revise this week and book support if you need it.`
        : theme === 'career'
          ? 'Set one career skill to practice this week and find a tutor to guide you.'
          : `Choose one ${subject} topic to focus on this week and keep your momentum.`;
    return {
      title: 'Start the week strong',
      message: studentMsg,
      actionUrl: '/student-nav',
      actionText: 'Continue learning',
      notificationType: 'monday_engagement',
    };
  }

  if (campaignId === 'month_start') {
    if (ctx.role === 'tutor') {
      return {
        title: 'New month on PrepSkul',
        message: 'Check your earnings and confirm your availability for new bookings.',
        actionUrl: '/earnings',
        actionText: 'View earnings',
        notificationType: 'monthly_engagement',
      };
    }
    if (ctx.role === 'parent') {
      return {
        title: 'Fresh month for learning',
        message: `Review ${child}'s progress and book the next session while slots are open.`,
        actionUrl: '/parent-nav',
        actionText: 'Book a session',
        notificationType: 'monthly_engagement',
      };
    }
    return {
      title: 'New month, new progress',
      message:
        theme === 'exams'
          ? `Map your ${subject} revision plan for this month and book a tutor if you are stuck.`
          : 'Set one learning goal for this month and open PrepSkul to get started.',
      actionUrl: '/student-nav',
      actionText: 'Set a goal',
      notificationType: 'monthly_engagement',
    };
  }

  if (campaignId === 'behaviour_tutor_browse') {
    return {
      title: 'Ready to book?',
      message: `You recently viewed tutors. Send a booking request for ${subject} when you are ready.`,
      actionUrl: '/discovery',
      actionText: 'Find tutors',
      notificationType: 'behaviour_tutor_browse',
    };
  }

  if (campaignId === 'notes_to_games') {
    const who =
      ctx.role === 'parent'
        ? `${child}'s notes`
        : 'your notes';
    return {
      title: 'Turn notes into a quick game',
      message: `You uploaded study material recently. Turn ${who} into a short SkulMate revision round.`,
      actionUrl: '/skulmate',
      actionText: 'Open SkulMate',
      notificationType: 'daily_challenge',
    };
  }

  if (campaignId === 'daily_skulmate_streak') {
    return {
      title: 'Keep your SkulMate streak',
      message: 'Your daily challenge is ready. One short round on your main subject.',
      actionUrl: '/skulmate',
      actionText: 'Play now',
      notificationType: 'daily_challenge_reminder',
    };
  }

  if (campaignId === 'tutor_pending_verification') {
    return {
      title: 'Complete your tutor verification',
      message: 'Upload remaining documents so students can see your profile as approved.',
      actionUrl: '/tutor/onboarding',
      actionText: 'Complete profile',
      notificationType: 'onboarding_reminder',
    };
  }

  if (campaignId === 'kyc_resume') {
    return {
      title: 'Resume identity verification',
      message: 'Finish verifying your identity to unlock bookings and payments on PrepSkul.',
      actionUrl: '/identity-verification',
      actionText: 'Continue verification',
      notificationType: 'identity_verification_rejected',
    };
  }

  if (campaignId === 'identity_verified_pay') {
    return {
      title: 'Complete your payment',
      message: 'Your identity is verified. Complete payment to confirm your upcoming session.',
      actionUrl: '/payments',
      actionText: 'Pay now',
      notificationType: 'payment_reminder',
    };
  }

  // daily_engagement_boost fallback
  if (ctx.role === 'tutor') {
    return {
      title: 'Keep your schedule up to date',
      message: 'Open PrepSkul to review requests, sessions, and availability for the week.',
      actionUrl: '/tutor-nav',
      actionText: 'View schedule',
      notificationType: 'daily_inactivity_nudge',
    };
  }
  if (ctx.role === 'parent') {
    return {
      title: 'Review your child’s learning',
      message: 'Open PrepSkul to check upcoming sessions and pick one topic to focus on today.',
      actionUrl: '/parent-nav',
      actionText: 'Review sessions',
      notificationType: 'daily_inactivity_nudge',
    };
  }
  return {
    title: 'Pick up where you left off',
    message: `Continue learning or play a short SkulMate round on ${subject}.`,
    actionUrl: '/student-nav',
    actionText: 'Continue learning',
    notificationType: 'daily_inactivity_nudge',
  };
}
