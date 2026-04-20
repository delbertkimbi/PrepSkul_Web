import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOpsAlertEmail } from '@/lib/ops-email';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const isVercelCron =
        request.headers.get('user-agent')?.includes('vercel-cron') ||
        request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: sessions, error } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, subject, scheduled_date, scheduled_time, created_at, status')
      .in('status', ['pending', 'pending_tutor_approval'])
      .lt('created_at', cutoff)
      .limit(200);
    if (error) throw error;

    let remindersSent = 0;
    for (const s of sessions || []) {
      const { data: existing } = await supabase
        .from('admin_operational_events')
        .select('id')
        .eq('event_type', 'tutor_pending_approval_reminder')
        .contains('payload', { session_id: s.id })
        .limit(1);
      if (existing && existing.length > 0) continue;

      const tutor = await supabase.from('profiles').select('id, full_name, email').eq('id', s.tutor_id).maybeSingle();
      const learnerId = s.learner_id || s.parent_id;
      const learner = await supabase.from('profiles').select('id, full_name, email').eq('id', learnerId).maybeSingle();

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
          },
          sendEmail: true,
          sendPush: true,
        }),
      }).catch((e) => console.error('notify tutor reminder failed', e));

      await supabase.from('admin_operational_events').insert({
        event_type: 'tutor_pending_approval_reminder',
        subject: `Reminder sent for session ${s.id}`,
        payload: {
          session_id: s.id,
          tutor_id: s.tutor_id,
          tutor_email: tutor.data?.email,
          learner_id: learnerId,
          learner_name: learner.data?.full_name,
          hours_pending: Math.floor((Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60)),
        },
        emails_sent: tutor.data?.email ? [tutor.data.email] : [],
      });
      remindersSent += 1;
    }

    await sendOpsAlertEmail(
      'Session approval reminder run',
      `<p>Reminder cron executed.</p><p><strong>Overdue sessions checked:</strong> ${(sessions || []).length}</p><p><strong>Reminders sent:</strong> ${remindersSent}</p>`
    );

    return NextResponse.json({
      success: true,
      overdueChecked: (sessions || []).length,
      remindersSent,
    });
  } catch (error: any) {
    console.error('session-approval-reminders cron error', error);
    return NextResponse.json({ error: error?.message || 'Cron failed' }, { status: 500 });
  }
}

