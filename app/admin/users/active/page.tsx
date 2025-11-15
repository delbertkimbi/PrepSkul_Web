import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';

export default async function ActiveUsers() {
  const user = await getServerSession();
  if (!user) {
    redirect('/admin/login');
  }
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) {
    redirect('/admin/login');
  }

  const supabase = await createServerSupabaseClient();
  
  // Time thresholds
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Online now (last 5 minutes)
  const { count: onlineNow } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', fiveMinutesAgo.toISOString());

  const { count: tutorsOnline } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'tutor')
    .gte('last_seen', fiveMinutesAgo.toISOString());

  const { count: learnersOnline } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'learner')
    .gte('last_seen', fiveMinutesAgo.toISOString());

  const { count: parentsOnline } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'parent')
    .gte('last_seen', fiveMinutesAgo.toISOString());

  // Active today (last 24 hours)
  const { count: activeToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', oneDayAgo.toISOString());

  // Active this week
  const { count: activeThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_seen', oneWeekAgo.toISOString());

  // Users currently in sessions
  const { count: inSessions } = await supabase
    .from('lessons')
    .select('tutor_id, learner_id', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .lte('start_time', now.toISOString())
    .gte('end_time', now.toISOString());

  // Get online users list with details
  const { data: onlineUsers } = await supabase
    .from('profiles')
    .select('id, full_name, user_type, last_seen')
    .gte('last_seen', fiveMinutesAgo.toISOString())
    .order('last_seen', { ascending: false })
    .limit(50);

  // Peak activity times (hourly breakdown for today)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const { data: todayActivity } = await supabase
    .from('profiles')
    .select('last_seen')
    .gte('last_seen', startOfDay.toISOString())
    .order('last_seen', { ascending: true });

  // Process hourly data
  const hourlyActivity = new Array(24).fill(0);
  todayActivity?.forEach((user) => {
    const hour = new Date(user.last_seen).getHours();
    hourlyActivity[hour]++;
  });

  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
  const peakCount = Math.max(...hourlyActivity);

  function getTimeAgo(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Active Users</h1>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{onlineNow || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 5 minutes</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Active Today</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeToday || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 24 hours</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Active This Week</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{activeThisWeek || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Last 7 days</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">In Sessions</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{inSessions || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Currently teaching/learning</p>
            </div>
          </div>

          {/* By User Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Online by User Type</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{tutorsOnline || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Tutors</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{learnersOnline || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Learners</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{parentsOnline || 0}</p>
                <p className="text-sm text-gray-600 mt-1">Parents</p>
              </div>
            </div>
          </div>

          {/* Peak Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity Today</h2>
            <div className="flex items-center gap-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{peakHour}:00</p>
                <p className="text-sm text-gray-600 mt-1">Peak Hour</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{peakCount}</p>
                <p className="text-sm text-gray-600 mt-1">Users at Peak</p>
              </div>
            </div>
            <div className="mt-4 flex items-end gap-1 h-32">
              {hourlyActivity.map((count, hour) => {
                const height = peakCount > 0 ? (count / peakCount) * 100 : 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                      title={`${hour}:00 - ${count} users`}
                    />
                    {hour % 3 === 0 && (
                      <p className="text-xs text-gray-400 mt-1">{hour}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Online Users List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Currently Online ({onlineUsers?.length || 0})
            </h2>
            {!onlineUsers || onlineUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">No users online right now</p>
            ) : (
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{getTimeAgo(user.last_seen)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

