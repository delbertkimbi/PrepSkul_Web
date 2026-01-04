import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get the ambassador ID from params
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      console.error('[Ambassadors] Missing ambassador ID in request');
      return NextResponse.json(
        { error: 'Ambassador ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.error('[Ambassadors] Invalid ambassador ID format:', id);
      return NextResponse.json(
        { error: 'Invalid ambassador ID format' },
        { status: 400 }
      );
    }

    const adminSupabase = getSupabaseAdmin();

    // First, check if the ambassador exists
    const { data: existing, error: fetchError } = await adminSupabase
      .from('ambassadors')
      .select('id, full_name')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('[Ambassadors] Error fetching ambassador:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch ambassador application', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Ambassador application not found' },
        { status: 404 }
      );
    }

    // Delete the ambassador application
    const { error: deleteError } = await adminSupabase
      .from('ambassadors')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Ambassadors] Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete ambassador application', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log('✅ Ambassador application deleted:', id, existing.full_name);

    return NextResponse.json({
      success: true,
      message: 'Ambassador application deleted successfully',
    });
  } catch (error: any) {
    console.error('[Ambassadors] Unexpected error:', error);
    console.error('[Ambassadors] Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

