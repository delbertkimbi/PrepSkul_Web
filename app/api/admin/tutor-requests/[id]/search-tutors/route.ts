import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';

/**
 * POST /api/admin/tutor-requests/[id]/search-tutors
 * Search for tutors by name, email, phone, or subject
 */
export async function POST(
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
    const { query } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const searchTerm = query.trim().toLowerCase();

    // Get all tutors (approved and pending) to search through
    const { data: tutors, error } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone_number
        )
      `)
      .in('status', ['approved', 'pending'])
      .limit(200);

    if (error) {
      console.error('Error searching tutors:', error);
      return NextResponse.json(
        { error: 'Failed to search tutors' },
        { status: 500 }
      );
    }

    // Filter results by search term (case-insensitive)
    const filteredTutors = (tutors || []).filter((tutor: any) => {
      const profile = tutor.profiles;
      if (!profile) return false;

      const nameMatch = profile.full_name?.toLowerCase().includes(searchTerm);
      const emailMatch = profile.email?.toLowerCase().includes(searchTerm);
      const phoneMatch = profile.phone_number?.toLowerCase().includes(searchTerm);
      const subjectMatch = (tutor.subjects || []).some((subject: string) =>
        subject.toLowerCase().includes(searchTerm)
      );

      return nameMatch || emailMatch || phoneMatch || subjectMatch;
    });

    return NextResponse.json({ success: true, tutors: filteredTutors });
  } catch (error: any) {
    console.error('Error in POST /api/admin/tutor-requests/[id]/search-tutors:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
