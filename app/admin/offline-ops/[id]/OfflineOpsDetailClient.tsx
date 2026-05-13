'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  'inline-flex items-center justify-center min-h-[40px] px-4 py-2 text-sm font-semibold rounded-md border shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

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
  const [busyBySession, setBusyBySession] = useState<Record<string, string>>({});
  const [replyBySession, setReplyBySession] = useState<Record<string, { target: 'tutor' | 'learner'; subject: string; message: string }>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const setBusy = (sessionId: string, key: string | null) => {
    setBusyBySession((prev) => {
      const next = { ...prev };
      if (key) next[sessionId] = key;
      else delete next[sessionId];
      return next;
    });
  };

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
    setBusy(sessionId, attended ? 'mark-attended' : 'mark-not-attended');
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
      setActionMsg(attended ? 'Session marked attended. Tutor and family were emailed (if addresses are on file).' : 'Session marked not attended. Ops team was notified.');
    } catch (e: any) {
      setActionMsg(e?.message || 'Attendance update failed');
    } finally {
      setBusy(sessionId, null);
    }
  };

  const createLinks = async (sessionId: string) => {
    setActionMsg('');
    setBusy(sessionId, 'links');
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
      setActionMsg('Secure links generated. Copy and send via WhatsApp or email.');
    } catch (e: any) {
      setActionMsg(e?.message || 'Failed to create links');
    } finally {
      setBusy(sessionId, null);
    }
  };

  const getReplyDefaults = (sessionId: string) =>
    replyBySession[sessionId] || { target: 'learner' as const, subject: 'Message from PrepSkul', message: '' };

  const setReplyField = (sessionId: string, patch: Partial<{ target: 'tutor' | 'learner'; subject: string; message: string }>) => {
    setReplyBySession((prev) => ({
      ...prev,
      [sessionId]: { ...getReplyDefaults(sessionId), ...patch },
    }));
  };

  const sendReply = async (sessionId: string) => {
    const r = getReplyDefaults(sessionId);
    setBusy(sessionId, 'reply');
    setActionMsg('');
    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: r.target, subject: r.subject, message: r.message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Send failed');
      setActionMsg(`Email sent to ${json.sentTo || r.target}.${json.whatsappUrl ? ` WhatsApp: ${json.whatsappUrl}` : ''}`);
      setReplyField(sessionId, { message: '' });
    } catch (e: any) {
      setActionMsg(e?.message || 'Could not send email');
    } finally {
      setBusy(sessionId, null);
    }
  };

  const deleteRecord = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/offline-ops/${record.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Delete failed');
      router.push('/admin/offline-ops');
      router.refresh();
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const learnerEmailNote =
    profiles.learner?.email?.includes('offline.learner.') || profiles.learner?.email?.includes('@account.prepskul.com');

  return (
    <div className="space-y-6">
      {(!record.offline_run_id && !record.primary_user_id && sessionState.length === 0) && (
        <div className="border border-amber-200 bg-amber-50 text-amber-900 text-sm p-3 rounded-md">
          This record has no platform linkage yet (older offline row). Apply the SQL upgrade in{' '}
          <code className="bg-amber-100 px-1 rounded">supabase/offline_operations_detail_upgrade.sql</code> and use “New
          offline record” so runs link to users and sessions, or backfill IDs manually.
        </div>
      )}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Operation Detail</h1>
          <p className="text-sm text-gray-600 mt-1">
            {record.customer_name} • {record.customer_role}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm font-semibold px-4 py-2 rounded-md border border-red-300 text-red-700 bg-white hover:bg-red-50 shadow-sm"
          >
            Delete record
          </button>
          <Link href="/admin/offline-ops" className="text-sm text-[#1B2C4F] font-medium hover:underline px-2 py-2">
            Back to list
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Total sessions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Completed sessions</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
          <p className="text-xs text-gray-500">Learner feedback submitted</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.withFeedback}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
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
            <p className="text-gray-500 break-all">{profiles.learner?.email || '—'}</p>
            {learnerEmailNote && (
              <p className="text-xs text-amber-800 mt-1">
                System learner login email — family contact is the parent fields above. Share portal links with the parent.
              </p>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">Tutor</p>
            <p>{profiles.tutor?.full_name || '—'}</p>
            <p className="text-gray-500">{profiles.tutor?.email || '—'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 space-y-3 rounded-md shadow-sm">
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
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
            <p className="text-xs text-amber-900 font-medium">Outstanding balance</p>
            <p className="text-xl font-bold text-amber-800">{money(balance)} XAF</p>
            {(form.payment_status === 'partial' || form.payment_status === 'unpaid') && (
              <p className="text-xs text-amber-900 mt-1">Payment status is highlighted — adjust amount paid or expected total as money comes in.</p>
            )}
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
        <div className="flex items-center gap-3 flex-wrap">
          <Button type="button" onClick={saveRecord} disabled={saving} className="bg-[#1B2C4F] hover:bg-[#15243d]">
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
          {saveMessage && <p className="text-sm text-gray-700">{saveMessage}</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Scheduled sessions</h2>
        {sessionState.length === 0 ? (
          <p className="text-sm text-gray-600">No sessions found for this offline operation yet.</p>
        ) : (
          <div className="space-y-4">
            {sessionState.map((s) => {
              const links = linkBySession[s.id];
              const busy = busyBySession[s.id];
              const tr = s.tutorReport;
              const lf = s.learnerFeedback;
              const rf = getReplyDefaults(s.id);
              return (
                <div key={s.id} className="border border-gray-200 p-4 rounded-md bg-gray-50/50 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">Session</p>
                    <code className="text-xs bg-white border px-1.5 py-0.5 rounded">{s.id.slice(0, 8)}…</code>
                    <span className="text-xs font-semibold uppercase tracking-wide bg-white border px-2 py-0.5 rounded">
                      {(s.status || 'unknown').toLowerCase()}
                    </span>
                    <span className="text-sm text-gray-700">{s.subject || 'Subject n/a'}</span>
                    <span className="text-xs text-gray-500">{s.duration_minutes || 0} min</span>
                    <span className="text-xs text-gray-600">{formatDate(`${s.scheduled_date || ''}T${s.scheduled_time || '00:00:00'}`)}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white border rounded-md p-3 space-y-1">
                      <p className="font-medium text-gray-800">Tutor report</p>
                      {tr ? (
                        <>
                          <p className="text-gray-700">Submitted: {formatDate(tr.created_at)}</p>
                          <p className="text-gray-700">Reported attended: {tr.attended ? 'yes' : 'no'}</p>
                          {tr.topics_covered && (
                            <p>
                              <span className="text-gray-500">Topics:</span> {tr.topics_covered}
                            </p>
                          )}
                          {tr.learner_engagement && (
                            <p>
                              <span className="text-gray-500">Engagement:</span> {tr.learner_engagement}
                            </p>
                          )}
                          {tr.issues && (
                            <p>
                              <span className="text-gray-500">Issues:</span> {tr.issues}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">Not submitted yet.</p>
                      )}
                    </div>
                    <div className="bg-white border rounded-md p-3 space-y-1">
                      <p className="font-medium text-gray-800">Learner / parent feedback</p>
                      {lf ? (
                        <>
                          <p className="text-gray-700">{formatDate(lf.created_at)}</p>
                          <p className="text-gray-700">Rating: {lf.rating ?? '—'} / 5</p>
                          <p className="text-gray-800 whitespace-pre-wrap">{lf.comment}</p>
                        </>
                      ) : (
                        <p className="text-gray-500">Not submitted yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => markAttendance(s.id, true)}
                      className={`${btnBase} border-green-300 bg-green-600 text-white hover:bg-green-700`}
                    >
                      {busy === 'mark-attended' ? 'Updating…' : 'Mark attended'}
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => markAttendance(s.id, false)}
                      className={`${btnBase} border-amber-300 bg-amber-500 text-white hover:bg-amber-600`}
                    >
                      {busy === 'mark-not-attended' ? 'Updating…' : 'Mark not attended'}
                    </button>
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => createLinks(s.id)}
                      className={`${btnBase} border-indigo-300 bg-indigo-600 text-white hover:bg-indigo-700`}
                    >
                      {busy === 'links' ? 'Generating…' : 'Generate secure links'}
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-800">Email follow-up (also logged to ops)</p>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="w-full sm:w-40">
                        <Select value={rf.target} onValueChange={(v) => setReplyField(s.id, { target: v as 'tutor' | 'learner' })}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="learner">Learner / parent</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        className="flex-1 min-w-[200px] border-gray-300"
                        placeholder="Subject"
                        value={rf.subject}
                        onChange={(e) => setReplyField(s.id, { subject: e.target.value })}
                      />
                    </div>
                    <Textarea
                      className="border-gray-300 min-h-[100px]"
                      placeholder="Write your message. It will be emailed to the selected recipient and a WhatsApp link will be offered if a phone number is on file."
                      value={rf.message}
                      onChange={(e) => setReplyField(s.id, { message: e.target.value })}
                    />
                    <button
                      type="button"
                      disabled={!!busy || rf.message.trim().length < 10}
                      onClick={() => sendReply(s.id)}
                      className={`${btnBase} border-[#1B2C4F] bg-[#1B2C4F] text-white hover:bg-[#15243d]`}
                    >
                      {busy === 'reply' ? 'Sending…' : 'Send email'}
                    </button>
                  </div>

                  {links && (
                    <div className="mt-1 bg-white border border-gray-200 p-3 text-sm space-y-2 break-all rounded-md">
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
        {actionMsg && (
          <p className="mt-3 text-sm border border-blue-200 bg-blue-50 text-blue-900 px-3 py-2 rounded-md">{actionMsg}</p>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white max-w-md w-full border border-gray-200 rounded-lg shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete this offline record?</h3>
            <p className="text-sm text-gray-600">
              This removes the tracking row only. Existing users and sessions in PrepSkul are not deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={deleteRecord}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
