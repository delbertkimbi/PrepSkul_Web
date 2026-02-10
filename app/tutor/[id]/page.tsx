import { Metadata } from 'next';
import { headers } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import TutorProfilePreview from './TutorProfilePreview';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Fetch tutor data for Open Graph metadata
  let tutor = null;
  let profile = null;

  // Try by user_id first (most common case)
  const { data: tutorById } = await supabase
    .from('tutor_profiles')
    .select('*, profiles!tutor_profiles_user_id_fkey(full_name, avatar_url, email)')
    .eq('user_id', id)
    .eq('status', 'approved')
    .neq('is_hidden', true)
    .maybeSingle();

  if (tutorById) {
    tutor = tutorById;
    profile = tutorById.profiles;
  } else {
    // Try by tutor_profiles.id as fallback
    const { data: tutorByTutorId } = await supabase
      .from('tutor_profiles')
      .select('*, profiles!tutor_profiles_user_id_fkey(full_name, avatar_url, email)')
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
    return {
      title: 'Tutor Not Found - PrepSkul',
      description: 'The tutor profile you are looking for could not be found.',
    };
  }

  const tutorName = (profile as any)?.full_name || 'Tutor';
  const tutorAvatar = (profile as any)?.avatar_url || null;
  const subjects = tutor.subjects as string[] | string | null;
  const subjectsArray = Array.isArray(subjects) 
    ? subjects 
    : (typeof subjects === 'string' ? [subjects] : []);
  const subjectsText = subjectsArray.length > 0 
    ? subjectsArray.join(', ') 
    : 'Tutor';
  
  // Get bio from multiple possible sources (bio, personal_statement, motivation)
  const bio = (tutor.bio as string | null) || 
              (tutor.personal_statement as string | null) ||
              (tutor.motivation as string | null);
  
  // Create rich description for link preview
  const rating = tutor.rating || tutor.admin_approved_rating || 0;
  const totalReviews = tutor.total_reviews || 0;
  const ratingText = rating > 0 ? `⭐ ${rating.toFixed(1)}${totalReviews > 0 ? ` (${totalReviews} reviews)` : ''}` : '';
  
  let description = `Book ${tutorName} for ${subjectsText} tutoring sessions`;
  if (ratingText.length > 0) {
    description += ` • ${ratingText}`;
  }
  if (bio && bio.trim().length > 0) {
    // Clean bio (remove "Hello!" if present) and truncate
    const cleanBio = bio.replaceAll(/^Hello!?\s*/i, '').trim();
    description += `. ${cleanBio.substring(0, 120)}${cleanBio.length > 120 ? '...' : ''}`;
  } else {
    description += '. Verified tutor on PrepSkul.';
  }
  
  const tutorId = tutor.user_id || tutor.id;
  // SEO proxy: shared links are www.prepskul.com/tutor/[id] so og:url and canonical match
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.prepskul.com';
  const tutorUrl = `${siteUrl}/tutor/${tutorId}`;

  // Ensure image URL is absolute and publicly accessible
  let imageUrl: string;
  if (tutorAvatar) {
    if (tutorAvatar.startsWith('http://') || tutorAvatar.startsWith('https://')) {
      imageUrl = tutorAvatar;
    } else if (tutorAvatar.startsWith('/')) {
      imageUrl = `${siteUrl}${tutorAvatar}`;
    } else {
      imageUrl = tutorAvatar.startsWith('http') ? tutorAvatar : `${siteUrl}${tutorAvatar}`;
    }
  } else {
    imageUrl = `${siteUrl}/logo.jpg`;
  }

  return {
    title: `${tutorName} - ${subjectsText} Tutor on PrepSkul`,
    description,
    openGraph: {
      title: `${tutorName} - ${subjectsText} Tutor on PrepSkul`,
      description,
      url: tutorUrl,
      siteName: 'PrepSkul',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${tutorName} - PrepSkul Tutor`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tutorName} - ${subjectsText} Tutor on PrepSkul`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: tutorUrl,
    },
  };
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
      redirect(`prepskul://tutor/${id}`);
    }

    // Desktop / mobile browser: send to Flutter Web app
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com';
    redirect(`${appUrl}/tutor/${id}`);
  }

  const supabase = await createServerSupabaseClient();

  // Fetch tutor data
  let tutor = null;
  let profile = null;

  // Try by user_id first (most common case)
  const { data: tutorById } = await supabase
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
    const { data: tutorByTutorId } = await supabase
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
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Get user role if authenticated
  let userRole: string | null = null;
  if (user) {
    const { data: userProfile } = await supabase
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
