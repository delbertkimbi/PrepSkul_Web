import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { releaseSessionEarningsToActive } from '@/lib/services/release-session-earnings';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = getSupabaseAdmin();

    const { data: sessions, error } = await supabase
      .from('individual_sessions')
      .select(`
        id,
        subject,
        scheduled_date,
        scheduled_time,
        location,
        status,
        attendance_admin_status,
        tutor_id,
        learner_id,
        parent_id
      `)
      .in('location', ['onsite', 'hybrid'])
      .eq('attendance_admin_status', 'pending')
      .order('scheduled_date', { ascending: false })
      .limit(100);

    if (error) throw error;

    const sessionIds = (sessions || []).map((s) => s.id);
    const tutorIds = [...new Set((sessions || []).map((s) => s.tutor_id).filter(Boolean))];

    const [{ data: attendance }, { data: tutors }] = await Promise.all([
      sessionIds.length
        ? supabase
            .from('session_attendance')
            .select('session_id, check_in_time, check_in_photo_url, check_in_verified, user_type')
            .in('session_id', sessionIds)
            .eq('user_type', 'tutor')
        : Promise.resolve({ data: [] }),
      tutorIds.length
        ? supabase.from('profiles').select('id, full_name').in('id', tutorIds)
        : Promise.resolve({ data: [] }),
    ]);

    const attendanceBySession = new Map(
      (attendance || []).map((a) => [a.session_id, a])
    );
    const tutorNameById = new Map(
      (tutors || []).map((t) => [t.id, t.full_name])
    );

    const queue = (sessions || []).map((s) => ({
      ...s,
      tutor_name: tutorNameById.get(s.tutor_id) || 'Tutor',
      attendance: attendanceBySession.get(s.id) || null,
    }));

    return NextResponse.json({ queue });
  } catch (error: unknown) {
    console.error('[session-attendance] GET error', error);
    const msg = error instanceof Error ? error.message : 'Failed to load queue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { sessionId, action, reason } = body as {
      sessionId?: string;
      action?: 'approve' | 'reject';
      reason?: string;
    };

    if (!sessionId || !action) {
      return NextResponse.json({ error: 'sessionId and action required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (action === 'reject') {
      const result = await releaseSessionEarningsToActive(supabase, sessionId, user.id, {
        reject: true,
        rejectReason: reason,
      });
      return NextResponse.json({ success: true, ...result });
    }

    const result = await releaseSessionEarningsToActive(supabase, sessionId, user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error('[session-attendance] POST error', error);
    const msg = error instanceof Error ? error.message : 'Action failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
