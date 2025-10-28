import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permission
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const tutorId = formData.get('tutorId') as string;
    const notes = formData.get('notes') as string;

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Update tutor profile with admin notes
    const { error } = await supabase
      .from('tutor_profiles')
      .update({
        admin_review_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tutorId);

    if (error) {
      console.error('Error saving notes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Redirect back to tutor detail page
    return NextResponse.redirect(new URL(`/admin/tutors/${tutorId}`, request.url));
  } catch (error: any) {
    console.error('Error in notes API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

