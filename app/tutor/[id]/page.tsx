import { Metadata } from 'next';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generateTutorMetadata } from '@/lib/tutor-metadata';
import { redirect } from 'next/navigation';
import TutorProfilePreview from './TutorProfilePreview';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return generateTutorMetadata(id);
}

// Crawler UAs that must receive HTML with OG meta tags (no redirect)
const CRAWLER_UA_PATTERNS = [
  'WhatsApp',
  'WhatsAppBot',
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'TelegramBot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
];

function isCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return CRAWLER_UA_PATTERNS.some((p) => ua.includes(p.toLowerCase()));
}

export default async function TutorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  if (!isCrawler(userAgent)) {
    const isMobileApp =
      userAgent.includes('PrepSkul') ||
      userAgent.includes('prepskul') ||
      headersList.get('x-requested-with') === 'com.prepskul.app';

    if (isMobileApp) {
      // Native app deep link
      redirect(`prepskul://tutor/${id}`);
    }

    // Desktop / mobile browser: send to Flutter Web app (hash routing)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com';
    redirect(`${appUrl}/#/tutor/${id}`);
  }

  // Fetch tutor data
  let tutor = null;
  let profile = null;

  // Try by user_id first (most common case)
  const supabaseAdmin = getSupabaseAdmin();

  const { data: tutorById } = await supabaseAdmin
    .from('tutor_profiles')
    .select('*, profiles!tutor_profiles_user_id_fkey(full_name, avatar_url, email, phone_number)')
    .eq('user_id', id)
    .eq('status', 'approved')
    .neq('is_hidden', true)
    .maybeSingle();

  if (tutorById) {
    tutor = tutorById;
    profile = tutorById.profiles;
  } else {
    // Try by tutor_profiles.id as fallback
    const { data: tutorByTutorId } = await supabaseAdmin
      .from('tutor_profiles')
      .select('*, profiles!tutor_profiles_user_id_fkey(full_name, avatar_url, email, phone_number)')
      .eq('id', id)
      .eq('status', 'approved')
      .neq('is_hidden', true)
      .maybeSingle();

    if (tutorByTutorId) {
      tutor = tutorByTutorId;
      profile = tutorByTutorId.profiles;
    }
  }

  if (!tutor || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tutor Not Found</h1>
          <p className="text-gray-600 mb-4">The tutor profile you are looking for could not be found.</p>
          <a 
            href="https://app.prepskul.com" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to PrepSkul
          </a>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const supabaseUserClient = await createServerSupabaseClient();
  const { data: { user } } = await supabaseUserClient.auth.getUser();
  const isAuthenticated = !!user;

  // Get user role if authenticated
  let userRole: string | null = null;
  if (user) {
    const { data: userProfile } = await supabaseUserClient
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .maybeSingle();
    userRole = userProfile?.user_type || null;
  }

  return (
    <TutorProfilePreview 
      tutor={tutor} 
      profile={profile as any}
      isAuthenticated={isAuthenticated}
      userRole={userRole}
      tutorId={tutor.user_id || tutor.id}
    />
  );
}
