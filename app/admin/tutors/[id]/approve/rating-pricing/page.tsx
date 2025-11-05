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

          {/* Tutor's Desired Rate Range */}
          {tutor.expected_rate && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Tutor's Desired Rate Range</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-700 mt-2">
                    {typeof tutor.expected_rate === 'number' 
                      ? `${tutor.expected_rate.toLocaleString()} XAF/hour` 
                      : tutor.expected_rate}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    This is the price range the tutor selected during onboarding. Use this as a reference when setting the final pricing.
                  </p>
                </div>
                <div className="text-right bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-xs font-medium text-blue-600 uppercase mb-1">Reference</p>
                  <p className="text-xs text-gray-600">Consider when setting</p>
                  <p className="text-xs text-gray-600">final pricing</p>
                </div>
              </div>
            </div>
          )}

          {/* Rating & Pricing Section */}
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
