'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ProfileLite = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  user_type?: string | null;
} | null;

type SessionInsight = {
  id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_minutes: number | null;
  subject: string | null;
  location: string | null;
  status: string | null;
  tutorReport?: {
    attended?: boolean | null;
    completed_at?: string | null;
    created_at?: string | null;
    topics_covered?: string | null;
    learner_engagement?: string | null;
    issues?: string | null;
  } | null;
  learnerFeedback?: {
    rating?: number | null;
    comment?: string | null;
    created_at?: string | null;
  } | null;
};

function money(n: number | null | undefined) {
  return Number(n || 0).toLocaleString();
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

const btnBase =
  'inline-flex items-center justify-center min-h-[40px] px-4 py-2 text-sm font-medium rounded-md border shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function OfflineOpsDetailClient({
  record,
  sessions,
  profiles,
}: {
  record: any;
  sessions: SessionInsight[];
  profiles: {
    primary: ProfileLite;
    learner: ProfileLite;
    tutor: ProfileLite;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    onboarding_stage: record.onboarding_stage || 'matched',
    payment_status: record.payment_status || 'unpaid',
    payment_environment: record.payment_environment || 'real',
    amount_paid: Number(record.amount_paid || 0),
    expected_total_amount: Number(record.expected_total_amount || 0),
    sessions_completed: Number(record.sessions_completed || 0),
    next_followup_at: record.next_followup_at ? new Date(record.next_followup_at).toISOString().slice(0, 16) : '',
    notes: record.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [sessionState, setSessionState] = useState(sessions);
  const [linkBySession, setLinkBySession] = useState<Record<string, { tutor?: string; learner?: string; expiresAt?: string }>>({});
  const [actionMsg, setActionMsg] = useState('');
  const [busyAttendance, setBusyAttendance] = useState<string | null>(null);
  const [busyLinks, setBusyLinks] = useState<string | null>(null);
  const [replyBySession, setReplyBySession] = useState<Record<string, { recipient: 'tutor' | 'learner'; text: string }>>({});
  const [replyBusy, setReplyBusy] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const balance = useMemo(() => {
    const total = Number(form.expected_total_amount || 0);
    return Math.max(0, total - Number(form.amount_paid || 0));
  }, [form.amount_paid, form.expected_total_amount]);

  const stats = useMemo(() => {
    const total = sessionState.length;
    const completed = sessionState.filter((s) => (s.status || '').toLowerCase() === 'completed').length;
    const withFeedback = sessionState.filter((s) => !!s.learnerFeedback).length;
    return { total, completed, withFeedback };
  }, [sessionState]);

  const saveRecord = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch(`/api/admin/offline-ops/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          next_followup_at: form.next_followup_at ? new Date(form.next_followup_at).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      setSaveMessage('Offline operation updated.');
    } catch (e: any) {
      setSaveMessage(e?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const markAttendance = async (sessionId: string, attended: boolean) => {
    setActionMsg('');
    setBusyAttendance(sessionId);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Could not update attendance');
      setSessionState((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: json.status,
                tutorReport: {
                  ...(s.tutorReport || {}),
                  attended,
                  completed_at: attended ? new Date().toISOString() : null,
                },
              }
            : s
        )
      );
      const emailNote =
        attended && Array.isArray(json.emailsSent) && json.emailsSent.length
          ? ` Notifications queued to: ${json.emailsSent.join(', ')}.`
          : '';
      setActionMsg(`Attendance updated.${emailNote}`);
    } catch (e: any) {
      setActionMsg(e?.message || 'Attendance update failed');
    } finally {
      setBusyAttendance(null);
    }
  };

  const createLinks = async (sessionId: string) => {
    setActionMsg('');
    setBusyLinks(sessionId);
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/portal-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInHours: 24 * 7 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate links');
      setLinkBySession((prev) => ({
        ...prev,
        [sessionId]: {
          tutor: json.tutorReportUrl,
          learner: json.learnerFeedbackUrl,
          expiresAt: json.expiresAt,
        },
      }));
      setActionMsg(`Secure links generated for session ${sessionId.slice(0, 8)}.`);
    } catch (e: any) {
      setActionMsg(e?.message || 'Failed to create links');
    } finally {
      setBusyLinks(null);
    }
  };

  const getReplyDraft = (sessionId: string) =>
    replyBySession[sessionId] || { recipient: 'learner' as const, text: '' };

  const setReplyDraft = (sessionId: string, patch: Partial<{ recipient: 'tutor' | 'learner'; text: string }>) => {
    setReplyBySession((prev) => ({
      ...prev,
      [sessionId]: { ...getReplyDraft(sessionId), ...patch },
    }));
  };

  const sendReply = async (sessionId: string) => {
    const draft = getReplyDraft(sessionId);
    if (draft.text.trim().length < 3) return;
    setReplyBusy(sessionId);
    setActionMsg('');
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/feedback-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: draft.recipient, message: draft.text.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Send failed');
      let msg = `Message emailed to ${json.emailedTo?.join(', ') || 'recipient'}.`;
      if (json.whatsappUrl) {
        msg += ` WhatsApp (if phone on file): ${json.whatsappUrl}`;
      }
      setActionMsg(msg);
      setReplyDraft(sessionId, { text: '' });
    } catch (e: any) {
      setActionMsg(e?.message || 'Could not send message');
    } finally {
      setReplyBusy(null);
    }
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/offline-ops/${record.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Delete failed');
      router.push('/admin/offline-ops');
      router.refresh();
    } catch (e: any) {
      setActionMsg(e?.message || 'Delete failed');
      setShowDelete(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {(!record.offline_run_id && !record.primary_user_id && sessionState.length === 0) && (
        <div className="border border-amber-200 bg-amber-50 text-amber-900 text-sm p-3 rounded-md">
          This record has no platform linkage yet (older offline row). Apply the SQL upgrade in{' '}
          <code className="bg-amber-100 px-1">supabase/offline_operations_detail_upgrade.sql</code> and use “New offline
          record” so runs link to users and sessions, or backfill IDs manually.
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Operation Detail</h1>
          <p className="text-sm text-gray-600 mt-1">
            {record.customer_name} • {record.customer_role}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className={`${btnBase} border-red-300 bg-white text-red-700 hover:bg-red-50`}
          >
            Delete record
          </button>
          <Link href="/admin/offline-ops" className={`${btnBase} border-gray-300 bg-white text-gray-800 hover:bg-gray-50`}>
            Back to list
          </Link>
        </div>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-md w-full border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Delete offline operation?</h2>
            <p className="text-sm text-gray-600">
              This removes the offline tracking row only. Platform users and sessions are not automatically deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => setShowDelete(false)}
                className={`${btnBase} border-gray-300 bg-white text-gray-800`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={confirmDelete}
                className={`${btnBase} border-red-600 bg-red-600 text-white hover:bg-red-700`}
              >
                {deleteBusy ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-md">
          <p className="text-xs text-gray-500">Total sessions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md">
          <p className="text-xs text-gray-500">Completed sessions</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md">
          <p className="text-xs text-gray-500">Learner feedback submitted</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.withFeedback}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-md">
        <h2 className="font-semibold text-gray-900 mb-3">People & profile context</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="font-medium text-gray-800">Primary contact</p>
            <p>{profiles.primary?.full_name || record.customer_name}</p>
            <p className="text-gray-500">{profiles.primary?.email || '—'}</p>
            <p className="text-gray-500">{profiles.primary?.phone_number || record.customer_whatsapp || '—'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Learner</p>
            <p>{profiles.learner?.full_name || '—'}</p>
            <p className="text-gray-500">{profiles.learner?.email || '—'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Tutor</p>
            <p>{profiles.tutor?.full_name || '—'}</p>
            <p className="text-gray-500">{profiles.tutor?.email || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 space-y-3 rounded-md">
        <h2 className="font-semibold text-gray-900">Tracking, payments & balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-gray-600">Onboarding stage</span>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.onboarding_stage}
              onChange={(e) => setForm((f) => ({ ...f, onboarding_stage: e.target.value }))}
            >
              {['new_lead', 'qualified', 'matched', 'active_sessions', 'completed', 'dropped'].map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Payment status</span>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.payment_status}
              onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}
            >
              {['unpaid', 'partial', 'paid', 'refunded'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Payment environment</span>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.payment_environment}
              onChange={(e) => setForm((f) => ({ ...f, payment_environment: e.target.value }))}
            >
              {['real', 'sandbox'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Amount paid (XAF)</span>
            <input
              type="number"
              min={0}
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.amount_paid}
              onChange={(e) => setForm((f) => ({ ...f, amount_paid: Number(e.target.value || 0) }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Expected total (XAF)</span>
            <input
              type="number"
              min={0}
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.expected_total_amount}
              onChange={(e) => setForm((f) => ({ ...f, expected_total_amount: Number(e.target.value || 0) }))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Sessions completed (manual)</span>
            <input
              type="number"
              min={0}
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.sessions_completed}
              onChange={(e) => setForm((f) => ({ ...f, sessions_completed: Number(e.target.value || 0) }))}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-gray-600">Next follow-up</span>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 p-2 rounded-md"
              value={form.next_followup_at}
              onChange={(e) => setForm((f) => ({ ...f, next_followup_at: e.target.value }))}
            />
          </label>
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-md">
            <p className="text-xs text-gray-500">Outstanding balance</p>
            <p className="text-xl font-bold text-amber-700">{money(balance)} XAF</p>
          </div>
          <label className="space-y-1 md:col-span-3">
            <span className="text-gray-600">Admin notes</span>
            <textarea
              className="w-full border border-gray-300 p-2 min-h-[90px] rounded-md"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveRecord}
            disabled={saving}
            className={`${btnBase} border-[#1B2C4F] bg-[#1B2C4F] text-white hover:bg-[#15243d]`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saveMessage && <p className="text-sm text-gray-700">{saveMessage}</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-md">
        <h2 className="font-semibold text-gray-900 mb-3">Scheduled sessions</h2>
        {sessionState.length === 0 ? (
          <p className="text-sm text-gray-600">No sessions found for this offline operation yet.</p>
        ) : (
          <div className="space-y-4">
            {sessionState.map((s) => {
              const links = linkBySession[s.id];
              const draft = getReplyDraft(s.id);
              const tr = s.tutorReport;
              const lf = s.learnerFeedback;
              return (
                <div key={s.id} className="border border-gray-200 p-4 rounded-md space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">Session {s.id.slice(0, 8)}…</p>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-md font-medium">
                      {(s.status || 'unknown').toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-600">{s.subject || 'Subject n/a'}</span>
                    <span className="text-xs text-gray-600">{s.duration_minutes || 0} mins</span>
                    <span className="text-xs text-gray-600">
                      {formatDate(`${s.scheduled_date || ''}T${s.scheduled_time || '00:00:00'}`)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="border border-gray-100 bg-gray-50/80 p-3 rounded-md">
                      <p className="font-medium text-gray-800 mb-1">Tutor report</p>
                      {tr ? (
                        <div className="space-y-1 text-gray-700">
                          <p>Attended (report): {tr.attended ? 'yes' : 'no'}</p>
                          {tr.topics_covered ? (
                            <p>
                              <span className="text-gray-500">Topics:</span> {tr.topics_covered}
                            </p>
                          ) : null}
                          {tr.learner_engagement ? (
                            <p>
                              <span className="text-gray-500">Engagement:</span> {tr.learner_engagement}
                            </p>
                          ) : null}
                          {tr.issues ? (
                            <p>
                              <span className="text-gray-500">Issues:</span> {tr.issues}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-gray-600">Not submitted yet.</p>
                      )}
                    </div>
                    <div className="border border-gray-100 bg-gray-50/80 p-3 rounded-md">
                      <p className="font-medium text-gray-800 mb-1">Learner / parent feedback</p>
                      {lf ? (
                        <div className="space-y-1 text-gray-700">
                          <p>Rating: {lf.rating ?? '—'} / 5</p>
                          <p>
                            <span className="text-gray-500">Comment:</span> {lf.comment}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">Not submitted yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyAttendance === s.id}
                      onClick={() => markAttendance(s.id, true)}
                      className={`${btnBase} border-green-600 bg-green-600 text-white hover:bg-green-700`}
                    >
                      {busyAttendance === s.id ? 'Updating…' : 'Mark attended'}
                    </button>
                    <button
                      type="button"
                      disabled={busyAttendance === s.id}
                      onClick={() => markAttendance(s.id, false)}
                      className={`${btnBase} border-amber-500 bg-amber-500 text-white hover:bg-amber-600`}
                    >
                      {busyAttendance === s.id ? 'Updating…' : 'Mark not attended'}
                    </button>
                    <button
                      type="button"
                      disabled={busyLinks === s.id}
                      onClick={() => createLinks(s.id)}
                      className={`${btnBase} border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700`}
                    >
                      {busyLinks === s.id ? 'Generating…' : 'Generate secure links'}
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-800">Send follow-up (email; WhatsApp from profile phone)</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <select
                          className="border border-gray-300 p-2 rounded-md text-sm"
                          value={draft.recipient}
                          onChange={(e) => setReplyDraft(s.id, { recipient: e.target.value as 'tutor' | 'learner' })}
                        >
                          <option value="learner">Email learner / parent on file</option>
                          <option value="tutor">Email tutor on file</option>
                        </select>
                      </div>
                      <textarea
                        className="w-full border border-gray-300 p-2 rounded-md text-sm min-h-[80px]"
                        placeholder="Write your message. It will be emailed to the selected recipient."
                        value={draft.text}
                        onChange={(e) => setReplyDraft(s.id, { text: e.target.value })}
                      />
                      <button
                        type="button"
                        disabled={replyBusy === s.id || draft.text.trim().length < 3}
                        onClick={() => sendReply(s.id)}
                        className={`${btnBase} border-[#1B2C4F] bg-[#1B2C4F] text-white hover:bg-[#15243d]`}
                      >
                        {replyBusy === s.id ? 'Sending…' : 'Send email'}
                      </button>
                      <p className="text-xs text-gray-500">
                        After sending, use the WhatsApp URL shown in the confirmation line if a phone number is on file.
                      </p>
                    </div>

                  {links && (
                    <div className="mt-1 bg-gray-50 border border-gray-200 p-3 text-sm space-y-2 break-all rounded-md">
                      <p className="text-xs text-gray-500">Links expire: {formatDate(links.expiresAt)}</p>
                      <p>
                        <span className="font-medium">Tutor report URL:</span> {links.tutor}
                      </p>
                      <p>
                        <span className="font-medium">Learner feedback URL:</span> {links.learner}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {actionMsg && <p className="mt-3 text-sm text-gray-800 font-medium">{actionMsg}</p>}
      </div>
    </div>
  );
}
