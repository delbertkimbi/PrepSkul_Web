'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type PayoutRow = {
  id: string;
  tutor_id: string;
  amount: number;
  phone_number: string;
  status: string;
  created_at: string;
  admin_notes?: string | null;
  tutor?: { full_name?: string; email?: string } | null;
};

export default function AdminPayoutsPage() {
  const [queue, setQueue] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payouts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setQueue(data.queue || []);
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const processPayout = async (id: string) => {
    if (!confirm('Process this payout via Fapshi?')) return;
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutRequestId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Payout failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2C4F]">Tutor Payout Queue</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and process withdrawal requests (minimum 5,000 XAF active balance).
          </p>
        </div>
        <Link href="/admin" className="text-sm text-[#4A6FBF] hover:underline">
          Back to admin
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading…</p>}

      <div className="space-y-3">
        {queue.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 bg-white flex flex-wrap justify-between gap-4">
            <div>
              <p className="font-semibold text-[#1B2C4F]">
                {p.tutor?.full_name || p.tutor_id} · {Number(p.amount).toLocaleString()} XAF
              </p>
              <p className="text-sm text-gray-600">{p.phone_number}</p>
              <p className="text-xs text-gray-500">
                {new Date(p.created_at).toLocaleString()} ·{' '}
                <span
                  className={
                    p.status === 'failed'
                      ? 'text-red-600 font-medium'
                      : p.status === 'processing'
                        ? 'text-amber-700 font-medium'
                        : ''
                  }
                >
                  {p.status}
                </span>
              </p>
              {p.admin_notes && (
                <p className="text-xs text-red-600 mt-1 max-w-md">{p.admin_notes}</p>
              )}
            </div>
            {p.status === 'pending' && (
              <button
                type="button"
                disabled={busyId === p.id}
                onClick={() => processPayout(p.id)}
                className="px-4 py-2 rounded-lg bg-[#4A6FBF] text-white text-sm disabled:opacity-50"
              >
                {busyId === p.id ? 'Processing…' : 'Process via Fapshi'}
              </button>
            )}
            {p.status === 'processing' && (
              <span className="text-sm text-amber-700 self-center">Fapshi in progress</span>
            )}
          </div>
        ))}
        {!loading && queue.length === 0 && (
          <p className="text-gray-500 bg-gray-50 border rounded-lg p-6">No payout requests.</p>
        )}
      </div>
    </div>
  );
}
