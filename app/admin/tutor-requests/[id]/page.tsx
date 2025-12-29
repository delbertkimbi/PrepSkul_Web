import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import Link from 'next/link';
import TutorMatchingClient from './TutorMatchingClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Tutor Request Detail Page with Matching
 * Shows request details and matching tutors
 */
export default async function TutorRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  
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

  // Fetch request details
  const { data: request, error: requestError } = await supabase
    .from('tutor_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (requestError || !request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">Request not found or error loading request.</p>
            <Link href="/admin/tutor-requests" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Tutor Requests
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fetch matching tutors
  // Match by: subjects, location (if available), teaching mode, budget range
  let matchingTutors: any[] = [];
  let suggestedTutors: any[] = [];

  try {
    // Get all approved tutors
    const { data: allTutors } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone_number
        )
      `)
      .eq('status', 'approved')
      .limit(100);

    if (allTutors) {
      // Perfect matches: subjects overlap AND teaching mode matches AND budget is within range
      matchingTutors = allTutors.filter((tutor: any) => {
        const tutorSubjects = tutor.subjects || [];
        const requestSubjects = request.subjects || [];
        
        // Check subject overlap
        const hasSubjectMatch = requestSubjects.some((subject: string) =>
          tutorSubjects.some((tutorSubject: string) =>
            tutorSubject.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(tutorSubject.toLowerCase())
          )
        );

        // Check teaching mode
        const teachingModeMatch = !request.teaching_mode || 
          tutor.teaching_modes?.includes(request.teaching_mode) ||
          tutor.teaching_mode === request.teaching_mode;

        // Check budget (if tutor has hourly_rate)
        let budgetMatch = true;
        if (tutor.hourly_rate) {
          const tutorRate = typeof tutor.hourly_rate === 'string' 
            ? parseInt(tutor.hourly_rate.replace(/[^0-9]/g, '')) 
            : tutor.hourly_rate;
          const monthlyRate = tutorRate * 4 * 4; // Approximate monthly (4 weeks, 4 sessions)
          budgetMatch = monthlyRate >= request.budget_min && monthlyRate <= request.budget_max;
        }

        return hasSubjectMatch && teachingModeMatch && budgetMatch;
      });

      // Suggested tutors: subject match OR teaching mode match (but not perfect match)
      suggestedTutors = allTutors.filter((tutor: any) => {
        // Exclude perfect matches
        const isPerfectMatch = matchingTutors.some(m => m.id === tutor.id);
        if (isPerfectMatch) return false;

        const tutorSubjects = tutor.subjects || [];
        const requestSubjects = request.subjects || [];
        
        // Subject match
        const hasSubjectMatch = requestSubjects.some((subject: string) =>
          tutorSubjects.some((tutorSubject: string) =>
            tutorSubject.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(tutorSubject.toLowerCase())
          )
        );

        // Teaching mode match
        const teachingModeMatch = !request.teaching_mode || 
          tutor.teaching_modes?.includes(request.teaching_mode) ||
          tutor.teaching_mode === request.teaching_mode;

        return hasSubjectMatch || teachingModeMatch;
      }).slice(0, 10); // Limit to 10 suggestions
    }
  } catch (error) {
    console.error('Error fetching matching tutors:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/tutor-requests"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Tutor Requests
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tutor Request Details</h1>
          <p className="text-gray-600 mt-1">Request ID: {request.id}</p>
        </div>

        <TutorMatchingClient 
          request={request}
          matchingTutors={matchingTutors}
          suggestedTutors={suggestedTutors}
        />
      </main>
    </div>
  );
}




import AdminNav from '../../components/AdminNav';
import Link from 'next/link';
import TutorMatchingClient from './TutorMatchingClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Tutor Request Detail Page with Matching
 * Shows request details and matching tutors
 */
export default async function TutorRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  
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

  // Fetch request details
  const { data: request, error: requestError } = await supabase
    .from('tutor_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (requestError || !request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700">Request not found or error loading request.</p>
            <Link href="/admin/tutor-requests" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Tutor Requests
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fetch matching tutors
  // Match by: subjects, location (if available), teaching mode, budget range
  let matchingTutors: any[] = [];
  let suggestedTutors: any[] = [];

  try {
    // Get all approved tutors
    const { data: allTutors } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone_number
        )
      `)
      .eq('status', 'approved')
      .limit(100);

    if (allTutors) {
      // Perfect matches: subjects overlap AND teaching mode matches AND budget is within range
      matchingTutors = allTutors.filter((tutor: any) => {
        const tutorSubjects = tutor.subjects || [];
        const requestSubjects = request.subjects || [];
        
        // Check subject overlap
        const hasSubjectMatch = requestSubjects.some((subject: string) =>
          tutorSubjects.some((tutorSubject: string) =>
            tutorSubject.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(tutorSubject.toLowerCase())
          )
        );

        // Check teaching mode
        const teachingModeMatch = !request.teaching_mode || 
          tutor.teaching_modes?.includes(request.teaching_mode) ||
          tutor.teaching_mode === request.teaching_mode;

        // Check budget (if tutor has hourly_rate)
        let budgetMatch = true;
        if (tutor.hourly_rate) {
          const tutorRate = typeof tutor.hourly_rate === 'string' 
            ? parseInt(tutor.hourly_rate.replace(/[^0-9]/g, '')) 
            : tutor.hourly_rate;
          const monthlyRate = tutorRate * 4 * 4; // Approximate monthly (4 weeks, 4 sessions)
          budgetMatch = monthlyRate >= request.budget_min && monthlyRate <= request.budget_max;
        }

        return hasSubjectMatch && teachingModeMatch && budgetMatch;
      });

      // Suggested tutors: subject match OR teaching mode match (but not perfect match)
      suggestedTutors = allTutors.filter((tutor: any) => {
        // Exclude perfect matches
        const isPerfectMatch = matchingTutors.some(m => m.id === tutor.id);
        if (isPerfectMatch) return false;

        const tutorSubjects = tutor.subjects || [];
        const requestSubjects = request.subjects || [];
        
        // Subject match
        const hasSubjectMatch = requestSubjects.some((subject: string) =>
          tutorSubjects.some((tutorSubject: string) =>
            tutorSubject.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(tutorSubject.toLowerCase())
          )
        );

        // Teaching mode match
        const teachingModeMatch = !request.teaching_mode || 
          tutor.teaching_modes?.includes(request.teaching_mode) ||
          tutor.teaching_mode === request.teaching_mode;

        return hasSubjectMatch || teachingModeMatch;
      }).slice(0, 10); // Limit to 10 suggestions
    }
  } catch (error) {
    console.error('Error fetching matching tutors:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/tutor-requests"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Tutor Requests
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Tutor Request Details</h1>
          <p className="text-gray-600 mt-1">Request ID: {request.id}</p>
        </div>

        <TutorMatchingClient 
          request={request}
          matchingTutors={matchingTutors}
          suggestedTutors={suggestedTutors}
        />
      </main>
    </div>
  );
}

