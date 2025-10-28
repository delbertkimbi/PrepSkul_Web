import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from './components/AdminNav';

export default async function AdminDashboard() {
  // Check authentication
  const user = await getServerSession();
  
  if (!user) {
    redirect('/admin/login');
  }

  // Check admin permission
  const adminStatus = await isAdmin(user.id);
  
  if (!adminStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have admin permissions.</p>
        </div>
      </div>
    );
  }

  // Fetch real-time metrics
  const supabase = await createServerSupabaseClient();
  
  // User counts by type
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  const { count: tutorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'tutor');
  
  const { count: learnerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'learner');
  
  const { count: parentCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'parent');
  
  // Pending tutors
  const { count: pendingTutors } = await supabase
    .from('tutor_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  
  // Active sessions (happening now)
  const now = new Date().toISOString();
  const { count: activeSessions } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .lte('start_time', now)
    .gte('end_time', now);
  
  // Upcoming sessions today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const { count: upcomingToday } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());
  
  // Total revenue from completed payments
  const { data: completedPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');
  
  const totalRevenue = completedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  
  // This month's revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data: monthlyPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString());
  
  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {tutorCount || 0} tutors • {learnerCount || 0} learners • {parentCount || 0} parents
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Pending Tutors</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingTutors || 0}</p>
              <a href="/admin/tutors/pending" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
                Review applications →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{activeSessions || 0}</p>
              <p className="text-xs text-gray-500 mt-2">{upcomingToday || 0} scheduled today</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Revenue (XAF)</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">
                This month: {monthlyRevenue.toLocaleString()} XAF
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/sessions" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition">
              <h3 className="font-semibold text-gray-900">Sessions</h3>
              <p className="text-sm text-gray-600 mt-1">View all lessons and schedules</p>
            </a>
            <a href="/admin/sessions/active" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition">
              <h3 className="font-semibold text-gray-900">Active Now</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor ongoing sessions</p>
            </a>
            <a href="/admin/tutors/pending" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-500 transition">
              <h3 className="font-semibold text-gray-900">Pending Tutors</h3>
              <p className="text-sm text-gray-600 mt-1">Review tutor applications</p>
            </a>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        </div>
      </main>
    </div>
  );
}

