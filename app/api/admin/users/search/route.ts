import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Search users API for admin (e.g. offline enrollment picker).
 * Uses the service-role client so results match server-side onboarding inserts (RLS-safe).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ok = await isAdmin(user.id);
    if (!ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const userType = searchParams.get('type') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 50);

    const admin = getSupabaseAdmin();

    let dbQuery = admin
      .from('profiles')
      .select('id, full_name, email, user_type, avatar_url, created_at')
      .order('full_name', { ascending: true })
      .limit(limit);

    if (userType !== 'all') {
      const normalized =
        userType === 'student' ? 'learner' : userType === 'parent' ? 'parent' : userType;
      dbQuery = dbQuery.eq('user_type', normalized);
    }

    if (query && query.length >= 2) {
      const safe = query.replace(/,/g, ' ');
      dbQuery = dbQuery.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
    }

    const { data: users, error } = await dbQuery;

    if (error) {
      console.error('Error searching users:', error);
      return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
    }

    const formattedUsers = (users || []).map((u) => ({
      id: u.id,
      fullName: u.full_name || 'Unknown User',
      email: u.email,
      phone: null,
      userType: u.user_type || 'student',
      avatarUrl: u.avatar_url,
      createdAt: u.created_at,
    }));

    return NextResponse.json({
      users: formattedUsers,
      count: formattedUsers.length,
    });
  } catch (error: any) {
    console.error('Error in user search API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
