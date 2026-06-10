import type { CampaignId } from './engagement-types';
import { ENGAGEMENT_CAMPAIGNS, roleAllowed } from './engagement-types';
import type { UserEngagementContext } from './user-context';
import { getCalendarEventToday } from './calendar-cm';
import { isMondayInWat, isFirstOfMonthInWat } from './timezone-wat';

export type PickMode =
  | 'daily_boost'
  | 'monday_only'
  | 'month_start_only'
  | 'calendar_only'
  | 'behaviour_only'
  | 'skulmate_daily';

export interface PickedCampaign {
  campaignId: CampaignId;
  calendarEventId?: string;
}

function enabledMatchedTutors(): boolean {
  return process.env.ENABLE_DAILY_MATCHED_TUTORS === 'true';
}

/**
 * Priority: calendar today > Monday evening > month start > behaviour > SkulMate > fallback boost.
 */
export function pickCampaign(
  ctx: UserEngagementContext,
  mode: PickMode,
  now: Date = new Date()
): PickedCampaign | null {
  const tryPick = (id: CampaignId, extra?: { calendarEventId?: string }): PickedCampaign | null => {
    const camp = ENGAGEMENT_CAMPAIGNS[id];
    if (!roleAllowed(camp, ctx.role)) return null;
    return { campaignId: id, ...extra };
  };

  if (mode === 'calendar_only') {
    const cal = getCalendarEventToday(now);
    if (!cal || !ctx.role || !cal.roles.includes(ctx.role)) return null;
    return tryPick('calendar_special', { calendarEventId: cal.id });
  }

  if (mode === 'monday_only') {
    if (!isMondayInWat(now)) return null;
    return tryPick('monday_week_start');
  }

  if (mode === 'month_start_only') {
    if (!isFirstOfMonthInWat(now)) return null;
    return tryPick('month_start');
  }

  if (mode === 'behaviour_only') {
    if (
      (ctx.role === 'student' || ctx.role === 'learner' || ctx.role === 'parent') &&
      ctx.browsedTutorsRecently &&
      !ctx.openBookingRequest
    ) {
      return tryPick('behaviour_tutor_browse');
    }
    return null;
  }

  if (mode === 'skulmate_daily') {
    if (ctx.recentNoteUpload && !ctx.recentGamePlay) {
      const notes = tryPick('notes_to_games');
      if (notes) return notes;
    }
    if (
      ctx.hasSkulMateStats &&
      (ctx.role === 'student' || ctx.role === 'learner' || ctx.role === 'parent')
    ) {
      return tryPick('daily_skulmate_streak');
    }
    return null;
  }

  // daily_boost — full priority stack
  const cal = getCalendarEventToday(now);
  if (cal && ctx.role && cal.roles.includes(ctx.role)) {
    const c = tryPick('calendar_special', { calendarEventId: cal.id });
    if (c) return c;
  }

  if (isMondayInWat(now)) {
    const m = tryPick('monday_week_start');
    if (m) return m;
  }

  if (isFirstOfMonthInWat(now)) {
    const ms = tryPick('month_start');
    if (ms) return ms;
  }

  if (ctx.role === 'tutor' && ctx.tutorStatus === 'pending') {
    const t = tryPick('tutor_pending_verification');
    if (t) return t;
  }

  if (
    (ctx.kycStatus === 'rejected' || ctx.kycStatus === 'pending') &&
    (ctx.role === 'student' || ctx.role === 'learner' || ctx.role === 'parent')
  ) {
    const k = tryPick('kyc_resume');
    if (k) return k;
  }

  if (ctx.kycStatus === 'approved' && ctx.pendingPaymentRequest) {
    const p = tryPick('identity_verified_pay');
    if (p) return p;
  }

  if (
    enabledMatchedTutors() &&
    (ctx.role === 'student' || ctx.role === 'learner' || ctx.role === 'parent') &&
    ctx.subjects.length > 0 &&
    !ctx.openBookingRequest
  ) {
    const d = tryPick('tutor_approved_discover');
    if (d) return d;
  }

  if (ctx.browsedTutorsRecently && !ctx.openBookingRequest) {
    const b = tryPick('behaviour_tutor_browse');
    if (b) return b;
  }

  if (ctx.recentNoteUpload && !ctx.recentGamePlay) {
    const n = tryPick('notes_to_games');
    if (n) return n;
  }

  if (ctx.hasSkulMateStats && (ctx.role === 'student' || ctx.role === 'learner')) {
    const s = tryPick('daily_skulmate_streak');
    if (s) return s;
  }

  return tryPick('daily_engagement_boost');
}
