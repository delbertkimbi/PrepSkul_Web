'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type AttendanceRow = {
  check_in_time?: string | null;
  check_in_photo_url?: string | null;
  check_in_verified?: boolean | null;
};

type QueueItem = {
  id: string;
  subject: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  tutor_name: string;
  attendance: AttendanceRow | null;
};

export default function SessionAttendancePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/session-attendance');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setQueue(data.queue || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (sessionId: string, action: 'approve' | 'reject') => {
    setBusyId(sessionId);
    try {
      const res = await fetch('/api/admin/session-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      await load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2C4F]">Session Attendance Review</h1>
          <p className="text-sm text-gray-600 mt-1">
            Approve onsite tutor check-ins and selfies to release pending earnings to active balance.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-[#4A6FBF] hover:underline">
          Back to admin
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading queue…</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && queue.length === 0 && (
        <p className="text-gray-500 bg-gray-50 border rounded-lg p-6">No sessions pending admin review.</p>
      )}

      <div className="space-y-4">
        {queue.map((item) => (
          <div key={item.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <p className="font-semibold text-[#1B2C4F]">{item.subject || 'Session'}</p>
                <p className="text-sm text-gray-600">
                  {item.scheduled_date} at {item.scheduled_time} · {item.location}
                </p>
                <p className="text-sm text-gray-600">Tutor: {item.tutor_name}</p>
                {item.attendance?.check_in_time && (
                  <p className="text-xs text-gray-500 mt-1">
                    Check-in: {new Date(item.attendance.check_in_time).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-start">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => act(item.id, 'approve')}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  {busyId === item.id ? '…' : 'Approve'}
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => act(item.id, 'reject')}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Reject
                </button>
                <Link
                  href={`/admin/sessions/${item.id}`}
                  className="px-4 py-2 rounded-lg border text-sm text-[#4A6FBF]"
                >
                  Details
                </Link>
              </div>
            </div>
            {item.attendance?.check_in_photo_url && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Tutor selfie</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.attendance.check_in_photo_url}
                  alt="Tutor check-in selfie"
                  className="max-h-48 rounded-lg border object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
