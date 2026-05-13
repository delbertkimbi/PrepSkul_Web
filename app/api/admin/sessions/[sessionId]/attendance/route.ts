import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { notifyPartiesAfterAdminMarkedAttendance } from '@/lib/offline-portal-notifications';

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
      .select('id, tutor_id, learner_id, parent_id, scheduled_date, scheduled_time, subject')
      .eq('id', sessionId)
      .maybeSingle();
    if (sErr || !session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const status = attended ? 'completed' : 'scheduled';
    const { error: upErr } = await supabase
      .from('individual_sessions')
      .update({ status, updated_at: nowIso })
      .eq('id', sessionId);
    if (upErr) throw upErr;

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
