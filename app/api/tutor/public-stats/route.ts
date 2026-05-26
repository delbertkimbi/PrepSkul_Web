import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from '@/lib/supabase-server';
import { computeTutorPublicStats, refreshTutorPublicStats } from '@/lib/services/tutor-public-stats';

const querySchema = z.object({
  tutorIds: z.string().optional(),
});

/**
 * GET /api/tutor/public-stats?tutorIds=uuid1,uuid2
 * Returns denormalized session/student counts (on + off platform).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = querySchema.safeParse({
      tutorIds: request.nextUrl.searchParams.get('tutorIds') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const ids = (parsed.data.tutorIds || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ stats: [] });
    }

    const { data: profiles, error } = await admin
      .from('tutor_profiles')
      .select('user_id, total_sessions_completed, total_students, offline_tutor_earnings_xaf')
      .in('user_id', ids)
      .eq('status', 'approved');

    if (error) throw error;

    const byId = new Map(
      (profiles || []).map((p) => [
        p.user_id as string,
        {
          tutorUserId: p.user_id as string,
          totalSessions: Number(p.total_sessions_completed || 0),
          totalStudents: Number(p.total_students || 0),
          offlineEarningsXaf: Number(p.offline_tutor_earnings_xaf || 0),
        },
      ])
    );

    const stats = await Promise.all(
      ids.map(async (id) => {
        const cached = byId.get(id);
        if (cached && cached.totalSessions > 0) return cached;
        try {
          return await computeTutorPublicStats(admin, id);
        } catch {
          return (
            cached ?? {
              tutorUserId: id,
              totalSessions: 0,
              totalStudents: 0,
              offlineEarningsXaf: 0,
            }
          );
        }
      })
    );

    return NextResponse.json({ stats });
  } catch (error: unknown) {
    console.error('tutor public-stats GET', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load tutor stats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tutor/public-stats — refresh denormalized tutor_profiles stats.
 */
export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

    const body = await request.json().catch(() => ({}));
    const tutorUserId = typeof body.tutorUserId === 'string' ? body.tutorUserId : null;
    const refreshAll = body.refreshAll === true;

    const admin = getSupabaseAdmin();

    if (!isCron) {
      const user = await getServerSession();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const { data: profile } = await admin.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
      const isSelfRefresh = tutorUserId === user.id;
      if (!profile?.is_admin && !isSelfRefresh) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (refreshAll) {
      const { data: tutors } = await admin.from('tutor_profiles').select('user_id').not('user_id', 'is', null);
      let count = 0;
      for (const row of tutors || []) {
        if (!row.user_id) continue;
        try {
          await refreshTutorPublicStats(admin, row.user_id);
        } catch {
          const computed = await computeTutorPublicStats(admin, row.user_id);
          await admin
            .from('tutor_profiles')
            .update({
              total_sessions_completed: computed.totalSessions,
              total_students: computed.totalStudents,
              offline_tutor_earnings_xaf: computed.offlineEarningsXaf,
            })
            .eq('user_id', row.user_id);
        }
        count += 1;
      }
      return NextResponse.json({ success: true, refreshed: count });
    }

    if (!tutorUserId) {
      return NextResponse.json({ error: 'tutorUserId or refreshAll required' }, { status: 400 });
    }

    try {
      await refreshTutorPublicStats(admin, tutorUserId);
    } catch {
      const computed = await computeTutorPublicStats(admin, tutorUserId);
      await admin
        .from('tutor_profiles')
        .update({
          total_sessions_completed: computed.totalSessions,
          total_students: computed.totalStudents,
          offline_tutor_earnings_xaf: computed.offlineEarningsXaf,
        })
        .eq('user_id', tutorUserId);
    }

    const stats = await computeTutorPublicStats(admin, tutorUserId);
    return NextResponse.json({ success: true, stats });
  } catch (error: unknown) {
    console.error('tutor public-stats POST', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to refresh tutor stats' },
      { status: 500 }
    );
  }
}
