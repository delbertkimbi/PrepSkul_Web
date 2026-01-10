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
  ];

  // CORS headers - when using credentials, must specify exact origin (not *)
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
  };

  // Only allow specific origins
  if (origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  } else if (origin) {
    // Allow any origin for localhost variations (Flutter web dev server)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
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
    // First, verify the token and get user info
    const tempSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user: userFromToken }, error: tokenError } = await tempSupabase.auth.getUser(accessToken);
    
    if (tokenError || !userFromToken) {
      console.error('[Agora Token] Token validation error:', tokenError?.message || 'Unknown error');
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired token.' },
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
  ];

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  // Allow any localhost origin for development (Flutter web dev server)
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

