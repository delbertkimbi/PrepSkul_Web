import type { SupabaseClient } from '@supabase/supabase-js';
import { buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import { sendOfflineMatchNotificationEmail } from '@/lib/offline-session-emails';

type MatchEmailOpts = {
  primaryUserId: string;
  learnerUserId: string;
  tutorUserId: string;
  tutorName: string;
  learnerName?: string | null;
  firstSessionId: string;
  subject: string;
  nextDate?: string | null;
  nextTime?: string | null;
  deliveryMode?: string | null;
  meetLink?: string | null;
  onsiteLocation?: string | null;
};

/** Send one-time welcome emails right after a new offline match (not on schedule extensions). */
export async function deliverOfflineMatchWelcomeEmails(admin: SupabaseClient, opts: MatchEmailOpts) {
  const urls = buildSessionPortalUrls(opts.firstSessionId);
  const familyUserId =
    opts.primaryUserId !== opts.learnerUserId ? opts.primaryUserId : opts.learnerUserId;

  const [{ data: tutorProfile }, { data: familyProfile }] = await Promise.all([
    admin.from('profiles').select('email, full_name').eq('id', opts.tutorUserId).maybeSingle(),
    admin.from('profiles').select('email, full_name').eq('id', familyUserId).maybeSingle(),
  ]);

  const emailOpts = {
    tutorName: opts.tutorName,
    learnerName: opts.learnerName || undefined,
    nextDate: opts.nextDate,
    nextTime: opts.nextTime,
    subject: opts.subject,
    deliveryMode: opts.deliveryMode,
    meetLink: opts.meetLink,
    onsiteLocation: opts.onsiteLocation,
  };

  if (familyProfile?.email) {
    await sendOfflineMatchNotificationEmail({
      to: familyProfile.email,
      recipientName: familyProfile.full_name || 'there',
      ...emailOpts,
      portalUrl: urls.learnerFeedbackUrl,
      rescheduleUrl: urls.learnerRescheduleUrl,
      role: 'learner',
    });
  }

  if (tutorProfile?.email) {
    await sendOfflineMatchNotificationEmail({
      to: tutorProfile.email,
      recipientName: tutorProfile.full_name || 'Tutor',
      ...emailOpts,
      portalUrl: urls.tutorReportUrl,
      rescheduleUrl: urls.tutorRescheduleUrl,
      role: 'tutor',
    });
  }
}

/** In-app notifications for the same one-time match event (no duplicate email). */
export async function scheduleOfflineMatchInAppNotifications(admin: SupabaseClient, opts: MatchEmailOpts) {
  const when = new Date().toISOString();
  const urls = buildSessionPortalUrls(opts.firstSessionId);
  const familyUserId =
    opts.primaryUserId !== opts.learnerUserId ? opts.primaryUserId : opts.learnerUserId;

  const baseMeta = {
    offline_match_email: false,
    sendEmail: false,
    sendPush: false,
    tutor_name: opts.tutorName,
    learner_name: opts.learnerName || null,
    subject: opts.subject,
    session_id: opts.firstSessionId,
  };

  const rows = [
    {
      user_id: familyUserId,
      notification_type: 'offline_match',
      title: 'Welcome to PrepSkul session notifications',
      message:
        'You have been matched on PrepSkul. You will receive session reminders and updates by email.',
      scheduled_for: when,
      status: 'pending',
      related_id: opts.firstSessionId,
      metadata: {
        ...baseMeta,
        recipient_role: 'learner',
        portal_url: urls.learnerFeedbackUrl,
        reschedule_url: urls.learnerRescheduleUrl,
      },
    },
    {
      user_id: opts.tutorUserId,
      notification_type: 'offline_match',
      title: 'Welcome to PrepSkul session notifications',
      message:
        'You have a new learner match on PrepSkul. Session reminders and updates will follow by email.',
      scheduled_for: when,
      status: 'pending',
      related_id: opts.firstSessionId,
      metadata: {
        ...baseMeta,
        recipient_role: 'tutor',
        portal_url: urls.tutorReportUrl,
        reschedule_url: urls.tutorRescheduleUrl,
      },
    },
  ];

  await admin.from('scheduled_notifications').insert(rows);
}

/** @deprecated Use deliverOfflineMatchWelcomeEmails + scheduleOfflineMatchInAppNotifications */
export async function scheduleOfflineMatchEmails(admin: SupabaseClient, opts: MatchEmailOpts) {
  await deliverOfflineMatchWelcomeEmails(admin, opts);
  await scheduleOfflineMatchInAppNotifications(admin, opts);
}
