import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Resolve the Supabase user from a mobile Bearer access token.
 */
export async function getUserFromBearer(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}
