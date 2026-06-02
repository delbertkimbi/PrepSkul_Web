import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { processTutorPayout } from '@/lib/services/process-tutor-payout';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('payout_requests')
      .select(`
        id,
        tutor_id,
        amount,
        phone_number,
        status,
        created_at,
        requested_at,
        processed_at,
        fapshi_trans_id,
        admin_notes
      `)
      .in('status', ['pending', 'processing', 'failed'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const tutorIds = [...new Set((data || []).map((p) => p.tutor_id).filter(Boolean))];
    const { data: profiles } = tutorIds.length
      ? await supabase.from('profiles').select('id, full_name, email').in('id', tutorIds)
      : { data: [] };

    const nameById = new Map((profiles || []).map((p) => [p.id, p]));

    const queue = (data || []).map((p) => ({
      ...p,
      created_at: p.created_at ?? p.requested_at,
      tutor: nameById.get(p.tutor_id) || null,
    }));

    return NextResponse.json({ queue });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to load payouts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { payoutRequestId } = await request.json();
    if (!payoutRequestId) {
      return NextResponse.json({ error: 'payoutRequestId required' }, { status: 400 });
    }

    // Process in-process with service role (no internal HTTP — avoids RLS + wrong host).
    const result = await processTutorPayout(payoutRequestId, user.id);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payout processing initiated',
      data: {
        payoutRequestId: result.payoutRequestId,
        transId: result.transId,
        dateInitiated: result.dateInitiated,
        status: result.status,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Payout processing failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
