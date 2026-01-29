import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Fetch tutor data - try both id and user_id since id might be the user_id UUID
  let tutor = null;
  
  // First try: query by id (primary key)
  const { data: tutorById } = await supabase
    .from('tutor_profiles')
    .select('*, profiles(full_name)')
    .eq('id', id)
    .maybeSingle();
  
  if (tutorById) {
    tutor = tutorById;
  }
  
  // Second try: query by user_id if first query failed
  if (!tutor) {
    const { data: tutorByUserId } = await supabase
      .from('tutor_profiles')
      .select('*, profiles(full_name)')
      .eq('user_id', id)
      .maybeSingle();
    
    if (tutorByUserId) {
      tutor = tutorByUserId;
    }
  }

  if (!tutor) {
    return {
      title: 'Tutor Not Found | PrepSkul',
      description: 'The requested tutor profile could not be found.',
    };
  }

  // Get tutor name
  const tutorName = (tutor.profiles as any)?.full_name || tutor.full_name || 'Tutor';
  const bio = tutor.bio || tutor.motivation || '';
  
  // Build description
  let description = `${tutorName} is a verified tutor on PrepSkul`;
  
  if (bio && bio.trim().length > 0) {
    // Clean bio (remove "Hello!" if present) and truncate
    const cleanBio = bio.replaceAll(/^Hello!?\s*/i, '').trim();
    description += `. ${cleanBio.substring(0, 120)}${cleanBio.length > 120 ? '...' : ''}`;
  } else {
    description += '. Verified tutor on PrepSkul.';
  }

  // Add subjects if available
  if (tutor.tutoring_areas && tutor.tutoring_areas.length > 0) {
    description += ` Specializes in ${tutor.tutoring_areas.slice(0, 3).join(', ')}.`;
  }

  return {
    title: `${tutorName} | Tutor Profile | PrepSkul`,
    description,
    openGraph: {
      title: `${tutorName} | Tutor Profile | PrepSkul`,
      description,
      type: 'profile',
      images: tutor.profile_photo_url ? [
        {
          url: tutor.profile_photo_url,
          width: 1200,
          height: 630,
          alt: `${tutorName} - PrepSkul Tutor`,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tutorName} | Tutor Profile | PrepSkul`,
      description,
      images: tutor.profile_photo_url ? [tutor.profile_photo_url] : undefined,
    },
  };
}

export default async function TutorProfilePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Fetch tutor data - try both id and user_id since id might be the user_id UUID
  let tutor = null;
  
  // First try: query by id (primary key)
  const { data: tutorById } = await supabase
    .from('tutor_profiles')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .maybeSingle();
  
  if (tutorById) {
    tutor = tutorById;
  }
  
  // Second try: query by user_id if first query failed
  if (!tutor) {
    const { data: tutorByUserId } = await supabase
      .from('tutor_profiles')
      .select('*, profiles(full_name, email)')
      .eq('user_id', id)
      .maybeSingle();
    
    if (tutorByUserId) {
      tutor = tutorByUserId;
    }
  }

  if (!tutor) {
    notFound();
  }

  const tutorName = (tutor.profiles as any)?.full_name || tutor.full_name || 'Tutor';

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{tutorName}</h1>
          {tutor.bio && (
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{tutor.bio}</p>
          )}
          {tutor.tutoring_areas && tutor.tutoring_areas.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Subjects</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.tutoring_areas.map((area: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
