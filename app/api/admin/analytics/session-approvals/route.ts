import { NextResponse } from 'next/server';
import { requireAdminOrDeny } from '../_lib';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const { data: pending, error } = await supabaseAdmin
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time, created_at, status')
      .in('status', ['pending', 'pending_tutor_approval'])
      .order('created_at', { ascending: true })
      .limit(200);

    if (error) throw error;

    const rows = pending || [];
    const tutorIds = [...new Set(rows.map((r) => r.tutor_id).filter(Boolean))];
    const learnerIds = [...new Set(rows.map((r) => (r.learner_id || r.parent_id)).filter(Boolean))] as string[];

    const [tutorsRes, learnersRes, remindersRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, full_name, email').in('id', tutorIds),
      supabaseAdmin.from('profiles').select('id, full_name, email').in('id', learnerIds),
      supabaseAdmin
        .from('admin_operational_events')
        .select('event_type, payload, created_at')
        .in('event_type', ['tutor_pending_approval_reminder', 'manual_session_approval_reminder'])
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    const tutorMap = new Map((tutorsRes.data || []).map((p: any) => [p.id, p]));
    const learnerMap = new Map((learnersRes.data || []).map((p: any) => [p.id, p]));
    const reminderMap = new Map<string, string>();
    for (const e of remindersRes.data || []) {
      const sid = (e.payload as any)?.session_id;
      if (sid && !reminderMap.has(sid)) reminderMap.set(sid, e.created_at);
    }

    const now = Date.now();
    const detailed = rows.map((s: any) => {
      const createdAtMs = new Date(s.created_at).getTime();
      const hoursPending = Math.floor((now - createdAtMs) / (1000 * 60 * 60));
      const learnerId = s.learner_id || s.parent_id;
      return {
        sessionId: s.id,
        status: s.status,
        subject: s.subject,
        scheduledDate: s.scheduled_date,
        scheduledTime: s.scheduled_time,
        createdAt: s.created_at,
        hoursPending,
        tutor: tutorMap.get(s.tutor_id) || null,
        learner: learnerMap.get(learnerId) || null,
        reminderSentAt: reminderMap.get(s.id) || null,
      };
    });

    return NextResponse.json({
      totals: {
        pendingCount: detailed.length,
        overdue24h: detailed.filter((d) => d.hoursPending >= 24).length,
        reminderSent: detailed.filter((d) => d.reminderSentAt).length,
      },
      rows: detailed,
    });
  } catch (error) {
    console.error('admin analytics session approvals error', error);
    return NextResponse.json({ error: 'Failed to load session approval analytics' }, { status: 500 });
  }
}

