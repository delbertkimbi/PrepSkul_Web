import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const supabase = getSupabaseAdmin();

    const { data: runs } = await supabase
      .from('offline_onboarding_runs')
      .select('id, primary_user_id, learner_user_id, tutor_user_id, primary_role, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(500);

    const { data: opsWithPrimary } = await supabase
      .from('offline_operations')
      .select('id, primary_user_id, learner_user_id, tutor_user_id, customer_name, onboarding_stage, created_at')
      .not('primary_user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(500);

    const primaryIds = [
      ...new Set([
        ...(runs || []).map((r) => r.primary_user_id).filter(Boolean),
        ...(opsWithPrimary || []).map((o) => o.primary_user_id).filter(Boolean),
      ]),
    ] as string[];

    if (!primaryIds.length) return NextResponse.json({ users: [] });

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone_number, user_type, avatar_url')
      .in('id', primaryIds);

    const byId = new Map((profiles || []).map((p) => [p.id, p]));

    const users = await Promise.all(
      primaryIds.map(async (pid) => {
        const run = (runs || []).find((r) => r.primary_user_id === pid);
        const op = (opsWithPrimary || []).find((o) => o.primary_user_id === pid);

        const learnerId = run?.learner_user_id || op?.learner_user_id;

        const { data: nextSession } = learnerId
          ? await supabase
              .from('individual_sessions')
              .select('id, scheduled_date, scheduled_time, status, subject')
              .or(`learner_id.eq.${learnerId},parent_id.eq.${pid}`)
              .in('status', ['pending', 'scheduled', 'pending_admin_review'])
              .gte('scheduled_date', new Date().toISOString().slice(0, 10))
              .order('scheduled_date', { ascending: true })
              .order('scheduled_time', { ascending: true })
              .limit(1)
              .maybeSingle()
          : { data: null };

        const p = byId.get(pid);
        const tutorUserId = run?.tutor_user_id || op?.tutor_user_id;

        let tutorName = (run?.metadata as { tutor_name?: string })?.tutor_name || null;
        if (tutorUserId) {
          const t = await supabase.from('profiles').select('full_name').eq('id', tutorUserId).maybeSingle();
          tutorName = t.data?.full_name || tutorName;
        }

        return {
          primaryUserId: pid,
          fullName: p?.full_name || op?.customer_name || 'Unknown',
          email: p?.email || '',
          phone: p?.phone_number || '',
          role: run?.primary_role || p?.user_type,
          tutorName,
          tutorUserId,
          learnerUserId: learnerId,
          offlineOperationId: op?.id,
          onboardingStage: op?.onboarding_stage,
          nextSession: nextSession || null,
          createdAt: run?.created_at || op?.created_at,
        };
      })
    );

    users.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ users });
  } catch (e: unknown) {
    console.error('offline users list', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
