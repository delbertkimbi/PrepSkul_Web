import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getAuthenticatedSupabaseForApi(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.replace('Bearer ', '') || null

  if (accessToken) {
    const tempSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const {
      data: { user },
      error,
    } = await tempSupabase.auth.getUser(accessToken)
    if (error || !user) {
      return { supabase: null, user: null }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    )
    return { supabase, user }
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return { supabase: null, user: null }
  }
  return { supabase, user }
}

