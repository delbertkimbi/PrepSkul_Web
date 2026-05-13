'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SessionFeedbackClient() {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [thankYouNote, setThankYouNote] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const canSubmit = useMemo(() => token.length > 10 && comment.trim().length >= 3 && status !== 'saving', [token, comment, status]);

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
      setMessage('Feedback submitted. Thank you.');
      setShowSuccessPopup(true);
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-none p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Session Feedback</h1>
      <p className="text-sm text-gray-600 mt-1">
        Share your session experience. This helps improve tutoring quality and support.
      </p>

      {!token && (
        <div className="mt-4 border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 rounded-none">
          To submit feedback, open the personalized link PrepSkul sent you (it includes a secure token in the URL).
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-gray-700">
          <span className="font-medium">Rating (1-5)</span>
          <select
            value={String(rating)}
            onChange={(e) => setRating(Number(e.target.value))}
            className="mt-1 w-full border border-gray-300 p-2 rounded-none bg-white"
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Fair</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Very poor</option>
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <span className="font-medium">Feedback comment</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="mt-1 w-full border border-gray-300 p-2 rounded-none"
            placeholder="Tell us what went well or what needs improvement."
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="bg-[#1B2C4F] text-white px-4 py-3 rounded-md font-medium shadow-sm hover:bg-[#15243d] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'saving' ? 'Submitting...' : 'Submit Feedback'}
        </button>

        {message && (
          <div className={`text-sm p-3 border rounded-md ${status === 'done' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {message}
          </div>
        )}

        {thankYouNote && status === 'done' && (
          <div className="border border-gray-200 bg-gray-50 p-4 rounded-md text-sm text-gray-800 leading-relaxed">
            {thankYouNote}
          </div>
        )}
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-lg border border-gray-200 shadow-xl p-6 text-center">
            <div className="mx-auto mb-4 relative h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping" />
              <div className="relative h-16 w-16 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
                ✓
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Feedback submitted</h2>
            <p className="text-sm text-gray-700 mt-2">{thankYouNote || 'Thank you for sharing your experience with us.'}</p>
            <div className="mt-5 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3">
              <button
                type="button"
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setShowSuccessPopup(false)}
              >
                Close
              </button>
              <a
                href="https://prepskul.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-col items-center justify-center gap-0.5 px-5 py-3 rounded-lg text-sm font-semibold bg-[#1B2C4F] text-white hover:bg-[#15243d] shadow-md transition-colors min-h-[3rem] sm:min-w-[14rem]"
              >
                <span className="leading-tight">Learn more about PrepSkul</span>
                <span className="text-[11px] font-normal text-white/85">prepskul.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
