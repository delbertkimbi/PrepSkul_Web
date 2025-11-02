import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { notifyTutorApproval } from '@/lib/notifications';

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

    // Get supabase client
    const supabase = await createServerSupabaseClient();

    // First, fetch tutor profile to get contact info
    const { data: tutorProfile, error: fetchError } = await supabase
      .from('tutor_profiles')
      .select('user_id, full_name')
      .eq('id', tutorId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    // Get user profile for email/phone
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email, phone_number, full_name')
      .eq('id', tutorProfile.user_id)
      .maybeSingle();

    if (profileError) throw profileError;

    // Update tutor status to approved with optional notes
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

    // Send notification to tutor (email/SMS)
    const tutorName = userProfile?.full_name || tutorProfile.full_name || 'Tutor';
    const notificationResult = await notifyTutorApproval(
      userProfile?.email || null,
      userProfile?.phone_number || null,
      tutorName,
      notes || undefined
    );

    console.log('📧 Notification results:', notificationResult);

    // Redirect back to pending tutors page
    return NextResponse.redirect(new URL('/admin/tutors/pending', request.url));
  } catch (error: any) {
    console.error('Error approving tutor:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

