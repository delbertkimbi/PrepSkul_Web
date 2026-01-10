import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Agora Session Service
 * 
 * Manages Agora channel names and session metadata
 */

/**
 * Generate unique Agora channel name for a session
 * 
 * Format: session_{sessionId}
 * 
 * @param sessionId Individual session ID
 * @returns Channel name
 */
export function generateChannelName(sessionId: string): string {
  return `session_${sessionId}`;
}

/**
 * Get or create Agora channel name for a session
 * 
 * If channel name doesn't exist, generates and stores it in the database.
 * 
 * @param sessionId Individual session ID
 * @param supabase Optional Supabase client (if not provided, creates a new one)
 * @returns Channel name
 */
export async function getOrCreateChannelName(sessionId: string, supabase?: any): Promise<string> {
  const client = supabase || await createServerSupabaseClient();

  // Check if channel name already exists
  const { data: session, error: fetchError } = await client
    .from('individual_sessions')
    .select('agora_channel_name')
    .eq('id', sessionId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to fetch session: ${fetchError.message}`);
  }

  // If channel name exists, return it
  if (session?.agora_channel_name) {
    return session.agora_channel_name;
  }

  // Generate new channel name
  const channelName = generateChannelName(sessionId);

  // Store in database
  const { error: updateError } = await client
    .from('individual_sessions')
    .update({ agora_channel_name: channelName })
    .eq('id', sessionId);

  if (updateError) {
    throw new Error(`Failed to store channel name: ${updateError.message}`);
  }

  return channelName;
}

/**
 * Validate user access to a session
 * 
 * Checks if the user is a participant (tutor, learner, or parent) in the session.
 * 
 * @param sessionId Session ID
 * @param userId User ID
 * @param supabase Optional Supabase client (if not provided, creates a new one)
 * @returns True if user has access, false otherwise
 */
export async function validateSessionAccess(
  sessionId: string,
  userId: string,
  supabase?: any
): Promise<boolean> {
  const client = supabase || await createServerSupabaseClient();

  console.log('[validateSessionAccess] Querying session:', sessionId);
  console.log('[validateSessionAccess] Using client with auth:', client ? 'Yes' : 'No');
  
  // First, try to check if the session exists at all (with more detailed query)
  console.log('[validateSessionAccess] Attempting to query individual_sessions table...');
  
  // Try the query with the authenticated client
  const { data: session, error, status, statusText, count } = await client
    .from('individual_sessions')
    .select('tutor_id, learner_id, parent_id, id, status', { count: 'exact' })
    .eq('id', sessionId)
    .maybeSingle();

  console.log('[validateSessionAccess] Query result:', {
    hasData: !!session,
    error: error?.message,
    status,
    statusText,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  });

  if (error) {
    console.error('[validateSessionAccess] Database error:', error);
    console.error('[validateSessionAccess] Error code:', error?.code);
    console.error('[validateSessionAccess] Error message:', error?.message);
    console.error('[validateSessionAccess] Error details:', error?.details);
    console.error('[validateSessionAccess] Error hint:', error?.hint);
    
    // Check if it's an RLS error
    if (error?.code === 'PGRST301' || error?.message?.includes('permission denied') || error?.message?.includes('RLS')) {
      console.error('[validateSessionAccess] This appears to be an RLS (Row Level Security) error');
    }
    
    return false;
  }

  if (!session) {
    console.error('[validateSessionAccess] Session not found in database');
    console.error('[validateSessionAccess] Session ID:', sessionId, 'User ID:', userId);
    
    // Check if this might be a recurring_session_id instead of individual_session_id
    // Try querying recurring_sessions to see if it exists there
    try {
      const { data: recurringSession, error: recurringError } = await client
        .from('recurring_sessions')
        .select('id, tutor_id')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (recurringSession) {
        console.error('[validateSessionAccess] ⚠️ Session ID exists in recurring_sessions, not individual_sessions!');
        console.error('[validateSessionAccess] This might be a recurring_session_id instead of individual_session_id');
        console.error('[validateSessionAccess] Recurring session tutor_id:', recurringSession.tutor_id);
      } else {
        console.error('[validateSessionAccess] Session ID does not exist in recurring_sessions either');
      }
    } catch (e) {
      console.error('[validateSessionAccess] Could not check recurring_sessions:', e);
    }
    
    return false;
  }

  console.log('[validateSessionAccess] Session found:', {
    tutor_id: session.tutor_id,
    learner_id: session.learner_id,
    parent_id: session.parent_id
  });

  const hasAccess = (
    session.tutor_id === userId ||
    session.learner_id === userId ||
    session.parent_id === userId
  );
  
  console.log('[validateSessionAccess] Access check:', {
    sessionId,
    userId,
    tutor_id: session.tutor_id,
    learner_id: session.learner_id,
    parent_id: session.parent_id,
    hasAccess
  });

  return hasAccess;
}

/**
 * Get user role in a session
 * 
 * @param sessionId Session ID
 * @param userId User ID
 * @param supabase Optional Supabase client (if not provided, creates a new one)
 * @returns User role ('tutor' or 'learner') or null if not a participant
 */
export async function getUserRoleInSession(
  sessionId: string,
  userId: string,
  supabase?: any
): Promise<'tutor' | 'learner' | null> {
  const client = supabase || await createServerSupabaseClient();

  const { data: session, error } = await client
    .from('individual_sessions')
    .select('tutor_id, learner_id, parent_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !session) {
    console.error('[getUserRoleInSession] Error or session not found:', error?.message || 'Session not found');
    return null;
  }

  if (session.tutor_id === userId) {
    return 'tutor';
  }

  if (session.learner_id === userId || session.parent_id === userId) {
    return 'learner';
  }

  return null;
}

