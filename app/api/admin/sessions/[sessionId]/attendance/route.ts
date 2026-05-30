import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { releaseSessionEarningsToActive } from '@/lib/services/release-session-earnings';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { notifyPartiesAfterAdminMarkedAttendance } from '@/lib/offline-portal-notifications';
import { refreshTutorPublicStats, computeTutorPublicStats } from '@/lib/services/tutor-public-stats';

const schema = z.object({
  attended: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }
    const { sessionId } = await params;
    const { attended } = parsed.data;

    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    const { data: session, error: sErr } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, scheduled_date, scheduled_time, subject, status')
      .eq('id', sessionId)
      .maybeSingle();
    if (sErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const status = attended ? 'evaluated' : 'not_attended';
    const { error: upErr } = await supabase
      .from('individual_sessions')
      .update({ status, updated_at: nowIso })
      .eq('id', sessionId);
    if (upErr) throw upErr;

    if (attended && session.tutor_id) {
      try {
        await releaseSessionEarningsToActive(supabase, sessionId, user.id);
      } catch (releaseErr) {
        console.warn('[attendance] releaseSessionEarningsToActive skipped', releaseErr);
      }

      try {
        await refreshTutorPublicStats(supabase, session.tutor_id);
      } catch (e) {
        console.warn('[attendance] refresh_tutor_public_stats skipped, using fallback', e);
        try {
          const computed = await computeTutorPublicStats(supabase, session.tutor_id);
          await supabase
            .from('tutor_profiles')
            .update({
              total_sessions_completed: computed.totalSessions,
              scheduled_sessions_count: computed.scheduledSessions,
              total_students: computed.totalStudents,
              offline_tutor_earnings_xaf: computed.offlineEarningsXaf,
            })
            .eq('user_id', session.tutor_id);
        } catch (fallbackErr) {
          console.warn('[attendance] tutor_profiles fallback update skipped', fallbackErr);
        }
      }
    }

    await supabase.from('session_tutor_completion_reports').upsert(
      {
        individual_session_id: sessionId,
        tutor_user_id: session.tutor_id,
        attended,
        completed_at: attended ? nowIso : null,
      },
      { onConflict: 'individual_session_id' }
    );

    const mail = await notifyPartiesAfterAdminMarkedAttendance({
      sessionId,
      attended,
      scheduledDate: session.scheduled_date,
      scheduledTime: session.scheduled_time,
      subject: session.subject,
    });
    const emailsSent = [...(mail.recipientEmails || []), ...(mail.opsEmails || [])];

    await supabase.from('admin_operational_events').insert({
      event_type: 'admin_marked_session_attendance',
      subject: `Admin marked attendance for session ${sessionId}`,
      payload: { session_id: sessionId, attended, status },
      emails_sent: emailsSent,
    });

    return NextResponse.json({ success: true, status, attended });
  } catch (error: any) {
    console.error('admin mark attendance error', error);
    return NextResponse.json({ error: error?.message || 'Failed to update session attendance' }, { status: 500 });
  }
}
