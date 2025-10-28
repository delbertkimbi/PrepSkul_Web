import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';

export default async function AnalyticsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0 XAF</p>
          <p className="text-xs text-green-600 mt-1">+0% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Sessions Completed</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-xs text-green-600 mt-1">+0% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Active Tutors</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
          <p className="text-xs text-gray-600 mt-1">0 pending approval</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Avg Session Rating</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">0.0</p>
          <p className="text-xs text-gray-600 mt-1">No ratings yet</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Chart will appear here
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Subjects</h2>
          <div className="h-48 flex items-center justify-center text-gray-400">
            Chart will appear here
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h2>
          <div className="h-48 flex items-center justify-center text-gray-400">
            Chart will appear here
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
}

