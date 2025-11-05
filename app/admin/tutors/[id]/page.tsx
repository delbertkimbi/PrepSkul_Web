import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, Download, ExternalLink, Play, Globe, Linkedin, Youtube, Instagram, Twitter, Facebook, FileText, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import ProfileImage from './ProfileImage';
import RatingPricingSection from './RatingPricingSection';
import VideoPlayer from './VideoPlayer';

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
  
  // Fetch tutor data with all fields
  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!tutor) {
    return <div>Tutor not found</div>;
  }

  // Fetch profile data (tutor.id is FK to profiles.id, or use user_id as fallback)
  const profileId = tutor.id || tutor.user_id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_number, email, date_of_birth')
    .eq('id', profileId)
    .single();

  const phoneNumber = profile?.phone_number || '';
  const whatsappLink = phoneNumber ? `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}` : '#';
  const callLink = phoneNumber ? `tel:${phoneNumber}` : '#';

  // Check if video exists (handle both URL strings and objects)
  const videoUrl = typeof tutor.video_intro === 'string' ? tutor.video_intro : tutor.video_intro?.url || tutor.video_intro?.link || null;

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
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/tutors" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Back to Tutors
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Tutor Profile'}</h1>
            </div>
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

          {/* Quick Actions - Contact Only */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Contact Actions */}
              <a
                href={callLink}
                className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Phone size={20} />
                <span className="text-sm font-medium">Call</span>
              </a>
              <Link
                href={`/admin/tutors/${id}/email`}
                className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Mail size={20} />
                <span className="text-sm font-medium">Email</span>
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <MessageCircle size={20} />
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Application Action Buttons - Separate Section Below Quick Actions */}
          {(tutor.status === 'pending' || tutor.status === 'needs_improvement' || tutor.status === 'approved' || tutor.status === 'rejected') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tutor.status === 'pending' && (
                <>
                  <Link
                    href={`/admin/tutors/${id}/approve/rating-pricing`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">Approve Tutor</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/improve/reasons`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">Request Improvements</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/reject/reasons`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle size={20} />
                    <span className="text-sm font-medium">Reject Application</span>
                  </Link>
                </>
              )}
              {tutor.status === 'needs_improvement' && (
                <>
                  <Link
                    href={`/admin/tutors/${id}/approve/rating-pricing`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">Approve Tutor</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/improve/reasons`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">Request Improvements</span>
                  </Link>
                  <Link
                    href={`/admin/tutors/${id}/reject/reasons`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle size={20} />
                    <span className="text-sm font-medium">Reject Application</span>
                  </Link>
                </>
              )}
              {tutor.status === 'approved' && (
                <>
                  {!tutor.is_hidden ? (
                    <Link
                      href={`/admin/tutors/${id}/hide`}
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <Edit size={20} />
                      <span className="text-sm font-medium">Hide Profile</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/tutors/${id}/unhide`}
                      className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">Unhide Profile</span>
                    </Link>
                  )}
                  <Link
                    href={`/admin/tutors/${id}/block`}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle size={20} />
                    <span className="text-sm font-medium">Block Tutor</span>
                  </Link>
                </>
              )}
              {tutor.status === 'rejected' && (
                <Link
                  href={`/admin/tutors/${id}/approve/rating-pricing`}
                  className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle size={20} />
                  <span className="text-sm font-medium">Approve Tutor</span>
                </Link>
              )}              </div>
            </div>
          )}
            </div>
          </div>

          {/* Video | Pic */}
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
                <ProfileImage src={tutor.profile_photo_url} alt={profile?.full_name || 'Tutor'} />
              </div>
            )}
          </div>

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
                <p className="font-medium text-gray-900">{profile?.full_name || tutor.full_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile?.email || tutor.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{phoneNumber || 'N/A'}</p>
              </div>
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
              {/* ID Card */}
              {tutor.id_card_url && (
                <a
                  href={tutor.id_card_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <FileText className="text-blue-600" size={20} />
                  <span className="flex-1 font-medium text-gray-900">ID Card</span>
                  <Download className="text-gray-400" size={18} />
                </a>
              )}
              
              {/* Certificates */}
              {tutor.certificates_urls && Array.isArray(tutor.certificates_urls) && tutor.certificates_urls.length > 0 ? (
                tutor.certificates_urls.map((url: string, index: number) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FileText className="text-blue-600" size={20} />
                    <span className="flex-1 font-medium text-gray-900">Certificate {index + 1}</span>
                    <Download className="text-gray-400" size={18} />
                  </a>
                ))
              ) : tutor.certificates_urls && typeof tutor.certificates_urls === 'string' ? (
                <a
                  href={tutor.certificates_urls}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <FileText className="text-blue-600" size={20} />
                  <span className="flex-1 font-medium text-gray-900">Certificate</span>
                  <Download className="text-gray-400" size={18} />
                </a>
              ) : null}
              
              {/* Show message if no documents */}
              {!tutor.id_card_url && (!tutor.certificates_urls || (Array.isArray(tutor.certificates_urls) && tutor.certificates_urls.length === 0)) && (
                <p className="text-gray-500 text-sm italic">No documents uploaded</p>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {tutor.payment_details && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(tutor.payment_details, null, 2)}
              </pre>
            </div>
          )}

          )}
              {tutor.expected_rate && (
                <div>
                  <p className="text-sm text-gray-600">Expected Rate</p>
                  <p className="font-medium text-gray-900">{tutor.expected_rate}</p>
                </div>
              )}
              {tutor.payment_method && (
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">{tutor.payment_method}</p>
                </div>
              )}
              {tutor.handles_multiple_learners !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Handles Multiple Learners</p>
                  <p className="font-medium text-gray-900">{tutor.handles_multiple_learners ? 'Yes' : 'No'}</p>
                </div>
              )}
            </div>
          </div>

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
        </div>
      </main>
    </div>
  );
}

