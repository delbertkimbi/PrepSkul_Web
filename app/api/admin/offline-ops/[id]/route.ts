import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  onboarding_stage: z.enum(['new_lead', 'qualified', 'matched', 'active_sessions', 'completed', 'dropped']).optional(),
  payment_status: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
  payment_environment: z.enum(['real', 'sandbox']).optional(),
  amount_paid: z.number().min(0).optional(),
  expected_total_amount: z.number().min(0).optional(),
  sessions_completed: z.number().int().min(0).optional(),
  next_followup_at: z.string().nullable().optional(),
  notes: z.string().min(1).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { ...parsed.data, updated_at: new Date().toISOString() };
    if ('next_followup_at' in updatePayload) {
      updatePayload.next_followup_at = updatePayload.next_followup_at ? new Date(updatePayload.next_followup_at).toISOString() : null;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('offline_operations')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ success: true, record: data });
  } catch (error: any) {
    console.error('offline-op patch error', error);
    return NextResponse.json({ error: error?.message || 'Failed to update offline operation' }, { status: 500 });
  }
}
