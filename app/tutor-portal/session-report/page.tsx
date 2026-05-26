import { Suspense } from 'react';
import { PortalShell } from '@/components/portals/PortalShell';
import SessionReportClient from './SessionReportClient';

export default function TutorSessionReportPortalPage() {
  return (
    <PortalShell title="Tutor session report">
      <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
        <SessionReportClient />
      </Suspense>
    </PortalShell>
  );
}
