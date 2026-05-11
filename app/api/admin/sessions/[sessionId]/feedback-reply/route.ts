import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendTransactionalEmail } from '@/lib/session-email-notifications';

const schema = z.object({
  recipient: z.enum(['tutor', 'learner']),
  message: z.string().min(3).max(8000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sessionId } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }
    const { recipient, message } = parsed.data;

    const supabase = getSupabaseAdmin();
    const { data: session } = await supabase
      .from('individual_sessions')
      .select('id, tutor_id, learner_id, parent_id, subject')
      .eq('id', sessionId)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const targetUserId = recipient === 'tutor' ? session.tutor_id : session.learner_id || session.parent_id;
    if (!targetUserId) {
      return NextResponse.json({ error: 'No recipient profile for this session' }, { status: 400 });
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, phone_number')
      .eq('id', targetUserId)
      .maybeSingle();
    const email = (profile?.email || '').trim();
    if (!email) {
      return NextResponse.json({ error: 'Recipient has no email on file' }, { status: 400 });
    }

    const { data: adminProf } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
    const adminName = adminProf?.full_name || 'PrepSkul Admin';

    const html = `<p>Hello${profile?.full_name ? ` ${escapeHtml(profile.full_name)}` : ''},</p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      <p style="margin-top:20px;font-size:12px;color:#666">Message from PrepSkul (${escapeHtml(adminName)}). Session: ${sessionId}</p>`;

    const send = await sendTransactionalEmail([email], `PrepSkul: message about your session (${session.subject || 'session'})`, html);

    const phoneDigits = ((profile?.phone_number as string) || '').replace(/[^\d]/g, '');
    const whatsappUrl =
      phoneDigits.length >= 9 ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}` : null;

    await supabase.from('admin_operational_events').insert({
      event_type: 'admin_feedback_reply_sent',
      subject: `Admin replied to ${recipient} for session ${sessionId}`,
      payload: { session_id: sessionId, recipient, message_preview: message.slice(0, 500) },
      emails_sent: send.ok ? send.to : [],
    });

    return NextResponse.json({ success: true, emailedTo: send.to, whatsappUrl });
  } catch (error: any) {
    console.error('feedback-reply error', error);
    return NextResponse.json({ error: error?.message || 'Failed to send reply' }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
