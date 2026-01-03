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

    const { id } = await params;
    const adminSupabase = getSupabaseAdmin();

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

    console.log('✅ Ambassador application deleted:', id);

    return NextResponse.json({
      success: true,
      message: 'Ambassador application deleted successfully',
    });
  } catch (error: any) {
    console.error('[Ambassadors] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

