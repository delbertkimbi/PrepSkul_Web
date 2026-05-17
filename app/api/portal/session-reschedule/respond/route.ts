import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionPortalAccessToken, buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import { sendRescheduleDecisionEmail } from '@/lib/offline-session-emails';
import { getReschedulePortalFlags } from '@/lib/services/session-reschedule';
import { resolveParticipantContact } from '@/lib/services/session-reschedule-notify';

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

    const portalRole = access.role === 'tutor' ? ('tutor' as const) : ('learner' as const);
    const { canRespondToReschedule } = getReschedulePortalFlags(session, reqRow, portalRole);
    if (!canRespondToReschedule) {
      return NextResponse.json({ error: 'You cannot respond to this reschedule request' }, { status: 400 });
    }

    const responderId =
      access.role === 'tutor' ? session.tutor_id : session.parent_id || session.learner_id;

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

    const requesterContact = await resolveParticipantContact(supabase, reqRow.requested_by_user_id);
    if (requesterContact) {
      const urls = buildSessionPortalUrls(session.id);
      const requesterIsTutor =
        String(reqRow.requested_by_user_id).toLowerCase() === String(session.tutor_id || '').toLowerCase();
      const portalUrl = requesterIsTutor ? urls.tutorReportUrl : urls.learnerFeedbackUrl;
      await sendRescheduleDecisionEmail({
        to: requesterContact.email,
        recipientName: requesterContact.fullName,
        accepted: parsed.data.accept,
        proposedDate: reqRow.proposed_date,
        proposedTime: String(reqRow.proposed_time),
        portalUrl,
        recipientRole: requesterIsTutor ? 'tutor' : 'learner',
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
