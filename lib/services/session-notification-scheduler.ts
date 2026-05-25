import type { SupabaseClient } from '@supabase/supabase-js';
import { buildSessionPortalUrls } from '@/lib/services/session-portal-access';

type Occurrence = { date: string; time: string };

const WEST_AFRICA_TIME_OFFSET_MINUTES = 60;

/**
 * Offline sessions store date/time as Cameroon/West Africa local business time.
 * Build the UTC instant explicitly instead of relying on the server timezone
 * (Vercel runs in UTC, which would shift "1 hour before" reminders one hour late).
 */
function westAfricaLocalDateTimeToUtc(date: string, time: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map((part) => Number(part));
  const [hour = 9, minute = 0, second = 0] = String(time || '09:00:00')
    .slice(0, 8)
    .split(':')
    .map((part) => Number(part));

  return new Date(
    Date.UTC(
      year,
      (month || 1) - 1,
      day || 1,
      (hour || 0) - WEST_AFRICA_TIME_OFFSET_MINUTES / 60,
      minute || 0,
      second || 0
    )
  );
}

async function scheduleSessionNotifications(
  admin: SupabaseClient,
  opts: {
    sessionId: string;
    occurrence: Occurrence;
    subject: string;
    tutorUserId: string;
    familyUserId: string;
    deliveryMode?: string;
    meetLink?: string | null;
    onsiteLocation?: string | null;
    urls: ReturnType<typeof buildSessionPortalUrls>;
  }
) {
  const start = westAfricaLocalDateTimeToUtc(opts.occurrence.date, opts.occurrence.time);
  const now = Date.now();
  const userIds = [opts.tutorUserId, opts.familyUserId];

  const reminders: Array<{ type: string; when: Date; title: string; label: string }> = [
    {
      type: '24_hours',
      when: new Date(start.getTime() - 24 * 60 * 60 * 1000),
      title: 'Upcoming PrepSkul session',
      label: '24 hours before your session',
    },
    {
      type: '1_hour',
      when: new Date(start.getTime() - 60 * 60 * 1000),
      title: 'PrepSkul session soon',
      label: '1 hour before your session',
    },
    {
      type: 'session_start',
      when: start,
      title: 'Your session is starting now',
      label: 'Starting now',
    },
  ].filter((r) => r.when.getTime() > now - 60_000);

  const rows: Record<string, unknown>[] = [];
  for (const uid of userIds) {
    const isTutor = uid === opts.tutorUserId;
    for (const r of reminders) {
      rows.push({
        user_id: uid,
        notification_type: r.type === 'session_start' ? 'session_start' : 'session_reminder',
        title: r.title,
        message:
          r.type === 'session_start'
            ? 'Your PrepSkul session is starting now.'
            : `Friendly reminder: your ${opts.subject || 'PrepSkul'} session is coming up soon.`,
        scheduled_for: r.when.toISOString(),
        status: 'pending',
        related_id: opts.sessionId,
        metadata: {
          session_id: opts.sessionId,
          reminder_type: r.type,
          session_start: start.toISOString(),
          sendEmail: true,
          sendPush: r.type === '1_hour' || r.type === 'session_start',
          offline_email: true,
          delivery_mode: opts.deliveryMode,
          meet_link: opts.meetLink,
          onsite_location: opts.onsiteLocation,
          tutor_portal_url: opts.urls.tutorReportUrl,
          learner_portal_url: opts.urls.learnerFeedbackUrl,
          tutor_reschedule_url: opts.urls.tutorRescheduleUrl,
          learner_reschedule_url: opts.urls.learnerRescheduleUrl,
          reminder_label: r.label,
          recipient_role: isTutor ? 'tutor' : 'learner',
        },
      });
    }
  }
  if (rows.length) await admin.from('scheduled_notifications').insert(rows);
}

/** Drop pending reminders for a session and schedule fresh ones at the new time. */
export async function replaceSessionRemindersAfterReschedule(
  admin: SupabaseClient,
  sessionId: string
) {
  const { data: session } = await admin
    .from('individual_sessions')
    .select(
      'id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time, delivery_mode, meet_link, onsite_location, offline_scheduling_period_id'
    )
    .eq('id', sessionId)
    .maybeSingle();
  if (!session?.scheduled_date || !session.scheduled_time || !session.tutor_id) return;

  await admin
    .from('scheduled_notifications')
    .delete()
    .eq('related_id', sessionId)
    .eq('status', 'pending');

  const familyUserId = session.parent_id || session.learner_id;
  if (!familyUserId) return;

  const urls = buildSessionPortalUrls(sessionId);
  await scheduleSessionNotifications(admin, {
    sessionId,
    occurrence: { date: session.scheduled_date, time: String(session.scheduled_time).slice(0, 8) },
    subject: session.subject || 'PrepSkul session',
    tutorUserId: session.tutor_id,
    familyUserId,
    deliveryMode: session.delivery_mode,
    meetLink: session.meet_link,
    onsiteLocation: session.onsite_location,
    urls,
  });
}

export { scheduleSessionNotifications };
