import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await request.json();

    const supabase = await createServerSupabaseClient();

    await supabase.from('tutor_profiles').update({
      status: 'suspended',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_review_notes: reason || 'Account blocked by admin',
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
