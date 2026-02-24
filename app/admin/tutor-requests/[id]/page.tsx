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
    // Get all approved tutors with pagination
    // First, get total count for pagination
    const { count: totalTutors } = await supabase
      .from('tutor_profiles')
      .select('*', { count: 'exact', head: true })
      .in('status', ['approved', 'pending']);

    // Get ALL tutors (no pagination limit to ensure we see all matches)
    const { data: allTutors } = await supabase
      .from('tutor_profiles')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          phone_number,
          gender
        )
      `)
      .in('status', ['approved', 'pending'])
      .order('created_at', { ascending: false });

    if (allTutors) {
      // Debug: Log tutor count and request subjects
      console.log(`[Tutor Matching] Found ${allTutors.length} tutors to evaluate`);
      console.log(`[Tutor Matching] Request subjects:`, request.subjects);
      console.log(`[Tutor Matching] Request location:`, request.location);
      
      // Calculate match score for each tutor
      const tutorsWithScores = allTutors.map((tutor: any) => {
        // Handle subjects - might be array or JSON string
        let tutorSubjects: string[] = [];
        if (Array.isArray(tutor.subjects)) {
          tutorSubjects = tutor.subjects;
        } else if (typeof tutor.subjects === 'string') {
          try {
            tutorSubjects = JSON.parse(tutor.subjects);
          } catch {
            tutorSubjects = [tutor.subjects];
          }
        }
        
        const requestSubjects = Array.isArray(request.subjects) ? request.subjects : [];
        
        // Subject match (30%) - more lenient matching
        const hasSubjectMatch = requestSubjects.length > 0 && tutorSubjects.length > 0 && 
          requestSubjects.some((subject: string) =>
            tutorSubjects.some((tutorSubject: string) => {
              const subjLower = subject.toLowerCase().trim();
              const tutorSubjLower = tutorSubject.toLowerCase().trim();
              return tutorSubjLower.includes(subjLower) || 
                     subjLower.includes(tutorSubjLower) ||
                     tutorSubjLower === subjLower;
            })
          );
        const subjectScore = hasSubjectMatch ? 30 : 0;
        
        // Debug first few tutors
        if (allTutors.indexOf(tutor) < 3) {
          console.log(`[Tutor Matching] Tutor ${tutor.profiles?.full_name || tutor.id}:`, {
            tutorSubjects,
            hasSubjectMatch,
            location: tutor.location,
            status: tutor.status
          });
        }

        // Teaching mode match (20%)
        const teachingModeMatch = !request.teaching_mode || 
          tutor.teaching_modes?.includes(request.teaching_mode) ||
          tutor.teaching_mode === request.teaching_mode;
        const teachingModeScore = teachingModeMatch ? 20 : 0;

        // Budget match (20%)
        let budgetScore = 0;
        if (tutor.hourly_rate) {
          const tutorRate = typeof tutor.hourly_rate === 'string' 
            ? parseInt(tutor.hourly_rate.replace(/[^0-9]/g, '')) 
            : tutor.hourly_rate;
          const sessionsPerWeek = request.preferred_days?.length || 4;
          const monthlyRate = tutorRate * sessionsPerWeek * 4;
          if (monthlyRate >= request.budget_min && monthlyRate <= request.budget_max) {
            budgetScore = 20;
          } else {
            // Partial score if close to range
            const budgetDiff = Math.min(
              Math.abs(monthlyRate - request.budget_min),
              Math.abs(monthlyRate - request.budget_max)
            );
            const budgetRange = request.budget_max - request.budget_min;
            budgetScore = Math.max(0, 20 - (budgetDiff / budgetRange) * 20);
          }
        } else {
          budgetScore = 10; // Partial score if no rate specified
        }

        // Location match (15%)
        const locationMatch = !request.location || 
          !tutor.location || 
          tutor.location.toLowerCase().includes(request.location.toLowerCase()) ||
          request.location.toLowerCase().includes(tutor.location.toLowerCase());
        const locationScore = locationMatch ? 15 : 0;

        // Schedule match (10%)
        let scheduleScore = 0;
        let hasScheduleOverlap = false;
        if (request.preferred_days && request.preferred_days.length > 0) {
          const tutorAvailableSchedule = tutor.available_schedule || [];
          const tutorAvailableDays = new Set<string>();
          
          tutorAvailableSchedule.forEach((schedule: string) => {
            const scheduleLower = schedule.toLowerCase();
            if (scheduleLower.includes('weekday')) {
              ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => tutorAvailableDays.add(day));
            }
            if (scheduleLower.includes('weekend')) {
              ['Saturday', 'Sunday'].forEach(day => tutorAvailableDays.add(day));
            }
          });

          if (tutor.availability_schedule) {
            const availabilitySchedule = typeof tutor.availability_schedule === 'string'
              ? JSON.parse(tutor.availability_schedule)
              : tutor.availability_schedule;
            Object.keys(availabilitySchedule || {}).forEach(day => {
              const normalizedDay = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
              tutorAvailableDays.add(normalizedDay);
            });
          }

          if (tutorAvailableDays.size === 0) {
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(day => tutorAvailableDays.add(day));
          }

          const matchingDays = request.preferred_days.filter((day: string) => 
            tutorAvailableDays.has(day) || 
            Array.from(tutorAvailableDays).some(tutorDay => 
              tutorDay.toLowerCase().includes(day.toLowerCase()) ||
              day.toLowerCase().includes(tutorDay.toLowerCase())
            )
          );
          hasScheduleOverlap = matchingDays.length > 0;
          scheduleScore = (matchingDays.length / request.preferred_days.length) * 10;
        } else {
          scheduleScore = 5; // Partial score if no preferred days
        }

        // Preferences match (5%)
        let preferenceScore = 0;
        // Gender match
        if (request.tutor_gender && tutor.profiles?.gender) {
          if (tutor.profiles.gender.toLowerCase() === request.tutor_gender.toLowerCase()) {
            preferenceScore += 2.5;
          }
        } else if (!request.tutor_gender) {
          preferenceScore += 2.5; // No preference = match
        }
        // Qualification match
        if (request.tutor_qualification && tutor.education) {
          const tutorEducation = typeof tutor.education === 'string'
            ? JSON.parse(tutor.education)
            : tutor.education;
          const educationStr = JSON.stringify(tutorEducation).toLowerCase();
          if (educationStr.includes(request.tutor_qualification.toLowerCase())) {
            preferenceScore += 2.5;
          }
        } else if (!request.tutor_qualification) {
          preferenceScore += 2.5; // No preference = match
        }

        // Education level match (weighted in schedule/preferences)
        let educationLevelScore = 0;
        if (request.education_level && tutor.education) {
          const tutorEducation = typeof tutor.education === 'string'
            ? JSON.parse(tutor.education)
            : tutor.education;
          const tutorHighestEducation = tutorEducation?.highest_education?.toLowerCase() || '';
          const requestLevel = request.education_level.toLowerCase();
          
          if (tutorHighestEducation.includes(requestLevel) || 
              requestLevel.includes(tutorHighestEducation) ||
              tutorHighestEducation === requestLevel) {
            educationLevelScore = 5; // Bonus points for education match
          }
        }

        const totalScore = subjectScore + teachingModeScore + budgetScore + locationScore + scheduleScore + preferenceScore + educationLevelScore;

        return {
          ...tutor,
          matchScore: Math.round(totalScore),
          hasSubjectMatch,
          teachingModeMatch,
          locationMatch,
          hasScheduleOverlap,
        };
      });

      // Primary matches: tutors with subject OR location match (OR both)
      // Prioritize those with higher scores, but include any tutor with subject/location overlap
      matchingTutors = tutorsWithScores
        .filter((tutor: any) =>
          tutor.hasSubjectMatch || tutor.locationMatch
        )
        .sort((a: any, b: any) => {
          // Sort by: both matches > score > single match
          const aBothMatches = a.hasSubjectMatch && a.locationMatch ? 1 : 0;
          const bBothMatches = b.hasSubjectMatch && b.locationMatch ? 1 : 0;
          if (aBothMatches !== bBothMatches) return bBothMatches - aBothMatches;
          return b.matchScore - a.matchScore;
        });

      console.log(`[Tutor Matching] Found ${matchingTutors.length} primary matches`);

      // If still no matches, include tutors with schedule or teaching mode overlap
      if (matchingTutors.length === 0) {
        matchingTutors = tutorsWithScores
          .filter((tutor: any) =>
            tutor.hasScheduleOverlap || tutor.teachingModeMatch
          )
          .sort((a: any, b: any) => b.matchScore - a.matchScore)
          .slice(0, 10);
        console.log(`[Tutor Matching] Found ${matchingTutors.length} fallback matches`);
      }
      
      // If STILL no matches, show ALL tutors sorted by score (at least show something)
      if (matchingTutors.length === 0 && tutorsWithScores.length > 0) {
        matchingTutors = tutorsWithScores
          .sort((a: any, b: any) => b.matchScore - a.matchScore)
          .slice(0, 10);
        console.log(`[Tutor Matching] Showing ${matchingTutors.length} tutors by score (no specific matches)`);
      }

      // Suggested tutors: other partial matches not already in matchingTutors
      suggestedTutors = tutorsWithScores
        .filter((tutor: any) => {
          const isAlreadyMatched = matchingTutors.some((m: any) => m.id === tutor.id);
          const hasAnyOverlap =
            tutor.hasSubjectMatch ||
            tutor.locationMatch ||
            tutor.hasScheduleOverlap ||
            tutor.teachingModeMatch;
          return !isAlreadyMatched && hasAnyOverlap;
        })
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .slice(0, 15);

      // Final safety net: if we still have zero matches but do have suggestions,
      // promote the top few suggested tutors into the "Matching Tutors" list.
      if (matchingTutors.length === 0 && suggestedTutors.length > 0) {
        matchingTutors = suggestedTutors.slice(0, 3);
      }
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