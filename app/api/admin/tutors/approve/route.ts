import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerSession();
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check admin permission
    const adminStatus = await isAdmin(user.id);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get tutor ID and notes from form data
    const formData = await request.formData();
    const tutorId = formData.get('tutorId') as string;
    const notes = formData.get('notes') as string;

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID required' }, { status: 400 });
    }

    // Update tutor status to approved with optional notes
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('tutor_profiles')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_review_notes: notes || null,
      })
      .eq('id', tutorId);

    if (error) throw error;

    // TODO: Send notification to tutor (email/SMS)

    // Redirect back to pending tutors page
    return NextResponse.redirect(new URL('/admin/tutors/pending', request.url));
  } catch (error: any) {
    console.error('Error approving tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

