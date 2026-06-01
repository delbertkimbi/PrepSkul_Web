import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { sendOpsAlertEmail } from '@/lib/ops-email';

export const runtime = 'nodejs';

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader =
    request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const bearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (bearer) {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data, error } = await supabaseAdmin.auth.getUser(bearer);
      if (!error && data?.user?.id) return data.user.id;
    } catch {
      // fall through
    }
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user?.id) return data.user.id;
  } catch {
    // ignore
  }

  return null;
}

/**
 * POST /api/safety/panic-alert
 * Sends branded ops email (prepskul@gmail.com + OPS_ADMIN_EMAILS) with GPS and session context.
 */
export async function POST(request: NextRequest) {
  try {
    const callerId = await getUserIdFromRequest(request);
    if (!callerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionId,
      userId,
      userType,
      userName,
      userPhone,
      sessionAddress,
      latitude,
      longitude,
      locationAccuracy,
      reason,
      mapUrl,
    } = body;

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, userId' },
        { status: 400 }
      );
    }

    if (userId !== callerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminBase =
      process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com';
    const sessionAdminUrl = `${adminBase}/admin/sessions/${sessionId}`;

    const hasCoords =
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !Number.isNaN(latitude) &&
      !Number.isNaN(longitude);

    const googleMapsLink = hasCoords
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

    const coordsLine = hasCoords
      ? `<p><strong>GPS coordinates:</strong> ${latitude}, ${longitude}${
          typeof locationAccuracy === 'number'
            ? ` (±${Math.round(locationAccuracy)}m accuracy)`
            : ''
        }</p>
         <p><a href="${googleMapsLink}">Open location in Google Maps</a></p>`
      : `<p><strong>GPS:</strong> Not available — enable location services and retry if needed.</p>`;

    const bodyHtml = `
      <p><strong>🚨 Panic button activated</strong></p>
      <p><strong>Person:</strong> ${userName || 'Unknown'} (${userType || 'user'})</p>
      ${userPhone ? `<p><strong>Phone:</strong> ${userPhone}</p>` : ''}
      <p><strong>Session ID:</strong> ${sessionId}</p>
      <p><strong>Scheduled location:</strong> ${sessionAddress || 'Unknown'}</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      ${coordsLine}
      ${mapUrl ? `<p><strong>In-app map:</strong> ${mapUrl}</p>` : ''}
      <p><em>Triggered at ${new Date().toISOString()}</em></p>
    `;

    const emailResult = await sendOpsAlertEmail(
      `PANIC: ${userName || 'User'} — session ${sessionId.slice(0, 8)}`,
      bodyHtml,
      {
        title: 'Panic button — immediate action required',
        actionUrl: sessionAdminUrl,
        actionText: 'View session in admin',
      }
    );

    if (!emailResult.ok) {
      console.warn('[panic-alert] Ops email not sent:', emailResult);
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.ok === true,
      recipients: emailResult.ok === true ? emailResult.to : [],
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Panic alert failed';
    console.error('[panic-alert]', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
