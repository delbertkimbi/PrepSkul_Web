'use client';

import { useCallback, useEffect, useState } from 'react';

type ActiveUser = {
  id: string;
  fullName: string;
  email: string | null;
  userType: string | null;
  avatarUrl: string | null;
  lastSeen: string;
  lastSeenAgo: string;
  source: string | null;
  platform: string | null;
};

type ActiveOnlinePayload = {
  fetchedAt: string;
  source: string;
  summary: {
    onlineNow: number;
    activeToday: number;
    activeThisWeek: number;
    inSessions: number;
    tutorsOnline: number;
    learnersOnline: number;
    parentsOnline: number;
    peakHour: number;
    peakCount: number;
  };
  hourlyActivity: number[];
  users: ActiveUser[];
};

export default function ActiveUsersClient() {
  const [data, setData] = useState<ActiveOnlinePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [source, setSource] = useState<'mobile' | 'all'>('mobile');

  const load = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`/api/admin/users/active-online?source=${source}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load active users');
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, 20_000);
    return () => clearInterval(id);
  }, [load]);

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Mobile Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live view — refreshes every 20 seconds. Online = active in the last 5 minutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as 'mobile' | 'all')}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="mobile">Mobile app only</option>
            <option value="all">All sources</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              load();
            }}
            className="text-sm px-3 py-2 rounded-md border border-[#1B2C4F]/30 bg-[#1B2C4F] text-white hover:bg-[#15243d]"
          >
            Refresh now
          </button>
        </div>
      </div>

      {data?.fetchedAt && (
        <p className="text-xs text-gray-400">Last updated: {new Date(data.fetchedAt).toLocaleString()}</p>
      )}

      {error && (
        <p className="text-sm border border-red-200 bg-red-50 text-red-800 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Online Now" value={s?.onlineNow ?? '—'} sub="Last 5 minutes" accent="text-green-600" />
        <StatCard label="Active Today" value={s?.activeToday ?? '—'} sub="Last 24 hours" accent="text-blue-600" />
        <StatCard label="Active This Week" value={s?.activeThisWeek ?? '—'} sub="Last 7 days" accent="text-purple-600" />
        <StatCard label="In Sessions" value={s?.inSessions ?? '—'} sub="in_progress now" accent="text-orange-600" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Online by User Type</h2>
        <div className="grid grid-cols-3 gap-4">
          <TypePill label="Tutors" value={s?.tutorsOnline ?? 0} bg="bg-blue-50" text="text-blue-600" />
          <TypePill label="Learners" value={s?.learnersOnline ?? 0} bg="bg-green-50" text="text-green-600" />
          <TypePill label="Parents" value={s?.parentsOnline ?? 0} bg="bg-purple-50" text="text-purple-600" />
        </div>
      </div>

      {data?.hourlyActivity && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Peak Activity Today</h2>
          <p className="text-sm text-gray-500 mb-4">
            Peak hour: {s?.peakHour ?? 0}:00 · {s?.peakCount ?? 0} users
          </p>
          <div className="flex items-end gap-1 h-32">
            {data.hourlyActivity.map((count, hour) => {
              const peak = s?.peakCount ?? 1;
              const height = peak > 0 ? (count / peak) * 100 : 0;
              return (
                <div key={hour} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    title={`${hour}:00 — ${count} users`}
                  />
                  {hour % 3 === 0 && <p className="text-xs text-gray-400 mt-1">{hour}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Currently Online ({data?.users?.length ?? 0})
          {loading && <span className="text-sm font-normal text-gray-400 ml-2">Updating…</span>}
        </h2>
        {!data?.users?.length ? (
          <p className="text-gray-500 text-sm">
            No users online right now. Users appear here when the mobile app sends a presence ping (every 2 minutes while
            open).
          </p>
        ) : (
          <div className="space-y-2">
            {data.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#1B2C4F]/10 flex items-center justify-center text-sm font-semibold text-[#1B2C4F] shrink-0">
                      {(user.fullName || '?').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {user.userType || 'user'}
                      {user.platform ? ` · ${user.platform}` : ''}
                      {user.email ? ` · ${user.email}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600 tabular-nums">{user.lastSeenAgo}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-2">{sub}</p>
    </div>
  );
}

function TypePill({
  label,
  value,
  bg,
  text,
}: {
  label: string;
  value: number;
  bg: string;
  text: string;
}) {
  return (
    <div className={`text-center p-4 ${bg} rounded-lg`}>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
}
