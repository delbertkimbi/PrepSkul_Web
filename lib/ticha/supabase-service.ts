/**
 * Supabase Service Role Client for Tichar AI
 * Use this for admin operations (Storage, direct DB access)
 * NEVER expose service role key to client-side code
 */

import { createClient } from '@supabase/supabase-js'

// #region agent log
const logDebug = (location: string, message: string, data: any) => {
  fetch('http://127.0.0.1:7242/ingest/7b5e5a52-47e1-4b45-99f3-6240f3527478', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location,
      message,
      data,
      timestamp: Date.now(),
      sessionId: 'debug-session',
      runId: 'run1',
    }),
  }).catch(() => {});
};
// #endregion

const tichaSupabaseUrl = process.env.NEXT_PUBLIC_TICHA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const tichaSupabaseServiceKey = process.env.TICHA_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// #region agent log
logDebug('supabase-service.ts:10', 'Module load - env vars check', {
  hasNextPublicTichaUrl: !!process.env.NEXT_PUBLIC_TICHA_SUPABASE_URL,
  hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasTichaServiceKey: !!process.env.TICHA_SUPABASE_SERVICE_KEY,
  hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  tichaUrlLength: tichaSupabaseUrl?.length || 0,
  serviceKeyLength: tichaSupabaseServiceKey?.length || 0,
  tichaUrlPrefix: tichaSupabaseUrl?.substring(0, 20) || 'null',
});
// #endregion

// Don't throw at module load - check in functions instead
function validateCredentials() {
  // #region agent log
  logDebug('supabase-service.ts:validateCredentials', 'validateCredentials called', {
    hasTichaUrl: !!tichaSupabaseUrl,
    hasServiceKey: !!tichaSupabaseServiceKey,
    tichaUrlLength: tichaSupabaseUrl?.length || 0,
    serviceKeyLength: tichaSupabaseServiceKey?.length || 0,
    tichaUrlPrefix: tichaSupabaseUrl?.substring(0, 30) || 'null',
    serviceKeyPrefix: tichaSupabaseServiceKey?.substring(0, 20) || 'null',
  });
  // #endregion
  
  if (!tichaSupabaseUrl || !tichaSupabaseServiceKey) {
    // #region agent log
    logDebug('supabase-service.ts:validateCredentials', 'Validation failed', {
      missingUrl: !tichaSupabaseUrl,
      missingKey: !tichaSupabaseServiceKey,
      allEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('TICHA')),
    });
    // #endregion
    throw new Error('Missing Tichar AI Supabase credentials. Please set NEXT_PUBLIC_TICHA_SUPABASE_URL and TICHA_SUPABASE_SERVICE_KEY environment variables.')
  }
}

/**
 * Get service role Supabase client for Tichar AI
 * This bypasses RLS and has full admin access
 * Use ONLY in API routes, never in client components
 */
export function getTichaSupabaseAdmin() {
  validateCredentials()
  return createClient(
    tichaSupabaseUrl!,
    tichaSupabaseServiceKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Export for backward compatibility
export const tichaSupabaseAdmin = {
  get storage() {
    return getTichaSupabaseAdmin().storage
  },
  get auth() {
    return getTichaSupabaseAdmin().auth
  },
  from(table: string) {
    return getTichaSupabaseAdmin().from(table)
  },
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: Buffer | ArrayBuffer,
  contentType: string
): Promise<{ path: string; url: string }> {
  validateCredentials()
  const supabase = getTichaSupabaseAdmin()
  
  // Convert Buffer/ArrayBuffer to Blob for Supabase
  const blob = file instanceof Buffer 
    ? new Blob([file], { type: contentType })
    : file instanceof ArrayBuffer
    ? new Blob([file], { type: contentType })
    : file

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error(`[Storage] Upload error details:`, error)
    throw new Error(`Failed to upload file: ${error.message || JSON.stringify(error)}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    url: publicUrl,
  }
}

/**
 * Download file from Supabase Storage
 */
export async function downloadFileFromStorage(
  bucket: string,
  path: string
): Promise<Buffer> {
  validateCredentials()
  const supabase = getTichaSupabaseAdmin()
  
  console.log(`[Storage] Downloading from bucket: ${bucket}, path: ${path}`)
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  if (error) {
    console.error(`[Storage] Download error:`, error)
    console.error(`[Storage] Error details:`, JSON.stringify(error, null, 2))
    const errorMessage = error.message || error.error || JSON.stringify(error) || "Unknown error"
    throw new Error(`Failed to download file from ${bucket}/${path}: ${errorMessage}`)
  }

  if (!data) {
    throw new Error(`No data returned from storage for ${bucket}/${path}`)
  }

  return Buffer.from(await data.arrayBuffer())
}

/**
 * Get public URL for a file in Storage
 */
export function getPublicUrl(bucket: string, path: string): string {
  validateCredentials()
  const supabase = getTichaSupabaseAdmin()
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}
