'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type UserRow = {
  primaryUserId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  tutorName: string | null;
  onboardingStage: string | null;
  nextSession: { scheduled_date: string; scheduled_time: string; subject: string } | null;
  offlineOperationId: string | null;
};

export default function OfflineUsersListClient() {
  const { data, isLoading } = useSWR('/api/admin/offline-ops/users', fetcher);
  const [q, setQ] = useState('');

  const users = useMemo(() => {
    const rows: UserRow[] = data?.users || [];
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (u) =>
        u.fullName.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        (u.phone || '').includes(s) ||
        (u.tutorName || '').toLowerCase().includes(s)
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1B2C4F]/15 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#4A6FBF]">Offline operations</p>
          <h1 className="text-2xl font-bold text-[#1B2C4F]">Offline users</h1>
          <p className="text-sm text-slate-600 mt-1">Manage enrolled families and schedule new periods.</p>
        </div>
        <Link
          href="/admin/offline-ops/new"
          className="text-sm font-semibold px-4 py-2 rounded-md bg-[#1B2C4F] text-white hover:bg-[#15243d]"
        >
          + New enrollment
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search name, email, tutor…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md border border-[#1B2C4F]/20 px-3 py-2 text-sm rounded-md"
      />

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((u) => (
          <div
            key={u.primaryUserId}
            className="bg-white border border-[#1B2C4F]/12 rounded-lg p-4 shadow-sm space-y-3"
          >
            <Link href={`/admin/offline-ops/users/${u.primaryUserId}`} className="block hover:opacity-90">
              <p className="font-semibold text-[#1B2C4F]">{u.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{u.email}</p>
              <p className="text-xs text-slate-600 mt-2">Tutor: {u.tutorName || '—'}</p>
              <p className="text-xs text-slate-600 capitalize">
                Stage: {u.onboardingStage?.replace(/_/g, ' ') || '—'}
              </p>
              {u.nextSession && (
                <p className="text-xs mt-2 text-[#4A6FBF] font-medium">
                  Next: {u.nextSession.scheduled_date} {String(u.nextSession.scheduled_time).slice(0, 5)}
                </p>
              )}
            </Link>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/offline-ops/users/${u.primaryUserId}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#1B2C4F]/20 text-[#1B2C4F] hover:bg-slate-50"
              >
                Manage user
              </Link>
              {u.offlineOperationId ? (
                <Link
                  href={`/admin/offline-ops/${u.offlineOperationId}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#1B2C4F] text-white hover:bg-[#15243d]"
                >
                  Operation detail
                </Link>
              ) : (
                <span className="text-xs px-3 py-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  No detail record yet
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isLoading && users.length === 0 && (
        <p className="text-sm text-slate-500">No offline users yet. Start with a new enrollment.</p>
      )}
    </div>
  );
}
