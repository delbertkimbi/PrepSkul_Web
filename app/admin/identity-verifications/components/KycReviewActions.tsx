'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  approveIdentityVerification,
  rejectIdentityVerification,
} from '@/lib/admin/kyc-review-actions';

type Props = {
  verificationId: string;
  accountId: string;
  bookingRequestId: string | null;
};

export default function KycReviewActions({
  verificationId,
  accountId,
  bookingRequestId,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onApprove = () => {
    const fd = new FormData();
    fd.set('id', verificationId);
    fd.set('account_id', accountId);
    if (bookingRequestId) fd.set('booking_request_id', bookingRequestId);
    startTransition(async () => {
      await approveIdentityVerification(fd);
      router.push('/admin/identity-verifications');
      router.refresh();
    });
  };

  const onReject = (formData: FormData) => {
    startTransition(async () => {
      await rejectIdentityVerification(formData);
      router.push('/admin/identity-verifications');
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Decision</h2>
      <p className="text-sm text-gray-600 mb-4">
        Review all documents above before approving. Approval marks the account identity-verified for
        onsite payments.
      </p>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <button
          type="button"
          disabled={pending}
          onClick={onApprove}
          className="inline-flex justify-center items-center px-5 py-2.5 border border-green-600 text-sm font-medium rounded-lg text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Approve verification'}
        </button>
        <form action={onReject} className="flex-1 flex flex-col gap-2 min-w-0">
          <input type="hidden" name="id" value={verificationId} />
          <input type="hidden" name="account_id" value={accountId} />
          <textarea
            name="rejection_reason"
            rows={3}
            placeholder="Rejection reason (shown to the user)"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex justify-center items-center px-5 py-2.5 border border-red-600 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 self-start"
          >
            Reject
          </button>
        </form>
      </div>
    </div>
  );
}
