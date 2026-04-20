import { NextResponse } from 'next/server';
import { requireAdminOrDeny } from '../../analytics/_lib';

export const runtime = 'nodejs';

function suggestReply(rating: number, comment: string) {
  const c = (comment || '').toLowerCase();
  if (rating >= 4) {
    return 'Thank you for the positive feedback. We are glad the session helped. We will keep improving and maintain this quality.';
  }
  if (c.includes('late') || c.includes('delay')) {
    return 'Thank you for your feedback. We apologize for the time issue and we have reminded the tutor to join on time for upcoming sessions.';
  }
  if (rating <= 2) {
    return 'Thank you for the feedback. We are sorry for this experience. We are reviewing the report and will share a corrective plan immediately.';
  }
  return 'Thank you for the feedback. We appreciate your input and will use it to improve the next sessions.';
}

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

    const [sessionsRes, profilesRes] = await Promise.all([
      supabaseAdmin
        .from('individual_sessions')
        .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time')
        .in('id', sessionIds),
      supabaseAdmin.from('profiles').select('id, full_name, email, phone_number').in('id', authorIds),
    ]);

    const sessionMap = new Map((sessionsRes.data || []).map((s: any) => [s.id, s]));
    const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));

    const mapped = rows.map((f: any) => {
      const session = sessionMap.get(f.individual_session_id) || null;
      const author = f.author_user_id ? profileMap.get(f.author_user_id) : null;
      const reply = suggestReply(Number(f.rating || 0), f.comment || '');
      const wa = (author?.phone_number || '').replace(/[^\d]/g, '');
      const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(reply)}` : null;
      return {
        id: f.id,
        createdAt: f.created_at,
        rating: f.rating,
        comment: f.comment,
        suggestedReply: reply,
        whatsappLink: waLink,
        author,
        session,
      };
    });

    return NextResponse.json({ rows: mapped });
  } catch (err) {
    console.error('feedback inbox error', err);
    return NextResponse.json({ error: 'Failed to load feedback inbox' }, { status: 500 });
  }
}

