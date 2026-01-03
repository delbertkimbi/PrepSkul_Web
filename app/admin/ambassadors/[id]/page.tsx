import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import Link from 'next/link';
import { Mail, Phone, MapPin, Calendar, User, GraduationCap, MessageSquare, Target, Lightbulb, Globe, Users } from 'lucide-react';
import AmbassadorStatusBadge from '../../components/AmbassadorStatusBadge';
import ApproveAmbassadorButton from './ApproveAmbassadorButton';
import RejectAmbassadorButton from './RejectAmbassadorButton';

export default async function AmbassadorDetailPage({ 
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
  
  // Fetch ambassador data
  const { data: ambassador, error } = await supabase
    .from('ambassadors')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!ambassador) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Ambassador not found</h2>
            <p className="text-red-700">No ambassador found with ID: {id}</p>
            {error && (
              <p className="text-red-600 text-sm mt-2">Error: {error.message}</p>
            )}
            <Link href="/admin/ambassadors" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Ambassadors
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Format data for display
  const ageRangeMap: Record<string, string> = {
    'under_18': 'Under 18',
    '18_20': '18-20',
    '21_25': '21-25',
    '26_30': '26-30',
    '30_plus': '30+',
  };

  const genderMap: Record<string, string> = {
    'male': 'Male',
    'female': 'Female',
    'prefer_not_to_say': 'Prefer not to say',
  };

  const currentStatusMap: Record<string, string> = {
    'student': 'Student',
    'graduate': 'Graduate',
    'tutor_teacher': 'Tutor / Teacher',
    'working_professional': 'Working Professional',
    'other': ambassador.status_other || 'Other',
  };

  const reachRangeMap: Record<string, string> = {
    'less_than_20': 'Less than 20',
    '20_50': '20-50',
    '50_100': '50-100',
    '100_plus': '100+',
  };

  const socialPlatforms = ambassador.social_platforms ? JSON.parse(JSON.stringify(ambassador.social_platforms)) : [];
  const alignmentGoals = ambassador.alignment_goals || [];
  const promotionMethods = ambassador.promotion_methods || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin/ambassadors" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Back to Ambassadors
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Ambassador Application Details</h1>
            </div>
            <AmbassadorStatusBadge status={ambassador.application_status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                  {ambassador.profile_image_url ? (
                    <img 
                      src={ambassador.profile_image_url} 
                      alt={ambassador.full_name} 
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-white">
                        {ambassador.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{ambassador.full_name}</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{ambassador.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{ambassador.whatsapp_number}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{ambassador.city}, {ambassador.region}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Applied: {new Date(ambassador.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {ambassador.application_status === 'pending' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-4">
                    <ApproveAmbassadorButton ambassadorId={ambassador.id} ambassadorEmail={ambassador.email} ambassadorName={ambassador.full_name} />
                    <RejectAmbassadorButton ambassadorId={ambassador.id} ambassadorName={ambassador.full_name} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Age Range</p>
                    <p className="font-medium">{ageRangeMap[ambassador.age_range] || ambassador.age_range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{genderMap[ambassador.gender] || ambassador.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="font-medium">{currentStatusMap[ambassador.status] || ambassador.status || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Motivation */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Motivation
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{ambassador.motivation}</p>
              </div>

              {/* Mission Alignment */}
              {alignmentGoals.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Mission Alignment
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {alignmentGoals.map((goal: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* PrepSkul Explanation */}
              {ambassador.explanation && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    How They Would Explain PrepSkul
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ambassador.explanation}</p>
                </div>
              )}

              {/* Social Media Presence */}
              {socialPlatforms.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Social Media Presence
                  </h3>
                  <div className="space-y-3">
                    {socialPlatforms.map((platform: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{platform.platform}</p>
                        {platform.username && (
                          <p className="text-sm text-gray-600">Username: {platform.username}</p>
                        )}
                        {platform.followers > 0 && (
                          <p className="text-sm text-gray-600">Followers: {platform.followers.toLocaleString()}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {ambassador.reach_range && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Weekly Reach</p>
                      <p className="font-medium">{reachRangeMap[ambassador.reach_range] || ambassador.reach_range}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Promotion Methods */}
              {promotionMethods.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Promotion Methods
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {promotionMethods.map((method: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {method}
                      </span>
                    ))}
                  </div>
                  {ambassador.promotion_methods_other && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Other Methods</p>
                      <p className="text-gray-700">{ambassador.promotion_methods_other}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Creative Idea */}
              {ambassador.creative_idea && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Creative Promotion Idea
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{ambassador.creative_idea}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

