import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendAdminFollowUpToParty } from '@/lib/offline-portal-notifications';

const schema = z.object({
  target: z.enum(['tutor', 'learner']),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(8000),
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

    const supabase = getSupabaseAdmin();
    const { data: ap } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle();
    const adminName = ap?.full_name || (user as { email?: string }).email || undefined;

    const result = await sendAdminFollowUpToParty({
      sessionId,
      target: parsed.data.target,
      subject: parsed.data.subject,
      message: parsed.data.message,
      adminName,
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'error' in result ? result.error : 'Send failed' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sentTo: result.email,
      whatsappUrl: result.whatsappUrl,
    });
  } catch (error: any) {
    console.error('admin session reply error', error);
    return NextResponse.json({ error: error?.message || 'Failed to send message' }, { status: 500 });
  }
}
