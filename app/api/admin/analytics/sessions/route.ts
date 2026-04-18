import { NextResponse } from 'next/server';
import { getTimeRanges, requireAdminOrDeny } from '../_lib';

export const runtime = 'nodejs';

type SessionRow = {
  status: string | null;
  created_at: string;
};

function inRangeCount(rows: SessionRow[], sinceIso: string) {
  const since = new Date(sinceIso);
  return rows.filter((r) => new Date(r.created_at) >= since).length;
}

function normalizeStatus(status: string | null): string {
  return (status || '').toLowerCase();
}

export async function GET() {
  try {
    const guard = await requireAdminOrDeny();
    if ('error' in guard) return guard.error;
    const { supabaseAdmin } = guard;

    const ranges = getTimeRanges();

    const [{ data: individual }, { data: trial }] = await Promise.all([
      supabaseAdmin.from('individual_sessions').select('status, created_at').gte('created_at', ranges.yearly),
      supabaseAdmin.from('trial_sessions').select('status, created_at').gte('created_at', ranges.yearly),
    ]);

    const rows = [
      ...((individual || []) as SessionRow[]),
      ...((trial || []) as SessionRow[]),
    ];

    const { data: offlineRows, error: offlineError } = await supabaseAdmin
      .from('offline_operations')
      .select('onboarding_stage, sessions_completed, created_at')
      .gte('created_at', ranges.yearly);

    const safeOfflineRows = offlineError
      ? []
      : (offlineRows || []) as Array<{
          onboarding_stage: string;
          sessions_completed: number | null;
          created_at: string;
        }>;

    const offlineEquivalentBooked = safeOfflineRows.reduce((sum, row) => {
      const completed = Number(row.sessions_completed || 0);
      if (completed > 0) return sum + completed;
      return ['matched', 'active_sessions', 'completed'].includes((row.onboarding_stage || '').toLowerCase())
        ? sum + 1
        : sum;
    }, 0);

    const offlinePending = safeOfflineRows.filter((r) =>
      ['new_lead', 'qualified'].includes((r.onboarding_stage || '').toLowerCase())
    ).length;
    const offlineApproved = safeOfflineRows.filter((r) =>
      ['matched', 'active_sessions', 'completed'].includes((r.onboarding_stage || '').toLowerCase())
    ).length;
    const offlineCompleted = safeOfflineRows.reduce((sum, row) => sum + Number(row.sessions_completed || 0), 0);

    const inRangeOfflineBooked = (sinceIso: string) => {
      const since = new Date(sinceIso);
      return safeOfflineRows
        .filter((r) => new Date(r.created_at) >= since)
        .reduce((sum, row) => {
          const completed = Number(row.sessions_completed || 0);
          if (completed > 0) return sum + completed;
          return ['matched', 'active_sessions', 'completed'].includes((row.onboarding_stage || '').toLowerCase())
            ? sum + 1
            : sum;
        }, 0);
    };

    const pendingTutorApproval = rows.filter((r) => ['pending', 'pending_tutor_approval'].includes(normalizeStatus(r.status))).length;
    const approved = rows.filter((r) => ['approved', 'scheduled', 'in_progress'].includes(normalizeStatus(r.status))).length;
    const completed = rows.filter((r) => normalizeStatus(r.status) === 'completed').length;

    return NextResponse.json({
      totals: {
        totalBooked: rows.length + offlineEquivalentBooked,
        pendingTutorApproval: pendingTutorApproval + offlinePending,
        approved: approved + offlineApproved,
        completed: completed + offlineCompleted,
      },
      periods: {
        daily: inRangeCount(rows, ranges.daily) + inRangeOfflineBooked(ranges.daily),
        weekly: inRangeCount(rows, ranges.weekly) + inRangeOfflineBooked(ranges.weekly),
        monthly: inRangeCount(rows, ranges.monthly) + inRangeOfflineBooked(ranges.monthly),
        yearly: rows.length + offlineEquivalentBooked,
      },
      platformBreakdown: {
        onPlatform: {
          totalBooked: rows.length,
          pendingTutorApproval,
          approved,
          completed,
        },
        offPlatform: {
          totalBooked: offlineEquivalentBooked,
          pendingTutorApproval: offlinePending,
          approved: offlineApproved,
          completed: offlineCompleted,
        },
      },
    });
  } catch (error) {
    console.error('admin analytics sessions error', error);
    return NextResponse.json({ error: 'Failed to load session analytics' }, { status: 500 });
  }
}
