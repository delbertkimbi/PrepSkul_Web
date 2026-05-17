import { Suspense } from 'react';
import SessionHubClient from '@/components/portals/SessionHubClient';

export default function TutorSessionHubPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FB] px-4 py-8">
      <Suspense fallback={<div className="max-w-2xl mx-auto text-sm text-slate-600">Loading session…</div>}>
        <SessionHubClient mode="tutor" />
      </Suspense>
    </main>
  );
}
