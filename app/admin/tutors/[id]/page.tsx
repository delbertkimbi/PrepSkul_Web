import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, Download, ExternalLink, Play, Globe, Linkedin, Youtube, Instagram, Twitter, Facebook, FileText, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import ProfileImage from './ProfileImage';
import RatingPricingSection from './RatingPricingSection';
import VideoPlayer from './VideoPlayer';
import DocumentDisplay from './DocumentDisplay';

export default async function TutorDetailPage({ 
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
  
  // Fetch tutor data - try both id and user_id since id might be the user_id UUID
  let tutor = null;
  let queryError = null;
  
  // First try: query by id (primary key)
  const { data: tutorById, error: errorById } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (tutorById) {
    tutor = tutorById;
  } else if (errorById) {
    queryError = errorById;
  }
  
  // Second try: query by user_id if first query failed
  if (!tutor) {
    const { data: tutorByUserId, error: errorByUserId } = await supabase
      .from('tutor_profiles')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();
    
    if (tutorByUserId) {
      tutor = tutorByUserId;
    } else if (errorByUserId) {
      queryError = errorByUserId;
    }
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Tutor not found</h2>
            <p className="text-red-700">No tutor found with ID: {id}</p>
            {queryError && (
              <p className="text-red-600 text-sm mt-2">Error: {queryError.message}</p>
            )}
            <Link href="/admin/tutors" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Tutors
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Fetch profile data using user_id (tutor.user_id is FK to profiles.id)
  // IMPORTANT: Name, email, phone are stored in profiles table, not tutor_profiles
  // tutor.id is the tutor_profiles primary key, NOT profiles.id
  // We MUST use tutor.user_id to get the profile
  let profile = null;
  
  // Debug: Log tutor data to understand structure
  console.log('Tutor data:', {
    tutor_id: tutor.id,
    user_id: tutor.user_id,
    has_user_id: !!tutor.user_id
  });
  
  if (tutor.user_id) {
    const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, phone_number, email')
    .eq('id', tutor.user_id)
    .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    } else if (!profileData) {
      console.warn('No profile found for user_id:', tutor.user_id);
    } else {
      console.log('Profile found:', { full_name: profileData.full_name });
    }
    profile = profileData;
  } else {
    console.warn('Tutor has no user_id! Tutor ID:', tutor.id);
  }
  
  // If still no profile and tutor.id exists, try it as a fallback (in case id === user_id)
  if (!profile && tutor.id) {
    const { data: profileData, error: profileError2 } = await supabase
      .from('profiles')
      .select('full_name, phone_number, email')
      .eq('id', tutor.id)
      .maybeSingle();
    
    if (profileError2) {
      console.error('Error fetching profile (fallback):', profileError2);
    }
    if (profileData) {
      console.log('Profile found via fallback (id === user_id):', { full_name: profileData.full_name });
      profile = profileData;
    }
  }
  
  // Use profile data - name comes from profiles table during signup/onboarding
  // If profile doesn't exist, there's a data integrity issue
  const fullName = profile?.full_name || 'Name not found';
  
  // Debug: Log final name result
  console.log('Final fullName:', fullName, 'Profile exists:', !!profile);
  const email = profile?.email || tutor.email || '';
  
  // Normalize phone number - remove duplicate +237 prefixes
  const normalizePhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return '';
    let normalized = phone.toString().trim();
    
    // Remove all occurrences of +237 at the start
    while (normalized.startsWith('+237')) {
      normalized = normalized.substring(4);
    }
    while (normalized.startsWith('237')) {
      normalized = normalized.substring(3);
    }
    
    // Add +237 prefix once if number exists
    if (normalized.length > 0) {
      // Remove any leading zeros
      normalized = normalized.replace(/^0+/, '');
      return `+237${normalized}`;
    }
    
    return phone;
  };
  
  const rawPhoneNumber = profile?.phone_number || tutor.phone_number || '';
  const phoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const whatsappLink = phoneNumber ? `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}` : '#';
  const callLink = phoneNumber ? `tel:${phoneNumber}` : '#';

  // Check if video exists (handle video_link, video_url, or video_intro)
  const videoUrl = tutor.video_link || tutor.video_url || 
    (typeof tutor.video_intro === 'string' ? tutor.video_intro : tutor.video_intro?.url || tutor.video_intro?.link || null);

  // Handle certificates (can be array, string, or JSONB)
  // Also check for last_certificate_url, last_official_certificate_url, and uploaded_documents
  let certificates: string[] = [];
  
  // Check certificates_urls field
  if (tutor.certificates_urls) {
    if (Array.isArray(tutor.certificates_urls)) {
      certificates = [...certificates, ...tutor.certificates_urls];
    } else if (typeof tutor.certificates_urls === 'string') {
      try {
        const parsed = JSON.parse(tutor.certificates_urls);
        if (Array.isArray(parsed)) {
          certificates = [...certificates, ...parsed];
        } else {
          certificates.push(tutor.certificates_urls);
        }
      } catch {
        certificates.push(tutor.certificates_urls);
      }
    } else if (typeof tutor.certificates_urls === 'object') {
      // Handle JSONB object
      const urls = Object.values(tutor.certificates_urls).filter((url): url is string => typeof url === 'string');
      certificates = [...certificates, ...urls];
    }
  }
  
  // Check last_certificate_url or last_official_certificate_url
  if ((tutor as any).last_certificate_url && !certificates.includes((tutor as any).last_certificate_url)) {
    certificates.push((tutor as any).last_certificate_url);
  }
  if ((tutor as any).last_official_certificate_url && !certificates.includes((tutor as any).last_official_certificate_url)) {
    certificates.push((tutor as any).last_official_certificate_url);
  }
  
  // Check uploaded_documents JSONB field
  if ((tutor as any).uploaded_documents && typeof (tutor as any).uploaded_documents === 'object') {
    const uploadedDocs = (tutor as any).uploaded_documents;
    // Check for last_certificate key
    if (uploadedDocs.last_certificate && typeof uploadedDocs.last_certificate === 'string') {
      if (!certificates.includes(uploadedDocs.last_certificate)) {
        certificates.push(uploadedDocs.last_certificate);
      }
    }
    // Also check for any certificate URLs in the object
    Object.values(uploadedDocs).forEach((url: any) => {
      if (typeof url === 'string' && url.includes('certificate') && !certificates.includes(url)) {
        certificates.push(url);
      }
    });
  }
  
  // Remove duplicates
  certificates = [...new Set(certificates)];


  // Determine which action buttons to show
  const showApproveButton = tutor.status === 'pending' || tutor.status === 'needs_improvement' || tutor.status === 'rejected';
  const showImproveButton = tutor.status === 'pending' || tutor.status === 'needs_improvement';
  const showRejectButton = tutor.status === 'pending' || tutor.status === 'needs_improvement';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Link href="/admin/tutors" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Back to Tutors
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{fullName !== 'Name not found' ? fullName : (profile ? 'Loading...' : 'Name not found')}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Contact Buttons - Top Right */}
              <div className="flex items-center gap-2">
                <a
                  href={callLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs"
                  title="Call"
                >
                  <Phone size={16} />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <Link
                  href={`/admin/tutors/${id}/email`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs"
                  title="Email"
                >
                  <Mail size={16} />
                  <span className="hidden sm:inline">Email</span>
                </Link>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs"
                  title="WhatsApp"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
              {/* Status Badges */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tutor.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  tutor.status === 'approved' ? 'bg-green-100 text-green-800' :
                  tutor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  tutor.status === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' :
                  tutor.status === 'suspended' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {tutor.status?.charAt(0).toUpperCase() + tutor.status?.slice(1) || 'Pending'}
                </span>
                {tutor.is_hidden && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Hidden
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Video | Photo - At Top */}
          {(videoUrl || tutor.profile_photo_url) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Introduction */}
              {videoUrl && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Video Introduction</h2>
                  <VideoPlayer videoUrl={videoUrl} />
                </div>
              )}
              
              {/* Profile Photo */}
              {tutor.profile_photo_url && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h2>
                  <ProfileImage src={tutor.profile_photo_url} alt={fullName} fallbackInitial={fullName.charAt(0).toUpperCase()} />
                </div>
              )}
            </div>
          )}


          {/* Rating & Pricing Section - Only for approved tutors */}
          {tutor.status === 'approved' && (
            <RatingPricingSection tutor={tutor} tutorId={id} />
          )}

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">{profile?.full_name || fullName || 'Name not found'}</p>
              </div>
              {email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{email}</p>
                </div>
              )}
              {phoneNumber && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{phoneNumber}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium text-gray-900">{tutor.city || 'N/A'}</p>
              </div>
              {tutor.quarter && (
                <div>
                  <p className="text-sm text-gray-600">Quarter/Area</p>
                  <p className="font-medium text-gray-900">{tutor.quarter}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Teaching Duration</p>
                <p className="font-medium text-gray-900">{tutor.teaching_duration || tutor.experience_duration || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Highest Education</p>
                <p className="font-medium text-gray-900">{tutor.highest_education || tutor.selected_education || 'N/A'}</p>
              </div>
              {tutor.institution && (
                <div>
                  <p className="text-sm text-gray-600">Institution</p>
                  <p className="font-medium text-gray-900">{tutor.institution}</p>
                </div>
              )}
              {tutor.field_of_study && (
                <div>
                  <p className="text-sm text-gray-600">Field of Study</p>
                  <p className="font-medium text-gray-900">{tutor.field_of_study}</p>
                </div>
              )}
              {tutor.has_training !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Has Training</p>
                  <p className="font-medium text-gray-900">{tutor.has_training ? 'Yes' : 'No'}</p>
                </div>
              )}
              {tutor.preferred_mode && (
                <div>
                  <p className="text-sm text-gray-600">Preferred Mode</p>
                  <p className="font-medium text-gray-900">{tutor.preferred_mode}</p>
                </div>
              )}
              {tutor.preferred_session_type && (
                <div>
                  <p className="text-sm text-gray-600">Preferred Session Type</p>
                  <p className="font-medium text-gray-900">{tutor.preferred_session_type}</p>
                </div>
              )}
              {tutor.hours_per_week && (
                <div>
                  <p className="text-sm text-gray-600">Hours Per Week</p>
                  <p className="font-medium text-gray-900">{tutor.hours_per_week}</p>
                </div>
              )}
            </div>
          </div>

          {/* Personal Statement */}
          {tutor.personal_statement && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Statement</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tutor.personal_statement}</p>
            </div>
          )}

          {/* Motivation */}
          {(tutor.bio || tutor.motivation) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Motivation</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tutor.bio || tutor.motivation}</p>
            </div>
          )}

          {/* Payment Expectations */}
          {(tutor.expected_rate || tutor.pricing_factors) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Expectations</h2>
              <div className="space-y-3">
                {tutor.expected_rate && (
                  <div>
                    <p className="text-sm text-gray-600">Expected Rate</p>
                    <p className="font-medium text-gray-900">{tutor.expected_rate}</p>
                  </div>
                )}
                {tutor.pricing_factors && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Pricing Factors</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(tutor.pricing_factors) ? (
                        tutor.pricing_factors.map((factor: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {factor}
                          </span>
                        ))
                      ) : typeof tutor.pricing_factors === 'string' ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {tutor.pricing_factors}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Digital Readiness */}
          {(tutor.devices || tutor.has_internet !== undefined || tutor.teaching_tools || tutor.has_materials !== undefined || tutor.wants_training !== undefined) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Digital Readiness</h2>
              <div className="space-y-3">
                {tutor.devices && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Devices</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(tutor.devices) ? (
                        tutor.devices.map((device: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {device}
                          </span>
                        ))
                      ) : typeof tutor.devices === 'string' ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tutor.devices}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
                {tutor.has_internet !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Reliable Internet Connection</p>
                    <p className="font-medium text-gray-900">{tutor.has_internet ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {tutor.teaching_tools && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Teaching Tools</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(tutor.teaching_tools) ? (
                        tutor.teaching_tools.map((tool: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {tool}
                          </span>
                        ))
                      ) : typeof tutor.teaching_tools === 'string' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {tutor.teaching_tools}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
                {tutor.has_materials !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Access to Teaching Materials</p>
                    <p className="font-medium text-gray-900">{tutor.has_materials ? 'Yes' : 'No'}</p>
                  </div>
                )}
                {tutor.wants_training !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Interested in Free Digital Training</p>
                    <p className="font-medium text-gray-900">{tutor.wants_training ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subjects and Specialties */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subjects and Specialties</h2>
            <div className="space-y-4">
              {/* Tutoring Areas */}
              {tutor.tutoring_areas && Array.isArray(tutor.tutoring_areas) && tutor.tutoring_areas.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Tutoring Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.tutoring_areas.map((area: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Learner Levels */}
              {tutor.learner_levels && Array.isArray(tutor.learner_levels) && tutor.learner_levels.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Learner Levels</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.learner_levels.map((level: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Specializations */}
              {tutor.specializations && Array.isArray(tutor.specializations) && tutor.specializations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.specializations.map((spec: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Teaching Approaches */}
              {tutor.teaching_approaches && Array.isArray(tutor.teaching_approaches) && tutor.teaching_approaches.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Teaching Approaches</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.teaching_approaches.map((approach: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {approach}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
            <div className="space-y-4">
                {/* Normal Tutoring Sessions */}
                {(tutor.tutoring_availability || (tutor.availability_schedule && typeof tutor.availability_schedule === 'object')) && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Normal Tutoring Sessions</p>
                    <div className="space-y-2">
                      {(() => {
                        let availability: any = tutor.tutoring_availability;
                        if (!availability && tutor.availability_schedule && typeof tutor.availability_schedule === 'object') {
                          availability = tutor.availability_schedule;
                        }
                        if (!availability) return <p className="text-gray-500 text-sm italic">Not specified</p>;
                        
                        if (typeof availability === 'string') {
                          try {
                            availability = JSON.parse(availability);
                          } catch {
                            return <p className="text-gray-500 text-sm">{availability}</p>;
                          }
                        }
                        
                        if (typeof availability === 'object' && availability !== null) {
                          const days = Object.keys(availability);
                          if (days.length === 0) return <p className="text-gray-500 text-sm italic">Not specified</p>;
                          
                          return days.map((day: string) => {
                            const slots = availability[day];
                            if (!slots || (Array.isArray(slots) && slots.length === 0)) return null;
                            return (
                              <div key={day} className="flex items-start gap-2">
                                <span className="text-sm font-medium text-gray-700 min-w-[100px]">{day}:</span>
                                <span className="text-sm text-gray-600">
                                  {Array.isArray(slots) ? slots.join(', ') : String(slots)}
                                </span>
                              </div>
                            );
                          });
                        }
                        return <p className="text-gray-500 text-sm italic">Not specified</p>;
                      })()}
                    </div>
                  </div>
                )}
                
                {/* Test Sessions */}
                {tutor.test_session_availability && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Test Sessions</p>
                    <div className="space-y-2">
                      {(() => {
                        let availability: any = tutor.test_session_availability;
                        if (typeof availability === 'string') {
                          try {
                            availability = JSON.parse(availability);
                          } catch {
                            return <p className="text-gray-500 text-sm">{availability}</p>;
                          }
                        }
                        
                        if (typeof availability === 'object' && availability !== null) {
                          const days = Object.keys(availability);
                          if (days.length === 0) return <p className="text-gray-500 text-sm italic">Not specified</p>;
                          
                          return days.map((day: string) => {
                            const slots = availability[day];
                            if (!slots || (Array.isArray(slots) && slots.length === 0)) return null;
                            return (
                              <div key={day} className="flex items-start gap-2">
                                <span className="text-sm font-medium text-gray-700 min-w-[100px]">{day}:</span>
                                <span className="text-sm text-gray-600">
                                  {Array.isArray(slots) ? slots.join(', ') : String(slots)}
                                </span>
                              </div>
                            );
                          });
                        }
                        return <p className="text-gray-500 text-sm italic">Not specified</p>;
                      })()}
                    </div>
                  </div>
                )}
                
              {/* Show message if no availability specified */}
              {!tutor.tutoring_availability && 
               !tutor.test_session_availability && 
               !tutor.availability_schedule && (
                <p className="text-gray-500 text-sm italic">No availability information provided</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="space-y-3">
              {/* Profile Photo */}
              {tutor.profile_photo_url && (
                <DocumentDisplay url={tutor.profile_photo_url} title="Profile Photo" />
              )}
              
              {/* ID Card Front */}
              {tutor.id_card_front_url && (
                <DocumentDisplay url={tutor.id_card_front_url} title="ID Card Front" />
              )}
              
              {/* ID Card Back */}
              {tutor.id_card_back_url && (
                <DocumentDisplay url={tutor.id_card_back_url} title="ID Card Back" />
              )}
              
              {/* Legacy ID Card URL */}
              {tutor.id_card_url && !tutor.id_card_front_url && !tutor.id_card_back_url && (
                <DocumentDisplay url={tutor.id_card_url} title="ID Card" />
              )}
              
              {/* Certificates */}
              {certificates.length > 0 ? (
                certificates.map((url: string, index: number) => (
                  <DocumentDisplay key={index} url={url} title={`Certificate ${index + 1}`} />
                ))
              ) : (
                // Check if tutor has teaching certificates field
                tutor.has_training === false ? (
                  <p className="text-gray-500 text-sm italic">No teaching certificates (tutor indicated no training)</p>
                ) : (
                  <p className="text-gray-500 text-sm italic">No certificates uploaded</p>
                )
              )}
              
              {/* Show message if no documents at all */}
              {!tutor.profile_photo_url && 
               !tutor.id_card_front_url && 
               !tutor.id_card_back_url && 
               !tutor.id_card_url && 
               certificates.length === 0 && (
                <p className="text-gray-500 text-sm italic mt-2">No documents uploaded</p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {tutor.payment_details && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <div className="space-y-3">
                {typeof tutor.payment_details === 'object' && tutor.payment_details !== null ? (
                  <>
                    {tutor.payment_details.name && (
                      <div>
                        <p className="text-sm text-gray-600">Account Name</p>
                        <p className="font-medium text-gray-900">{tutor.payment_details.name}</p>
                      </div>
                    )}
                    {tutor.payment_details.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-900">{tutor.payment_details.phone}</p>
                      </div>
                    )}
                    {tutor.payment_details.account_type && (
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium text-gray-900">{tutor.payment_details.account_type}</p>
                      </div>
                    )}
                    {tutor.payment_details.account_number && (
                      <div>
                        <p className="text-sm text-gray-600">Account Number</p>
                        <p className="font-medium text-gray-900">{tutor.payment_details.account_number}</p>
                      </div>
                    )}
                    {tutor.payment_details.bank_name && (
                      <div>
                        <p className="text-sm text-gray-600">Bank Name</p>
                        <p className="font-medium text-gray-900">{tutor.payment_details.bank_name}</p>
                      </div>
                    )}
                    {/* Show any other fields that might exist */}
                    {Object.entries(tutor.payment_details).map(([key, value]) => {
                      const displayKeys = ['name', 'phone', 'account_type', 'account_number', 'bank_name'];
                      if (displayKeys.includes(key) || !value) return null;
                      return (
                        <div key={key}>
                          <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-medium text-gray-900">{String(value)}</p>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">No payment details available</p>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {(() => {
            // Parse social_media_links from JSON if it exists
            let socialLinks: any = null;
            if (tutor.social_media_links) {
              try {
                socialLinks = typeof tutor.social_media_links === 'string' 
                  ? JSON.parse(tutor.social_media_links) 
                  : tutor.social_media_links;
              } catch (e) {
                console.error('Error parsing social_media_links:', e);
              }
            }
            
            // Also check legacy individual fields
            const hasLegacyLinks = tutor.facebook_url || tutor.linkedin_url || tutor.twitter_url || tutor.instagram_url || tutor.youtube_url;
            const hasSocialLinks = socialLinks && typeof socialLinks === 'object' && Object.keys(socialLinks).length > 0;
            
            if (hasSocialLinks || hasLegacyLinks) {
              return (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
              <div className="flex flex-wrap gap-3">
                    {/* Display from social_media_links JSON */}
                    {hasSocialLinks && Object.entries(socialLinks).map(([platform, url]: [string, any]) => {
                      if (!url || typeof url !== 'string') return null;
                      const platformLower = platform.toLowerCase();
                      const iconMap: any = {
                        linkedin: <Linkedin size={18} />,
                        youtube: <Youtube size={18} />,
                        facebook: <Facebook size={18} />,
                        instagram: <Instagram size={18} />,
                        twitter: <Twitter size={18} />,
                      };
                      const colorMap: any = {
                        linkedin: 'bg-blue-700 hover:bg-blue-800',
                        youtube: 'bg-red-600 hover:bg-red-700',
                        facebook: 'bg-blue-600 hover:bg-blue-700',
                        instagram: 'bg-pink-600 hover:bg-pink-700',
                        twitter: 'bg-black hover:bg-gray-800',
                      };
                      return (
                        <a 
                          key={platform}
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`flex items-center gap-2 px-4 py-2 ${colorMap[platformLower] || 'bg-gray-600 hover:bg-gray-700'} text-white rounded-lg transition`}
                        >
                          {iconMap[platformLower] || <Globe size={18} />}
                          {platform}
                        </a>
                      );
                    })}
                    
                    {/* Legacy individual fields */}
                {tutor.facebook_url && (
                  <a href={tutor.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Facebook size={18} />
                    Facebook
                  </a>
                )}
                {tutor.linkedin_url && (
                  <a href={tutor.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                )}
                {tutor.twitter_url && (
                  <a href={tutor.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                    <Twitter size={18} />
                    Twitter
                  </a>
                )}
                {tutor.instagram_url && (
                  <a href={tutor.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
                    <Instagram size={18} />
                    Instagram
                  </a>
                )}
                {tutor.youtube_url && (
                  <a href={tutor.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <Youtube size={18} />
                    YouTube
                  </a>
                )}
              </div>
            </div>
              );
            }
            return null;
          })()}

          {/* Admin Review Notes */}
          {tutor.admin_review_notes && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tutor.admin_review_notes}</p>
            </div>
          )}

          {/* Improvement Requests */}
          {tutor.improvement_requests && Array.isArray(tutor.improvement_requests) && tutor.improvement_requests.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Improvement Requests</h2>
              <ul className="space-y-2">
                {tutor.improvement_requests.map((request: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-gray-700">{typeof request === 'string' ? request : JSON.stringify(request)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hidden Information */}
          {tutor.is_hidden && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 border-purple-300">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">Hidden Status</h2>
              {tutor.hidden_reason && (
                <p className="text-gray-700 mb-2"><strong>Reason:</strong> {tutor.hidden_reason}</p>
              )}
              {tutor.hidden_at && (
                <p className="text-sm text-gray-600">Hidden on: {new Date(tutor.hidden_at).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Application Action Buttons - At Bottom */}
          {(tutor.status === 'pending' || tutor.status === 'needs_improvement' || tutor.status === 'approved' || tutor.status === 'rejected') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 border-t-4 border-t-blue-600">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Actions</h2>
              <div className="flex flex-wrap gap-3">
              {tutor.status === 'pending' && (
                <>
                  <Link
                    href={`/admin/tutors/${id}/approve/rating-pricing`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <CheckCircle size={18} />
                    <span>Approve Tutor</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/improve/reasons`}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                  >
                    <AlertCircle size={18} />
                    <span>Request Improvements</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/reject/reasons`}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    <XCircle size={18} />
                    <span>Reject Application</span>
                  </Link>
                </>
              )}
              {tutor.status === 'needs_improvement' && (
                <>
                  <Link
                    href={`/admin/tutors/${id}/approve/rating-pricing`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                  >
                    <CheckCircle size={18} />
                    <span>Approve Tutor</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/improve/reasons`}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                  >
                    <AlertCircle size={18} />
                    <span>Request Improvements</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/reject/reasons`}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    <XCircle size={18} />
                    <span>Reject Application</span>
                  </Link>
                </>
              )}
              {tutor.status === 'approved' && (
                <>
                  {!tutor.is_hidden ? (
                    <Link
                      href={`/admin/tutors/${id}/hide`}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                    >
                      <Edit size={18} />
                      <span>Hide Profile</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/tutors/${id}/unhide`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      <CheckCircle size={18} />
                      <span>Unhide Profile</span>
                    </Link>
                  )}
                  <Link
                    href={`/admin/tutors/${id}/block`}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    <XCircle size={18} />
                    <span>Block Tutor</span>
                  </Link>
                </>
              )}
              {tutor.status === 'rejected' && (
                <Link
                  href={`/admin/tutors/${id}/approve/rating-pricing`}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  <CheckCircle size={18} />
                  <span>Approve Tutor</span>
                </Link>
              )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

