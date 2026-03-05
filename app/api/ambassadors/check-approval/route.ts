import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Check if an email belongs to an approved ambassador (for signup).
 * Uses service role so we can read ambassadors table without exposing it to anon.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!email) {
      return NextResponse.json({ allowed: false, error: 'Email required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: ambassador } = await supabase
      .from('ambassadors')
      .select('id, email, application_status')
      .ilike('email', email)
      .maybeSingle();

    if (!ambassador || ambassador.application_status !== 'approved') {
      return NextResponse.json({ allowed: false });
    }

    return NextResponse.json({
      allowed: true,
      email: ambassador.email?.trim().toLowerCase() ?? email.toLowerCase(),
    });
  } catch (e) {
    console.error('Ambassador check-approval error:', e);
    return NextResponse.json({ allowed: false, error: 'Server error' }, { status: 500 });
  }
}
