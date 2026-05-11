import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { notifyPartiesAdminMarkedAttendance } from '@/lib/session-email-notifications';

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
      .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time')
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

    const emailsSent: string[] = [];
    if (attended) {
      const ids = [session.tutor_id, session.learner_id, session.parent_id].filter(Boolean) as string[];
      const { data: profiles } = ids.length
        ? await supabase.from('profiles').select('id, email, full_name').in('id', ids)
        : { data: [] as { id: string; email: string | null }[] };
      const emailById = new Map((profiles || []).map((p) => [p.id, (p.email || '').trim() || null]));

      const scheduledLabel = `${session.scheduled_date || ''} ${session.scheduled_time || ''}`.trim();
      const { partyResults, ops } = await notifyPartiesAdminMarkedAttendance({
        sessionId,
        attended,
        subjectLabel: (session as { subject?: string }).subject || 'Session',
        scheduledLabel,
        tutorEmail: emailById.get(session.tutor_id) || null,
        learnerEmail: session.learner_id ? emailById.get(session.learner_id) || null : null,
        parentEmail: session.parent_id ? emailById.get(session.parent_id) || null : null,
      });
      if (ops && 'to' in ops && ops.ok && Array.isArray((ops as { to: string[] }).to)) {
        emailsSent.push(...(ops as { to: string[] }).to);
      }
      for (const r of partyResults) {
        if (r.ok && r.to.length) emailsSent.push(...r.to);
      }
    }

    await supabase.from('admin_operational_events').insert({
      event_type: 'admin_marked_session_attendance',
      subject: `Admin marked attendance for session ${sessionId}`,
      payload: { session_id: sessionId, attended, status },
      emails_sent: emailsSent.length ? emailsSent : [],
    });

    return NextResponse.json({ success: true, status, attended, emailsSent });
  } catch (error: any) {
    console.error('admin mark attendance error', error);
    return NextResponse.json({ error: error?.message || 'Failed to update session attendance' }, { status: 500 });
  }
}
