import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../../components/AdminNav';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PendingUpdateClient from './PendingUpdateClient';

// Field name mapping for human-readable display
const FIELD_NAMES: Record<string, string> = {
  highest_education_level: 'Highest Education Level',
  bio: 'Bio',
  availability_schedule: 'Availability Schedule',
  subjects: 'Subjects',
  years_of_experience: 'Years of Experience',
  tutoring_availability: 'Tutoring Availability',
  test_session_availability: 'Test Session Availability',
  hourly_rate: 'Hourly Rate',
  certificates_urls: 'Certificates',
  social_media_links: 'Social Media Links',
  video_link: 'Video Link',
  languages: 'Languages',
  specializations: 'Specializations',
  education_background: 'Education Background',
  professional_experience: 'Professional Experience',
  teaching_approach: 'Teaching Approach',
  full_name: 'Full Name',
  city: 'City',
  tutoring_areas: 'Tutoring Areas',
};

// Format field value for display
function formatFieldValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export default async function PendingUpdatePage({ 
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
  
  // Fetch tutor data with pending_changes
  const { data: tutor, error: tutorError } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Tutor not found</h2>
            <p className="text-red-700">No tutor found with ID: {id}</p>
            <Link href="/admin/tutors" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Tutors
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Check if tutor has pending update
  // Handle different formats: JSONB object, string, or null
  let pendingChangesObj: Record<string, any> | null = null;
  
  if (tutor.pending_changes) {
    if (typeof tutor.pending_changes === 'string') {
      // If it's a string, try to parse it as JSON
      try {
        pendingChangesObj = JSON.parse(tutor.pending_changes);
      } catch (e) {
        console.error('Failed to parse pending_changes as JSON:', e);
        pendingChangesObj = null;
      }
    } else if (typeof tutor.pending_changes === 'object' && !Array.isArray(tutor.pending_changes)) {
      // If it's already an object, use it directly
      pendingChangesObj = tutor.pending_changes as Record<string, any>;
    }
  }
  
  // Check if we have valid pending changes
  const hasPendingChanges = pendingChangesObj && 
    typeof pendingChangesObj === 'object' && 
    !Array.isArray(pendingChangesObj) &&
    Object.keys(pendingChangesObj).length > 0;
  
  // Enhanced debug logging
  console.log('Tutor pending update check:', {
    tutorId: id,
    has_pending_update: tutor.has_pending_update,
    pending_changes_raw: tutor.pending_changes,
    pending_changes_type: typeof tutor.pending_changes,
    pending_changes_parsed: pendingChangesObj,
    hasPendingChanges,
    pendingChangesKeys: pendingChangesObj ? Object.keys(pendingChangesObj) : [],
    pendingChangesLength: pendingChangesObj ? Object.keys(pendingChangesObj).length : 0,
  });
    
  if (!tutor.has_pending_update || !hasPendingChanges) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">No Pending Updates</h2>
            <p className="text-yellow-700 mb-4">This tutor does not have any pending profile updates.</p>
            
            {/* Debug information - remove in production */}
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs font-mono">
              <p className="font-semibold mb-2">Debug Info:</p>
              <p>has_pending_update: {String(tutor.has_pending_update)}</p>
              <p>pending_changes type: {typeof tutor.pending_changes}</p>
              <p>pending_changes value: {tutor.pending_changes ? JSON.stringify(tutor.pending_changes, null, 2) : 'null'}</p>
              <p>hasPendingChanges: {String(hasPendingChanges)}</p>
              <p>pendingChangesObj: {pendingChangesObj ? JSON.stringify(pendingChangesObj, null, 2) : 'null'}</p>
            </div>
            
            <Link href="/admin/tutors" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Tutors
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fetch profile data
  let profile = null;
  if (tutor.user_id) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, phone_number, email')
      .eq('id', tutor.user_id)
      .maybeSingle();
    profile = profileData;
  }

  const tutorName = profile?.full_name || 'Unknown Tutor';
  const pendingChanges = tutor.pending_changes as Record<string, any>;

  // Get current values for comparison
  const currentValues: Record<string, any> = {};
  Object.keys(pendingChanges).forEach((field) => {
    currentValues[field] = tutor[field as keyof typeof tutor];
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/admin/tutors"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Pending Updates</h1>
                <p className="text-sm text-gray-600 mt-1">{tutorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Pending Update</span>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The tutor's current profile remains active until you approve these changes. 
              Review each change below and approve or reject individually, or approve/reject all at once.
            </p>
          </div>

          {/* Changes List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Changes ({Object.keys(pendingChanges).length})
              </h2>
              
              <div className="space-y-6">
                {Object.entries(pendingChanges).map(([field, newValue]) => {
                  const fieldName = FIELD_NAMES[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const currentValue = currentValues[field];
                  const hasChanged = JSON.stringify(currentValue) !== JSON.stringify(newValue);

                  return (
                    <div 
                      key={field}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{fieldName}</h3>
                        {hasChanged && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                            Changed
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Current Value */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Current Value</p>
                          <div className="bg-gray-50 rounded p-3 border border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                              {formatFieldValue(currentValue)}
                            </p>
                          </div>
                        </div>
                        
                        {/* New Value */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">New Value</p>
                          <div className="bg-blue-50 rounded p-3 border border-blue-200">
                            <p className="text-sm text-blue-900 whitespace-pre-wrap break-words">
                              {formatFieldValue(newValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Per-field action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <PendingUpdateClient 
                          tutorId={id} 
                          tutorUserId={tutor.user_id}
                          pendingChanges={pendingChanges}
                          currentValues={currentValues}
                          singleField={field}
                          fieldName={fieldName}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Client Component for Actions - Approve/Reject All */}
          <PendingUpdateClient 
            tutorId={id} 
            tutorUserId={tutor.user_id}
            pendingChanges={pendingChanges}
            currentValues={currentValues}
          />
        </div>
      </main>
    </div>
  );
}

