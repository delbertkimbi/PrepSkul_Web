import type { Metadata } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Shared helper to generate tutor profile metadata for www.prepskul.com/tutor/[id].
 * Uses Supabase admin client so crawlers (WhatsApp, Facebook, etc.) can always
 * see tutor data, even without an authenticated user session.
 */
export async function generateTutorMetadata(tutorIdParam: string): Promise<Metadata> {
  const supabase = getSupabaseAdmin();

  let tutor: any = null;
  let profile: any = null;

  // Try by user_id first (most common case)
  const { data: tutorById } = await supabase
    .from('tutor_profiles')
    .select('*, profiles!tutor_profiles_user_id_fkey(full_name, avatar_url, email)')
    .eq('user_id', tutorIdParam)
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
      .eq('id', tutorIdParam)
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

  const tutorName = profile.full_name || 'Tutor';
  const tutorAvatar = profile.avatar_url || null;

  const subjects = tutor.subjects as string[] | string | null;
  const subjectsArray = Array.isArray(subjects)
    ? subjects
    : typeof subjects === 'string'
      ? [subjects]
      : [];
  const subjectsText = subjectsArray.length > 0 ? subjectsArray.join(', ') : 'Tutor';

  const bio =
    (tutor.bio as string | null) ||
    (tutor.personal_statement as string | null) ||
    (tutor.motivation as string | null);

  const rating = tutor.rating || tutor.admin_approved_rating || 0;
  const totalReviews = tutor.total_reviews || 0;
  const ratingText =
    rating > 0
      ? `⭐ ${rating.toFixed(1)}${totalReviews > 0 ? ` (${totalReviews} reviews)` : ''}`
      : '';

  let description = `Book ${tutorName} for ${subjectsText} tutoring sessions`;
  if (ratingText.length > 0) {
    description += ` • ${ratingText}`;
  }
  if (bio && bio.trim().length > 0) {
    const cleanBio = bio.replace(/^Hello!?\s*/i, '').trim();
    description += `. ${cleanBio.substring(0, 120)}${cleanBio.length > 120 ? '...' : ''}`;
  } else {
    description += '. Verified tutor on PrepSkul.';
  }

  const tutorId = tutor.user_id || tutor.id;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.prepskul.com';
  const tutorUrl = `${siteUrl}/tutor/${tutorId}`;

  let imageUrl: string;
  if (tutorAvatar) {
    if (tutorAvatar.startsWith('http://') || tutorAvatar.startsWith('https://')) {
      imageUrl = tutorAvatar;
    } else if (tutorAvatar.startsWith('/')) {
      imageUrl = `${siteUrl}${tutorAvatar}`;
    } else {
      imageUrl = tutorAvatar.startsWith('http')
        ? tutorAvatar
        : `${siteUrl}${tutorAvatar}`;
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

