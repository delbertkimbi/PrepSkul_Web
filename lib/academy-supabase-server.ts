import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client for Academy
 * Use this in Server Components and API routes
 */
export async function createAcademySupabaseClient() {
  const cookieStore = await cookies();
  
  const academySupabaseUrl = process.env.NEXT_PUBLIC_ACADEMY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const academySupabaseAnonKey = process.env.NEXT_PUBLIC_ACADEMY_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(academySupabaseUrl, academySupabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Get the current academy user session on the server
 */
export async function getAcademyServerSession() {
  const supabase = await createAcademySupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}


