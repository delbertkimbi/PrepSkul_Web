import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { filterMessage } from '@/lib/services/message-filter-service';
import { sendPushNotification } from '@/lib/services/firebase-admin';

/**
 * Message Send API
 * 
 * POST /api/messages/send
 * 
 * Validates, filters, and sends a message
 * - Validates conversation exists and is active
 * - Checks user is participant
 * - Runs message filtering
 * - Blocks critical violations
 * - Stores flagged attempts
 * - Inserts allowed messages
 * - Updates conversation metadata
 * - Triggers push notifications
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
    // Get Authorization header (Flutter sends token here)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    let supabase;
    let user;

    if (accessToken) {
      // Flutter app sends token via Authorization header
      // Create Supabase client with the access token
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

      // Create authenticated Supabase client
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
      // Fallback: Try cookies (for web app)
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
    const { conversationId, content } = body;
    
    // Validate input
    if (!conversationId || !content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. conversationId and content are required.' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    // Validate conversation exists and user is participant
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { 
          status: 404,
          headers: corsHeaders,
        }
      );
    }
    
    if (conversation.student_id !== user.id && conversation.tutor_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You are not a participant in this conversation.' },
        { 
          status: 403,
          headers: corsHeaders,
        }
      );
    }
    
    // Check conversation is active
    if (conversation.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'This conversation is no longer active',
          reason: `Conversation status: ${conversation.status}`,
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    // Check if conversation expired
    if (conversation.expires_at && new Date(conversation.expires_at) < new Date()) {
      // Auto-close expired conversation
      await supabase
        .from('conversations')
        .update({ status: 'expired' })
        .eq('id', conversationId);
      
      return NextResponse.json(
        { error: 'This conversation has expired' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    // Check if user is muted/banned
    const { data: activeViolations } = await supabase
      .from('user_violations')
      .select('action_taken, expires_at')
      .eq('user_id', user.id)
      .in('action_taken', ['mute_24h', 'mute_7d', 'ban'])
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    
    if (activeViolations && activeViolations.length > 0) {
      const ban = activeViolations.find(v => v.action_taken === 'ban');
      if (ban) {
        return NextResponse.json(
          { error: 'Your account has been banned. You cannot send messages.' },
          { 
            status: 403,
            headers: corsHeaders,
          }
        );
      }
      
      const mute = activeViolations.find(v => v.action_taken?.startsWith('mute'));
      if (mute) {
        const expiresAt = mute.expires_at ? new Date(mute.expires_at) : null;
        const isExpired = expiresAt && expiresAt < new Date();
        
        if (!isExpired) {
          return NextResponse.json(
            { 
              error: 'You are temporarily muted and cannot send messages.',
              reason: `Mute expires: ${expiresAt?.toISOString() || 'indefinitely'}`,
            },
            { 
              status: 403,
              headers: corsHeaders,
            }
          );
        }
      }
    }
    
    // Filter message content
    const filterResult = filterMessage(content, user.id, conversationId);
    
    // If blocked, store flag and return error
    if (!filterResult.allowed) {
      // Store flagged message attempt
      const { error: flagError } = await supabase
        .from('flagged_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content, // Store original for review
          flags: filterResult.flags,
          status: 'blocked',
          severity: filterResult.flags.find(f => f.severity === 'critical')?.severity ||
                    filterResult.flags.find(f => f.severity === 'high')?.severity ||
                    filterResult.flags[0]?.severity ||
                    'medium',
          created_at: new Date().toISOString(),
        });
      
      if (flagError) {
        console.error('❌ Error storing flagged message:', flagError);
      }
      
      // Create user violation record
      for (const flag of filterResult.flags) {
        if (flag.severity === 'critical' || flag.severity === 'high') {
          await supabase
            .from('user_violations')
            .insert({
              user_id: user.id,
              violation_type: flag.type,
              severity: flag.severity,
              created_at: new Date().toISOString(),
            });
        }
      }
      
      // Get the primary reason
      const primaryFlag = filterResult.flags.find(f => f.severity === 'critical') ||
                         filterResult.flags.find(f => f.severity === 'high') ||
                         filterResult.flags[0];
      
      return NextResponse.json(
        { 
          error: 'Message blocked',
          reason: primaryFlag?.reason || 'Message contains prohibited content',
          flags: filterResult.flags.map(f => f.type), // Don't expose full details
        },
        { 
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    
    // If allowed but has low/medium flags, store flags for review
    if (filterResult.flags.length > 0) {
      const { error: flagError } = await supabase
        .from('flagged_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content,
          flags: filterResult.flags,
          status: 'review', // Needs admin review
          severity: filterResult.flags[0]?.severity || 'low',
          created_at: new Date().toISOString(),
        });
      
      if (flagError) {
        console.error('❌ Error storing flagged message for review:', flagError);
      }
    }
    
    // Insert message
    const { data: message, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        is_filtered: filterResult.flags.length > 0,
        filter_reason: filterResult.flags.length > 0 
          ? filterResult.flags.map(f => f.type).join(',')
          : null,
        moderation_status: filterResult.flags.length > 0 ? 'pending' : 'approved',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting message:', insertError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { 
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    
    // Update conversation last_message_at (trigger should handle this, but ensure it)
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    // Get recipient ID
    const recipientId = conversation.student_id === user.id 
      ? conversation.tutor_id 
      : conversation.student_id;
    
    // Get sender profile with avatar for rich notifications
    // NOTE: some users store photos in `profile_photo_url` (tutor_profiles) not `profiles.avatar_url`.
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    
    const senderName = senderProfile?.full_name || 'Someone';
    let senderAvatarUrl = senderProfile?.avatar_url || null;
    // Fallback: try tutor_profiles.profile_photo_url if avatar_url is missing.
    if (!senderAvatarUrl) {
      try {
        const { data: tutorProfile } = await supabase
          .from('tutor_profiles')
          .select('profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle();
        senderAvatarUrl = tutorProfile?.profile_photo_url || null;
      } catch {
        // ignore
      }
    }
    
    // Send rich notification via unified endpoint (if no critical flags)
    if (filterResult.flags.length === 0 || !filterResult.flags.some(f => f.severity === 'critical')) {
      try {
        // Always call the notification API on the SAME origin that served this request.
        // This avoids misconfigured env vars (e.g., pointing to `app.prepskul.com` which has no API routes).
        const baseUrl = new URL(request.url).origin;
        const messagePreview = content.length > 200 ? content.substring(0, 200) + '...' : content;
        
        const notifRes = await fetch(`${baseUrl}/api/notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: recipientId,
            type: 'message',
            title: `New message from ${senderName}`,
            message: messagePreview,
            priority: 'high',
            actionUrl: `/messages/${conversationId}`,
            actionText: 'Open Conversation',
            imageUrl: senderAvatarUrl, // Rich preview: sender avatar
            metadata: {
              sender_id: user.id,
              sender_name: senderName,
              sender_avatar_url: senderAvatarUrl,
              conversation_id: conversationId,
              message_preview: messagePreview,
            },
            sendEmail: true, // Enable email for messages
            sendPush: true, // Enable push for messages
          }),
        });

        const responseText = await notifRes.text().catch(() => '');
        if (!notifRes.ok) {
          console.warn(
            `⚠️ Notification API returned ${notifRes.status} ${notifRes.statusText}. Body preview: ${
              responseText.length > 200 ? responseText.substring(0, 200) : responseText
            }`
          );
        } else {
          try {
            const parsed = JSON.parse(responseText);
            const pushSent = parsed?.channels?.push?.sent;
            const pushErrors = parsed?.channels?.push?.errors;
            console.log(
              `✅ Message notification dispatched: recipient=${recipientId} push_sent=${pushSent ?? 'n/a'} push_errors=${pushErrors ?? 'n/a'}`
            );
          } catch {
            console.log(
              `✅ Message notification dispatched (non-JSON response): recipient=${recipientId}`
            );
          }
        }
      } catch (notifError) {
        // Don't fail message send if notification fails
        console.error('⚠️ Error sending notification:', notifError);
      }
    }
    
    return NextResponse.json(
      { 
        message,
        flags: filterResult.flags.length > 0 ? filterResult.flags.map(f => ({
          type: f.type,
          severity: f.severity,
          reason: f.reason,
        })) : [],
      },
      { 
        status: 200,
        headers: corsHeaders,
      }
    );
    
  } catch (error: any) {
    console.error('❌ Error in POST /api/messages/send:', error);
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

