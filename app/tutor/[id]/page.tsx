import { Metadata } from 'next';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { generateTutorMetadata } from '@/lib/tutor-metadata';
import AutoRedirect from './AutoRedirect';
import TutorProfilePreview from './TutorProfilePreview';
import OpeningAppScreen from './OpeningAppScreen';

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
  const uaLower = userAgent.toLowerCase();

  // IMPORTANT:
  // Do NOT HTTP-redirect here. Many link preview engines (Facebook/WhatsApp/Telegram/etc.)
  // either do not identify as crawlers or will follow redirects to Flutter Web, which
  // loses the tutor-specific OG metadata. Instead: always return 200 HTML with metadata,
  // and use a client-side redirect for real users.
  const isMobileApp =
    userAgent.includes('PrepSkul') ||
    userAgent.includes('prepskul') ||
    headersList.get('x-requested-with') === 'com.prepskul.app';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com';
  const deepLink = `prepskul://tutor/${id}`;
  const webAppUrl = `${appUrl}/#/tutor/${id}`;
  const isAndroidBrowser = uaLower.includes('android') && !isMobileApp;
  // Android Chrome supports intent:// which opens the app if installed (more reliable than scheme links).
  // Falls back to the web app automatically.
  const androidIntentUrl = `intent://tutor/${encodeURIComponent(
    id
  )}#Intent;scheme=prepskul;package=com.prepskul.app;S.browser_fallback_url=${encodeURIComponent(
    webAppUrl
  )};end`;

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
    <>
      {/* Always attempt to open the app for real users. Scrapers don't execute JS, so OG tags remain safe. */}
      <AutoRedirect
        to={isMobileApp ? deepLink : isAndroidBrowser ? androidIntentUrl : webAppUrl}
        // For Android intent:// links, the fallback is already handled by the intent itself.
        fallbackTo={isAndroidBrowser ? undefined : webAppUrl}
        fallbackDelayMs={900}
      />

      {/* UX: show a branded deep-blue opening screen during redirect to avoid UI flash. */}
      {!isCrawler(userAgent) ? (
        <OpeningAppScreen />
      ) : (
        <TutorProfilePreview
          tutor={tutor}
          profile={profile as any}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          tutorId={tutor.user_id || tutor.id}
        />
      )}
    </>
  );
}
