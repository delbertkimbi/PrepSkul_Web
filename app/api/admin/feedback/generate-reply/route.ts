import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminOrDeny } from '../../analytics/_lib';
import {
  buildWhatsAppUrl,
  composeAdminFeedbackReply,
  type TutorReportInput,
} from '@/lib/services/admin-feedback-reply-engine';

export const runtime = 'nodejs';

const schema = z.object({
  feedbackId: z.string().uuid(),
});

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

    const { data: session } = await supabaseAdmin
      .from('individual_sessions')
      .select('id, tutor_id, subject, scheduled_date, scheduled_time, parent_id, learner_id')
      .eq('id', feedback.individual_session_id)
      .maybeSingle();

    const { data: author } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone_number')
      .eq('id', feedback.author_user_id)
      .maybeSingle();

    let tutorReport: TutorReportInput = null;
    let tutorName: string | null = null;
    if (session?.id) {
      const { data: tr } = await supabaseAdmin
        .from('session_tutor_completion_reports')
        .select('attended, topics_covered, learner_engagement, issues, subject_taught')
        .eq('individual_session_id', session.id)
        .maybeSingle();
      if (tr) tutorReport = tr;
    }
    if (session?.tutor_id) {
      const { data: tutor } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', session.tutor_id)
        .maybeSingle();
      tutorName = tutor?.full_name || null;
    }

    const familyPhone =
      author?.phone_number ||
      (session?.parent_id
        ? (
            await supabaseAdmin
              .from('profiles')
              .select('phone_number')
              .eq('id', session.parent_id)
              .maybeSingle()
          ).data?.phone_number
        : null);

    const reply = composeAdminFeedbackReply(
      { rating: Number(feedback.rating || 0), comment: feedback.comment || '' },
      tutorReport,
      {
        recipientName: author?.full_name,
        tutorName,
        sessionSubject: session?.subject,
        sessionDate: session?.scheduled_date,
      }
    );

    const waLink = buildWhatsAppUrl(familyPhone, reply);

    await supabaseAdmin.from('admin_operational_events').insert({
      event_type: 'feedback_reply_generated',
      subject: `Reply generated for feedback ${feedback.id}`,
      payload: {
        feedback_id: feedback.id,
        session_id: feedback.individual_session_id,
        reply,
        whatsapp_link: waLink,
        themes_used: true,
      },
      emails_sent: [],
    });

    return NextResponse.json({
      success: true,
      suggestedReply: reply,
      whatsappLink: waLink,
      hasTutorReport: !!tutorReport,
    });
  } catch (err: unknown) {
    console.error('generate feedback reply error', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to generate reply' }, { status: 500 });
  }
}
