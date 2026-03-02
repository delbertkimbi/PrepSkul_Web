import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import ReachoutTrackListClient from './ReachoutTrackListClient';

export default async function ReachoutTrackPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: records, error } = await supabase
    .from('reachout_track')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reachout Track</h1>
            <p className="text-gray-600 mt-1">
              All customer reachout records. Search by WhatsApp number to find a specific customer.
            </p>
          </div>
          <a
            href="/admin/reachout/new"
            className="inline-flex items-center justify-center rounded-md bg-[#1B2C4F] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B2C4F]/90 transition-colors"
          >
            New reachout record
          </a>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            Error loading records: {error.message}. Ensure the <code className="bg-red-100 px-1 rounded">reachout_track</code> table exists in Supabase.
          </div>
        )}

        <ReachoutTrackListClient records={records || []} />
      </main>
    </div>
  );
}
