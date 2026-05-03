import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAgoraToken, generateSessionUID, getAgoraConfig } from '@/lib/services/agora/token-generator';
import { getOrCreateChannelName, validateSessionAccess, getUserRoleInSession } from '@/lib/services/agora/session-service';
import { RtcRole } from 'agora-token';
import { buildCorsHeaders } from '@/lib/services/group-classes/cors';

type TokenErrorShape = {
  error: string
  code: string
  reason: string
  hint: string
  retryable: boolean
}

function buildTokenErrorPayload(
  error: string,
  code: string,
  reason: string,
  hint: string,
  retryable: boolean,
): TokenErrorShape {
  return { error, code, reason, hint, retryable }
}

function qaSessionJoinBypassEnabled(): boolean {
  const enabled = (process.env.QA_SESSION_JOIN_BYPASS_ENABLED || '').toLowerCase();
  const isProd = process.env.NODE_ENV === 'production';
  return !isProd && (enabled === 'true' || enabled === '1' || enabled === 'yes');
}

function parseSessionStart(row: any): Date | null {
  try {
    if (row?.scheduled_at) {
      const d = new Date(row.scheduled_at);
      if (!isNaN(d.getTime())) return d;
    }
    if (row?.scheduled_date && row?.start_time) {
      const d = new Date(`${row.scheduled_date}T${row.start_time}`);
      if (!isNaN(d.getTime())) return d;
    }
  } catch (_) {}
  return null;
}

function parseDurationMinutes(row: any): number {
  const candidates = [
    row?.duration_minutes,
    row?.duration,
    row?.session_duration_minutes,
  ];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 60;
}

async function isQaJoinWithinWindow(sessionId: string, supabase: any): Promise<boolean> {
  try {
    const { data: individual } = await supabase
      .from('individual_sessions')
      .select('id, status, scheduled_at, scheduled_date, start_time, duration_minutes, duration')
      .eq('id', sessionId)
      .maybeSingle();

    const row = individual ?? (
      await supabase
        .from('trial_sessions')
        .select('id, status, scheduled_at, scheduled_date, start_time, duration_minutes, duration')
        .eq('id', sessionId)
        .maybeSingle()
    )?.data;

    if (!row) return false;

    const status = (row.status || '').toString().toLowerCase();
    if (status === 'completed' || status === 'cancelled') return false;

    const start = parseSessionStart(row);
    if (!start) {
      // Dev-only fallback: if timing metadata is missing, allow QA bypass.
      return true;
    }

    const durationMinutes = parseDurationMinutes(row);
    const expiresAt = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return new Date() <= expiresAt;
  } catch (e) {
    console.warn('[Agora Token] QA bypass window check failed:', e);
    return false;
  }
}

/**
 * Agora Token Generation API
 * 
 * Generates RTC tokens for Agora video sessions.
 * 
 * POST /api/agora/token
 * Body: { sessionId: string }
 * 
 * Returns: { token: string, channelName: string, uid: number, expiresAt: string }
 */
export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request, {
    methods: 'POST, OPTIONS',
    allowHeaders: 'Content-Type, Authorization, X-Requested-With, X-PrepSkul-QA-Bypass',
  });

  try {
    // Get Authorization header from request (Flutter web sends token here)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    if (!accessToken) {
      return NextResponse.json(
        buildTokenErrorPayload(
          'Missing authorization token',
          'TOKEN_AUTH_HEADER_MISSING',
          'auth_missing',
          'Sign in again and retry joining the session.',
          false,
        ),
        { 
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    // Create Supabase client with the access token from Authorization header
    // This is needed because Flutter web sends tokens in headers, not cookies
    // First, verify the token and get user info with retry logic for network issues
    const tempSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          fetch: (url, options = {}) => {
            return fetch(url, {
              ...options,
              // Increase timeout for Supabase requests
              signal: AbortSignal.timeout(30000), // 30 seconds instead of default 10
            });
          },
        },
      }
    );
    
    // Retry logic for token validation (network issues can cause timeouts)
    let userFromToken = null;
    let tokenError = null;
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries && !userFromToken) {
      try {
        const result = await tempSupabase.auth.getUser(accessToken);
        userFromToken = result.data?.user;
        tokenError = result.error;
        
        if (userFromToken) {
          break; // Success, exit retry loop
        }
        
        // If it's a network/timeout error, retry
        if (tokenError && (
          tokenError.message?.includes('timeout') ||
          tokenError.message?.includes('fetch failed') ||
          tokenError.message?.includes('ConnectTimeoutError')
        )) {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // Exponential backoff, max 5s
            console.warn(`[Agora Token] Token validation timeout (attempt ${retryCount}/${maxRetries}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        } else {
          // Not a network error, don't retry
          break;
        }
      } catch (error: any) {
        // Catch any other errors (like AbortError from timeout)
        if (error?.message?.includes('timeout') || error?.code === 'UND_ERR_CONNECT_TIMEOUT') {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
            console.warn(`[Agora Token] Token validation error (attempt ${retryCount}/${maxRetries}): ${error.message}, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            tokenError = { message: `Connection timeout after ${maxRetries} attempts: ${error.message}` };
          }
        } else {
          // Not a timeout error, don't retry
          tokenError = { message: error?.message || 'Unknown error' };
          break;
        }
      }
    }
    
    if (tokenError || !userFromToken) {
      console.error('[Agora Token] Token validation error:', tokenError?.message || 'Unknown error');
      console.error('[Agora Token] This may be a network connectivity issue with Supabase');
      return NextResponse.json(
        buildTokenErrorPayload(
          'Unauthorized. Invalid or expired token, or network connectivity issue.',
          'TOKEN_AUTH_INVALID_OR_NETWORK',
          'auth_invalid_or_network',
          'Refresh your session. If this continues, check network connectivity and retry.',
          true,
        ),
        { 
          status: 401,
          headers: corsHeaders,
        }
      );
    }
    
    // Create Supabase client with proper authentication for RLS
    // The key is to use the access token in the auth context
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
      }
    );
    
    // Manually set the session using the access token
    // This ensures RLS policies can read the user context
    try {
      // Decode the JWT to get user info (we already have it from getUser above)
      // The Authorization header should work, but let's also try setting it in the auth context
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.warn('[Agora Token] No session found, but Authorization header should work');
        // The Authorization header in global.headers should still work for RLS
      } else {
        console.log('[Agora Token] Session found:', session.user.id);
      }
    } catch (e) {
      console.warn('[Agora Token] Session check error (continuing):', e);
    }
    
    const user = userFromToken;
    console.log('[Agora Token] User authenticated:', user.id, user.email);

    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    console.log('[Agora Token] Received sessionId from request:', sessionId);
    console.log('[Agora Token] Request body:', JSON.stringify(body, null, 2));

    if (!sessionId) {
      console.error('[Agora Token] Missing sessionId in request body');
      return NextResponse.json(
        buildTokenErrorPayload(
          'Missing required field: sessionId',
          'TOKEN_SESSION_ID_MISSING',
          'invalid_request',
          'Pass a valid sessionId in the request body.',
          false,
        ),
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate user access to session (pass the authenticated supabase client)
    console.log(`[Agora Token] Validating access for user ${user.id} to session ${sessionId}`);
    let hasAccess = await validateSessionAccess(sessionId, user.id, supabase);
    console.log(`[Agora Token] Access validation result: ${hasAccess}`);

    if (!hasAccess && qaSessionJoinBypassEnabled()) {
      const qaBypassRequested = request.headers.get('x-prepskul-qa-bypass') === '1';
      if (qaBypassRequested) {
        const withinWindow = await isQaJoinWithinWindow(sessionId, supabase);
        if (withinWindow) {
          hasAccess = true;
          console.warn(`[Agora Token] QA bypass enabled for user ${user.id} on session ${sessionId}`);
        }
      }
    }

    if (!hasAccess) {
      console.error(`[Agora Token] Access denied for user ${user.id} to session ${sessionId}`);
      return NextResponse.json(
        buildTokenErrorPayload(
          'Access denied. You are not a participant in this session.',
          'TOKEN_SESSION_ACCESS_DENIED',
          'authz_denied',
          'Only paid/enrolled participants and session owners can join.',
          false,
        ),
        { 
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    // Get user role in session (pass the authenticated supabase client)
    const role = await getUserRoleInSession(sessionId, user.id, supabase);
    if (!role) {
      return NextResponse.json(
        buildTokenErrorPayload(
          'Unable to determine user role in session',
          'TOKEN_ROLE_RESOLUTION_FAILED',
          'role_resolution_failed',
          'Verify session participant records and retry.',
          true,
        ),
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Get or create channel name (pass the authenticated supabase client)
    const channelName = await getOrCreateChannelName(sessionId, supabase);

    // Generate unique UID for this user in this session
    const uid = generateSessionUID(sessionId, user.id, role);
    console.log(`[Agora Token] Generated UID for user ${user.id} (${role}): ${uid}`);
    console.log(`[Agora Token] UID generation input: sessionId=${sessionId}, userId=${user.id}, role=${role}`);

    // Get Agora configuration
    const agoraConfig = getAgoraConfig();

    // Generate Agora RTC token (1 hour expiration)
    const agoraToken = generateAgoraToken({
      appId: agoraConfig.appId,
      appCertificate: agoraConfig.appCertificate,
      channelName,
      uid,
      role: RtcRole.PUBLISHER, // Allow publishing video/audio
      expirationTimeInSeconds: 3600, // 1 hour
    });

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    // Store token expiration in database (optional, for tracking)
    await supabase
      .from('individual_sessions')
      .update({ agora_token_expires_at: expiresAt })
      .eq('id', sessionId);

    return NextResponse.json({
      token: agoraToken,
      channelName,
      uid,
      expiresAt,
      role,
      appId: agoraConfig.appId, // Include appId for client initialization
    }, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      buildTokenErrorPayload(
        error?.message || 'Failed to generate token',
        'TOKEN_GENERATION_FAILED',
        'server_error',
        'Retry shortly. If this continues, contact support with sessionId and timestamp.',
        true,
      ),
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request, {
    methods: 'POST, OPTIONS',
    allowHeaders: 'Content-Type, Authorization, X-Requested-With, X-PrepSkul-QA-Bypass',
  });

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

