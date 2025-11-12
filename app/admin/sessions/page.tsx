import Link from 'next/link';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminNav from '../components/AdminNav';

/**
 * Sessions Admin Page
 * 
 * Overview of all sessions with links to flags
 */

export default async function SessionsPage() {
  // Check authentication and admin permission
  const user = await getServerSession();
  
  if (!user) {
    redirect('/admin/login');
  }

  const adminStatus = await isAdmin(user.id);
  
  if (!adminStatus) {
    redirect('/admin/login');
  }

  // Get Supabase client for data fetching
  const supabase = await createServerSupabaseClient();
  
  if (!supabase) {
    console.error('Failed to create Supabase client');
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">Failed to connect to database. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Get session stats
  const { data: trialSessions } = await supabase
    .from('trial_sessions')
    .select('id, status')
    .limit(1000);

  const { data: recurringSessions } = await supabase
    .from('recurring_sessions')
    .select('id, status')
    .limit(1000);

  const { data: flags, error: flagsError } = await supabase
    .from('admin_flags')
    .select('id, resolved, severity')
    .limit(1000);
  
  if (flagsError) {
    console.error('Error fetching flags:', flagsError);
  }

  const totalSessions = (trialSessions?.length || 0) + (recurringSessions?.length || 0);
  const unresolvedFlags = (flags || []).filter(f => !f.resolved).length || 0;
  const criticalFlags = (flags || []).filter(f => !f.resolved && f.severity === 'critical').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions</h1>
          <p className="text-gray-600">Manage and monitor all tutoring sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sessions</h3>
            <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Trial Sessions</h3>
            <p className="text-3xl font-bold text-blue-600">{trialSessions?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Recurring Sessions</h3>
            <p className="text-3xl font-bold text-green-600">{recurringSessions?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Unresolved Flags</h3>
            <p className="text-3xl font-bold text-red-600">{unresolvedFlags}</p>
            {criticalFlags > 0 && (
              <p className="text-sm text-red-600 mt-1">{criticalFlags} critical</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/sessions/flags"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-red-200 hover:border-red-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Session Flags</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Review and resolve flags detected in session transcripts
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    {unresolvedFlags} Unresolved
                  </span>
                  {criticalFlags > 0 && (
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold">
                      {criticalFlags} Critical
                    </span>
                  )}
                </div>
              </div>
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </Link>

          <Link
            href="/admin/sessions/active"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-blue-200 hover:border-blue-400"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
                <p className="text-sm text-gray-600">
                  View all currently active tutoring sessions
                </p>
              </div>
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Session Monitoring</h3>
          <p className="text-sm text-blue-800 mb-4">
            Session flags are automatically detected when Fathom AI processes meeting transcripts.
            Flags are created for payment bypass attempts, inappropriate language, contact sharing,
            and session quality issues.
          </p>
          <p className="text-sm text-blue-800">
            <strong>Critical flags</strong> are automatically flagged and admins are notified immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
