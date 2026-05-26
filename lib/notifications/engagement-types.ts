export type UserRole = 'student' | 'learner' | 'parent' | 'tutor';

export type CampaignId =
  | 'calendar_special'
  | 'monday_week_start'
  | 'month_start'
  | 'behaviour_tutor_browse'
  | 'notes_to_games'
  | 'daily_skulmate_streak'
  | 'tutor_pending_verification'
  | 'tutor_approved_discover'
  | 'kyc_resume'
  | 'identity_verified_pay'
  | 'daily_engagement_boost';

export interface EngagementCampaign {
  id: CampaignId;
  notificationType: string;
  allowedRoles: UserRole[];
  priority: number;
}

export const ENGAGEMENT_CAMPAIGNS: Record<CampaignId, EngagementCampaign> = {
  calendar_special: {
    id: 'calendar_special',
    notificationType: 'calendar_engagement',
    allowedRoles: ['student', 'learner', 'parent', 'tutor'],
    priority: 100,
  },
  monday_week_start: {
    id: 'monday_week_start',
    notificationType: 'monday_engagement',
    allowedRoles: ['student', 'learner', 'parent', 'tutor'],
    priority: 80,
  },
  month_start: {
    id: 'month_start',
    notificationType: 'monthly_engagement',
    allowedRoles: ['student', 'learner', 'parent', 'tutor'],
    priority: 70,
  },
  behaviour_tutor_browse: {
    id: 'behaviour_tutor_browse',
    notificationType: 'behaviour_tutor_browse',
    allowedRoles: ['student', 'learner', 'parent'],
    priority: 60,
  },
  notes_to_games: {
    id: 'notes_to_games',
    notificationType: 'daily_challenge',
    allowedRoles: ['student', 'learner', 'parent'],
    priority: 55,
  },
  daily_skulmate_streak: {
    id: 'daily_skulmate_streak',
    notificationType: 'daily_challenge_reminder',
    allowedRoles: ['student', 'learner'],
    priority: 50,
  },
  tutor_pending_verification: {
    id: 'tutor_pending_verification',
    notificationType: 'onboarding_reminder',
    allowedRoles: ['tutor'],
    priority: 65,
  },
  tutor_approved_discover: {
    id: 'tutor_approved_discover',
    notificationType: 'daily_matched_tutors',
    allowedRoles: ['student', 'learner', 'parent'],
    priority: 45,
  },
  kyc_resume: {
    id: 'kyc_resume',
    notificationType: 'identity_verification_rejected',
    allowedRoles: ['student', 'learner', 'parent'],
    priority: 75,
  },
  identity_verified_pay: {
    id: 'identity_verified_pay',
    notificationType: 'payment_reminder',
    allowedRoles: ['student', 'learner', 'parent'],
    priority: 74,
  },
  daily_engagement_boost: {
    id: 'daily_engagement_boost',
    notificationType: 'daily_inactivity_nudge',
    allowedRoles: ['student', 'learner', 'parent', 'tutor'],
    priority: 10,
  },
};

export const ENGAGEMENT_NOTIFICATION_PREFIXES = [
  'daily_',
  'weekly_',
  'monthly_',
  'behaviour_',
  'calendar_',
  'daily_challenge',
  'skulmate_weekly_digest',
] as const;

export function isEngagementNotificationType(type: string): boolean {
  if (!type) return false;
  return ENGAGEMENT_NOTIFICATION_PREFIXES.some(
    (p) => type === p || type.startsWith(p)
  );
}

export function normalizeRole(userType: string | null): UserRole | null {
  const r = (userType || '').toLowerCase();
  if (r === 'student' || r === 'learner' || r === 'parent' || r === 'tutor') {
    return r as UserRole;
  }
  return null;
}

export function roleAllowed(campaign: EngagementCampaign, role: UserRole | null): boolean {
  if (!role) return false;
  return campaign.allowedRoles.includes(role);
}
