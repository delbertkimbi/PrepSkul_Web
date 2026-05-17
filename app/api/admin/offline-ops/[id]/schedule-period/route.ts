import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { schedulePeriodBodySchema } from '@/lib/validators/offline-period-schema';
import { schedulePeriodForExistingUser } from '@/lib/services/offline-user-hub-service';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data: op } = await supabase
      .from('offline_operations')
      .select('primary_user_id')
      .eq('id', id)
      .maybeSingle();

    if (!op?.primary_user_id) {
      return NextResponse.json({ error: 'Operation has no linked primary user' }, { status: 400 });
    }

    const parsed = schedulePeriodBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await schedulePeriodForExistingUser(supabase, op.primary_user_id, user.id, parsed.data);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    console.error('[op schedule-period]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
