import { Suspense } from 'react';
import { PortalShell } from '@/components/portals/PortalShell';
import SessionFeedbackClient from './SessionFeedbackClient';

export default function LearnerSessionFeedbackPortalPage() {
  return (
    <PortalShell title="Session feedback">
      <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
        <SessionFeedbackClient />
      </Suspense>
    </PortalShell>
  );
}
