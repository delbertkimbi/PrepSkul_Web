import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Search users API for admin notifications
 * 
 * Allows searching users by name, email, or phone
 * with optional filtering by user type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const userType = searchParams.get('type') || 'all'; // 'all', 'student', 'tutor'
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = await createServerSupabaseClient();

    // Build the query - Note: phone is stored in auth.users, not profiles
    let dbQuery = supabase
      .from('profiles')
      .select('id, full_name, email, user_type, avatar_url, created_at')
      .order('full_name', { ascending: true })
      .limit(limit);

    // Filter by user type if specified
    if (userType !== 'all') {
      dbQuery = dbQuery.eq('user_type', userType);
    }

    // Search by name or email if query provided
    if (query && query.length >= 2) {
      dbQuery = dbQuery.or(
        `full_name.ilike.%${query}%,email.ilike.%${query}%`
      );
    }

    const { data: users, error } = await dbQuery;

    if (error) {
      console.error('Error searching users:', error);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      fullName: user.full_name || 'Unknown User',
      email: user.email,
      phone: null, // Phone is stored in auth.users, not profiles
      userType: user.user_type || 'student',
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    }));

    return NextResponse.json({
      users: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error: any) {
    console.error('Error in user search API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

