import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminNav from '../components/AdminNav';
import OfflineOpsStatsSummary from '@/components/admin/offline-ops/OfflineOpsStatsSummary';

export default async function OfflineOpsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: records, error } = await supabase
    .from('offline_operations')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Offline Operations</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Overview of WhatsApp and off-platform customer records. To enroll families or schedule sessions, use{' '}
            <a href="/admin/offline-ops/users" className="text-[#4A6FBF] font-medium underline">
              Offline Users
            </a>
            .
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            Error loading records: {error.message}
          </div>
        )}

        <OfflineOpsStatsSummary records={records || []} />

        <p className="mt-8 text-sm text-slate-600">
          Open a record from the list on{' '}
          <a href="/admin/offline-ops/users" className="text-[#4A6FBF] underline font-medium">
            Offline Users
          </a>{' '}
          to view schedules, history, and modifications. Detailed analytics are on the{' '}
          <a href="/admin/analytics" className="text-[#4A6FBF] underline font-medium">
            Analytics
          </a>{' '}
          page.
        </p>
      </main>
    </div>
  );
}
