import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function generateRawToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export async function verifyPortalToken(
  rawToken: string,
  purpose: 'tutor_report' | 'learner_feedback'
) {
  const supabase = getSupabaseAdmin();
  const tokenHash = sha256(rawToken);
  const { data, error } = await supabase
    .from('session_portal_tokens')
    .select('id, individual_session_id, purpose, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .eq('purpose', purpose)
    .maybeSingle();
  if (error || !data) throw new Error('Invalid token');
  if (data.used_at) throw new Error('Token already used');
  if (new Date(data.expires_at).getTime() < Date.now()) throw new Error('Token expired');
  return data;
}

export async function markTokenUsed(tokenId: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('session_portal_tokens').update({ used_at: new Date().toISOString() }).eq('id', tokenId);
}

