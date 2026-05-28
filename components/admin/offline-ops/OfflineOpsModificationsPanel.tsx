'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OfflineSchedulePeriodFields, {
  buildHistoricalMonthlyPayloads,
  buildSchedulePayload,
  defaultHistoricalMonthRecord,
  defaultSchedulePeriodState,
  validateSchedulePeriodState,
  type SchedulePeriodFormState,
} from '@/components/admin/offline-ops/OfflineSchedulePeriodFields';
import type { OfflineSchedulingPeriodLite } from '@/components/admin/offline-ops/OfflineSessionHistoryPanel';

type PanelMode = 'closed' | 'schedule' | 'import';

/** Resume only for paused historical backfill — not live matchings already on active sessions/periods. */
export function shouldShowResumeMatching(
  onboardingStage?: string | null,
  periods: OfflineSchedulingPeriodLite[] = []
): boolean {
  const stage = (onboardingStage || '').toLowerCase();
  if (['active_sessions', 'completed'].includes(stage)) return false;

  const hasActiveLivePeriod = periods.some(
    (p) =>
      !p.is_historical_import &&
      String(p.operation_state || 'active').toLowerCase() === 'active'
  );
  if (hasActiveLivePeriod) return false;

  return stage === 'paused';
}

export default function OfflineOpsModificationsPanel({
  offlineOperationId,
  primaryUserId,
  learnerUserId,
  tutorUserId,
  learners,
  onboardingStage,
  schedulingPeriods = [],
}: {
  offlineOperationId: string;
  primaryUserId: string;
  learnerUserId: string | null;
  tutorUserId: string | null;
  learners: Array<{ id: string; full_name?: string | null }>;
  onboardingStage?: string | null;
  schedulingPeriods?: OfflineSchedulingPeriodLite[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<PanelMode>('closed');
  const [busy, setBusy] = useState(false);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [state, setState] = useState<SchedulePeriodFormState>(() => ({
    ...defaultSchedulePeriodState(),
    learnerUserId: learnerUserId || learners[0]?.id || '',
    tutor: tutorUserId ? { tutorUserId, tutorName: 'Tutor' } : null,
    historicalMonthRecords: [defaultHistoricalMonthRecord()],
  }));

  const canResume = shouldShowResumeMatching(onboardingStage, schedulingPeriods);

  const submitSchedule = async () => {
    setError(null);
    const err = validateSchedulePeriodState(state, { requireTutor: true });
    if (err) {
      setError(err);
      return;
    }
    const { schedule } = buildSchedulePayload(state);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/offline-ops/${offlineOperationId}/schedule-period`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerUserId: state.learnerUserId || undefined,
          tutor: { tutorUserId: state.tutor?.tutorUserId },
          schedule: { ...schedule, operationState: state.operationState || 'active' },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setOk(`Scheduled ${json.sessionIds?.length || 0} live sessions (reminders enabled, no welcome email).`);
      setMode('closed');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const submitImport = async () => {
    setError(null);
    const err = validateSchedulePeriodState(state, {
      historical: true,
      historicalMonthOnly: true,
    });
    if (err) {
      setError(err);
      return;
    }
    const monthlySchedules = buildHistoricalMonthlyPayloads(state);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/offline-ops/${offlineOperationId}/import-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerUserId: state.learnerUserId || undefined,
          monthlySchedules,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setOk(
        `Imported ${json.importedMonths || monthlySchedules.length} month(s), ${json.sessionIds?.length || 0} historical sessions (paused periods, no emails).`
      );
      setMode('closed');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const resumeMatching = async () => {
    setError(null);
    setResumeBusy(true);
    try {
      const res = await fetch(`/api/admin/offline-ops/${offlineOperationId}/resume-matching`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setOk(
        json.alreadyActive
          ? 'Matching is already active.'
          : 'Matching resumed. Schedule a new active period below when ready.'
      );
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setResumeBusy(false);
    }
  };

  if (!primaryUserId) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
        Link this operation to a primary user (run onboarding sync SQL) to schedule new periods here.
      </p>
    );
  }

  return (
    <div className="bg-white border border-[#1B2C4F]/15 p-5 rounded-lg shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-[#1B2C4F] text-lg border-l-4 border-[#4A6FBF] pl-3">Modifications</h2>
          <p className="text-sm text-slate-600 mt-1 pl-4">
            Import past billing months (paused, evaluated sessions), resume a paused matching, or schedule live
            sessions with reminders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canResume && (
            <Button type="button" variant="outline" disabled={resumeBusy} onClick={resumeMatching}>
              {resumeBusy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Resume matching
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode((m) => (m === 'import' ? 'closed' : 'import'))}
          >
            {mode === 'import' ? 'Hide import' : 'Import past months'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode((m) => (m === 'schedule' ? 'closed' : 'schedule'))}
          >
            {mode === 'schedule' ? 'Hide schedule' : 'Schedule live period'}
          </Button>
        </div>
      </div>

      {ok && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">{ok}</p>}

      {mode !== 'closed' && (
        <div className="border-t border-[#1B2C4F]/10 pt-4 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {mode === 'import' && (
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-3">
              Each month creates a <strong>paused</strong> billing period with evaluated sessions only — no welcome
              or reminder emails. Sessions are limited to that calendar month.
            </p>
          )}
          {mode === 'schedule' && (
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-3">
              Live sessions use normal reminders and session emails. The one-time match welcome email is not sent for
              extensions or resumed matchings.
            </p>
          )}
          <OfflineSchedulePeriodFields
            state={state}
            onChange={(p) => setState((s) => ({ ...s, ...p }))}
            learners={learners}
            showLearnerSelect={learners.length > 1}
            historical={mode === 'import'}
            historicalMonthOnly={mode === 'import'}
          />
          <Button
            type="button"
            disabled={busy}
            className="bg-[#1B2C4F]"
            onClick={mode === 'import' ? submitImport : submitSchedule}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {mode === 'import' ? 'Import historical months' : 'Schedule period'}
          </Button>
        </div>
      )}
    </div>
  );
}
