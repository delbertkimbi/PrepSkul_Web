'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type AttendanceRow = {
  check_in_time?: string | null;
  check_out_time?: string | null;
  check_in_photo_url?: string | null;
  check_out_photo_url?: string | null;
  check_in_verified?: boolean | null;
  duration_minutes?: number | null;
  punctuality_status?: string | null;
  arrival_time_minutes?: number | null;
};

type FeedbackRow = {
  student_rating?: number | null;
  student_review?: string | null;
  tutor_notes?: string | null;
  session_took_place?: string | null;
  session_took_place_notes?: string | null;
  student_feedback_submitted_at?: string | null;
  tutor_feedback_submitted_at?: string | null;
};

type QueueItem = {
  id: string;
  subject: string;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  status: string;
  tutor_name: string;
  learner_name?: string | null;
  parent_name?: string | null;
  venue_address?: string | null;
  attendance: AttendanceRow | null;
  feedback: FeedbackRow | null;
};

function mapsUrl(address: string | null | undefined) {
  if (!address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

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
    const reason =
      action === 'reject'
        ? window.prompt('Optional reason for rejection (shown internally):') || undefined
        : undefined;
    setBusyId(sessionId);
    try {
      const res = await fetch('/api/admin/session-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action, reason }),
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
          <h1 className="text-2xl font-bold text-[#1B2C4F]">On-site session review</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Review tutor check-in and check-out (GPS, selfies, duration) and session feedback before
            releasing pending earnings to active balance.
          </p>
        </div>
        <Link href="/admin" className="text-sm text-[#4A6FBF] hover:underline shrink-0">
          Back to admin
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading queue…</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && queue.length === 0 && (
        <p className="text-gray-500 bg-gray-50 border rounded-lg p-6">
          No on-site sessions pending admin review.
        </p>
      )}

      <div className="space-y-6">
        {queue.map((item) => {
          const mapLink = mapsUrl(item.venue_address);
          const att = item.attendance;
          const fb = item.feedback;
          return (
            <article
              key={item.id}
              className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 bg-[#F9FAFB]">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-[#1B2C4F] text-lg">
                      {item.subject || 'Session'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.scheduled_date} at {item.scheduled_time} · {item.location} ·{' '}
                      <span className="capitalize">{item.status}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tutor: {item.tutor_name}
                      {item.learner_name && ` · Learner: ${item.learner_name}`}
                      {item.parent_name && ` · Parent: ${item.parent_name}`}
                    </p>
                    {item.venue_address && (
                      <p className="text-sm text-gray-700 mt-2">
                        Venue: {item.venue_address}
                        {mapLink && (
                          <>
                            {' '}
                            ·{' '}
                            <a
                              href={mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#4A6FBF] hover:underline"
                            >
                              Open in Maps
                            </a>
                          </>
                        )}
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
                      {busyId === item.id ? '…' : 'Approve & release'}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => act(item.id, 'reject')}
                      className="px-4 py-2 rounded-lg border border-red-300 text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 grid md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Attendance
                  </h3>
                  <dl className="text-sm space-y-2 text-gray-700">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">GPS verified</dt>
                      <dd>{att?.check_in_verified ? 'Yes' : 'No'}</dd>
                    </div>
                    {att?.check_in_time && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Check-in</dt>
                        <dd>{new Date(att.check_in_time).toLocaleString()}</dd>
                      </div>
                    )}
                    {att?.check_out_time && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Check-out</dt>
                        <dd>{new Date(att.check_out_time).toLocaleString()}</dd>
                      </div>
                    )}
                    {att?.duration_minutes != null && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Duration</dt>
                        <dd>{att.duration_minutes} min</dd>
                      </div>
                    )}
                    {att?.punctuality_status && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Punctuality</dt>
                        <dd className="capitalize">
                          {att.punctuality_status.replace('_', ' ')}
                          {att.arrival_time_minutes != null &&
                            ` (${att.arrival_time_minutes} min)`}
                        </dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {att?.check_in_photo_url && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Check-in selfie</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.check_in_photo_url}
                          alt="Check-in selfie"
                          className="w-full max-h-52 rounded-lg border object-cover"
                        />
                      </div>
                    )}
                    {att?.check_out_photo_url && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Check-out selfie</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.check_out_photo_url}
                          alt="Check-out selfie"
                          className="w-full max-h-52 rounded-lg border object-cover"
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
                    Session feedback
                  </h3>
                  {!fb?.student_feedback_submitted_at && !fb?.tutor_feedback_submitted_at && (
                    <p className="text-sm text-gray-500 italic">No feedback submitted yet.</p>
                  )}
                  {fb?.tutor_notes && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500">Tutor notes</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                        {fb.tutor_notes}
                      </p>
                    </div>
                  )}
                  {fb?.student_rating != null && (
                    <p className="text-sm text-gray-700 mb-2">
                      Family rating: {fb.student_rating}/5
                    </p>
                  )}
                  {fb?.student_review && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500">Family review</p>
                      <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
                        {fb.student_review}
                      </p>
                    </div>
                  )}
                  {fb?.session_took_place && (
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        fb.session_took_place === 'yes'
                          ? 'bg-green-50 text-green-900'
                          : 'bg-amber-50 text-amber-900'
                      }`}
                    >
                      <p className="font-medium">
                        Session took place: {fb.session_took_place}
                      </p>
                      {fb.session_took_place_notes && (
                        <p className="mt-1 whitespace-pre-wrap">{fb.session_took_place_notes}</p>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
