'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  notifyIdentityVerificationApproved,
  notifyIdentityVerificationRejected,
} from '@/lib/identity-verification-notifications';

export async function approveIdentityVerification(formData: FormData) {
  const sessionUser = await getServerSession();
  if (!sessionUser) return { ok: false as const, error: 'Unauthorized' };
  const adminOk = await isAdmin(sessionUser.id);
  if (!adminOk) return { ok: false as const, error: 'Forbidden' };

  const supa = getSupabaseAdmin();

  const id = formData.get('id') as string;
  const accountId = formData.get('account_id') as string;
  const bookingRequestId = (formData.get('booking_request_id') as string) || null;

  await supa
    .from('identity_verifications')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      verified_by: sessionUser.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  await supa
    .from('profiles')
    .update({
      identity_verified_at: new Date().toISOString(),
    })
    .eq('id', accountId);

  let paymentRequestId: string | undefined;
  if (bookingRequestId) {
    const { data: pr } = await supa
      .from('payment_requests')
      .select('id')
      .eq('booking_request_id', bookingRequestId)
      .eq('status', 'pending')
      .order('payment_number', { ascending: true })
      .limit(1)
      .maybeSingle();
    paymentRequestId = pr?.id as string | undefined;
  }

  await notifyIdentityVerificationApproved(accountId, {
    verificationId: id,
    paymentRequestId,
    bookingRequestId: bookingRequestId ?? undefined,
  });

  revalidatePath('/admin/identity-verifications');
  revalidatePath(`/admin/identity-verifications/${id}`);
  return { ok: true as const };
}

export async function rejectIdentityVerification(formData: FormData) {
  const sessionUser = await getServerSession();
  if (!sessionUser) return { ok: false as const, error: 'Unauthorized' };
  const adminOk = await isAdmin(sessionUser.id);
  if (!adminOk) return { ok: false as const, error: 'Forbidden' };

  const supa = getSupabaseAdmin();

  const id = formData.get('id') as string;
  const accountId = formData.get('account_id') as string;
  const reason = ((formData.get('rejection_reason') as string) || '').trim();
  const rejectionReason = reason || 'Please resubmit clearer photos.';

  await supa
    .from('identity_verifications')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      verified_at: null,
      verified_by: sessionUser.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  await notifyIdentityVerificationRejected(accountId, rejectionReason, {
    verificationId: id,
  });

  revalidatePath('/admin/identity-verifications');
  revalidatePath(`/admin/identity-verifications/${id}`);
  return { ok: true as const };
}
