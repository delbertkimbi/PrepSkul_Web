import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { schedulePeriodBodySchema } from '@/lib/validators/offline-period-schema';
import { schedulePeriodForExistingUser } from '@/lib/services/offline-user-hub-service';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ primaryUserId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { primaryUserId } = await params;
    const parsed = schedulePeriodBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const result = await schedulePeriodForExistingUser(supabase, primaryUserId, user.id, parsed.data);
    return NextResponse.json({ success: true, ...result });
  } catch (e: unknown) {
    console.error('[schedule-period]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
