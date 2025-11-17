import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Resolve Admin Flag API Route
 * 
 * POST: Mark a flag as resolved with optional notes
 */

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { resolutionNotes } = body;

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('admin_flags')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes || null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error resolving flag:', error);
      return NextResponse.json(
        { error: 'Failed to resolve flag' },
        { status: 500 }
      );
    }

    console.log(`✅ Flag resolved: ${params.id}`);

    return NextResponse.json({ flag: data });
  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/flags/[id]/resolve:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}






