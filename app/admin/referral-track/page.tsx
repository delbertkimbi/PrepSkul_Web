import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import ReferralTrackListClient from './ReferralTrackListClient';

export default async function ReferralTrackPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const { data: records, error } = await supabase
    .from('ambassador_referrals')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Referral Track</h1>
          <p className="text-gray-600 mt-1">
            Referrals submitted by ambassadors. Search by WhatsApp number or ambassador name.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            Error loading referrals: {error.message}. Ensure the <code className="bg-red-100 px-1 rounded">ambassador_referrals</code> table exists in Supabase.
          </div>
        )}

        <ReferralTrackListClient records={records || []} />
      </main>
    </div>
  );
}
