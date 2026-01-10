import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import FlagsListClient from './FlagsListClient';
import AdminNav from '../../components/AdminNav';

/**
 * Admin Messaging Flags Dashboard
 * 
 * Displays all flagged messages for admin review
 */

export default async function MessagingFlagsPage() {
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

  // Fetch initial flagged messages
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/flagged-messages?limit=50`,
    {
      headers: {
        'Cookie': `sb-access-token=${user.id}`, // Simplified - in production use proper auth
      },
    }
  );

  const data = response.ok ? await response.json() : { flaggedMessages: [] };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Flagged Messages
          </h1>
          <p className="text-gray-600">
            Review and resolve messages flagged for content violations
          </p>
        </div>

        <FlagsListClient initialFlags={data.flaggedMessages || []} />
      </div>
    </div>
  );
}

