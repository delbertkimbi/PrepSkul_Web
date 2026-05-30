import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStartOfDayWatIso, formatWatDateKey } from './timezone-wat';
import { isEngagementNotificationType, type CampaignId } from './engagement-types';

const ENGAGEMENT_TYPES_FOR_CAP = [
  'daily_inactivity_nudge',
  'monday_engagement',
  'monthly_engagement',
  'calendar_engagement',
  'behaviour_tutor_browse',
  'daily_challenge_reminder',
  'daily_challenge',
  'daily_matched_tutors',
];

/** At most one engagement push per user per WAT calendar day. */
export async function canSendEngagementToday(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const startIso = getStartOfDayWatIso();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('type, metadata')
    .eq('user_id', userId)
    .gte('created_at', startIso);

  for (const n of notifications || []) {
    const t = n.type as string;
    if (isEngagementNotificationType(t) || ENGAGEMENT_TYPES_FOR_CAP.includes(t)) {
      return false;
    }
    const meta = n.metadata as Record<string, unknown> | null;
    if (meta?.campaign_id) return false;
  }

  const { data: campaignLog } = await supabase
    .from('notification_campaign_log')
    .select('id')
    .eq('user_id', userId)
    .gte('sent_at', startIso)
    .limit(1);

  if (campaignLog?.length) return false;

  return true;
}

/** Skip if any notification already sent today (transactional + engagement). */
export async function hadAnyNotificationToday(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const startIso = getStartOfDayWatIso();
  const { data } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startIso)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

export function buildDedupeKey(campaignId: CampaignId, userId: string): string {
  return `engagement:${campaignId}:${formatWatDateKey()}:${userId}`;
}

export async function logCampaignSend(params: {
  userId: string;
  campaignId: CampaignId;
  notificationType: string;
  channel: 'push' | 'in_app' | 'both';
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('notification_campaign_log').insert({
      user_id: params.userId,
      campaign_id: params.campaignId,
      notification_type: params.notificationType,
      channel: params.channel,
      metadata: { region: 'CM', ...params.metadata },
      sent_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('notification_campaign_log insert failed (table may be missing):', e);
  }
}
