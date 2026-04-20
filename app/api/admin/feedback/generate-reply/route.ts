import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminOrDeny } from '../../analytics/_lib';

export const runtime = 'nodejs';

const schema = z.object({
  feedbackId: z.string().uuid(),
});

function suggestReply(rating: number, comment: string) {
  const c = (comment || '').toLowerCase();
  if (rating >= 4) return 'Thank you for the positive feedback. We are glad the session helped and will maintain this quality.';
  if (c.includes('late') || c.includes('delay')) return 'Thank you for the feedback. We apologize for the delay and have addressed punctuality with the tutor.';
  if (rating <= 2) return 'Thank you for your feedback. We are sorry for this experience and are escalating this case for immediate correction.';
  return 'Thank you for the feedback. We appreciate your input and will improve the next sessions.';
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { data: feedback } = await supabaseAdmin
      .from('session_learner_feedback')
      .select('id, individual_session_id, author_user_id, rating, comment')
      .eq('id', parsed.data.feedbackId)
      .maybeSingle();
    if (!feedback) return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });

    const { data: author } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone_number')
      .eq('id', feedback.author_user_id)
      .maybeSingle();

    const reply = suggestReply(Number(feedback.rating || 0), feedback.comment || '');
    const waTarget = (author?.phone_number || '').replace(/[^\d]/g, '');
    const waLink = waTarget ? `https://wa.me/${waTarget}?text=${encodeURIComponent(reply)}` : null;

    await supabaseAdmin.from('admin_operational_events').insert({
      event_type: 'feedback_reply_generated',
      subject: `Reply generated for feedback ${feedback.id}`,
      payload: { feedback_id: feedback.id, session_id: feedback.individual_session_id, reply, whatsapp_link: waLink },
      emails_sent: [],
    });

    return NextResponse.json({ success: true, suggestedReply: reply, whatsappLink: waLink });
  } catch (err: any) {
    console.error('generate feedback reply error', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate reply' }, { status: 500 });
  }
}

