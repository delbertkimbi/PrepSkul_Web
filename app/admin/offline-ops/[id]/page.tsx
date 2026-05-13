import { redirect } from 'next/navigation';
import AdminNav from '../../components/AdminNav';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import OfflineOpsDetailClient from './OfflineOpsDetailClient';

export default async function OfflineOperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminOk = await isAdmin(user.id);
  if (!adminOk) redirect('/admin/login');

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: record, error } = await supabase
    .from('offline_operations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!record || error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 p-4 text-red-800">
            Offline operation not found.
          </div>
        </main>
      </div>
    );
  }

  const recordAny = record as any;
  const primaryUserId: string | null = recordAny.primary_user_id || null;
  const learnerUserId: string | null = recordAny.learner_user_id || null;
  const tutorUserId: string | null = recordAny.tutor_user_id || null;
  const recurringSessionId: string | null = recordAny.recurring_session_id || null;
  const offlineRunId: string | null = recordAny.offline_run_id || null;

  let sessionIdsFromRun: string[] = [];
  if (offlineRunId) {
    const { data: runRow } = await supabase
      .from('offline_onboarding_runs')
      .select('metadata')
      .eq('id', offlineRunId)
      .maybeSingle();
    const meta = (runRow?.metadata || {}) as { session_ids?: string[] };
    if (Array.isArray(meta.session_ids)) sessionIdsFromRun = meta.session_ids.filter(Boolean);
  }

  const ids = [primaryUserId, learnerUserId, tutorUserId].filter(Boolean) as string[];
  const { data: profiles } = ids.length
    ? await supabase.from('profiles').select('id, full_name, email, phone_number, user_type').in('id', ids)
    : { data: [] as any[] };

  const profileById = new Map((profiles || []).map((p: any) => [p.id, p]));

  let sessions: any[] | null = null;

  if (sessionIdsFromRun.length) {
    const { data } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, recurring_session_id, scheduled_date, scheduled_time, duration_minutes, subject, location, status, created_at, updated_at')
      .in('id', sessionIdsFromRun)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
    sessions = data;
  } else if (recurringSessionId) {
    const { data } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, recurring_session_id, scheduled_date, scheduled_time, duration_minutes, subject, location, status, created_at, updated_at')
      .eq('recurring_session_id', recurringSessionId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(300);
    sessions = data;
  } else if (learnerUserId && tutorUserId) {
    const { data } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, recurring_session_id, scheduled_date, scheduled_time, duration_minutes, subject, location, status, created_at, updated_at')
      .eq('learner_id', learnerUserId)
      .eq('tutor_id', tutorUserId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(300);
    sessions = data;
  } else if (learnerUserId) {
    const { data } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, recurring_session_id, scheduled_date, scheduled_time, duration_minutes, subject, location, status, created_at, updated_at')
      .eq('learner_id', learnerUserId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(300);
    sessions = data;
  } else if (primaryUserId && tutorUserId) {
    const { data } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, recurring_session_id, scheduled_date, scheduled_time, duration_minutes, subject, location, status, created_at, updated_at')
      .eq('parent_id', primaryUserId)
      .eq('tutor_id', tutorUserId)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(300);
    sessions = data;
  } else {
    sessions = [];
  }
  const sessionIds = (sessions || []).map((s: any) => s.id);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  const [{ data: reports }, { data: feedbacks }, { data: dailyReminders }] = await Promise.all([
    sessionIds.length
      ? supabase
          .from('session_tutor_completion_reports')
          .select('individual_session_id, attended, completed_at, created_at, topics_covered, learner_engagement, issues')
          .in('individual_session_id', sessionIds)
      : Promise.resolve({ data: [] as any[] }),
    sessionIds.length
      ? supabase
          .from('session_learner_feedback')
          .select('individual_session_id, rating, comment, created_at')
          .in('individual_session_id', sessionIds)
      : Promise.resolve({ data: [] as any[] }),
    sessionIds.length
      ? supabase
          .from('scheduled_notifications')
          .select('id, user_id, notification_type, title, message, scheduled_for, status, related_id')
          .eq('notification_type', 'session_reminder')
          .in('related_id', sessionIds)
          .gte('scheduled_for', startOfToday.toISOString())
          .lte('scheduled_for', endOfToday.toISOString())
          .order('scheduled_for', { ascending: true })
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const reportBySession = new Map((reports || []).map((r: any) => [r.individual_session_id, r]));
  const feedbackBySession = new Map((feedbacks || []).map((f: any) => [f.individual_session_id, f]));

  const sessionsWithInsights = (sessions || [])
    .map((s: any) => ({
      ...s,
      tutorReport: reportBySession.get(s.id) || null,
      learnerFeedback: feedbackBySession.get(s.id) || null,
    }))
    .sort((a: any, b: any) => {
      const da = `${a.scheduled_date || ''} ${a.scheduled_time || ''}`;
      const db = `${b.scheduled_date || ''} ${b.scheduled_time || ''}`;
      return da.localeCompare(db);
    });

  const sessionIdSet = new Set(sessionIds);
  const lastManualReminderAtBySession: Record<string, string> = {};
  if (sessionIds.length) {
    const { data: reminderEvents } = await supabase
      .from('admin_operational_events')
      .select('payload, created_at')
      .eq('event_type', 'admin_triggered_session_reminder')
      .order('created_at', { ascending: false })
      .limit(400);
    for (const row of reminderEvents || []) {
      const sid = (row.payload as { session_id?: string } | null)?.session_id;
      if (!sid || !sessionIdSet.has(sid) || lastManualReminderAtBySession[sid]) continue;
      lastManualReminderAtBySession[sid] = row.created_at as string;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <OfflineOpsDetailClient
          record={recordAny}
          sessions={sessionsWithInsights}
          dailyReminders={dailyReminders || []}
          lastManualReminderAtBySession={lastManualReminderAtBySession}
          profiles={{
            primary: primaryUserId ? profileById.get(primaryUserId) || null : null,
            learner: learnerUserId ? profileById.get(learnerUserId) || null : null,
            tutor: tutorUserId ? profileById.get(tutorUserId) || null : null,
          }}
        />
      </main>
    </div>
  );
}
