import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Registers / updates an FCM token for the currently authenticated user.
// Uses service-role Supabase client to bypass RLS and handle account switching on same device.

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const supabaseAdmin = getSupabaseAdmin();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const token = body?.token ? String(body.token) : '';
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const platform = body?.platform ? String(body.platform) : undefined;
    const deviceId = body?.device_id ? String(body.device_id) : undefined;
    const deviceName = body?.device_name ? String(body.device_name) : undefined;
    const appVersion = body?.app_version ? String(body.app_version) : undefined;

    const now = new Date().toISOString();

    // Prefer upsert on token (single device token should belong to latest signed-in user).
    // If schema differs, fall back to minimal columns.
    const richRow: Record<string, any> = {
      user_id: user.id,
      token,
      is_active: true,
      updated_at: now,
      ...(platform ? { platform } : {}),
      ...(deviceId ? { device_id: deviceId } : {}),
      ...(deviceName ? { device_name: deviceName } : {}),
      ...(appVersion ? { app_version: appVersion } : {}),
    };

    const minimalRow: Record<string, any> = {
      user_id: user.id,
      token,
      is_active: true,
      updated_at: now,
    };

    const isMissingColumn = (err: any, columnName: string) =>
      err?.code === 'PGRST204' && String(err?.message || '').includes(`'${columnName}'`);

    let writeErr: any | null = null;
    {
      const attempt = await supabaseAdmin
        .from('fcm_tokens')
        .upsert(richRow, { onConflict: 'token' })
        .select('token, user_id, is_active')
        .maybeSingle();

      writeErr = attempt.error;

      if (writeErr && (isMissingColumn(writeErr, 'platform') || isMissingColumn(writeErr, 'device_id') || isMissingColumn(writeErr, 'device_name') || isMissingColumn(writeErr, 'app_version'))) {
        const retry = await supabaseAdmin
          .from('fcm_tokens')
          .upsert(minimalRow, { onConflict: 'token' })
          .select('token, user_id, is_active')
          .maybeSingle();
        writeErr = retry.error;
      }
    }

    if (writeErr) {
      console.error('❌ register-token write error:', writeErr);
      return NextResponse.json({ error: 'Failed to register token' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('❌ register-token error:', e);
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

