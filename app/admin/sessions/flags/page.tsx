import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import FlagsListClient from './FlagsListClient';

/**
 * Admin Flags Dashboard
 * 
 * Displays all session flags for admin review
 */

export default async function AdminFlagsPage() {
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

  // Fetch flags
  const { data: flags } = await supabase
    .from('admin_flags')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Session Flags
          </h1>
          <p className="text-gray-600">
            Review and resolve flags detected in session transcripts
          </p>
        </div>

        <FlagsListClient initialFlags={flags || []} />
      </div>
    </div>
  );
}

