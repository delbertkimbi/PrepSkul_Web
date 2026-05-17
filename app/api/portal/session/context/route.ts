import { NextRequest, NextResponse } from 'next/server';
import { getSessionPortalContext } from '@/lib/services/session-portal-token';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || '';
    if (token.length < 10) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    const ctx = await getSessionPortalContext(token);
    return NextResponse.json({
      session: ctx.session,
      subjects: ctx.subjects,
      pendingReschedule: ctx.pendingReschedule,
      hasSubmittedReport: ctx.hasSubmittedReport,
      hasSubmittedFeedback: ctx.hasSubmittedFeedback,
      portalRole: ctx.portalRole,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid token' }, { status: 401 });
  }
}
