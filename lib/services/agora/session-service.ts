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
 * For trial sessions, just generates the channel name (trial_sessions doesn't have agora_channel_name column).
 * 
 * @param sessionId Session ID (can be individual_sessions or trial_sessions)
 * @param supabase Optional Supabase client (if not provided, creates a new one)
 * @returns Channel name
 */
export async function getOrCreateChannelName(sessionId: string, supabase?: any): Promise<string> {
  const client = supabase || await createServerSupabaseClient();

  // First, check if it's an individual_session with stored channel name
  const { data: session, error: fetchError } = await client
    .from('individual_sessions')
    .select('agora_channel_name')
    .eq('id', sessionId)
    .maybeSingle();

  if (fetchError) {
    console.warn('[getOrCreateChannelName] Error querying individual_sessions:', fetchError.message);
  }

  // If channel name exists in individual_sessions, return it
  if (session?.agora_channel_name) {
    console.log('[getOrCreateChannelName] Found existing channel name in individual_sessions');
    return session.agora_channel_name;
  }

  // Check if it's a trial session (trial_sessions doesn't have agora_channel_name column)
  const { data: trialSession, error: trialError } = await client
    .from('trial_sessions')
    .select('id')
    .eq('id', sessionId)
    .maybeSingle();

  if (trialError) {
    console.warn('[getOrCreateChannelName] Error querying trial_sessions:', trialError.message);
  }

  // Generate channel name
  const channelName = generateChannelName(sessionId);

  if (trialSession) {
    // For trial sessions, just return the generated channel name
    // (trial_sessions table doesn't have agora_channel_name column)
    console.log('[getOrCreateChannelName] Trial session detected, using generated channel name:', channelName);
    return channelName;
  }

  // For individual_sessions, try to store the channel name
  if (session) {
    // Session exists but no channel name - store it
    const { error: updateError } = await client
      .from('individual_sessions')
      .update({ agora_channel_name: channelName })
      .eq('id', sessionId);

    if (updateError) {
      console.warn('[getOrCreateChannelName] Failed to store channel name, but continuing with generated name:', updateError.message);
      // Continue anyway - the channel name will still work
    } else {
      console.log('[getOrCreateChannelName] Stored channel name in individual_sessions');
    }
  } else {
    // Session not found in either table - just return generated name
    console.warn('[getOrCreateChannelName] Session not found in individual_sessions or trial_sessions, using generated channel name');
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
    console.error('[validateSessionAccess] Session not found in individual_sessions');
    console.error('[validateSessionAccess] Session ID:', sessionId, 'User ID:', userId);
    
    // Check trial_sessions table first (before recurring_sessions)
    try {
      console.log('[validateSessionAccess] Checking trial_sessions table...');
      const { data: trialSession, error: trialError } = await client
        .from('trial_sessions')
        .select('tutor_id, learner_id, parent_id, id, status')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (trialError) {
        console.error('[validateSessionAccess] Error querying trial_sessions:', trialError);
      }
      
      if (trialSession) {
        console.log('[validateSessionAccess] ✅ Session found in trial_sessions:', {
          tutor_id: trialSession.tutor_id,
          learner_id: trialSession.learner_id,
          parent_id: trialSession.parent_id,
          status: trialSession.status
        });
        
        // Validate access for trial session
        const hasAccess = (
          trialSession.tutor_id === userId ||
          trialSession.learner_id === userId ||
          trialSession.parent_id === userId
        );
        
        console.log('[validateSessionAccess] Trial session access check:', {
          sessionId,
          userId,
          tutor_id: trialSession.tutor_id,
          learner_id: trialSession.learner_id,
          parent_id: trialSession.parent_id,
          hasAccess
        });
        
        return hasAccess;
      } else {
        console.log('[validateSessionAccess] Session not found in trial_sessions');
      }
    } catch (e) {
      console.error('[validateSessionAccess] Could not check trial_sessions:', e);
    }
    
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

  // First, try individual_sessions
  const { data: session, error } = await client
    .from('individual_sessions')
    .select('tutor_id, learner_id, parent_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('[getUserRoleInSession] Error querying individual_sessions:', error);
  }

  if (session) {
    console.log('[getUserRoleInSession] Session found in individual_sessions');
    if (session.tutor_id === userId) {
      return 'tutor';
    }
    if (session.learner_id === userId || session.parent_id === userId) {
      return 'learner';
    }
    return null;
  }

  // If not found in individual_sessions, check trial_sessions
  console.log('[getUserRoleInSession] Session not found in individual_sessions, checking trial_sessions...');
  const { data: trialSession, error: trialError } = await client
    .from('trial_sessions')
    .select('tutor_id, learner_id, parent_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (trialError) {
    console.error('[getUserRoleInSession] Error querying trial_sessions:', trialError);
  }

  if (trialSession) {
    console.log('[getUserRoleInSession] ✅ Session found in trial_sessions:', {
      tutor_id: trialSession.tutor_id,
      learner_id: trialSession.learner_id,
      parent_id: trialSession.parent_id
    });
    
    if (trialSession.tutor_id === userId) {
      return 'tutor';
    }
    if (trialSession.learner_id === userId || trialSession.parent_id === userId) {
      return 'learner';
    }
    return null;
  }

  console.error('[getUserRoleInSession] Session not found in individual_sessions or trial_sessions');
  return null;
}

