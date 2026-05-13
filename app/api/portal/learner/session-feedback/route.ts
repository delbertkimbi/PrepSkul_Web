import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { markTokenUsed, verifyPortalToken } from '@/lib/services/session-portal-token';
import { notifyOpsLearnerFeedbackSubmitted } from '@/lib/offline-portal-notifications';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(20),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
});

const LEARNER_THANK_YOU =
  'Thank you for your feedback. We will review it to make your learning experience the best.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { token, rating, comment } = parsed.data;
    const verified = await verifyPortalToken(token, 'learner_feedback');
    const supabase = getSupabaseAdmin();

    const { data: session } = await supabase
      .from('individual_sessions')
      .select('id, learner_id, parent_id, tutor_id')
      .eq('id', verified.individual_session_id)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    await supabase.from('session_learner_feedback').insert({
      individual_session_id: session.id,
      author_user_id: session.learner_id || session.parent_id,
      rating,
      comment,
    });

    const ops = await notifyOpsLearnerFeedbackSubmitted({
      sessionId: session.id,
      rating,
      comment,
    });
    const emailsSent = ops.ok && 'to' in ops && ops.to ? ops.to : [];

    await supabase.from('admin_operational_events').insert({
      event_type: 'learner_feedback_submitted',
      subject: `Learner feedback captured for session ${session.id}`,
      payload: { session_id: session.id, rating, comment },
      emails_sent: emailsSent,
    });

    await markTokenUsed(verified.id);

    return NextResponse.json({
      success: true,
      thankYouNote: LEARNER_THANK_YOU,
    });
  } catch (error: any) {
    console.error('portal learner session feedback error', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
