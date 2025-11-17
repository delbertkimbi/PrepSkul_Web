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
    const { data: tutor } = await supabase.from('tutor_profiles').select('is_hidden, user_id').eq('id', id).maybeSingle();
    if (!tutor) return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });

    const newHiddenState = !tutor.is_hidden;

    await supabase.from('tutor_profiles').update({
      is_hidden: newHiddenState,
      hidden_reason: newHiddenState ? reason : null,
      hidden_at: newHiddenState ? new Date().toISOString() : null,
      hidden_by: newHiddenState ? user.id : null,
    }).eq('id', id);

    return NextResponse.json({ success: true, is_hidden: newHiddenState });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
