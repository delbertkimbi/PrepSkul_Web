import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

const PHONE_ALIAS_EMAIL = /^p\d+@phone\.prepskul\.local$/;

const bodySchema = z.object({
  phoneNumber: z.string().min(8),
  password: z.string().min(6),
  fullName: z.string().min(1),
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
 * POST /api/mobile/auth/phone-signup
 * Creates a phone-alias auth user with email already confirmed (no inbox step).
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400, headers: corsHeaders() }
      );
    }

    const { phoneNumber, password, fullName, aliasEmail } = parsed.data;

    if (!PHONE_ALIAS_EMAIL.test(aliasEmail)) {
      return NextResponse.json(
        { error: 'Invalid phone alias email' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const admin = getSupabaseAdmin();

    const { data: existingProfiles, error: profileLookupError } = await admin
      .from('profiles')
      .select('id')
      .eq('phone_number', phoneNumber)
      .limit(1);

    if (profileLookupError) throw profileLookupError;
    if (existingProfiles?.length) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409, headers: corsHeaders() }
      );
    }

    const { data: existingUser, error: existingUserError } =
      await admin.auth.admin.getUserByEmail(aliasEmail);

    if (existingUserError && existingUserError.status !== 404) {
      throw existingUserError;
    }

    if (existingUser?.user) {
      if (!existingUser.user.email_confirmed_at) {
        const { error: confirmError } = await admin.auth.admin.updateUserById(
          existingUser.user.id,
          { email_confirm: true }
        );
        if (confirmError) throw confirmError;
      }

      return NextResponse.json(
        { success: true, userId: existingUser.user.id, existing: true },
        { headers: corsHeaders() }
      );
    }

    const { data, error } = await admin.auth.admin.createUser({
      email: aliasEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone_number: phoneNumber,
      },
    });

    if (error) throw error;

    return NextResponse.json(
      { success: true, userId: data.user.id },
      { headers: corsHeaders() }
    );
  } catch (error: unknown) {
    console.error('mobile phone-signup', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create phone account',
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
