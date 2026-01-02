import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

/**
 * PATCH /api/admin/tutor-requests/[id]
 * Update tutor request (status, matched tutor, admin notes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getServerSession();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, matched_tutor_id, admin_notes, matched_at } = body;

    const supabase = await createServerSupabaseClient();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (matched_tutor_id !== undefined) updateData.matched_tutor_id = matched_tutor_id;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (matched_at) updateData.matched_at = matched_at;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tutor_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating tutor request:', error);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/tutor-requests/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}