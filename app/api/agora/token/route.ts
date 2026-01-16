import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { generateAgoraToken, generateSessionUID, getAgoraConfig } from '@/lib/services/agora/token-generator';
import { getOrCreateChannelName, validateSessionAccess, getUserRoleInSession } from '@/lib/services/agora/session-service';
import { RtcRole } from 'agora-token';

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
  // Handle CORS for Flutter Web - define at function level so it's available everywhere
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5000',
    'https://app.prepskul.com',
    'https://www.prepskul.com',
    'https://prepskul.com',
    'http://10.148.224.254:5000', // Network IP for local testing
  ];

  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  };

  // Helper function to check if origin is a local/network IP
  const isLocalOrNetworkOrigin = (orig: string): boolean => {
    // Check for localhost variations
    if (orig.includes('localhost') || orig.includes('127.0.0.1')) {
      return true;
    }
    // Check for private network IP ranges (RFC 1918)
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    const ipPattern = /^http:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/;
    const match = orig.match(ipPattern);
    if (match) {
      const ip = match[1];
      const parts = ip.split('.').map(Number);
      // 10.0.0.0 - 10.255.255.255
      if (parts[0] === 10) return true;
      // 172.16.0.0 - 172.31.255.255
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0 - 192.168.255.255
      if (parts[0] === 192 && parts[1] === 168) return true;
    }
    return false;
  };

  // Only allow specific origins
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    console.log(`[Agora Token] Allowing origin: ${origin}`);
  } else if (origin) {
    // Allow localhost variations and private network IPs (for local/network testing)
    if (isLocalOrNetworkOrigin(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
      console.log(`[Agora Token] Allowing network origin: ${origin}`);
    } else {
      // CRITICAL: Always allow prepskul.com domains (production or not)
      // This ensures app.prepskul.com works regardless of NODE_ENV setting
      const isPrepskulDomain = origin.includes('prepskul.com');
      if (isPrepskulDomain) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
        corsHeaders['Access-Control-Allow-Credentials'] = 'true';
        console.log(`[Agora Token] Allowing prepskul.com domain: ${origin}`);
      } else {
        console.warn(`[Agora Token] Blocked origin: ${origin}`);
        // Still set CORS headers for debugging (but don't allow credentials)
        corsHeaders['Access-Control-Allow-Origin'] = origin || '*';
      }
    }
  } else {
    // No origin header - might be a direct request or some browsers
    // In production, allow requests without origin (for debugging)
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.warn('[Agora Token] No origin header - allowing in production');
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    }
  }

  try {
    // Get Authorization header from request (Flutter web sends token here)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
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
        { error: 'Unauthorized. Invalid or expired token, or network connectivity issue.' },
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
        { error: 'Missing required field: sessionId' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Validate user access to session (pass the authenticated supabase client)
    console.log(`[Agora Token] Validating access for user ${user.id} to session ${sessionId}`);
    const hasAccess = await validateSessionAccess(sessionId, user.id, supabase);
    console.log(`[Agora Token] Access validation result: ${hasAccess}`);
    
    if (!hasAccess) {
      console.error(`[Agora Token] Access denied for user ${user.id} to session ${sessionId}`);
      return NextResponse.json(
        { error: 'Access denied. You are not a participant in this session.' },
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
        { error: 'Unable to determine user role in session' },
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
      { error: error.message || 'Failed to generate token' },
      { 
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5000',
    'https://app.prepskul.com',
    'https://www.prepskul.com',
    'https://prepskul.com',
    'http://10.148.224.254:5000', // Network IP for local testing
  ];

  // Helper function to check if origin is a local/network IP
  const isLocalOrNetworkOrigin = (orig: string): boolean => {
    // Check for localhost variations
    if (orig.includes('localhost') || orig.includes('127.0.0.1')) {
      return true;
    }
    // Check for private network IP ranges (RFC 1918)
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    const ipPattern = /^http:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/;
    const match = orig.match(ipPattern);
    if (match) {
      const ip = match[1];
      const parts = ip.split('.').map(Number);
      // 10.0.0.0 - 10.255.255.255
      if (parts[0] === 10) return true;
      // 172.16.0.0 - 172.31.255.255
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0 - 192.168.255.255
      if (parts[0] === 192 && parts[1] === 168) return true;
    }
    return false;
  };

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  // Allow specific origins or local/network IPs for development
  if (origin) {
    if (allowedOrigins.includes(origin) || isLocalOrNetworkOrigin(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
      console.log(`[Agora Token OPTIONS] Allowing origin: ${origin}`);
    } else {
      // CRITICAL: Always allow prepskul.com domains (production or not)
      // This ensures app.prepskul.com works regardless of NODE_ENV setting
      const isPrepskulDomain = origin.includes('prepskul.com');
      if (isPrepskulDomain) {
        corsHeaders['Access-Control-Allow-Origin'] = origin;
        corsHeaders['Access-Control-Allow-Credentials'] = 'true';
        console.log(`[Agora Token OPTIONS] Allowing prepskul.com domain: ${origin}`);
      } else {
        console.warn(`[Agora Token OPTIONS] Blocked origin: ${origin}`);
        // Still set CORS headers for debugging
        corsHeaders['Access-Control-Allow-Origin'] = origin;
      }
    }
  } else {
    // No origin header - might be a direct request or some browsers
    // In production, allow requests without origin (for debugging)
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      console.warn('[Agora Token OPTIONS] No origin header - allowing in production');
      corsHeaders['Access-Control-Allow-Origin'] = '*';
    }
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

