import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function hashPortalToken(rawToken: string) {
  return sha256(rawToken);
}

export function generateRawToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export async function createPortalTokenRecord(opts: {
  individualSessionId: string;
  purpose: 'tutor_report' | 'learner_feedback';
  expiresAt: string;
}) {
  const supabase = getSupabaseAdmin();
  const rawToken = generateRawToken();
  const tokenHash = hashPortalToken(rawToken);
  const { data, error } = await supabase
    .from('session_portal_tokens')
    .insert({
      individual_session_id: opts.individualSessionId,
      purpose: opts.purpose,
      token_hash: tokenHash,
      expires_at: opts.expiresAt,
    })
    .select('id, individual_session_id, purpose, expires_at')
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || 'Failed to create portal token');
  return { rawToken, token: data };
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

