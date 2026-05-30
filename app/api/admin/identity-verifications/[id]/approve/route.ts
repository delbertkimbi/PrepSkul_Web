import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  notifyKycApproved,
  resolvePaymentRequestIdForBooking,
} from '@/lib/services/kyc-verification-notify';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const admin = getSupabaseAdmin();

    const { data: row, error: fetchErr } = await admin
      .from('identity_verifications')
      .select('id, account_id, status, booking_request_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }
    if (row.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve: status is ${row.status}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await admin
      .from('identity_verifications')
      .update({
        status: 'verified',
        verified_at: now,
        verified_by: user.id,
        updated_at: now,
        rejection_reason: null,
      })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json(
        { error: 'Failed to approve verification', details: updateErr.message },
        { status: 500 }
      );
    }

    const { error: profileErr } = await admin
      .from('profiles')
      .update({ identity_verified_at: now })
      .eq('id', row.account_id);

    if (profileErr) {
      return NextResponse.json(
        { error: 'Verification approved but profile update failed', details: profileErr.message },
        { status: 500 }
      );
    }

    const paymentRequestId = await resolvePaymentRequestIdForBooking(
      admin,
      row.booking_request_id as string | null
    );

    await notifyKycApproved({
      accountId: row.account_id as string,
      verificationId: id,
      bookingRequestId: row.booking_request_id as string | null,
      paymentRequestId,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[kyc/approve]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
