'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OfflineSchedulePeriodFields, {
  buildSchedulePayload,
  defaultSchedulePeriodState,
  validateSchedulePeriodState,
  type SchedulePeriodFormState,
} from '@/components/admin/offline-ops/OfflineSchedulePeriodFields';

export default function OfflineOpsModificationsPanel({
  offlineOperationId,
  primaryUserId,
  learnerUserId,
  tutorUserId,
  learners,
}: {
  offlineOperationId: string;
  primaryUserId: string;
  learnerUserId: string | null;
  tutorUserId: string | null;
  learners: Array<{ id: string; full_name?: string | null }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [state, setState] = useState<SchedulePeriodFormState>(() => ({
    ...defaultSchedulePeriodState(),
    learnerUserId: learnerUserId || learners[0]?.id || '',
    tutor: tutorUserId ? { tutorUserId, tutorName: 'Tutor' } : null,
  }));

  const submit = async () => {
    setError(null);
    const err = validateSchedulePeriodState(state);
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
          schedule,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setOk(`Scheduled ${json.sessionIds?.length || 0} new sessions.`);
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
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
          <p className="text-sm text-slate-600 mt-1 pl-4">Schedule an additional period (same fields as new enrollment).</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? 'Hide form' : 'Schedule new period'}
        </Button>
      </div>
      {ok && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">{ok}</p>}
      {open && (
        <div className="border-t border-[#1B2C4F]/10 pt-4 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <OfflineSchedulePeriodFields
            state={state}
            onChange={(p) => setState((s) => ({ ...s, ...p }))}
            learners={learners}
            showLearnerSelect={learners.length > 1}
          />
          <Button type="button" disabled={busy} className="bg-[#1B2C4F]" onClick={submit}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Schedule period
          </Button>
        </div>
      )}
    </div>
  );
}
