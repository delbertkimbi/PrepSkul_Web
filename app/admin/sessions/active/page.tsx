import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import { Video, Clock, User, ExternalLink } from 'lucide-react';

export default async function ActiveSessionsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();

  // Fetch active sessions (happening right now)
  const { data: activeLessons, error: activeError } = await supabase
    .from('lessons')
    .select('*')
    .eq('status', 'scheduled')
    .lte('start_time', now)
    .gte('end_time', now);

  // Fetch upcoming sessions (next 2 hours)
  const twoHoursLater = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const { data: upcomingLessons, error: upcomingError } = await supabase
    .from('lessons')
    .select('*')
    .eq('status', 'scheduled')
    .gte('start_time', now)
    .lte('start_time', twoHoursLater)
    .order('start_time', { ascending: true });

  // Get details for active sessions
  let activeSessionsWithDetails = [];
  if (activeLessons) {
    activeSessionsWithDetails = await Promise.all(
      activeLessons.map(async (lesson) => {
        const { data: tutorProfile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', lesson.tutor_id)
          .single();

        const { data: learnerProfile } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('id', lesson.learner_id)
          .single();

        // Calculate progress
        const startTime = new Date(lesson.start_time).getTime();
        const endTime = new Date(lesson.end_time).getTime();
        const currentTime = Date.now();
        const progress = Math.min(100, Math.max(0, ((currentTime - startTime) / (endTime - startTime)) * 100));
        
        // Calculate time remaining
        const minutesRemaining = Math.max(0, Math.floor((endTime - currentTime) / (1000 * 60)));

        return {
          ...lesson,
          tutor: tutorProfile,
          learner: learnerProfile,
          progress,
          minutesRemaining,
        };
      })
    );
  }

  // Get details for upcoming sessions
  let upcomingSessionsWithDetails = [];
  if (upcomingLessons) {
    upcomingSessionsWithDetails = await Promise.all(
      upcomingLessons.map(async (lesson) => {
        const { data: tutorProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', lesson.tutor_id)
          .single();

        const { data: learnerProfile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', lesson.learner_id)
          .single();

        // Calculate minutes until start
        const startTime = new Date(lesson.start_time).getTime();
        const minutesUntilStart = Math.floor((startTime - Date.now()) / (1000 * 60));

        return {
          ...lesson,
          tutor: tutorProfile,
          learner: learnerProfile,
          minutesUntilStart,
        };
      })
    );
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Active Sessions Monitor</h1>
              <p className="text-sm text-gray-600 mt-1">Real-time view of ongoing and upcoming sessions</p>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/sessions"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                View All Sessions
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Right Now</p>
                  <p className="text-4xl font-bold mt-2">{activeSessionsWithDetails.length}</p>
                  <p className="text-sm opacity-75 mt-1">🔴 Live sessions in progress</p>
                </div>
                <Video size={48} className="opacity-75" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Starting Soon</p>
                  <p className="text-4xl font-bold mt-2">{upcomingSessionsWithDetails.length}</p>
                  <p className="text-sm opacity-75 mt-1">📅 Next 2 hours</p>
                </div>
                <Clock size={48} className="opacity-75" />
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Active Now ({activeSessionsWithDetails.length})
            </h2>
            
            {activeError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                Error loading active sessions: {activeError.message}
              </div>
            )}

            {!activeError && activeSessionsWithDetails.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active sessions</h3>
                <p className="mt-1 text-sm text-gray-500">Sessions will appear here when they start.</p>
              </div>
            )}

            <div className="space-y-4">
              {activeSessionsWithDetails.map((session) => (
                <div key={session.id} className="bg-white rounded-lg border-2 border-green-500 p-6 shadow-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        <h3 className="text-xl font-bold text-gray-900">{session.subject || 'Session'}</h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          LIVE
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Tutor</p>
                          <p className="font-medium text-gray-900">{session.tutor?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{session.tutor?.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Learner</p>
                          <p className="font-medium text-gray-900">{session.learner?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{session.learner?.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {formatTime(session.start_time)} - {formatTime(session.end_time)}
                          </span>
                          <span className="font-medium text-green-600">
                            {session.minutesRemaining} min remaining
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                      </div>

                      {session.meeting_link && (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          <ExternalLink size={16} />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Starting Soon ({upcomingSessionsWithDetails.length})
            </h2>

            {upcomingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                Error loading upcoming sessions: {upcomingError.message}
              </div>
            )}

            {!upcomingError && upcomingSessionsWithDetails.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming sessions</h3>
                <p className="mt-1 text-sm text-gray-500">No sessions scheduled for the next 2 hours.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessionsWithDetails.map((session) => (
                <div key={session.id} className="bg-white rounded-lg border border-blue-300 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{session.subject || 'Session'}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      In {session.minutesUntilStart} min
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={14} />
                      <span>Tutor: {session.tutor?.full_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={14} />
                      <span>Learner: {session.learner?.full_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={14} />
                      <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

