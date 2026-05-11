import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { markTokenUsed, verifyPortalToken } from '@/lib/services/session-portal-token';
import { notifyOpsTutorReportSubmitted } from '@/lib/session-email-notifications';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(20),
  attended: z.boolean(),
  topicsCovered: z.string().optional(),
  learnerEngagement: z.string().optional(),
  issues: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }
    const { token, attended, topicsCovered, learnerEngagement, issues } = parsed.data;
    const verified = await verifyPortalToken(token, 'tutor_report');

    const supabase = getSupabaseAdmin();
    const { data: session } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id')
      .eq('id', verified.individual_session_id)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    await supabase.from('session_tutor_completion_reports').upsert(
      {
        individual_session_id: session.id,
        tutor_user_id: session.tutor_id,
        attended,
        topics_covered: topicsCovered || null,
        learner_engagement: learnerEngagement || null,
        issues: issues || null,
        completed_at: attended ? new Date().toISOString() : null,
      },
      { onConflict: 'individual_session_id' }
    );

    if (attended) {
      await supabase.from('individual_sessions').update({ status: 'completed' }).eq('id', session.id);
      // Best-effort increment if column exists.
      const { data: tutorProfile } = await supabase
        .from('tutor_profiles')
        .select('id, total_sessions_completed')
        .eq('user_id', session.tutor_id)
        .maybeSingle();
      if (tutorProfile) {
        const next = Number((tutorProfile as any).total_sessions_completed || 0) + 1;
        await supabase.from('tutor_profiles').update({ total_sessions_completed: next }).eq('id', tutorProfile.id);
      }
    }

    const ops = await notifyOpsTutorReportSubmitted({
      sessionId: session.id,
      tutorId: session.tutor_id,
      attended,
      topicsCovered: topicsCovered || null,
      learnerEngagement: learnerEngagement || null,
      issues: issues || null,
    });
    const emailsSent =
      ops && 'to' in ops && ops.ok && Array.isArray((ops as { to: string[] }).to) ? (ops as { to: string[] }).to : [];

    await supabase.from('admin_operational_events').insert({
      event_type: 'tutor_session_report_submitted',
      subject: `Tutor submitted report for session ${session.id}`,
      payload: { session_id: session.id, tutor_id: session.tutor_id, attended },
      emails_sent: emailsSent,
    });

    await markTokenUsed(verified.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('portal tutor session report error', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit session report' }, { status: 500 });
  }
}

