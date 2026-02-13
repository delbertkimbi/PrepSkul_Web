import { type Metadata } from 'next';

jest.mock('@/lib/supabase-admin', () => ({
  getSupabaseAdmin: jest.fn(),
}));

jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

import { generateTutorMetadata } from '@/lib/tutor-metadata';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

describe('Tutor share links (www.prepskul.com/tutor/[id])', () => {
  const tutorId = 'tutor-123';

  function setupSupabaseAdminMocks() {
    const tutorRow = {
      id: tutorId,
      user_id: tutorId,
      subjects: ['Math', 'Physics'],
      bio: 'Experienced tutor with strong results.',
      rating: 4.8,
      total_reviews: 10,
      profiles: {
        full_name: 'John Doe',
        avatar_url: 'https://cdn.prepskul.com/avatar.jpg',
        email: 'john@example.com',
      },
    };

    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: tutorRow }),
    };

    (getSupabaseAdmin as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(queryBuilder),
    });

    return { tutorRow, queryBuilder };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generateTutorMetadata returns tutor-specific Open Graph data using admin client', async () => {
    const { tutorRow } = setupSupabaseAdminMocks();

    const metadata = (await generateTutorMetadata(tutorId)) as Metadata;

    expect(getSupabaseAdmin).toHaveBeenCalled();

    expect(metadata.title).toContain('John Doe');
    expect(metadata.description).toContain('Book John Doe for Math, Physics tutoring sessions');

    // In real production, NEXT_PUBLIC_SITE_URL is set to https://www.prepskul.com.
    // In Jest tests, Next.js may default this base URL to http://localhost:3000,
    // so we only assert that the path portion is correct.
    expect(metadata.openGraph?.url).toContain(
      `/tutor/${tutorRow.user_id}`,
    );

    const ogImage = metadata.openGraph?.images?.[0];
    expect(ogImage?.url).toBe('https://cdn.prepskul.com/avatar.jpg');
    expect(ogImage?.alt).toContain('John Doe');
  });
});
