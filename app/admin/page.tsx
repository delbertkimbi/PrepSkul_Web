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
  
  // Fix learner count - check for case variations and null values
  const { count: learnerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .or('user_type.eq.learner,user_type.eq.Learner,user_type.eq.LEARNER')
    .not('user_type', 'is', null);
  
  const { count: parentCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'parent');
  
  // Pending tutors - separate counts for new applications and pending updates
  const { count: newApplications } = await supabase
    .from('tutor_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
    .or('has_pending_update.is.null,has_pending_update.eq.false');

  const { count: pendingUpdates } = await supabase
    .from('tutor_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('has_pending_update', true);

  const pendingTutors = (newApplications || 0) + (pendingUpdates || 0);
  
  // Active sessions (happening now) - check both individual_sessions and trial_sessions
  const now = new Date();
  const nowISO = now.toISOString();
  const todayDate = now.toISOString().split('T')[0];
  const nowTime = now.toTimeString().split(' ')[0].substring(0, 5);
  
  // Count active individual sessions
  const { count: activeIndividualSessions } = await supabase
    .from('individual_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')
    .eq('scheduled_date', todayDate)
    .lte('scheduled_time', nowTime);
  
  // Count active trial sessions
  const { count: activeTrialSessions } = await supabase
    .from('trial_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'in_progress')
    .eq('scheduled_date', todayDate)
    .lte('scheduled_time', nowTime);
  
  const activeSessions = (activeIndividualSessions || 0) + (activeTrialSessions || 0);
  
  // Upcoming sessions today
  const { count: upcomingTodayIndividual } = await supabase
    .from('individual_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .eq('scheduled_date', todayDate)
    .gte('scheduled_time', nowTime);
  
  const { count: upcomingTodayTrial } = await supabase
    .from('trial_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .eq('scheduled_date', todayDate)
    .gte('scheduled_time', nowTime);
  
  const upcomingToday = (upcomingTodayIndividual || 0) + (upcomingTodayTrial || 0);
  
  // Total revenue from completed session payments
  const { data: completedPayments } = await supabase
    .from('session_payments')
    .select('amount')
    .eq('payment_status', 'paid');
  
  const totalRevenue = completedPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
  
  // This month's revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const { data: monthlyPayments } = await supabase
    .from('session_payments')
    .select('amount')
    .eq('payment_status', 'paid')
    .gte('created_at', startOfMonth.toISOString());
  
  const monthlyRevenue = monthlyPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

  // Active user metrics
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const { count: onlineNow } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', fiveMinutesAgo.toISOString());

  const { count: activeToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', oneDayAgo.toISOString());

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
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{onlineNow || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {activeToday || 0} active today
              </p>
              <a href="/admin/users/active" className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block">
                View details →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{pendingTutors || 0}</p>
              <p className="text-xs text-gray-500 mt-2">
                {newApplications || 0} new • {pendingUpdates || 0} updates
              </p>
              <a href="/admin/tutors/pending" className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block">
                Review applications →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Revenue (XAF)</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">
                This month: {monthlyRevenue.toLocaleString()} XAF
              </p>
            </div>
          </div>

          {/* Secondary Stats - Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{activeSessions || 0}</p>
              <p className="text-xs text-gray-500 mt-2">{upcomingToday || 0} scheduled today</p>
              <a href="/admin/sessions/active" className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block">
                Monitor live →
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Platform Health</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <p className="text-xl font-bold text-green-600">All Systems Operational</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {onlineNow || 0} users online • {activeSessions || 0} active sessions
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a href="/admin/users/active" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition">
              <h3 className="font-semibold text-gray-900">Active Users</h3>
              <p className="text-sm text-gray-600 mt-1">See who's online now</p>
            </a>
            <a href="/admin/sessions" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition">
              <h3 className="font-semibold text-gray-900">Sessions</h3>
              <p className="text-sm text-gray-600 mt-1">View all lessons and schedules</p>
            </a>
            <a href="/admin/sessions/active" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition">
              <h3 className="font-semibold text-gray-900">Active Now</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor ongoing sessions</p>
            </a>
            <a href="/admin/tutors?tab=pending" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-orange-500 transition">
              <h3 className="font-semibold text-gray-900">Pending Tutors</h3>
              <p className="text-sm text-gray-600 mt-1">Review tutor applications</p>
            </a>
            <a href="/admin/tutor-requests" className="bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-500 transition">
              <h3 className="font-semibold text-gray-900">Tutor Requests</h3>
              <p className="text-sm text-gray-600 mt-1">Manage custom requests</p>
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

