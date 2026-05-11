import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { createPortalTokenRecord } from '@/lib/services/session-portal-token';

const schema = z.object({
  expiresInHours: z.number().int().min(1).max(24 * 30).default(24 * 7),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const adminOk = await isAdmin(user.id);
    if (!adminOk) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { sessionId } = await params;
    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + parsed.data.expiresInHours * 60 * 60 * 1000).toISOString();

    const [tutor, learner] = await Promise.all([
      createPortalTokenRecord({
        individualSessionId: sessionId,
        purpose: 'tutor_report',
        expiresAt,
      }),
      createPortalTokenRecord({
        individualSessionId: sessionId,
        purpose: 'learner_feedback',
        expiresAt,
      }),
    ]);

    const tutorBase = process.env.NEXT_PUBLIC_TUTOR_PORTAL_URL || 'https://tutor.prepskul.com';
    const learnerBase = process.env.NEXT_PUBLIC_LEARNER_PORTAL_URL || 'https://learner.prepskul.com';

    return NextResponse.json({
      success: true,
      expiresAt,
      tutorReportUrl: `${tutorBase}/session-report?token=${encodeURIComponent(tutor.rawToken)}`,
      learnerFeedbackUrl: `${learnerBase}/session-feedback?token=${encodeURIComponent(learner.rawToken)}`,
      tokenIds: {
        tutor: tutor.token.id,
        learner: learner.token.id,
      },
    });
  } catch (error: any) {
    console.error('admin session portal-links error', error);
    return NextResponse.json({ error: error?.message || 'Failed to create portal links' }, { status: 500 });
  }
}
