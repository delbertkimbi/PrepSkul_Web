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
    </div>
  );
}
