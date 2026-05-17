import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionPortalAccessToken, buildSessionPortalUrls } from '@/lib/services/session-portal-access';
import { sendRescheduleRequestEmail } from '@/lib/offline-session-emails';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(20),
  reason: z.string().min(3),
  proposedDate: z.string().min(8),
  proposedTime: z.string().min(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const access = verifySessionPortalAccessToken(parsed.data.token);
    const supabase = getSupabaseAdmin();

    const { data: session } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id')
      .eq('id', access.sessionId)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const requesterId =
      access.role === 'tutor' ? session.tutor_id : session.parent_id || session.learner_id;

    const { data: existingPending } = await supabase
      .from('session_reschedule_requests')
      .select('id')
      .eq('individual_session_id', session.id)
      .eq('status', 'pending')
      .maybeSingle();
    if (existingPending) {
      return NextResponse.json(
        { error: 'A reschedule request is already pending for this session.' },
        { status: 409 }
      );
    }

    await supabase.from('session_reschedule_requests').insert({
      individual_session_id: session.id,
      requested_by_user_id: requesterId,
      reason: parsed.data.reason,
      proposed_date: parsed.data.proposedDate,
      proposed_time: parsed.data.proposedTime.length === 5 ? `${parsed.data.proposedTime}:00` : parsed.data.proposedTime,
      status: 'pending',
    });

    const counterpartyId = access.role === 'tutor' ? session.parent_id || session.learner_id : session.tutor_id;
    const { data: requester } = await supabase.from('profiles').select('full_name').eq('id', requesterId).maybeSingle();
    const { data: counter } = await supabase.from('profiles').select('full_name, email').eq('id', counterpartyId).maybeSingle();

    if (counter?.email) {
      const role = access.role === 'tutor' ? 'learner' : 'tutor';
      const urls = buildSessionPortalUrls(session.id);
      const portalUrl = role === 'tutor' ? urls.tutorReportUrl : urls.learnerFeedbackUrl;
      await sendRescheduleRequestEmail({
        to: counter.email,
        recipientName: counter.full_name || 'there',
        requesterName: requester?.full_name || 'A participant',
        reason: parsed.data.reason,
        proposedDate: parsed.data.proposedDate,
        proposedTime: parsed.data.proposedTime,
        portalUrl,
      });
    }

    return NextResponse.json({ success: true, message: 'Reschedule request submitted. Awaiting approval from the other participant.' });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
