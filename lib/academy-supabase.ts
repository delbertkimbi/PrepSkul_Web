import { createBrowserClient } from '@supabase/ssr';

// Academy Supabase Configuration
// Uses separate env vars to keep Academy isolated from main PrepSkul
// Fallback to main env vars if Academy-specific vars are not set
const academySupabaseUrl = process.env.NEXT_PUBLIC_ACADEMY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const academySupabaseAnonKey = process.env.NEXT_PUBLIC_ACADEMY_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser/client-side Supabase client for Academy
 * Use this in Client Components and browser-side code
 */
export const academySupabase = createBrowserClient(academySupabaseUrl, academySupabaseAnonKey);


