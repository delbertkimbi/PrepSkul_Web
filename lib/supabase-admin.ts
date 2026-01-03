/**
 * Supabase Admin Client for Main PrepSkul Database
 * Uses service role key to bypass RLS
 * ONLY use in API routes, never in client components
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function validateCredentials() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    )
  }
}

/**
 * Get service role Supabase client for main PrepSkul database
 * This bypasses RLS and has full admin access
 * Use ONLY in API routes, never in client components
 */
export function getSupabaseAdmin() {
  validateCredentials()
  return createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

