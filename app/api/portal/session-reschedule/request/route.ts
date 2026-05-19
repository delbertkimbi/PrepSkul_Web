import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionPortalAccessToken } from '@/lib/services/session-portal-access';
import {
  fetchPendingRescheduleRequest,
  insertPendingRescheduleRequest,
} from '@/lib/services/session-reschedule';
import { emailRescheduleRequestToCounterparty } from '@/lib/services/session-reschedule-notify';

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
      .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time')
      .eq('id', access.sessionId)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const requesterId =
      access.role === 'tutor' ? session.tutor_id : session.parent_id || session.learner_id;

    const { row: existingPending } = await fetchPendingRescheduleRequest(supabase, session.id);
    if (existingPending) {
      return NextResponse.json(
        { error: 'A reschedule request is already pending for this session.' },
        { status: 409 }
      );
    }

    if (!requesterId) {
      return NextResponse.json({ error: 'Session is missing participant information.' }, { status: 400 });
    }

    const proposedTime =
      parsed.data.proposedTime.length === 5 ? `${parsed.data.proposedTime}:00` : parsed.data.proposedTime;

    const inserted = await insertPendingRescheduleRequest(supabase, {
      sessionId: session.id,
      requestedByUserId: requesterId,
      reason: parsed.data.reason,
      proposedDate: parsed.data.proposedDate,
      proposedTime,
    });
    if (!inserted.ok) {
      const hint =
        /relation|does not exist|42P01/i.test(inserted.error) ?
          ' Run supabase/offline_ops_phase2_schema_fix.sql in Supabase.'
        : '';
      return NextResponse.json(
        { error: `Could not save reschedule request: ${inserted.error}${hint}` },
        { status: 500 }
      );
    }

    const { data: requester } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', requesterId)
      .maybeSingle();

    const emailResult = await emailRescheduleRequestToCounterparty(supabase, {
      session,
      requesterRole: access.role,
      requesterName: requester?.full_name || 'A participant',
      reason: parsed.data.reason,
      proposedDate: parsed.data.proposedDate,
      proposedTime: parsed.data.proposedTime,
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.sent,
      emailError: emailResult.error,
      message: emailResult.sent
        ? 'Reschedule request submitted. The other participant was emailed to approve or decline.'
        : 'Reschedule request submitted. We could not email the other participant — share your session link with them directly.',
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
