import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default async function SessionsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();

  // Fetch all lessons with tutor and learner info
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(100);

  // Get tutor and learner profiles for each lesson
  let lessonsWithDetails = [];
  if (lessons) {
    lessonsWithDetails = await Promise.all(
      lessons.map(async (lesson) => {
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

        return {
          ...lesson,
          tutor: tutorProfile,
          learner: learnerProfile,
        };
      })
    );
  }

  // Calculate stats
  const totalSessions = lessons?.length || 0;
  const scheduledSessions = lessons?.filter(l => l.status === 'scheduled').length || 0;
  const completedSessions = lessons?.filter(l => l.status === 'completed').length || 0;
  const cancelledSessions = lessons?.filter(l => l.status === 'cancelled').length || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <AlertCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">All Sessions</h1>
            <div className="flex gap-2">
              <a
                href="/admin/sessions/active"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                View Active Sessions
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{scheduledSessions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{completedSessions}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{cancelledSessions}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-4">
            <input
              type="text"
              placeholder="Search by tutor or learner..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Statuses</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>English</option>
              <option>Science</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                Error loading sessions: {error.message}
              </div>
            )}

            {!error && totalSessions === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
                <p className="mt-1 text-sm text-gray-500">Sessions will appear here when booked.</p>
              </div>
            )}

            {lessonsWithDetails?.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Date/Time */}
                    <div className="flex flex-col items-center justify-center bg-blue-50 rounded-lg p-4 min-w-[120px]">
                      <Calendar size={24} className="text-blue-600 mb-2" />
                      <p className="text-sm font-medium text-gray-900">{formatDate(lesson.start_time)}</p>
                      <p className="text-xs text-gray-600">{formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}</p>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{lesson.subject || 'No Subject'}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(lesson.status)}`}>
                          {getStatusIcon(lesson.status)}
                          {lesson.status?.charAt(0).toUpperCase() + lesson.status?.slice(1)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>Tutor: {lesson.tutor?.full_name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>Learner: {lesson.learner?.full_name || 'Unknown'}</span>
                        </div>
                        {lesson.description && (
                          <p className="text-gray-500 mt-2">{lesson.description}</p>
                        )}
                      </div>

                      {lesson.meeting_link && (
                        <a
                          href={lesson.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Join Meeting →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

