import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { parseHistoricalCsv, schedulePeriodForExistingUser } from '@/lib/services/offline-user-hub-service';

export const runtime = 'nodejs';

const bodySchema = z.object({
  csv: z.string().min(10),
  tutor: z.object({
    tutorUserId: z.string().uuid().optional(),
    tutorEmail: z.string().email().optional(),
  }),
  learnerUserId: z.string().uuid().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ primaryUserId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { primaryUserId } = await params;
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const rows = parseHistoricalCsv(parsed.data.csv);
    const supabase = getSupabaseAdmin();
    const results = [];

    for (const schedule of rows) {
      const r = await schedulePeriodForExistingUser(supabase, primaryUserId, user.id, {
        tutor: parsed.data.tutor,
        learnerUserId: parsed.data.learnerUserId,
        schedule,
        isHistoricalImport: true,
        sendWelcomeEmail: false,
      });
      results.push(r);
    }

    return NextResponse.json({ success: true, imported: results.length, results });
  } catch (e: unknown) {
    console.error('[import-csv]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
