'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Ctx = {
  session: {
    id: string;
    scheduled_date: string;
    scheduled_time: string;
    subject: string;
    status: string;
    delivery_mode?: string;
    meet_link?: string;
    onsite_location?: string;
  };
  subjects: string[];
  pendingReschedule: { id: string; reason: string; proposed_date: string; proposed_time: string; requested_by_user_id: string } | null;
  hasSubmittedReport: boolean;
  hasSubmittedFeedback: boolean;
  portalRole: 'tutor' | 'learner';
};

export default function SessionHubClient({ mode }: { mode: 'tutor' | 'learner' }) {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const [attended, setAttended] = useState(true);
  const [subjectTaught, setSubjectTaught] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [learnerEngagement, setLearnerEngagement] = useState('');
  const [issues, setIssues] = useState('');
  const [prePhotoUrl, setPrePhotoUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/portal/session/context?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error);
        setCtx(j);
        if (j.subjects?.[0]) setSubjectTaught(j.subjects[0]);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  const submitReport = async () => {
    const res = await fetch('/api/portal/tutor/session-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, attended, topicsCovered, learnerEngagement, issues, subjectTaught, preSessionPhotoUrl: prePhotoUrl || undefined }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Failed');
    setPopupTitle('Report submitted');
    setShowSuccessPopup(true);
  };

  const submitFeedback = async () => {
    const res = await fetch('/api/portal/learner/session-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, rating, comment }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Failed');
    setPopupTitle('Feedback submitted');
    setShowSuccessPopup(true);
  };

  const submitReschedule = async () => {
    const res = await fetch('/api/portal/session-reschedule/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, reason: rescheduleReason, proposedDate, proposedTime }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Failed');
    setMsg(j.message || 'Request submitted.');
    setShowReschedule(false);
  };

  const respondReschedule = async (accept: boolean) => {
    if (!ctx?.pendingReschedule) return;
    const res = await fetch('/api/portal/session-reschedule/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, requestId: ctx.pendingReschedule.id, accept }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Failed');
    setMsg(accept ? 'Reschedule accepted.' : 'Reschedule declined.');
    window.location.reload();
  };

  if (!token) {
    return <p className="p-6 text-sm text-slate-600">Open the link from your PrepSkul session email.</p>;
  }
  if (error) return <p className="p-6 text-sm text-red-600">{error}</p>;
  if (!ctx) return <p className="p-6 text-sm text-slate-500">Loading session…</p>;

  const s = ctx.session;
  const submitted = mode === 'tutor' ? ctx.hasSubmittedReport : ctx.hasSubmittedFeedback;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl font-semibold text-[#1B2C4F]">Session</h1>
      <p className="text-sm text-slate-600 mt-1">
        {s.subject} · {s.scheduled_date} {String(s.scheduled_time).slice(0, 5)}
      </p>
      {s.meet_link && (
        <p className="text-sm mt-2">
          <a href={s.meet_link} className="text-[#4A6FBF] font-medium underline" target="_blank" rel="noreferrer">
            Join Google Meet
          </a>
        </p>
      )}
      {s.onsite_location && <p className="text-sm text-slate-600 mt-1">Location: {s.onsite_location}</p>}

      {msg && <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">{msg}</p>}

      {ctx.pendingReschedule && (
        <div className="mt-4 border border-amber-200 bg-amber-50 p-3 rounded text-sm">
          <p className="font-medium text-amber-900">Reschedule request pending</p>
          <p className="mt-1">{ctx.pendingReschedule.reason}</p>
          <p>Proposed: {ctx.pendingReschedule.proposed_date} {String(ctx.pendingReschedule.proposed_time).slice(0, 5)}</p>
          <div className="flex gap-2 mt-2">
            <button type="button" className="px-3 py-1 bg-[#1B2C4F] text-white text-xs rounded" onClick={() => respondReschedule(true)}>Accept</button>
            <button type="button" className="px-3 py-1 border text-xs rounded" onClick={() => respondReschedule(false)}>Decline</button>
          </div>
        </div>
      )}

      {!submitted && !showSuccessPopup && (
        <>
          <button
            type="button"
            className="mt-4 text-sm font-medium text-[#4A6FBF] underline"
            onClick={() => setShowReschedule((v) => !v)}
          >
            Reschedule session
          </button>
          {showReschedule && (
            <div className="mt-3 space-y-2 border p-3 rounded">
              <textarea className="w-full border p-2 text-sm" placeholder="Why reschedule?" value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} rows={2} />
              <input type="date" className="w-full border p-2 text-sm" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
              <input type="time" className="w-full border p-2 text-sm" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)} />
              <button type="button" className="px-4 py-2 bg-[#1B2C4F] text-white text-sm rounded" onClick={() => submitReschedule().catch((e) => setError(e.message))}>
                Submit request
              </button>
            </div>
          )}

          {mode === 'tutor' && !ctx.hasSubmittedReport && (
            <div className="mt-6 space-y-3 border-t pt-4">
              <h2 className="font-semibold text-[#1B2C4F]">Tutor report</h2>
              <label className="block text-sm">
                Subject taught
                <select className="w-full border mt-1 p-2" value={subjectTaught} onChange={(e) => setSubjectTaught(e.target.value)}>
                  {ctx.subjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </label>
              {(s.delivery_mode === 'onsite' || s.delivery_mode === 'hybrid') && (
                <label className="block text-sm">
                  Pre-session photo URL
                  <input className="w-full border mt-1 p-2" value={prePhotoUrl} onChange={(e) => setPrePhotoUrl(e.target.value)} placeholder="Paste image URL after upload" />
                </label>
              )}
              <label className="block text-sm">
                Attended?
                <select className="w-full border mt-1 p-2" value={attended ? 'yes' : 'no'} onChange={(e) => setAttended(e.target.value === 'yes')}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <textarea className="w-full border p-2 text-sm" placeholder="Topics covered" value={topicsCovered} onChange={(e) => setTopicsCovered(e.target.value)} rows={3} />
              <textarea className="w-full border p-2 text-sm" placeholder="Learner engagement" value={learnerEngagement} onChange={(e) => setLearnerEngagement(e.target.value)} rows={2} />
              <button type="button" className="px-4 py-2 bg-[#1B2C4F] text-white rounded text-sm" onClick={() => submitReport().catch((e) => setError(e.message))}>
                Submit report
              </button>
            </div>
          )}

          {mode === 'learner' && !ctx.hasSubmittedFeedback && (
            <div className="mt-6 space-y-3 border-t pt-4">
              <h2 className="font-semibold text-[#1B2C4F]">Your feedback</h2>
              <select className="w-full border p-2 text-sm" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} stars</option>
                ))}
              </select>
              <textarea className="w-full border p-2 text-sm" placeholder="Your comment (min 3 characters)" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
              <button type="button" className="px-4 py-2 bg-[#1B2C4F] text-white rounded text-sm" onClick={() => submitFeedback().catch((e) => setError(e.message))}>
                Submit feedback
              </button>
            </div>
          )}
        </>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-sm w-full p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-[#1B2C4F]">{popupTitle}</p>
            <p className="text-sm text-slate-600 mt-2">Thank you. PrepSkul will review your submission.</p>
            <button type="button" className="mt-4 px-4 py-2 bg-[#1B2C4F] text-white text-sm rounded" onClick={() => setShowSuccessPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

