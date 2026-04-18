import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import OfflineOpsFormClient from './OfflineOpsFormClient';

export default async function NewOfflineOpsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Offline Operation Record</h1>
          <p className="text-gray-600 mt-1">
            Capture WhatsApp-managed customer onboarding, matching, session, and payment activity.
          </p>
        </div>
        <OfflineOpsFormClient />
      </main>
    </div>
  );
}
