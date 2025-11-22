import { createBrowserClient } from '@supabase/ssr';

// TichaAI Supabase Configuration
// Uses separate env vars to keep TichaAI isolated from PrepSkul
// Fallback to main env vars if TichaAI-specific vars are not set
const tichaSupabaseUrl = process.env.NEXT_PUBLIC_TICHA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const tichaSupabaseAnonKey = process.env.NEXT_PUBLIC_TICHA_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser/client-side Supabase client for TichaAI
 * Use this in Client Components and browser-side code
 */
export const tichaSupabase = createBrowserClient(tichaSupabaseUrl, tichaSupabaseAnonKey);
