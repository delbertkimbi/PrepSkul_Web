import Link from 'next/link';
import {
  documentTypeLabel,
  locationBadge,
  whoseIdLabel,
  type KycReviewListItem,
} from '@/lib/admin/kyc-review-data';
import UserAvatar from './UserAvatar';

type Props = {
  item: KycReviewListItem;
  variant?: 'pending' | 'history';
};

export default function KycVerificationCard({ item, variant = 'pending' }: Props) {
  const submitted = item.created_at
    ? new Date(item.created_at).toLocaleString()
    : '—';
  const location = locationBadge(item.bookingSummary.location);
  const isPending = variant === 'pending';

  return (
    <Link
      href={`/admin/identity-verifications/${item.id}`}
      className="group block bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-indigo-300 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="flex gap-3 sm:gap-4">
        <UserAvatar name={item.account.name} avatarUrl={item.account.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700">
                {item.account.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{item.account.email}</p>
            </div>
            {isPending ? (
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shrink-0">
                Pending review
              </span>
            ) : (
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                  item.status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {item.status === 'verified'
                  ? 'Verified'
                  : item.status === 'rejected'
                    ? 'Rejected'
                    : item.status}
              </span>
            )}
          </div>

          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {item.account.city && (
              <div>
                <dt className="text-gray-500 inline">Location: </dt>
                <dd className="text-gray-800 inline">{item.account.city}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500 inline">Booking: </dt>
              <dd className="text-gray-800 inline">{location}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">Document: </dt>
              <dd className="text-gray-800 inline">{documentTypeLabel(item.document_type)}</dd>
            </div>
            <div>
              <dt className="text-gray-500 inline">ID holder: </dt>
              <dd className="text-gray-800 inline">{whoseIdLabel(item.whose_id)}</dd>
            </div>
            {item.bookingSummary.tutorName && (
              <div className="sm:col-span-2">
                <dt className="text-gray-500 inline">Tutor: </dt>
                <dd className="text-gray-800 inline">{item.bookingSummary.tutorName}</dd>
              </div>
            )}
            {item.bookingSummary.subjectsLabel &&
              item.bookingSummary.subjectsLabel !== '—' && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 inline">Subjects: </dt>
                  <dd className="text-gray-800 line-clamp-2">{item.bookingSummary.subjectsLabel}</dd>
                </div>
              )}
            {item.bookingSummary.scheduleLabel &&
              item.bookingSummary.scheduleLabel !== '—' && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500 inline">Schedule: </dt>
                  <dd className="text-gray-800 line-clamp-1">{item.bookingSummary.scheduleLabel}</dd>
                </div>
              )}
          </dl>

          <p className="mt-3 text-xs text-gray-500">
            Submitted {submitted}
            {isPending && (
              <span className="text-indigo-600 font-medium ml-2 group-hover:underline">
                View documents →
              </span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
