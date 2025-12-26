import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Admin Flags API Route
 * 
 * GET: Fetch all admin flags (with optional filters)
 * POST: Create a flag manually (if needed)
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const resolved = searchParams.get('resolved');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('admin_flags')
      .select('*');

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (resolved !== null) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching admin flags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch flags' },
        { status: 500 }
      );
    }

    return NextResponse.json({ flags: data || [] });
  } catch (error: any) {
    console.error('❌ Error in GET /api/admin/flags:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('admin_flags')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ Error creating admin flag:', error);
      return NextResponse.json(
        { error: 'Failed to create flag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ flag: data });
  } catch (error: any) {
    console.error('❌ Error in POST /api/admin/flags:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}






