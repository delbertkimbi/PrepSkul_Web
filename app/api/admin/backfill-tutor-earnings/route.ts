import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  backfillTutorEarningsForPaymentRequest,
  listPaymentRequestsNeedingEarningsBackfill,
} from '@/lib/services/tutor-earnings-allocation';

/**
 * GET  — preview paid payment_requests missing tutor_earnings allocation
 * POST — run backfill for one id or all candidates
 *
 * Body (POST):
 *   { paymentRequestId?: string, dryRun?: boolean, cancelExcess?: boolean }
 */
export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const candidates = await listPaymentRequestsNeedingEarningsBackfill(supabase, 50);

    return NextResponse.json({
      count: candidates.length,
      candidates,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to list candidates';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const paymentRequestId = body.paymentRequestId as string | undefined;
    const dryRun = body.dryRun === true;
    const cancelExcess = body.cancelExcess !== false;

    const supabase = getSupabaseAdmin();

    const targets = paymentRequestId
      ? [{ id: paymentRequestId }]
      : await listPaymentRequestsNeedingEarningsBackfill(supabase, 50);

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        wouldProcess: targets.length,
        paymentRequestIds: targets.map((t) => t.id),
      });
    }

    const results = [];
    for (const t of targets) {
      const result = await backfillTutorEarningsForPaymentRequest(supabase, t.id, {
        cancelExcess,
      });
      results.push(result);
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Backfill failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
