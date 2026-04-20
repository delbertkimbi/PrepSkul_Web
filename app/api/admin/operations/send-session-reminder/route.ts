import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const schema = z.object({
  sessionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await isAdmin(user.id);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data: s } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time, created_at, status')
      .eq('id', parsed.data.sessionId)
      .maybeSingle();
    if (!s) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (!['pending', 'pending_tutor_approval'].includes((s.status || '').toLowerCase())) {
      return NextResponse.json({ error: 'Session is not pending tutor approval' }, { status: 400 });
    }

    const learnerId = s.learner_id || s.parent_id;
    const [tutor, learner] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email').eq('id', s.tutor_id).maybeSingle(),
      supabase.from('profiles').select('id, full_name, email').eq('id', learnerId).maybeSingle(),
    ]);

    const title = 'Session approval reminder';
    const message = `Please approve pending session request for ${learner.data?.full_name || 'your learner'} (${s.subject || 'subject'}).`;

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: s.tutor_id,
        type: 'session_approval_reminder',
        title,
        message,
        priority: 'high',
        actionUrl: '/sessions',
        actionText: 'Review Session Requests',
        metadata: {
          session_id: s.id,
          scheduled_date: s.scheduled_date,
          scheduled_time: s.scheduled_time,
          learner_name: learner.data?.full_name,
          sent_by_admin_id: user.id,
        },
        sendEmail: true,
        sendPush: true,
      }),
    });

    await supabase.from('admin_operational_events').insert({
      event_type: 'manual_session_approval_reminder',
      subject: `Manual reminder sent for session ${s.id}`,
      payload: {
        session_id: s.id,
        tutor_id: s.tutor_id,
        tutor_email: tutor.data?.email,
        learner_id: learnerId,
        learner_name: learner.data?.full_name,
        sent_by_admin_id: user.id,
      },
      emails_sent: tutor.data?.email ? [tutor.data.email] : [],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('manual session reminder error', error);
    return NextResponse.json({ error: error?.message || 'Failed to send reminder' }, { status: 500 });
  }
}

