import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { getServiceSupabaseAdmin } from './billing'
import { isAllowedOrigin } from './http'

export type SkulMateAccountRole = 'learner' | 'parent'

export function normalizeAccountRole(raw?: string | null): SkulMateAccountRole {
  return raw === 'parent' ? 'parent' : 'learner'
}

/**
 * Identity comes from the access token (Bearer) or a cookie session.
 * A body/query `userId` is only a consistency check: it must match the token.
 * It is never accepted as identity on its own.
 */
export async function resolveSkulMateUserId(
  request: NextRequest,
  claimedUserId?: string
): Promise<string | undefined> {
  if (!isAllowedOrigin(request.headers.get('origin'))) return undefined
  const tokenUserId = await userIdFromBearer(request)
  // An invalid explicit token must never fall back to a different cookie identity.
  const userId = request.headers.has('authorization') ? tokenUserId : await userIdFromCookie()
  if (!userId) return undefined
  if (claimedUserId && claimedUserId !== userId) return undefined
  return userId
}

async function userIdFromBearer(request: NextRequest): Promise<string | undefined> {
  const auth = request.headers.get('authorization')
  const token = auth?.match(/^Bearer\s+(\S+)$/i)?.[1]
  if (!token) return undefined
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return undefined
  try {
    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data } = await supabase.auth.getUser(token)
    return data.user?.id
  } catch {
    return undefined
  }
}

async function userIdFromCookie(): Promise<string | undefined> {
  try {
    const { createServerSupabaseClient } = await import('@/lib/supabase-server')
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.id
  } catch {
    return undefined
  }
}

export async function loadAccountRole(
  userId: string
): Promise<SkulMateAccountRole> {
  const admin = getServiceSupabaseAdmin()
  if (!admin) return 'learner'
  const { data } = await admin
    .from('profiles')
    .select('user_type')
    .eq('id', userId)
    .maybeSingle()
  return normalizeAccountRole(data?.user_type as string | undefined)
}

export function getSkulMateApiKeys(): string[] {
  const primary = process.env.SKULMATE_OPENROUTER_API_KEY
  const fallback = process.env.OPENROUTER_API_KEY
  const keys = [primary, fallback].filter(
    (k): k is string => Boolean(k && k.trim())
  )
  const unique = [...new Set(keys)]
  if (unique.length === 0) {
    throw new Error(
      'Missing SKULMATE_OPENROUTER_API_KEY or OPENROUTER_API_KEY'
    )
  }
  return unique
}

export function hasSkulMateApiKeys(): boolean {
  try {
    return getSkulMateApiKeys().length > 0
  } catch {
    return false
  }
}

/** Check linked learner ownership before any service-role read/write. */
export async function assertOwnedChild(userId: string, childId?: string | null) {
  if (childId == null) return
  if (typeof childId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(childId)) throw new Error('Learner not found')
  const admin = getServiceSupabaseAdmin()
  if (!admin) throw new Error('Memory store unavailable')
  const { data, error } = await admin.from('parent_learners').select('id').eq('id', childId).eq('parent_id', userId).maybeSingle()
  if (error || !data) throw new Error('Learner not found')
}
