import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionPortalAccessToken, buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import { sendRescheduleDecisionEmail } from '@/lib/offline-session-emails';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(20),
  requestId: z.string().uuid(),
  accept: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const access = verifySessionPortalAccessToken(parsed.data.token);
    const supabase = getSupabaseAdmin();

    const { data: reqRow } = await supabase
      .from('session_reschedule_requests')
      .select('*')
      .eq('id', parsed.data.requestId)
      .eq('individual_session_id', access.sessionId)
      .eq('status', 'pending')
      .maybeSingle();
    if (!reqRow) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

    const { data: session } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id')
      .eq('id', access.sessionId)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const responderId =
      access.role === 'tutor' ? session.tutor_id : session.parent_id || session.learner_id;
    if (reqRow.requested_by_user_id === responderId) {
      return NextResponse.json({ error: 'You cannot respond to your own request' }, { status: 400 });
    }

    const status = parsed.data.accept ? 'accepted' : 'rejected';
    await supabase
      .from('session_reschedule_requests')
      .update({
        status,
        responded_by_user_id: responderId,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', reqRow.id);

    if (parsed.data.accept) {
      await supabase
        .from('individual_sessions')
        .update({
          scheduled_date: reqRow.proposed_date,
          scheduled_time: reqRow.proposed_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);
    }

    const { data: requester } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', reqRow.requested_by_user_id)
      .maybeSingle();

    if (requester?.email) {
      const urls = buildSessionPortalUrls(session.id);
      const portalUrl =
        reqRow.requested_by_user_id === session.tutor_id ? urls.tutorReportUrl : urls.learnerFeedbackUrl;
      await sendRescheduleDecisionEmail({
        to: requester.email,
        recipientName: requester.full_name || 'there',
        accepted: parsed.data.accept,
        proposedDate: reqRow.proposed_date,
        proposedTime: String(reqRow.proposed_time),
        portalUrl: parsed.data.accept ? portalUrl : undefined,
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
