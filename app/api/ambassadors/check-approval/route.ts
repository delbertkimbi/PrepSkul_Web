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
    const { data, error } = await supabase
      .from('ambassadors')
      .select('id, email, application_status')
      .eq('application_status', 'approved')
      // Use wildcard match to be robust to stray spaces/case differences
      .ilike('email', `%${email}%`)
      .order('approved_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('check-approval query error:', error);
      return NextResponse.json({ allowed: false, reason: 'query_error' }, { status: 500 });
    }

    const ambassador = data?.[0];

    if (!ambassador) {
      return NextResponse.json({ allowed: false, reason: 'not_found' });
    }

    return NextResponse.json({
      allowed: true,
      email: ambassador.email?.trim().toLowerCase() ?? email.toLowerCase(),
      reason: 'ok',
    });
  } catch (e) {
    console.error('Ambassador check-approval error:', e);
    return NextResponse.json({ allowed: false, error: 'Server error' }, { status: 500 });
  }
}
