import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getUserFromBearer } from '@/lib/supabase-mobile-auth';

export const runtime = 'nodejs';

const bodySchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().nullable().optional(),
  userType: z.enum(['student', 'parent', 'tutor', 'learner']).optional(),
  surveyCompleted: z.boolean().optional(),
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
 * POST /api/mobile/auth/bootstrap-profile
 * Admin upsert for onboarding when client-side profiles RLS blocks insert.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const fullName =
      parsed.data.fullName?.trim() ||
      user.user_metadata?.full_name?.toString()?.trim() ||
      user.email?.split('@')[0] ||
      'User';

    const payload: Record<string, unknown> = {
      id: user.id,
      email: parsed.data.email ?? user.email ?? '',
      full_name: fullName,
      phone_number: parsed.data.phoneNumber ?? null,
      survey_completed: parsed.data.surveyCompleted ?? false,
      is_admin: false,
      updated_at: new Date().toISOString(),
    };

    if (parsed.data.userType) {
      payload.user_type = parsed.data.userType;
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('profiles').upsert(payload, {
      onConflict: 'id',
    });

    if (error) throw error;

    return NextResponse.json(
      { success: true, userId: user.id },
      { headers: corsHeaders() }
    );
  } catch (error: unknown) {
    console.error('mobile bootstrap-profile', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to bootstrap profile',
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
