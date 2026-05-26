import { getCalendarEventById } from './calendar-cm';
import { buildDedupeKey, canSendEngagementToday, logCampaignSend } from './engagement-cap';
import { resolveEngagementMessage } from './message-catalog';
import { pickCampaign, type PickMode } from './pick-campaign';
import { hadMeaningfulActivityToday } from './meaningful-activity';
import { loadUserEngagementContext } from './user-context';

export interface EngagementSendResult {
  sent: boolean;
  skipped?: string;
  campaignId?: string;
}

function getAppBaseUrl(): string | null {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  );
}

export async function sendEngagementToUser(params: {
  userId: string;
  profile?: { user_type?: string | null; full_name?: string | null; last_seen?: string | null };
  mode: PickMode;
  skipMeaningfulActivityCheck?: boolean;
  skipEngagementCapCheck?: boolean;
}): Promise<EngagementSendResult> {
  const { userId, profile, mode } = params;

  if (!params.skipMeaningfulActivityCheck) {
    if (await hadMeaningfulActivityToday(userId)) {
      return { sent: false, skipped: 'meaningful_activity_today' };
    }
  }

  if (!params.skipEngagementCapCheck) {
    if (!(await canSendEngagementToday(userId))) {
      return { sent: false, skipped: 'engagement_cap_today' };
    }
  }

  const ctx = await loadUserEngagementContext(userId, profile);
  const picked = pickCampaign(ctx, mode);
  if (!picked) {
    return { sent: false, skipped: 'no_campaign' };
  }

  const calendarEvent =
    picked.calendarEventId != null
      ? getCalendarEventById(picked.calendarEventId)
      : undefined;

  const msg = resolveEngagementMessage(picked.campaignId, ctx, calendarEvent ?? undefined);
  const dedupeKey = buildDedupeKey(picked.campaignId, userId);
  const baseUrl = getAppBaseUrl();
  if (!baseUrl) {
    return { sent: false, skipped: 'no_app_url' };
  }

  const res = await fetch(`${baseUrl}/api/notifications/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      type: msg.notificationType,
      title: msg.title,
      message: msg.message,
      priority: 'normal',
      actionUrl: msg.actionUrl,
      actionText: msg.actionText,
      sendEmail: false,
      sendPush: true,
      metadata: {
        campaign_id: picked.campaignId,
        dedupe_key: dedupeKey,
        region: 'CM',
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`send-engagement failed for ${userId}: ${res.status} ${text}`);
    return { sent: false, skipped: `send_failed_${res.status}` };
  }

  await logCampaignSend({
    userId,
    campaignId: picked.campaignId,
    notificationType: msg.notificationType,
    channel: 'both',
    metadata: { dedupe_key: dedupeKey },
  });

  return { sent: true, campaignId: picked.campaignId };
}

export async function runEngagementBatch(params: {
  profiles: Array<{
    id: string;
    user_type?: string | null;
    full_name?: string | null;
    last_seen?: string | null;
    is_admin?: boolean | null;
  }>;
  mode: PickMode;
  maxUsers?: number;
}): Promise<{ processed: number; failed: number; skipped: number }> {
  const max = params.maxUsers ?? 500;
  let processed = 0;
  let failed = 0;
  let skipped = 0;

  const eligible = params.profiles
    .filter((p) => {
      if (p.is_admin) return false;
      const role = (p.user_type || '').toLowerCase();
      return ['student', 'learner', 'parent', 'tutor'].includes(role);
    })
    .slice(0, max);

  for (const profile of eligible) {
    try {
      const result = await sendEngagementToUser({
        userId: profile.id,
        profile,
        mode: params.mode,
      });
      if (result.sent) processed++;
      else skipped++;
    } catch (e) {
      failed++;
      console.warn(`runEngagementBatch error for ${profile.id}:`, e);
    }
  }

  return { processed, failed, skipped };
}
