import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendAdminTriggeredSessionReminder } from '@/lib/offline-portal-notifications';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sessionId } = await params;
    const supabase = getSupabaseAdmin();
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();
    const adminName = adminProfile?.full_name || (user as { email?: string }).email || 'PrepSkul admin';

    const sent = await sendAdminTriggeredSessionReminder({ sessionId, adminName });
    if (!sent.ok) return NextResponse.json({ error: sent.error || 'Failed to send reminder' }, { status: 400 });

    await supabase.from('admin_operational_events').insert({
      event_type: 'admin_triggered_session_reminder',
      subject: `Admin triggered reminder for session ${sessionId}`,
      payload: {
        session_id: sessionId,
        admin_id: user.id,
        admin_name: adminName,
      },
      emails_sent: [...(sent.sentTo || []), ...(sent.opsEmails || [])],
    });

    return NextResponse.json({ success: true, sentTo: sent.sentTo || [] });
  } catch (error: any) {
    console.error('admin send reminder now error', error);
    return NextResponse.json({ error: error?.message || 'Failed to send reminder' }, { status: 500 });
  }
}
