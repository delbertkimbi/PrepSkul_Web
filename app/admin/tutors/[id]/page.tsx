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
  // Also try tutor.id in case it's the same as user_id
  const profileId = tutor.user_id || tutor.id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_number, email, date_of_birth')
    .eq('id', profileId)
    .maybeSingle();

  // Use profile data with fallbacks from tutor_profiles
  const fullName = profile?.full_name || tutor.full_name || 'Tutor';
  const email = profile?.email || tutor.email || '';
  const phoneNumber = profile?.phone_number || tutor.phone_number || '';
  const whatsappLink = phoneNumber ? `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}` : '#';
  const callLink = phoneNumber ? `tel:${phoneNumber}` : '#';

  // Check if video exists (handle video_link, video_url, or video_intro)
  const videoUrl = tutor.video_link || tutor.video_url || 
    (typeof tutor.video_intro === 'string' ? tutor.video_intro : tutor.video_intro?.url || tutor.video_intro?.link || null);

  // Handle certificates (can be array, string, or JSONB)
  let certificates: string[] = [];
  if (tutor.certificates_urls) {
    if (Array.isArray(tutor.certificates_urls)) {
      certificates = tutor.certificates_urls;
    } else if (typeof tutor.certificates_urls === 'string') {
      try {
        const parsed = JSON.parse(tutor.certificates_urls);
        certificates = Array.isArray(parsed) ? parsed : [tutor.certificates_urls];
      } catch {
        certificates = [tutor.certificates_urls];
      }
    } else if (typeof tutor.certificates_urls === 'object') {
      // Handle JSONB object
      certificates = Object.values(tutor.certificates_urls).filter((url): url is string => typeof url === 'string');
    }
  }


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
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
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
                <p className="font-medium text-gray-900">{fullName}</p>
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
              {profile?.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
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

          {/* Motivation */}
          {(tutor.bio || tutor.motivation) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Motivation</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{tutor.bio || tutor.motivation}</p>
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
              ) : null}
              
              {/* Show message if no documents */}
              {!tutor.profile_photo_url && 
               !tutor.id_card_front_url && 
               !tutor.id_card_back_url && 
               !tutor.id_card_url && 
               certificates.length === 0 && (
                <p className="text-gray-500 text-sm italic">No documents uploaded</p>
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
          {(tutor.facebook_url || tutor.linkedin_url || tutor.twitter_url || tutor.instagram_url || tutor.youtube_url) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h2>
              <div className="flex flex-wrap gap-3">
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
          )}

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

