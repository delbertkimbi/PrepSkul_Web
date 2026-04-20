import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const eventSchema = z.object({
  eventType: z.string().min(2),
  userId: z.string().uuid().optional(),
  userRole: z.string().optional(),
  platform: z.enum(['android', 'ios']).default('android'),
  eventTimestamp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  eventId: z.string().optional(),
});

const payloadSchema = z.object({
  app: z.literal('flutter_native'),
  events: z.array(eventSchema).min(1).max(200),
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-mobile-analytics-key');
    if (!apiKey || apiKey !== process.env.MOBILE_ANALYTICS_INGEST_KEY) {
      return NextResponse.json({ error: 'Unauthorized ingest key' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const rows = parsed.data.events.map((e) => {
      const generatedEventId =
        e.eventId ||
        crypto
          .createHash('sha256')
          .update(`${e.eventType}|${e.userId || 'anon'}|${e.eventTimestamp || ''}|${JSON.stringify(e.metadata || {})}`)
          .digest('hex');
      return {
        event_id: generatedEventId,
        event_type: e.eventType,
        user_id: e.userId || null,
        user_role: e.userRole || null,
        platform: e.platform,
        source_app: 'flutter_native',
        event_timestamp: e.eventTimestamp ? new Date(e.eventTimestamp).toISOString() : new Date().toISOString(),
        metadata: e.metadata || {},
      };
    });

    const { error } = await supabase.from('mobile_app_events').upsert(rows, { onConflict: 'event_id' });
    if (error) throw error;

    return NextResponse.json({ success: true, accepted: rows.length });
  } catch (error: any) {
    console.error('mobile analytics ingest error', error);
    return NextResponse.json({ error: error?.message || 'Failed to ingest mobile events' }, { status: 500 });
  }
}

