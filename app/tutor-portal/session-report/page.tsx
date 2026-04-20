import { Suspense } from 'react';
import SessionReportClient from './SessionReportClient';

export default function TutorSessionReportPortalPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-4 py-8">
      <Suspense fallback={<div className="max-w-3xl mx-auto text-sm text-gray-600">Loading report form...</div>}>
        <SessionReportClient />
      </Suspense>
    </main>
  );
}

