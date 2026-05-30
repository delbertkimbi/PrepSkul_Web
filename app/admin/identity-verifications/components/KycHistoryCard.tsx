import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  email: string;
  status: string;
  verifiedAt: string | null;
  notes: string;
};

export default function KycHistoryCard({
  id,
  name,
  email,
  status,
  verifiedAt,
  notes,
}: Props) {
  const statusLabel =
    status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : status;

  return (
    <Link
      href={`/admin/identity-verifications/${id}`}
      className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 hover:shadow-sm transition"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">{name}</p>
          <p className="text-sm text-gray-500 truncate">{email}</p>
        </div>
        <span
          className={`inline-flex self-start px-2 py-0.5 rounded text-xs font-medium ${
            status === 'verified'
              ? 'bg-green-100 text-green-800'
              : status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 text-xs text-gray-500">
        {verifiedAt && <span>{verifiedAt}</span>}
        {notes && <span className="text-gray-700 line-clamp-1">{notes}</span>}
      </div>
    </Link>
  );
}
