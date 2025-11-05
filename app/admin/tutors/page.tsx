import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import TutorsListClient from './TutorsListClient';

export default async function TutorsPage() {
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
  
  // Fetch all tutors with profile data
  const { data: tutors, error } = await supabase
    .from('tutor_profiles')
    .select('*')
    .order('created_at', { ascending: false });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tutor Management</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {tutorsWithProfiles?.length || 0} Total Tutors
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              Error loading tutors: {error.message}
            </div>
          )}

          <TutorsListClient tutors={tutorsWithProfiles || []} />
        </div>
      </main>
    </div>
  );
}
