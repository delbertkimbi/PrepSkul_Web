import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { resumePausedOfflineMatching } from '@/lib/services/offline-user-hub-service';

export const runtime = 'nodejs';

/** Resume a paused offline matching so admins can schedule live sessions (no welcome email). */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const result = await resumePausedOfflineMatching(supabase, id);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    console.error('[op resume-matching]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
