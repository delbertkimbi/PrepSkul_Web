import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
        processed_at,
        fapshi_trans_id
      `)
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const res = await fetch(`${baseUrl}/api/payouts/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutRequestId, adminId: user.id }),
    });

    const body = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: body.error || 'Payout failed' }, { status: res.status });
    }

    return NextResponse.json(body);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Payout processing failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
