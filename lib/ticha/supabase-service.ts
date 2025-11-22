/**
 * Supabase Service Role Client for TichaAI
 * Use this for admin operations (Storage, direct DB access)
 * NEVER expose service role key to client-side code
 */

import { createClient } from '@supabase/supabase-js'

const tichaSupabaseUrl = process.env.NEXT_PUBLIC_TICHA_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const tichaSupabaseServiceKey = process.env.TICHA_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// Don't throw at module load - check in functions instead
function validateCredentials() {
  if (!tichaSupabaseUrl || !tichaSupabaseServiceKey) {
    throw new Error('Missing TichaAI Supabase credentials. Please set NEXT_PUBLIC_TICHA_SUPABASE_URL and TICHA_SUPABASE_SERVICE_KEY environment variables.')
  }
}

/**
 * Get service role Supabase client for TichaAI
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
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
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

