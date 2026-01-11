import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

/**
 * Message Feedback API
 * 
 * POST /api/messages/feedback
 * 
 * Allows users to submit feedback on message filtering results
 * - Report false positives
 * - Confirm correct flags
 * - Provide context for review
 */

export async function POST(request: NextRequest) {
  // Handle CORS
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5000',
    'http://localhost:49581',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:49581',
    'https://app.prepskul.com',
    'https://www.prepskul.com',
  ];

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  } else if (!origin) {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  }

  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    let supabase;
    let user;

    if (accessToken) {
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user: userFromToken }, error: tokenError } = 
        await tempSupabase.auth.getUser(accessToken);
      
      if (tokenError || !userFromToken) {
        return NextResponse.json(
          { error: 'Unauthorized. Invalid or expired token.' },
          { 
            status: 401,
            headers: corsHeaders,
          }
        );
      }

      supabase = createClient(
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
      
      user = userFromToken;
    } else {
      supabase = await createServerSupabaseClient();
      const { data: { user: userFromCookies }, error: authError } = 
        await supabase.auth.getUser();
      
      if (authError || !userFromCookies) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { 
            status: 401,
            headers: corsHeaders,
          }
        );
      }
      
      user = userFromCookies;
    }

    const body = await request.json();
    const { flaggedMessageId, messageId, feedbackType, feedbackText, contextSnippet } = body;

    // Validate input
    if (!feedbackType || !['false_positive', 'correct_flag', 'other'].includes(feedbackType)) {
      return NextResponse.json(
        { error: 'Invalid feedback type. Must be false_positive, correct_flag, or other.' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!flaggedMessageId && !messageId) {
      return NextResponse.json(
        { error: 'Either flaggedMessageId or messageId is required.' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('message_feedback')
      .insert({
        flagged_message_id: flaggedMessageId || null,
        message_id: messageId || null,
        user_id: user.id,
        feedback_type: feedbackType,
        feedback_text: feedbackText || null,
        context_snippet: contextSnippet || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting feedback:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      { 
        feedback,
        message: 'Feedback submitted successfully. Thank you for helping improve our system!',
      },
      { 
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (error: any) {
    console.error('❌ Error in POST /api/messages/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
    'http://localhost:49581',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:49581',
    'https://app.prepskul.com',
    'https://www.prepskul.com',
  ];

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  } else if (!origin) {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}


