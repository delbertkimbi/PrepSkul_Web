import { NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type RangeKey = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type TimeRanges = {
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
};

export const runtime = 'nodejs';

export function getTimeRanges(now = new Date()): TimeRanges {
  return {
    daily: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    yearly: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function percentDelta(current: number, previous: number): number {
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function trendColor(value: number): 'green' | 'yellow' | 'red' {
  if (value > 0) return 'green';
  if (value < 0) return 'red';
  return 'yellow';
}

export async function requireAdminOrDeny() {
  const user = await getServerSession();
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const admin = await isAdmin(user.id);
  if (!admin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, supabaseAdmin: getSupabaseAdmin() };
}

export function groupByDay(rows: Array<{ created_at?: string | null; timestamp?: string | null }>, days = 30) {
  const now = new Date();
  const map: Record<string, number> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }

  rows.forEach((r) => {
    const iso = r.created_at || r.timestamp;
    if (!iso) return;
    const key = new Date(iso).toISOString().slice(0, 10);
    if (map[key] !== undefined) map[key] += 1;
  });

  return Object.entries(map).map(([date, value]) => ({ date, value }));
}
