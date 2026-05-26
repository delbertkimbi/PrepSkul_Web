import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { hardDeleteOfflineUserKeepingStats } from '@/lib/services/offline-user-hub-service';

export const runtime = 'nodejs';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ primaryUserId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { primaryUserId } = await params;
    const supabase = getSupabaseAdmin();
    const result = await hardDeleteOfflineUserKeepingStats(supabase, primaryUserId);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    console.error('[offline-user-delete]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}
