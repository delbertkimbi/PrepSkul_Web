'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarClock, Loader2, X } from 'lucide-react';
import Link from 'next/link';

type Ctx = {
  session: {
    id: string;
    tutor_id?: string | null;
    learner_id?: string | null;
    parent_id?: string | null;
    scheduled_date: string;
    scheduled_time: string;
    subject: string;
    meet_link?: string;
    onsite_location?: string;
  };
  pendingReschedule: {
    id: string;
    reason: string;
    proposed_date: string;
    proposed_time: string;
    requested_by_user_id: string;
  } | null;
  canRespondToReschedule: boolean;
  awaitingRescheduleApproval: boolean;
  portalRole: 'tutor' | 'learner';
  rescheduleUrl: string;
  feedbackUrl: string;
  rescheduleLookupError?: string | null;
};

function idsMatch(a?: string | null, b?: string | null) {
  return !!a && !!b && String(a).toLowerCase() === String(b).toLowerCase();
}

export default function SessionRescheduleClient({ mode }: { mode: 'tutor' | 'learner' }) {
  const search = useSearchParams();
  const token = search.get('token') || '';
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [error, setError] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<{ title: string; body: string } | null>(null);

  const loadContext = useCallback(() => {
    if (!token) return;
    fetch(`/api/portal/session/context?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error);
        setCtx(j);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  const submitRequest = async () => {
    if (!rescheduleReason.trim() || !proposedDate || !proposedTime) {
      setError('Please share a short reason and pick a new date and time.');
      return;
    }
    setBusy(true);
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
      setRescheduleReason('');
      setProposedDate('');
      setProposedTime('');
      setModal({
        title: 'Request sent',
        body:
          j.message ||
          'We have notified the other participant by email. They can approve or decline from their own link.',
      });
      loadContext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const respond = async (accept: boolean) => {
    if (!ctx?.pendingReschedule) return;
    setBusy(true);
    setError('');
    try {
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
          ? `The session is now set for ${ctx.pendingReschedule.proposed_date} at ${String(ctx.pendingReschedule.proposed_time).slice(0, 5)}. Reminders will follow the new time.`
          : 'The original session time stays as scheduled. The other participant has been notified.',
      });
      loadContext();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg p-6">
        Please open the personal link from your PrepSkul email to manage this session.
      </p>
    );
  }
  if (error && !ctx) return <p className="text-sm text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">{error}</p>;
  if (!ctx) {
    return (
      <p className="text-sm text-slate-500 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  }

  const s = ctx.session;
  const role = ctx.portalRole || mode;
  const pendingActive = !!ctx.pendingReschedule;
  const tutorRequested =
    pendingActive && idsMatch(ctx.pendingReschedule?.requested_by_user_id, s.tutor_id);
  const familyRequested =
    pendingActive &&
    (idsMatch(ctx.pendingReschedule?.requested_by_user_id, s.parent_id) ||
      idsMatch(ctx.pendingReschedule?.requested_by_user_id, s.learner_id));
  const canRespond =
    ctx.canRespondToReschedule || (role === 'learner' && tutorRequested) || (role === 'tutor' && familyRequested);
  const awaiting =
    ctx.awaitingRescheduleApproval ||
    (role === 'tutor' && tutorRequested) ||
    (role === 'learner' && familyRequested);
  const showRequestForm = !pendingActive;

  return (
    <div className="bg-white border border-[#1B2C4F]/10 rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-xl font-semibold text-[#1B2C4F]">Reschedule session</h1>
      <p className="text-sm text-slate-600 mt-1">
        {s.subject} · {s.scheduled_date} {String(s.scheduled_time).slice(0, 5)}
      </p>
      {s.onsite_location && <p className="text-sm text-slate-600 mt-1">Location: {s.onsite_location}</p>}

      {error && (
        <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
      )}

      {ctx.rescheduleLookupError && (
        <p className="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-lg">
          We could not load reschedule status. Please refresh or contact PrepSkul support.
        </p>
      )}

      {canRespond && ctx.pendingReschedule && (
        <div className="mt-6 border-2 border-amber-300 bg-amber-50 p-5 rounded-xl text-sm">
          <p className="font-semibold text-amber-950 text-base">A reschedule needs your response</p>
          <p className="mt-2 text-amber-900">{ctx.pendingReschedule.reason}</p>
          <p className="mt-2 font-medium text-amber-950">
            Proposed: {ctx.pendingReschedule.proposed_date} at{' '}
            {String(ctx.pendingReschedule.proposed_time).slice(0, 5)}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              disabled={busy}
              className="px-4 py-2 bg-[#1B2C4F] text-white text-sm font-semibold rounded-lg hover:bg-[#15243d] disabled:opacity-50"
              onClick={() => respond(true)}
            >
              Accept new time
            </button>
            <button
              type="button"
              disabled={busy}
              className="px-4 py-2 border border-amber-400 bg-white text-amber-950 text-sm font-semibold rounded-lg hover:bg-amber-100 disabled:opacity-50"
              onClick={() => respond(false)}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      {awaiting && !canRespond && (
        <div className="mt-6 border border-[#4A6FBF]/30 bg-[#4A6FBF]/5 p-4 rounded-xl text-sm">
          <p className="font-semibold text-[#1B2C4F]">Waiting for the other participant</p>
          <p className="mt-1 text-slate-600">
            Your reschedule request was sent. They will receive an email with a link to approve or decline.
          </p>
        </div>
      )}

      {showRequestForm && (
        <div className="mt-6 space-y-4 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-600">
            Need a different time? Share why and suggest a date that works for you. The other participant must agree
            before anything changes.
          </p>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Reason</span>
            <textarea
              className="w-full border border-slate-200 mt-1 p-2.5 text-sm rounded-lg min-h-[80px]"
              placeholder="e.g. School event, travel, illness…"
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">New date</span>
            <input
              type="date"
              className="w-full border border-slate-200 mt-1 p-2.5 text-sm rounded-lg"
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">New time</span>
            <input
              type="time"
              className="w-full border border-slate-200 mt-1 p-2.5 text-sm rounded-lg"
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
            />
          </label>
          <button
            type="button"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B2C4F] text-white text-sm font-semibold rounded-lg hover:bg-[#15243d] disabled:opacity-50"
            onClick={submitRequest}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            {busy ? 'Sending…' : 'Send reschedule request'}
          </button>
        </div>
      )}

      {ctx.feedbackUrl && (
        <p className="mt-8 text-sm text-slate-600 border-t border-slate-100 pt-4">
          After your class, you can{' '}
          <Link href={ctx.feedbackUrl} className="text-[#4A6FBF] font-medium underline">
            share session feedback
          </Link>
          .
        </p>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true">
          <div className="bg-white max-w-md w-full rounded-xl shadow-xl p-6 text-center border border-[#1B2C4F]/10">
            <p className="text-lg font-semibold text-[#1B2C4F]">{modal.title}</p>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">{modal.body}</p>
            <button
              type="button"
              className="mt-6 px-6 py-2.5 bg-[#1B2C4F] text-white text-sm font-semibold rounded-lg"
              onClick={() => setModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
