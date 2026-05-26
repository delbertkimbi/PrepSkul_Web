import { Suspense } from 'react';
import { PortalShell } from '@/components/portals/PortalShell';
import SessionRescheduleClient from '@/components/portals/SessionRescheduleClient';

export default function LearnerSessionReschedulePage() {
  return (
    <PortalShell title="Reschedule">
      <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
        <SessionRescheduleClient mode="learner" />
      </Suspense>
    </PortalShell>
  );
}
