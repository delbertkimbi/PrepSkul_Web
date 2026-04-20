'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SessionReportClient() {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [attended, setAttended] = useState(true);
  const [topicsCovered, setTopicsCovered] = useState('');
  const [learnerEngagement, setLearnerEngagement] = useState('');
  const [issues, setIssues] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const canSubmit = useMemo(() => token.length > 10 && status !== 'saving', [token, status]);

  const submit = async () => {
    if (!token) return;
    setStatus('saving');
    setMessage('');
    try {
      const res = await fetch('/api/portal/tutor/session-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, attended, topicsCovered, learnerEngagement, issues }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to submit report');
      setStatus('done');
      setMessage('Session report submitted successfully.');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Submission failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-none p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tutor Session Completion Report</h1>
      <p className="text-sm text-gray-600 mt-1">
        Submit one report after each session so operations, earnings, and tracking stay synced.
      </p>

      {!token && (
        <div className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700 rounded-none">
          Missing secure token in URL. Please use the link sent by PrepSkul.
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <label className="text-sm text-gray-700">
          <span className="font-medium">Session attended?</span>
          <select
            value={attended ? 'yes' : 'no'}
            onChange={(e) => setAttended(e.target.value === 'yes')}
            className="mt-1 w-full border border-gray-300 p-2 rounded-none bg-white"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <span className="font-medium">Topics covered</span>
          <textarea
            value={topicsCovered}
            onChange={(e) => setTopicsCovered(e.target.value)}
            rows={4}
            className="mt-1 w-full border border-gray-300 p-2 rounded-none"
            placeholder="Key topics and progress made."
          />
        </label>

        <label className="text-sm text-gray-700">
          <span className="font-medium">Learner engagement</span>
          <textarea
            value={learnerEngagement}
            onChange={(e) => setLearnerEngagement(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-300 p-2 rounded-none"
            placeholder="Participation level, understanding, behavior."
          />
        </label>

        <label className="text-sm text-gray-700">
          <span className="font-medium">Issues / blockers (optional)</span>
          <textarea
            value={issues}
            onChange={(e) => setIssues(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-gray-300 p-2 rounded-none"
            placeholder="Connectivity, attendance, learning blockers."
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="bg-[#1B2C4F] text-white px-4 py-2 rounded-none disabled:opacity-60"
        >
          {status === 'saving' ? 'Submitting...' : 'Submit Report'}
        </button>

        {message && (
          <div className={`text-sm p-3 border rounded-none ${status === 'done' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
