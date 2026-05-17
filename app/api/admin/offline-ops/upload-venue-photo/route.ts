import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `offline-venues/${user.id}/${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from('offline-ops').upload(path, buf, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

    if (error) {
      return NextResponse.json({
        error: error.message,
        hint: 'Create a public bucket "offline-ops" in Supabase Storage or paste a photo URL manually.',
      }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from('offline-ops').getPublicUrl(path);
    return NextResponse.json({ success: true, url: pub.publicUrl });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Upload failed' }, { status: 500 });
  }
}
