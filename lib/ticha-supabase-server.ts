import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// TichaAI Supabase Configuration for Server Components
const tichaSupabaseUrl = process.env.NEXT_PUBLIC_TICHA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const tichaSupabaseAnonKey = process.env.NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client for TichaAI
 * Use this in Server Components, API routes, and server actions
 */
export async function createTichaServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(tichaSupabaseUrl, tichaSupabaseAnonKey, {
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
          // Ignore errors in Server Components
        }
      },
    },
  });
}

/**
 * Get the current authenticated user from server
 */
export async function getTichaServerSession() {
  const supabase = await createTichaServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isTichaAuthenticated() {
  const user = await getTichaServerSession();
  return !!user;
}

