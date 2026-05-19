import type { SupabaseClient } from '@supabase/supabase-js';
import { buildSessionPortalUrls } from '@/lib/services/session-portal-access';

const MATCH_DELAY_MS = 3 * 60 * 1000;

/** Schedule friendly match emails ~3 minutes after offline enrollment (cron delivers them). */
export async function scheduleOfflineMatchEmails(
  admin: SupabaseClient,
  opts: {
    primaryUserId: string;
    learnerUserId: string;
    tutorUserId: string;
    tutorName: string;
    firstSessionId: string;
    subject: string;
    nextDate?: string | null;
    nextTime?: string | null;
    deliveryMode?: string | null;
    meetLink?: string | null;
    onsiteLocation?: string | null;
  }
) {
  const when = new Date(Date.now() + MATCH_DELAY_MS).toISOString();
  const urls = buildSessionPortalUrls(opts.firstSessionId);
  const familyUserId =
    opts.primaryUserId !== opts.learnerUserId ? opts.primaryUserId : opts.learnerUserId;

  const baseMeta = {
    offline_match_email: true,
    sendEmail: true,
    sendPush: false,
    tutor_name: opts.tutorName,
    subject: opts.subject,
    next_date: opts.nextDate,
    next_time: opts.nextTime,
    delivery_mode: opts.deliveryMode,
    meet_link: opts.meetLink,
    onsite_location: opts.onsiteLocation,
    session_id: opts.firstSessionId,
  };

  const rows = [
    {
      user_id: familyUserId,
      notification_type: 'offline_match',
      title: 'You are matched on PrepSkul',
      message:
        'Great news — you have been matched with your tutor on PrepSkul. We will send session reminders ahead of each class.',
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
      title: 'New PrepSkul offline match',
      message:
        'You have been matched with a new learner for offline sessions on PrepSkul. Session reminders will follow before each class.',
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
