import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { markTokenUsed, verifyPortalToken } from '@/lib/services/session-portal-token';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(20),
  rating: z.number().min(1).max(5),
  comment: z.string().min(3),
  whatsappNumber: z.string().optional(),
});

function suggestionFromFeedback(rating: number, comment: string) {
  if (rating >= 4) {
    return `Thank you for your feedback. We are glad the session was helpful. We will keep the same quality and follow up with your next lesson plan.`;
  }
  if (rating === 3) {
    return `Thank you for your honest feedback. We will improve the pacing and session structure in the next class.`;
  }
  return `Thank you for your feedback. We are sorry your experience was not ideal. We will review the tutor report and contact you with an improvement plan immediately.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const { token, rating, comment, whatsappNumber } = parsed.data;
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

    const suggestedReply = suggestionFromFeedback(rating, comment);
    const waTarget = (whatsappNumber || '').replace(/[^\d]/g, '');
    const whatsappLink = waTarget
      ? `https://wa.me/${waTarget}?text=${encodeURIComponent(suggestedReply)}`
      : null;

    await supabase.from('admin_operational_events').insert({
      event_type: 'learner_feedback_submitted',
      subject: `Learner feedback captured for session ${session.id}`,
      payload: { session_id: session.id, rating, comment, suggested_reply: suggestedReply, whatsapp_link: whatsappLink },
      emails_sent: [],
    });

    await markTokenUsed(verified.id);

    return NextResponse.json({
      success: true,
      suggestedReply,
      whatsappLink,
    });
  } catch (error: any) {
    console.error('portal learner session feedback error', error);
    return NextResponse.json({ error: error?.message || 'Failed to submit feedback' }, { status: 500 });
  }
}

