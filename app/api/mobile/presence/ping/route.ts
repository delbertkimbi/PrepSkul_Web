import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromBearer } from '@/lib/supabase-mobile-auth';

const bodySchema = z.object({
  platform: z.enum(['ios', 'android', 'web']).optional(),
  appVersion: z.string().optional(),
});

/**
 * POST /api/mobile/presence/ping
 * Mobile app heartbeat — marks user as online on the mobile app.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const admin = getSupabaseAdmin();

    await admin
      .from('profiles')
      .update({
        last_seen: now,
        last_seen_source: 'mobile',
        last_seen_platform: parsed.data.platform ?? 'android',
        updated_at: now,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      lastSeen: now,
      source: 'mobile',
    });
  } catch (error: unknown) {
    console.error('mobile presence ping', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record presence' },
      { status: 500 }
    );
  }
}
