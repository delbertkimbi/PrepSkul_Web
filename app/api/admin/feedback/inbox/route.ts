import { NextResponse } from 'next/server';
import { requireAdminOrDeny } from '../../analytics/_lib';
import { buildWhatsAppUrl, composeAdminFeedbackReply } from '@/lib/services/admin-feedback-reply-engine';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const { data: feedbackRows, error } = await supabaseAdmin
      .from('session_learner_feedback')
      .select('id, individual_session_id, author_user_id, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(300);
    if (error) throw error;

    const rows = feedbackRows || [];
    const sessionIds = [...new Set(rows.map((r) => r.individual_session_id))];
    const authorIds = [...new Set(rows.map((r) => r.author_user_id).filter(Boolean))];

    const [sessionsRes, profilesRes, reportsRes] = await Promise.all([
      supabaseAdmin
        .from('individual_sessions')
        .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time')
        .in('id', sessionIds.length ? sessionIds : ['00000000-0000-0000-0000-000000000000']),
      supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone_number')
        .in('id', authorIds.length ? authorIds : ['00000000-0000-0000-0000-000000000000']),
      supabaseAdmin
        .from('session_tutor_completion_reports')
        .select('individual_session_id, attended, topics_covered, learner_engagement, issues, subject_taught')
        .in('individual_session_id', sessionIds.length ? sessionIds : ['00000000-0000-0000-0000-000000000000']),
    ]);

    const sessionMap = new Map((sessionsRes.data || []).map((s) => [s.id, s]));
    const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]));
    const reportMap = new Map((reportsRes.data || []).map((r) => [r.individual_session_id, r]));

    const tutorIds = [...new Set((sessionsRes.data || []).map((s) => s.tutor_id).filter(Boolean))];
    const { data: tutorProfiles } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', tutorIds.length ? tutorIds : ['00000000-0000-0000-0000-000000000000']);
    const tutorNameMap = new Map((tutorProfiles || []).map((t) => [t.id, t.full_name]));

    const mapped = rows.map((f) => {
      const session = sessionMap.get(f.individual_session_id) || null;
      const author = f.author_user_id ? profileMap.get(f.author_user_id) : null;
      const tutorReport = reportMap.get(f.individual_session_id) || null;
      const tutorName = session?.tutor_id ? tutorNameMap.get(session.tutor_id) : null;

      const reply = composeAdminFeedbackReply(
        { rating: Number(f.rating || 0), comment: f.comment || '' },
        tutorReport,
        {
          recipientName: author?.full_name,
          tutorName: tutorName || null,
          sessionSubject: session?.subject,
          sessionDate: session?.scheduled_date,
        }
      );

      const phone =
        author?.phone_number ||
        (session?.parent_id ? profileMap.get(session.parent_id)?.phone_number : null);
      const waLink = buildWhatsAppUrl(phone, reply);

      return {
        id: f.id,
        createdAt: f.created_at,
        rating: f.rating,
        comment: f.comment,
        suggestedReply: reply,
        whatsappLink: waLink,
        hasTutorReport: !!tutorReport,
        tutorReport: tutorReport
          ? {
              attended: tutorReport.attended,
              topics_covered: tutorReport.topics_covered,
              learner_engagement: tutorReport.learner_engagement,
              issues: tutorReport.issues,
            }
          : null,
        author,
        session,
        tutorName,
      };
    });

    return NextResponse.json({ rows: mapped });
  } catch (err) {
    console.error('feedback inbox error', err);
    return NextResponse.json({ error: 'Failed to load feedback inbox' }, { status: 500 });
  }
}
