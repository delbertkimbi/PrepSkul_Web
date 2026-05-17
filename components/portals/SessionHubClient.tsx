'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarClock, Loader2, Upload, X } from 'lucide-react';

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
  pendingReschedule: {
    id: string;
    reason: string;
    proposed_date: string;
    proposed_time: string;
    requested_by_user_id: string;
  } | null;
  canRespondToReschedule: boolean;
  awaitingRescheduleApproval: boolean;
  hasSubmittedReport: boolean;
  hasSubmittedFeedback: boolean;
  portalRole: 'tutor' | 'learner';
};

function PortalModal({
  title,
  body,
  onClose,
  primaryLabel = 'Close',
}: {
  title: string;
  body: string;
  onClose: () => void;
  primaryLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
      <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 text-center border border-[#1B2C4F]/10">
        <p className="text-lg font-semibold text-[#1B2C4F]">{title}</p>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{body}</p>
        <button
          type="button"
          className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-[#1B2C4F] text-white text-sm font-semibold rounded-lg hover:bg-[#15243d]"
          onClick={onClose}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}

function SessionPhotoUpload({
  token,
  value,
  onChange,
}: {
  token: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const onFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      setErr('Please choose an image file.');
      return;
    }
    setErr('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('token', token);
      const res = await fetch('/api/portal/tutor/upload-session-photo', { method: 'POST', body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Upload failed');
      onChange(j.url);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#1B2C4F]">Pre-session venue photo</p>
      <p className="text-xs text-slate-500">Photo of the teaching location before the session starts.</p>
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Venue" className="h-24 rounded-md border border-slate-200 object-cover" />
          <button
            type="button"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center"
            onClick={() => onChange('')}
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#1B2C4F]/25 rounded-lg text-sm font-medium text-[#1B2C4F] cursor-pointer hover:bg-slate-50">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

export default function SessionHubClient({ mode }: { mode: 'tutor' | 'learner' }) {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [error, setError] = useState('');

  const [attended, setAttended] = useState(true);
  const [subjectTaught, setSubjectTaught] = useState('');
  const [topicsCovered, setTopicsCovered] = useState('');
  const [learnerEngagement, setLearnerEngagement] = useState('');
  const [issues, setIssues] = useState('');
  const [prePhotoUrl, setPrePhotoUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [rescheduleBusy, setRescheduleBusy] = useState(false);

  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);

  const loadContext = useCallback(() => {
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

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const submitReport = async () => {
    const res = await fetch('/api/portal/tutor/session-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        attended,
        topicsCovered,
        learnerEngagement,
        issues,
        subjectTaught,
        preSessionPhotoUrl: prePhotoUrl || undefined,
      }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Failed');
    setModal({
      title: 'Report submitted',
      body: 'Thank you. PrepSkul will review your session report.',
    });
    loadContext();
  };

  const submitFeedback = async () => {
    const res = await fetch('/api/portal/learner/session-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, rating, comment }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || 'Failed');
    setModal({
      title: 'Feedback submitted',
      body: 'Thank you for sharing your feedback with PrepSkul.',
    });
    loadContext();
  };

  const submitReschedule = async () => {
    if (!rescheduleReason.trim() || !proposedDate || !proposedTime) {
      setError('Please provide a reason, date, and time for the new session.');
      return;
    }
    setRescheduleBusy(true);
    setError('');
    try {
      const res = await fetch('/api/portal/session-reschedule/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          reason: rescheduleReason.trim(),
          proposedDate,
          proposedTime,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed');
      setRescheduleOpen(false);
      setRescheduleReason('');
      setProposedDate('');
      setProposedTime('');
      setModal({
        title: 'Reschedule requested',
        body:
          j.message ||
          'Reschedule request submitted. Awaiting approval from the other participant.',
      });
      loadContext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setRescheduleBusy(false);
    }
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
    setModal({
      title: accept ? 'Reschedule accepted' : 'Reschedule declined',
      body: accept
        ? `The session is now scheduled for ${ctx.pendingReschedule.proposed_date} at ${String(ctx.pendingReschedule.proposed_time).slice(0, 5)}.`
        : 'The original session time remains unchanged.',
    });
    loadContext();
  };

  if (!token) {
    return <p className="p-6 text-sm text-slate-600">Open the link from your PrepSkul session email.</p>;
  }
  if (error && !ctx) return <p className="p-6 text-sm text-red-600">{error}</p>;
  if (!ctx) return <p className="p-6 text-sm text-slate-500">Loading session…</p>;

  const s = ctx.session;
  const submitted = mode === 'tutor' ? ctx.hasSubmittedReport : ctx.hasSubmittedFeedback;
  const showMainForms =
    !submitted && !rescheduleOpen && !ctx.awaitingRescheduleApproval && !ctx.canRespondToReschedule;

  return (
    <div className="max-w-2xl mx-auto">
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

      {error && ctx && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">{error}</p>
      )}

      {ctx.canRespondToReschedule && ctx.pendingReschedule && (
        <div className="mt-5 border-2 border-amber-300 bg-amber-50 p-4 rounded-xl text-sm shadow-sm">
          <p className="font-semibold text-amber-950 text-base">Reschedule request — your response needed</p>
          <p className="mt-2 text-amber-900">{ctx.pendingReschedule.reason}</p>
          <p className="mt-1 font-medium text-amber-950">
            Proposed: {ctx.pendingReschedule.proposed_date} at{' '}
            {String(ctx.pendingReschedule.proposed_time).slice(0, 5)}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-[#1B2C4F] text-white text-sm font-semibold rounded-lg hover:bg-[#15243d]"
              onClick={() => respondReschedule(true).catch((e) => setError(e.message))}
            >
              Approve new time
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-amber-400 bg-white text-amber-950 text-sm font-semibold rounded-lg hover:bg-amber-100"
              onClick={() => respondReschedule(false).catch((e) => setError(e.message))}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {ctx.awaitingRescheduleApproval && !ctx.canRespondToReschedule && (
        <div className="mt-5 border border-[#4A6FBF]/30 bg-[#4A6FBF]/5 p-4 rounded-xl text-sm">
          <p className="font-semibold text-[#1B2C4F]">Reschedule pending approval</p>
          <p className="mt-1 text-slate-600">
            Your request was sent. The other participant must approve before the session time changes.
          </p>
        </div>
      )}

      {!submitted && !ctx.canRespondToReschedule && !ctx.awaitingRescheduleApproval && (
        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[#4A6FBF] text-[#1B2C4F] text-sm font-semibold bg-white hover:bg-[#4A6FBF]/5 transition-colors"
          onClick={() => {
            setRescheduleOpen(true);
            setError('');
          }}
        >
          <CalendarClock className="h-4 w-4 text-[#4A6FBF]" />
          Reschedule session
        </button>
      )}

      {showMainForms && mode === 'tutor' && !ctx.hasSubmittedReport && (
        <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
          <h2 className="font-semibold text-[#1B2C4F]">Tutor report</h2>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Subject taught</span>
            <select
              className="w-full border border-slate-200 mt-1 p-2.5 rounded-lg text-sm"
              value={subjectTaught}
              onChange={(e) => setSubjectTaught(e.target.value)}
            >
              {ctx.subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </label>
          {(s.delivery_mode === 'onsite' || s.delivery_mode === 'hybrid') && (
            <SessionPhotoUpload token={token} value={prePhotoUrl} onChange={setPrePhotoUrl} />
          )}
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Attended?</span>
            <select
              className="w-full border border-slate-200 mt-1 p-2.5 rounded-lg text-sm"
              value={attended ? 'yes' : 'no'}
              onChange={(e) => setAttended(e.target.value === 'yes')}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <textarea
            className="w-full border border-slate-200 p-3 text-sm rounded-lg"
            placeholder="Topics covered"
            value={topicsCovered}
            onChange={(e) => setTopicsCovered(e.target.value)}
            rows={3}
          />
          <textarea
            className="w-full border border-slate-200 p-3 text-sm rounded-lg"
            placeholder="Learner engagement"
            value={learnerEngagement}
            onChange={(e) => setLearnerEngagement(e.target.value)}
            rows={2}
          />
          <button
            type="button"
            className="px-5 py-2.5 bg-[#1B2C4F] text-white rounded-lg text-sm font-semibold hover:bg-[#15243d]"
            onClick={() => submitReport().catch((e) => setError(e.message))}
          >
            Submit report
          </button>
        </div>
      )}

      {showMainForms && mode === 'learner' && !ctx.hasSubmittedFeedback && (
        <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
          <h2 className="font-semibold text-[#1B2C4F]">Your feedback</h2>
          <select
            className="w-full border border-slate-200 p-2.5 text-sm rounded-lg"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
          <textarea
            className="w-full border border-slate-200 p-3 text-sm rounded-lg"
            placeholder="Your comment (min 3 characters)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <button
            type="button"
            className="px-5 py-2.5 bg-[#1B2C4F] text-white rounded-lg text-sm font-semibold hover:bg-[#15243d]"
            onClick={() => submitFeedback().catch((e) => setError(e.message))}
          >
            Submit feedback
          </button>
        </div>
      )}

      {submitted && (
        <p className="mt-6 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
          You have already submitted for this session. Thank you.
        </p>
      )}

      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 border border-[#1B2C4F]/10">
            <div className="flex justify-between items-start gap-2">
              <h2 className="text-lg font-semibold text-[#1B2C4F]">Request a reschedule</h2>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setRescheduleOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Explain why you need to move the session. The other participant must approve your proposed time.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Reason</span>
                <textarea
                  className="w-full border border-slate-200 mt-1 p-2.5 text-sm rounded-lg min-h-[72px]"
                  placeholder="e.g. Family emergency, school event…"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  rows={2}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Select another suitable day for the session</span>
                <input
                  type="date"
                  className="w-full border border-slate-200 mt-1 p-2.5 text-sm rounded-lg"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Select a suitable time on that day</span>
                <input
                  type="time"
                  className="w-full border border-slate-200 mt-1 p-2.5 text-sm rounded-lg"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              disabled={rescheduleBusy}
              className="mt-5 w-full py-2.5 bg-[#1B2C4F] text-white text-sm font-semibold rounded-lg hover:bg-[#15243d] disabled:opacity-50"
              onClick={() => submitReschedule()}
            >
              {rescheduleBusy ? 'Sending…' : 'Submit reschedule request'}
            </button>
          </div>
        </div>
      )}

      {modal && (
        <PortalModal title={modal.title} body={modal.body} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
