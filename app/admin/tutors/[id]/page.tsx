import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import Link from 'next/link';
import { Phone, Mail, MessageCircle, Download, ExternalLink } from 'lucide-react';
import EmailEditor from './email-editor';

export default async function TutorDetailPage({ params }: { params: { id: string } }) {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  
  // Fetch tutor data
  const { data: tutor } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!tutor) {
    return <div>Tutor not found</div>;
  }

  // Fetch profile data (tutor.id is FK to profiles.id, or use user_id as fallback)
  const profileId = tutor.id || tutor.user_id;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_number, email')
    .eq('id', profileId)
    .single();

  const phoneNumber = profile?.phone_number || '';
  const whatsappLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;
  const emailLink = `mailto:${profile?.email}`;
  const callLink = `tel:${phoneNumber}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/tutors/pending" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Back to Pending Tutors
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Tutor Profile'}</h1>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tutor.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                tutor.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {tutor.status?.charAt(0).toUpperCase() + tutor.status?.slice(1) || 'Pending'}
              </span>
            </div>
          </div>

          {/* Contact Buttons */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex gap-3">
              <a
                href={callLink}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Phone size={18} />
                Call
              </a>
              <a
                href={emailLink}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Mail size={18} />
                Email
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">{profile?.full_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{profile?.phone_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-medium text-gray-900">{tutor.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quarter</p>
                <p className="font-medium text-gray-900">{tutor.quarter || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Years of Experience</p>
                <p className="font-medium text-gray-900">{tutor.teaching_duration || 'Less than 1 year'}</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Education Level</p>
                <p className="font-medium text-gray-900">{tutor.highest_education || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Field of Study</p>
                <p className="font-medium text-gray-900">{tutor.field_of_study || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Institution</p>
                <p className="font-medium text-gray-900">{tutor.institution || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Tutoring Details */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tutoring Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Tutoring Areas</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(tutor.tutoring_areas) ? tutor.tutoring_areas : []).map((area: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Learner Levels</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(tutor.learner_levels) ? tutor.learner_levels : []).map((level: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">About / Motivation</p>
                <p className="font-medium text-gray-900 mt-1">{tutor.bio || tutor.motivation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Profile Photo</p>
                {tutor.profile_photo_url ? (
                  <img src={tutor.profile_photo_url} alt="Profile" className="w-32 h-32 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <p className="text-gray-500 text-sm">No photo uploaded</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Certificates</p>
                {(Array.isArray(tutor.certificate_urls) && tutor.certificate_urls.length > 0) ? (
                  <div className="space-y-2">
                    {tutor.certificate_urls.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Download size={16} />
                        Certificate {i + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No certificates uploaded</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">ID Card (Front)</p>
                {tutor.id_card_front_url ? (
                  <a href={tutor.id_card_front_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                    <Download size={16} />
                    View ID Front
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">Not uploaded</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">ID Card (Back)</p>
                {tutor.id_card_back_url ? (
                  <a href={tutor.id_card_back_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                    <Download size={16} />
                    View ID Back
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">Not uploaded</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Video Introduction</p>
                {tutor.video_link ? (
                  <a href={tutor.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                    <ExternalLink size={16} />
                    Watch Video
                  </a>
                ) : (
                  <p className="text-gray-500 text-sm">No video link provided</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
            <form action="/api/admin/tutors/notes" method="POST" className="space-y-4">
              <input type="hidden" name="tutorId" value={tutor.id} />
              <textarea
                name="notes"
                rows={4}
                defaultValue={tutor.admin_review_notes || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes for this tutor (corrections needed, instructions, etc.)..."
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
              >
                Save Notes
              </button>
            </form>
          </div>

          {/* Approve/Reject Actions */}
          {tutor.status === 'pending' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h2>
              <div className="flex gap-4">
                <form action="/api/admin/tutors/approve" method="POST" className="flex-1">
                  <input type="hidden" name="tutorId" value={tutor.id} />
                  <textarea
                    name="notes"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-green-500"
                    placeholder="Approval notes (optional)..."
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✓ Approve Tutor
                  </button>
                </form>
                <form action="/api/admin/tutors/reject" method="POST" className="flex-1">
                  <input type="hidden" name="tutorId" value={tutor.id} />
                  <textarea
                    name="notes"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-red-500"
                    placeholder="Rejection reason (required)..."
                    required
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    ✗ Reject Application
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Custom Email Editor */}
          <EmailEditor 
            tutorEmail={profile?.email || ''} 
            tutorName={profile?.full_name || 'Tutor'}
            tutorId={tutor.id}
          />
        </div>
      </main>
    </div>
  );
}


