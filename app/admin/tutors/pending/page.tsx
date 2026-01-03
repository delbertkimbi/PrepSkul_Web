import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import TutorCard from '@/app/admin/components/TutorCard';

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
  
  // Fetch both new applications and pending updates
  // New applications: status = 'pending' AND (has_pending_update IS NULL OR has_pending_update = FALSE)
  // Pending updates: status = 'approved' AND has_pending_update = TRUE
  const { data: newApplications, error: newAppsError } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('status', 'pending')
    .or('has_pending_update.is.null,has_pending_update.eq.false')
    .order('created_at', { ascending: false });

  const { data: pendingUpdates, error: updatesError } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('status', 'approved')
    .eq('has_pending_update', true)
    .order('updated_at', { ascending: false });

  // Combine both lists
  const tutors = [...(newApplications || []), ...(pendingUpdates || [])];
  const error = newAppsError || updatesError;

  // Fetch profiles separately for each tutor
  let tutorsWithProfiles = [];
  if (tutors) {
      tutorsWithProfiles = await Promise.all(
      tutors.map(async (tutor) => {
        // Use tutor.id (primary key) first, fallback to user_id
        const profileId = tutor.id || tutor.user_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number, email')
          .eq('id', profileId)
          .maybeSingle();
        
        return { ...tutor, profiles: profile || {} };
      })
    );
  }

  const pendingCount = tutorsWithProfiles?.length || 0;
  const newAppsCount = newApplications?.length || 0;
  const updatesCount = pendingUpdates?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pending Tutor Reviews</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {pendingCount} Total
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
            {newAppsCount} New
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {updatesCount} Updates
          </span>
        </div>
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
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
        </div>
      </main>
    </div>
  );
}

