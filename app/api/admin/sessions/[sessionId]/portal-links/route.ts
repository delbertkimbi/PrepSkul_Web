import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { ensureSessionPortalTokens } from '@/lib/services/session-portal-token';

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

    const expiresInDays = Math.ceil(parsed.data.expiresInHours / 24);
    const links = await ensureSessionPortalTokens(sessionId, expiresInDays);

    return NextResponse.json({
      success: true,
      expiresAt: links.expiresAt,
      tutorReportUrl: links.tutorReportUrl,
      learnerFeedbackUrl: links.learnerFeedbackUrl,
      tutorRescheduleUrl: links.tutorRescheduleUrl,
      learnerRescheduleUrl: links.learnerRescheduleUrl,
    });
  } catch (error: any) {
    console.error('admin session portal-links error', error);
    return NextResponse.json({ error: error?.message || 'Failed to create portal links' }, { status: 500 });
  }
}
