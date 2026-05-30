'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type IdentityVerificationRow = {
  id: string;
  account_id: string;
  document_type: string;
  whose_id: string;
  relationship: string | null;
  front_url: string;
  back_url: string | null;
  holding_id_url: string | null;
  location_photo_url: string | null;
  booking_request_id: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
};

export type AccountProfile = {
  name: string;
  email: string;
};

type Props = {
  initialVerifications: IdentityVerificationRow[];
  profilesByAccountId: Record<string, AccountProfile>;
};

type Filter = 'pending' | 'all' | 'verified' | 'rejected';

function docLabel(documentType: string) {
  switch (documentType) {
    case 'national_id':
      return 'National ID';
    case 'passport':
      return 'Passport';
    case 'voter_card':
      return 'Voter card';
    case 'drivers_licence':
      return "Driver's licence";
    case 'residence_permit':
      return 'Residence permit';
    default:
      return documentType || 'Other';
  }
}

function whoseLabel(whoseId: string) {
  switch (whoseId) {
    case 'self':
      return 'Account owner';
    case 'parent_guardian':
      return 'Parent / guardian';
    default:
      return 'Other adult';
  }
}

function DocLink({ href, label }: { href: string | null | undefined; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-indigo-600 hover:underline text-xs"
    >
      {label}
    </a>
  );
}

export default function IdentityVerificationsClient({
  initialVerifications,
  profilesByAccountId,
}: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initialVerifications);
  const [filter, setFilter] = useState<Filter>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rejectTarget, setRejectTarget] = useState<IdentityVerificationRow | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingCount = useMemo(() => rows.filter((r) => r.status === 'pending').length, [rows]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'pending') return rows.filter((r) => r.status === 'pending');
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const handleApprove = async (row: IdentityVerificationRow) => {
    if (!confirm(`Approve identity verification for ${profilesByAccountId[row.account_id]?.name ?? 'this account'}?`)) {
      return;
    }
    setError('');
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/identity-verifications/${row.id}/approve`, {
        method: 'POST',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Failed to approve');
        return;
      }
      const now = new Date().toISOString();
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, status: 'verified', verified_at: now, rejection_reason: null }
            : r
        )
      );
      router.refresh();
    } catch {
      setError('Failed to approve. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setError('Please enter a reason the learner will see.');
      return;
    }
    setError('');
    setBusyId(rejectTarget.id);
    try {
      const res = await fetch(`/api/admin/identity-verifications/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Failed to reject');
        return;
      }
      setRows((prev) =>
        prev.map((r) =>
          r.id === rejectTarget.id
            ? { ...r, status: 'rejected', rejection_reason: reason, verified_at: null }
            : r
        )
      );
      setRejectTarget(null);
      setRejectReason('');
      router.refresh();
    } catch {
      setError('Failed to reject. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verifications (KYC)</h1>
        <p className="text-gray-600 text-sm max-w-3xl">
          Review parent and learner ID submissions for onsite or hybrid bookings. Approving unlocks Pay
          now for payment. Rejecting sends email, push, and in-app notice with your reason so they can
          resubmit from Pay now.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['pending', `Pending (${pendingCount})`],
            ['all', 'All'],
            ['verified', 'Verified'],
            ['rejected', 'Rejected'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              filter === key
                ? 'bg-[#1B2C4F] text-white border-[#1B2C4F]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
          {filter === 'pending'
            ? 'No pending verifications. New submissions from the app will appear here.'
            : 'No verifications in this view.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => {
            const profile = profilesByAccountId[v.account_id];
            const isPending = v.status === 'pending';
            const isBusy = busyId === v.id;

            return (
              <article
                key={v.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{profile?.name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{profile?.email ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Submitted {new Date(v.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      v.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : v.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : v.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Whose ID</p>
                    <p className="text-gray-800">{whoseLabel(v.whose_id)}</p>
                    {v.relationship && (
                      <p className="text-xs text-gray-500">Relationship: {v.relationship}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Document</p>
                    <p className="text-gray-800">{docLabel(v.document_type)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Booking</p>
                    <p className="text-gray-800 font-mono text-xs break-all">
                      {v.booking_request_id ?? '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Documents</p>
                    <div className="flex flex-col gap-1">
                      <DocLink href={v.front_url} label="Front" />
                      <DocLink href={v.back_url} label="Back" />
                      <DocLink href={v.holding_id_url} label="Holding ID" />
                      <DocLink href={v.location_photo_url} label="Location photo" />
                    </div>
                  </div>
                </div>

                {(v.status === 'rejected' || v.status === 'verified') && (
                  <div className="px-4 pb-3 text-sm text-gray-600">
                    {v.status === 'rejected' && v.rejection_reason && (
                      <p>
                        <span className="font-medium">Rejection reason:</span> {v.rejection_reason}
                      </p>
                    )}
                    {v.verified_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Handled {new Date(v.verified_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {isPending && (
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setError('');
                        setRejectTarget(v);
                        setRejectReason('');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleApprove(v)}
                      className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {isBusy ? 'Saving…' : 'Approve'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject verification</DialogTitle>
            <DialogDescription>
              This message is sent to the learner by email, push, and in-app notification. They
              will see it when opening Pay now to resubmit KYC.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="w-full min-h-[120px] text-sm border border-gray-300 rounded-lg p-3"
            placeholder="e.g. ID photo is blurry; please resubmit a clear front image in good lighting."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!!busyId}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
              onClick={handleRejectSubmit}
            >
              Reject and notify learner
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
