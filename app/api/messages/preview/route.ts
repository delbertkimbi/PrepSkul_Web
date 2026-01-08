import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, senderId, conversationId } = body;
    
    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. content is required.' },
        { status: 400 }
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
    });
    
  } catch (error: any) {
    console.error('❌ Error in POST /api/messages/preview:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

