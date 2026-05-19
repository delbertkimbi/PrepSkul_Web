'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';

export default function SessionFeedbackClient() {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [thankYouNote, setThankYouNote] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [rescheduleUrl, setRescheduleUrl] = useState('');

  const loadLinks = useCallback(() => {
    if (!token) return;
    fetch(`/api/portal/session/context?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.rescheduleUrl) setRescheduleUrl(j.rescheduleUrl);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const canSubmit = useMemo(
    () => token.length > 10 && comment.trim().length >= 3 && status !== 'saving',
    [token, comment, status]
  );

  const submit = async () => {
    if (!token) return;
    setStatus('saving');
    setMessage('');
    setThankYouNote('');
    try {
      const res = await fetch('/api/portal/learner/session-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to submit feedback');
      setThankYouNote(json?.thankYouNote || '');
      setStatus('done');
      setMessage('');
      setShowSuccessPopup(true);
    } catch (e: unknown) {
      setStatus('error');
      setMessage(e instanceof Error ? e.message : 'Submission failed');
    }
  };

  return (
    <div className="bg-white border border-[#1B2C4F]/10 rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-[#1B2C4F]">How was your session?</h1>
      <p className="text-sm text-slate-600 mt-1">
        Your feedback helps us support you and your tutor. Thank you for taking a moment to share.
      </p>

      {!token && (
        <div className="mt-4 border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 rounded-lg">
          Please open the personal link PrepSkul sent you after your class.
        </div>
      )}

      {rescheduleUrl && (
        <Link
          href={rescheduleUrl}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#4A6FBF] text-[#1B2C4F] text-sm font-semibold bg-white hover:bg-[#4A6FBF]/5 transition-colors"
        >
          <CalendarClock className="h-4 w-4 text-[#4A6FBF]" />
          Need to reschedule this session?
        </Link>
      )}

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-slate-700">
          <span className="font-medium">Rating</span>
          <select
            value={String(rating)}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 w-full border border-slate-200 p-2.5 rounded-lg bg-white text-sm"
          >
            <option value="5">5 stars — Excellent</option>
            <option value="4">4 stars — Good</option>
            <option value="3">3 stars — Fair</option>
            <option value="2">2 stars — Poor</option>
            <option value="1">1 star — Very poor</option>
          </select>
        </label>

        <label className="text-sm text-slate-700">
          <span className="font-medium">Your comments</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="mt-1 w-full border border-slate-200 p-3 rounded-lg text-sm"
            placeholder="What went well? What could be better?"
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="bg-[#1B2C4F] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#15243d] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'saving' ? 'Submitting…' : 'Submit feedback'}
        </button>

        {message && status === 'error' && (
          <p className="text-sm p-3 border rounded-lg bg-red-50 border-red-200 text-red-800">{message}</p>
        )}
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-xl p-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-semibold text-[#1B2C4F]">Thank you!</h2>
            <p className="text-sm text-slate-600 mt-2">{thankYouNote || 'We appreciate you sharing your experience.'}</p>
            <button
              type="button"
              className="mt-5 px-6 py-2.5 bg-[#1B2C4F] text-white rounded-lg text-sm font-semibold"
              onClick={() => setShowSuccessPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
