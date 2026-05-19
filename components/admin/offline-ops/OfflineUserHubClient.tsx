'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import OfflineSchedulePeriodFields, {
  buildSchedulePayload,
  defaultSchedulePeriodState,
  validateSchedulePeriodState,
  type SchedulePeriodFormState,
} from '@/components/admin/offline-ops/OfflineSchedulePeriodFields';

type HubProps = {
  primaryUserId: string;
  fullName: string;
  email: string;
  userType: string | null;
  offlineOperationId: string | null;
  learners: Array<{ id: string; full_name?: string | null }>;
  defaultLearnerUserId: string | null;
  defaultTutorUserId: string | null;
};

type Panel = 'schedule' | 'child' | 'import' | 'csv' | 'anonymize' | 'delete' | null;

export default function OfflineUserHubClient(props: HubProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [scheduleState, setScheduleState] = useState<SchedulePeriodFormState>(() => ({
    ...defaultSchedulePeriodState(),
    learnerUserId: props.defaultLearnerUserId || props.learners[0]?.id || '',
    tutor: props.defaultTutorUserId
      ? { tutorUserId: props.defaultTutorUserId, tutorName: 'Tutor' }
      : null,
  }));

  const [childName, setChildName] = useState('');
  const [childEmail, setChildEmail] = useState('');
  const [csvText, setCsvText] = useState('');
  const [confirmAnonymize, setConfirmAnonymize] = useState('');
  const [confirmDelete, setConfirmDelete] = useState('');

  const patchSchedule = (p: Partial<SchedulePeriodFormState>) =>
    setScheduleState((s) => ({ ...s, ...p }));

  const base = `/api/admin/offline-ops/users/${props.primaryUserId}`;

  const submitSchedule = async (historical: boolean) => {
    setError(null);
    const err = validateSchedulePeriodState(scheduleState, { historical });
    if (err) {
      setError(err);
      return;
    }
    const { schedule } = buildSchedulePayload(scheduleState, { historical });
    setBusy(true);
    try {
      const res = await fetch(historical ? `${base}/import-period` : `${base}/schedule-period`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerUserId: scheduleState.learnerUserId || undefined,
          tutor: { tutorUserId: scheduleState.tutor?.tutorUserId },
          schedule: historical ? { ...schedule, operationState: 'stopped' as const } : schedule,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMessage(
        historical
          ? `Imported ${json.sessionIds?.length || 0} historical sessions.`
          : `Scheduled ${json.sessionIds?.length || 0} sessions.`
      );
      setPanel(null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const submitChild = async () => {
    if (!childName.trim()) {
      setError('Child full name is required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/add-child`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: childName.trim(),
          email: childEmail.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMessage('Child learner linked.');
      setPanel(null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const submitCsv = async () => {
    if (!scheduleState.tutor?.tutorUserId) {
      setError('Select a tutor for CSV import.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/import-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv: csvText,
          tutor: { tutorUserId: scheduleState.tutor.tutorUserId },
          learnerUserId: scheduleState.learnerUserId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMessage(`Imported ${json.imported} period(s) from CSV.`);
      setPanel(null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const submitAnonymize = async () => {
    if (confirmAnonymize !== 'ANONYMIZE') {
      setError('Type ANONYMIZE to confirm.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/anonymize`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMessage('User data anonymized. Session history retained for analytics.');
      router.push('/admin/offline-ops/users');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const submitDelete = async () => {
    if (confirmDelete !== 'DELETE') {
      setError('Type DELETE to confirm.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${base}/delete`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMessage('User deleted. Session counts and tutor ratings preserved.');
      router.push('/admin/offline-ops/users');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const cards: { id: Panel; title: string; desc: string; show: boolean }[] = [
    { id: 'schedule', title: 'Schedule new period', desc: 'Add sessions for a new billing period', show: true },
    { id: 'child', title: 'Add child learner', desc: 'Link another learner to this parent', show: props.userType === 'parent' },
    { id: 'import', title: 'Import past period', desc: 'Backfill Jan–Apr style history (no emails)', show: true },
    { id: 'csv', title: 'CSV import', desc: 'Bulk import multiple historical periods', show: true },
    { id: 'anonymize', title: 'Soft anonymize', desc: 'Remove PII; keep sessions for analytics', show: true },
    { id: 'delete', title: 'Delete user', desc: 'Erase the account; keep session counts + tutor ratings', show: true },
  ];

  return (
    <div className="space-y-6">
      {message && (
        <p className="text-sm border border-emerald-200 bg-emerald-50 text-emerald-900 px-3 py-2 rounded-md">{message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {props.offlineOperationId && (
          <Link
            href={`/admin/offline-ops/${props.offlineOperationId}`}
            className="bg-white border border-[#1B2C4F]/12 p-4 rounded-lg shadow-sm hover:border-[#4A6FBF]/40"
          >
            <p className="font-semibold text-[#1B2C4F]">Operation detail</p>
            <p className="text-xs text-slate-500 mt-1">Sessions, payments, next session</p>
          </Link>
        )}
        {cards
          .filter((c) => c.show)
          .map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setPanel(c.id);
                setError(null);
              }}
              className="text-left bg-white border border-[#1B2C4F]/12 p-4 rounded-lg shadow-sm hover:border-[#4A6FBF]/40"
            >
              <p className="font-semibold text-[#1B2C4F]">{c.title}</p>
              <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
            </button>
          ))}
      </div>

      {panel && (
        <div className="bg-white border border-[#1B2C4F]/15 rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-lg font-semibold text-[#1B2C4F]">
              {cards.find((c) => c.id === panel)?.title}
            </h2>
            <Button type="button" variant="ghost" size="sm" onClick={() => setPanel(null)}>
              Close
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {(panel === 'schedule' || panel === 'import') && (
            <>
              <OfflineSchedulePeriodFields
                state={scheduleState}
                onChange={patchSchedule}
                learners={props.learners}
                showLearnerSelect={props.learners.length >= 1 && props.userType === 'parent'}
                historicalDefaults={panel === 'import'}
              />
              <Button
                type="button"
                disabled={busy}
                className="bg-[#1B2C4F] hover:bg-[#15243d]"
                onClick={() => submitSchedule(panel === 'import')}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {panel === 'import' ? 'Import period' : 'Schedule period'}
              </Button>
            </>
          )}

          {panel === 'child' && (
            <div className="grid gap-4 max-w-md">
              <div>
                <Label>Learner full name *</Label>
                <Input value={childName} onChange={(e) => setChildName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="Leave blank for system email"
                  className="mt-1"
                />
              </div>
              <Button type="button" disabled={busy} onClick={submitChild} className="bg-[#1B2C4F]">
                Add child
              </Button>
            </div>
          )}

          {panel === 'csv' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Header row: startDate,weeks,subjects,sessionsPerWeek,dayTimeSlots,durationMinutes,deliveryMode,meetLink,onsiteLocation,payPerMonth,payMonths,startMonthLabel,operationState
                <br />
                dayTimeSlots example: <code>mon:16:00|wed:16:00</code> — subjects: <code>Math|English</code>
              </p>
              <OfflineSchedulePeriodFields
                state={scheduleState}
                onChange={patchSchedule}
                showTutorPicker
                showLearnerSelect={false}
                historicalDefaults
              />
              <Textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Paste CSV rows…"
                className="min-h-[160px] font-mono text-xs"
              />
              <Button type="button" disabled={busy} onClick={submitCsv} className="bg-[#1B2C4F]">
                Import CSV
              </Button>
            </div>
          )}

          {panel === 'anonymize' && (
            <div className="space-y-4 max-w-md">
              <p className="text-sm text-slate-600">
                Replaces names and emails for this family with anonymized placeholders. Individual sessions and revenue
                data stay for reporting. Type <strong>ANONYMIZE</strong> to confirm.
              </p>
              <Input
                value={confirmAnonymize}
                onChange={(e) => setConfirmAnonymize(e.target.value)}
                placeholder="ANONYMIZE"
              />
              <Button type="button" variant="destructive" disabled={busy} onClick={submitAnonymize}>
                Soft anonymize user
              </Button>
            </div>
          )}

          {panel === 'delete' && (
            <div className="space-y-4 max-w-md">
              <p className="text-sm text-slate-600">
                Removes the auth account and profile so this user can no longer sign in. Tutor session counts, learner
                feedback, ratings, and revenue rows are kept (anonymized references). Type <strong>DELETE</strong> to
                confirm.
              </p>
              <Input
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="DELETE"
              />
              <Button type="button" variant="destructive" disabled={busy} onClick={submitDelete}>
                Delete user account
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
