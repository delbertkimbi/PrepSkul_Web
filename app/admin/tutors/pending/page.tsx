import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';

export default async function PendingTutors() {
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
  
  // Fetch pending tutor applications with profile data
  const { data: tutors, error } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Fetch profiles separately for each tutor
  let tutorsWithProfiles = [];
  if (tutors) {
      tutorsWithProfiles = await Promise.all(
      tutors.map(async (tutor) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number, email')
          .eq('id', tutor.user_id)
          .maybeSingle();
        
        return { ...tutor, profiles: profile || {} };
      })
    );
  }

  const pendingCount = tutorsWithProfiles?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pending Tutor Applications</h1>
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
          {pendingCount} Pending
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-4">
        <input 
          type="text" 
          placeholder="Search tutors..." 
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>All Subjects</option>
          <option>Mathematics</option>
          <option>English</option>
          <option>Science</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option>All Locations</option>
          <option>Douala</option>
          <option>Yaoundé</option>
        </select>
      </div>

      {/* Tutor List */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading tutors: {error.message}
          </div>
        )}

        {!error && pendingCount === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
            <p className="mt-1 text-sm text-gray-500">Tutor applications will appear here when submitted.</p>
          </div>
        )}

        {/* Tutor Cards */}
        {tutorsWithProfiles?.map((tutor) => (
          <div key={tutor.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                {tutor.profile_photo_url ? (
                  <img 
                    src={tutor.profile_photo_url} 
                    alt={tutor.profiles?.full_name || 'Tutor'} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {tutor.profiles?.full_name?.charAt(0) || 'T'}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{tutor.profiles?.full_name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(tutor.tutoring_areas) ? tutor.tutoring_areas.join(', ') : 'No subjects'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {tutor.city || 'Location not specified'} • {tutor.teaching_duration || 'Less than 1 year'} experience
                  </p>
                  <p className="text-sm text-gray-500">
                    Applied: {new Date(tutor.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Phone: {tutor.profiles?.phone_number || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <form action={`/api/admin/tutors/approve`} method="POST">
                  <input type="hidden" name="tutorId" value={tutor.id} />
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                    Approve
                  </button>
                </form>
                <form action={`/api/admin/tutors/reject`} method="POST">
                  <input type="hidden" name="tutorId" value={tutor.id} />
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                    Reject
                  </button>
                </form>
                <a 
                  href={`/admin/tutors/${tutor.id}`} 
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  View Details
                </a>
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

