import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../../../components/AdminNav';
import Link from 'next/link';
import RatingPricingSection from '../../RatingPricingSection';

export default async function RatingPricingPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  
  // Fetch tutor data
  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-red-600">Tutor not found</p>
            <Link href="/admin/tutors" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Back to Tutors
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fetch profile for name display
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', tutor.user_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link href={`/admin/tutors/${id}`} className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Tutor Details
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Approve Tutor: {profile?.full_name || 'Tutor'}</h1>
            <p className="text-sm text-gray-500 mt-1">Step 1 of 2: Set Initial Rating & Pricing</p>
          </div>

          {/* Rating & Pricing Section - includes tutor's requested rate reference */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <RatingPricingSection tutor={tutor} tutorId={tutor.id} />
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href={`/admin/tutors/${id}`}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium transition-colors"
            >
              Cancel
            </Link>
            <Link
              href={`/admin/tutors/${id}/approve/email`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium transition-colors"
            >
              Next: Send Approval Email →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
