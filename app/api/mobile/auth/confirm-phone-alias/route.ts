import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const PHONE_ALIAS_EMAIL = /^p\d+@phone\.prepskul\.local$/;

const bodySchema = z.object({
  aliasEmail: z.string().email(),
});

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/mobile/auth/confirm-phone-alias
 * Confirms email for legacy phone-alias accounts so password login works without inbox.
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { aliasEmail } = parsed.data;
    if (!PHONE_ALIAS_EMAIL.test(aliasEmail)) {
      return NextResponse.json(
        { error: 'Invalid phone alias email' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const admin = getSupabaseAdmin();
    const { data: userData, error: lookupError } =
      await admin.auth.admin.getUserByEmail(aliasEmail);

    if (lookupError) {
      if (lookupError.status === 404) {
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404, headers: corsHeaders() }
        );
      }
      throw lookupError;
    }

    if (!userData?.user) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (userData.user.email_confirmed_at) {
      return NextResponse.json(
        { success: true, alreadyConfirmed: true },
        { headers: corsHeaders() }
      );
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(
      userData.user.id,
      { email_confirm: true }
    );
    if (updateError) throw updateError;

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (error: unknown) {
    console.error('mobile confirm-phone-alias', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to confirm phone account',
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
