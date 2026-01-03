import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import AmbassadorsListClient from './AmbassadorsListClient';

export default async function AmbassadorsPage() {
  // Check authentication
  const user = await getServerSession();
  
  if (!user) {
    redirect('/admin/login');
  }

  // Check admin permission
  const adminStatus = await isAdmin(user.id);
  
  if (!adminStatus) {
    redirect('/admin/login');
  }

  const supabase = await createServerSupabaseClient();
  
  // Fetch all ambassador applications
  const { data: ambassadors, error } = await supabase
    .from('ambassadors')
    .select('*')
    .order('created_at', { ascending: false });

  // Count by status
  const pendingCount = ambassadors?.filter(a => a.application_status === 'pending').length || 0;
  const approvedCount = ambassadors?.filter(a => a.application_status === 'approved').length || 0;
  const rejectedCount = ambassadors?.filter(a => a.application_status === 'rejected').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Ambassador Applications</h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                {pendingCount} Pending
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {approvedCount} Approved
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {ambassadors?.length || 0} Total
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              Error loading ambassadors: {error.message}
            </div>
          )}

          <AmbassadorsListClient ambassadors={ambassadors || []} />
        </div>
      </main>
    </div>
  );
}

