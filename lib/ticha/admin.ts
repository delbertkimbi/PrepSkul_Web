/**
 * Ticha Admin Utilities
 * Functions to check admin status and manage admin users
 */

import { getTichaSupabaseAdmin } from './supabase-service'
import { createTichaServerSupabaseClient } from '../ticha-supabase-server'

/**
 * Check if a user is a Ticha admin
 */
export async function isTichaAdmin(userId: string): Promise<boolean> {
  const supabase = getTichaSupabaseAdmin()
  
  const { data, error } = await supabase
    .from('ticha_users')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()
  
  if (error || !data) {
    return false
  }
  
  return data.is_admin === true
}

/**
 * Set a user as admin (server-side only)
 */
export async function setTichaAdmin(userId: string, isAdmin: boolean = true): Promise<void> {
  const supabase = getTichaSupabaseAdmin()
  
  const { error } = await supabase
    .from('ticha_users')
    .update({ is_admin: isAdmin })
    .eq('id', userId)
  
  if (error) {
    throw new Error(`Failed to update admin status: ${error.message}`)
  }
}

/**
 * Get admin status from server session
 */
export async function getTichaAdminStatus(): Promise<boolean> {
  const supabase = await createTichaServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return false
  }
  
  return isTichaAdmin(user.id)
}

