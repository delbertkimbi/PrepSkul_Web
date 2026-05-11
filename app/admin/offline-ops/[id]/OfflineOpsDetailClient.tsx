'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

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
      setActionMsg(`Session ${sessionId.slice(0, 8)} attendance updated.`);
    } catch (e: any) {
      setActionMsg(e?.message || 'Attendance update failed');
    }
  };

  const createLinks = async (sessionId: string) => {
    setActionMsg('');
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
    }
  };

  return (
    <div className="space-y-6">
      {(!record.offline_run_id && !record.primary_user_id && sessionState.length === 0) && (
        <div className="border border-amber-200 bg-amber-50 text-amber-900 text-sm p-3">
          This record has no platform linkage yet (older offline row). Apply the SQL upgrade in{' '}
          <code className="bg-amber-100 px-1">supabase/offline_operations_detail_upgrade.sql</code> and use “New offline
          record” so runs link to users and sessions, or backfill IDs manually.
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Operation Detail</h1>
          <p className="text-sm text-gray-600 mt-1">{record.customer_name} • {record.customer_role}</p>
        </div>
        <Link href="/admin/offline-ops" className="text-sm text-[#1B2C4F] font-medium">Back to list</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total sessions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Completed sessions</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Learner feedback submitted</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.withFeedback}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4">
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

      <div className="bg-white border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Tracking, payments & balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-gray-600">Onboarding stage</span>
            <select className="w-full border border-gray-300 p-2" value={form.onboarding_stage} onChange={(e) => setForm((f) => ({ ...f, onboarding_stage: e.target.value }))}>
              {['new_lead', 'qualified', 'matched', 'active_sessions', 'completed', 'dropped'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Payment status</span>
            <select className="w-full border border-gray-300 p-2" value={form.payment_status} onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value }))}>
              {['unpaid', 'partial', 'paid', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Payment environment</span>
            <select className="w-full border border-gray-300 p-2" value={form.payment_environment} onChange={(e) => setForm((f) => ({ ...f, payment_environment: e.target.value }))}>
              {['real', 'sandbox'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Amount paid (XAF)</span>
            <input type="number" min={0} className="w-full border border-gray-300 p-2" value={form.amount_paid} onChange={(e) => setForm((f) => ({ ...f, amount_paid: Number(e.target.value || 0) }))} />
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Expected total (XAF)</span>
            <input type="number" min={0} className="w-full border border-gray-300 p-2" value={form.expected_total_amount} onChange={(e) => setForm((f) => ({ ...f, expected_total_amount: Number(e.target.value || 0) }))} />
          </label>
          <label className="space-y-1">
            <span className="text-gray-600">Sessions completed (manual)</span>
            <input type="number" min={0} className="w-full border border-gray-300 p-2" value={form.sessions_completed} onChange={(e) => setForm((f) => ({ ...f, sessions_completed: Number(e.target.value || 0) }))} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="text-gray-600">Next follow-up</span>
            <input type="datetime-local" className="w-full border border-gray-300 p-2" value={form.next_followup_at} onChange={(e) => setForm((f) => ({ ...f, next_followup_at: e.target.value }))} />
          </label>
          <div className="bg-gray-50 border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Outstanding balance</p>
            <p className="text-xl font-bold text-amber-700">{money(balance)} XAF</p>
          </div>
          <label className="space-y-1 md:col-span-3">
            <span className="text-gray-600">Admin notes</span>
            <textarea className="w-full border border-gray-300 p-2 min-h-[90px]" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={saveRecord} disabled={saving} className="bg-[#1B2C4F] text-white px-4 py-2 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {saveMessage && <p className="text-sm text-gray-700">{saveMessage}</p>}
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Scheduled sessions</h2>
        {sessionState.length === 0 ? (
          <p className="text-sm text-gray-600">No sessions found for this offline operation yet.</p>
        ) : (
          <div className="space-y-3">
            {sessionState.map((s) => {
              const links = linkBySession[s.id];
              return (
                <div key={s.id} className="border border-gray-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">Session {s.id.slice(0, 8)}</p>
                    <span className="text-xs bg-gray-100 px-2 py-0.5">{(s.status || 'unknown').toLowerCase()}</span>
                    <span className="text-xs text-gray-600">{s.subject || 'Subject n/a'}</span>
                    <span className="text-xs text-gray-600">{s.duration_minutes || 0} mins</span>
                    <span className="text-xs text-gray-600">{formatDate(`${s.scheduled_date || ''}T${s.scheduled_time || '00:00:00'}`)}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>Tutor report: {s.tutorReport ? `submitted (${s.tutorReport.attended ? 'attended' : 'not attended'})` : 'not submitted'}</p>
                    <p>Learner feedback: {s.learnerFeedback ? `submitted (${s.learnerFeedback.rating || '-'}★)` : 'not submitted'}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => markAttendance(s.id, true)} className="px-3 py-1.5 text-sm bg-green-100 text-green-800">Mark attended</button>
                    <button type="button" onClick={() => markAttendance(s.id, false)} className="px-3 py-1.5 text-sm bg-amber-100 text-amber-800">Mark not attended</button>
                    <button type="button" onClick={() => createLinks(s.id)} className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-800">Generate secure links</button>
                  </div>
                  {links && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 p-3 text-sm space-y-2 break-all">
                      <p className="text-xs text-gray-500">Expires: {formatDate(links.expiresAt)}</p>
                      <p><span className="font-medium">Tutor report URL:</span> {links.tutor}</p>
                      <p><span className="font-medium">Learner feedback URL:</span> {links.learner}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {actionMsg && <p className="mt-3 text-sm text-gray-700">{actionMsg}</p>}
      </div>
    </div>
  );
}
