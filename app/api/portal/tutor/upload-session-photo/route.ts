import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifySessionPortalAccessToken } from '@/lib/services/session-portal-access';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const token = String(form.get('token') || '');
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const access = verifySessionPortalAccessToken(token);
    if (access.role !== 'tutor') {
      return NextResponse.json({ error: 'Invalid token for tutor upload' }, { status: 403 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `tutor-session-photos/${access.sessionId}/${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from('offline-ops').upload(path, buf, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

    if (error) {
      return NextResponse.json({
        error: error.message,
        hint: 'Ensure the "offline-ops" storage bucket exists (see supabase/offline_ops_storage_bucket.sql).',
      }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from('offline-ops').getPublicUrl(path);
    return NextResponse.json({ success: true, url: pub.publicUrl });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}
