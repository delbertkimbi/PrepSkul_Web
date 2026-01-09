import { NextRequest, NextResponse } from 'next/server';
import { filterMessage } from '@/lib/services/message-filter-service';

/**
 * Message Preview API
 * 
 * POST /api/messages/preview
 * 
 * Previews filter results without blocking
 * - Returns warnings for client-side UI
 * - Helps users fix issues before sending
 * - Does not store anything in database
 */

export async function POST(request: NextRequest) {
  // Handle CORS
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
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
  }

  try {
    const body = await request.json();
    const { content, senderId, conversationId } = body;
    
    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. content is required.' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    // Run filter (preview only - doesn't block)
    const filterResult = filterMessage(
      content,
      senderId || 'preview',
      conversationId
    );
    
    // Return preview results
    return NextResponse.json({
      hasWarnings: filterResult.flags.length > 0,
      willBlock: filterResult.willBlock,
      warnings: filterResult.warnings,
      flags: filterResult.flags.map(f => ({
        type: f.type,
        severity: f.severity,
        reason: f.reason,
      })),
    }, {
      headers: corsHeaders,
    });
    
  } catch (error: any) {
    console.error('❌ Error in POST /api/messages/preview:', error);
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
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
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
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

