import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminNav from '../../components/AdminNav';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import {
  documentTypeLabel,
  loadKycReviewDetail,
  locationBadge,
  whoseIdLabel,
} from '@/lib/admin/kyc-review-data';
import UserAvatar from '../components/UserAvatar';
import KycDocumentGallery, { type KycDoc } from '../components/KycDocumentGallery';
import KycReviewActions from '../components/KycReviewActions';

export default async function IdentityVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            Failed to connect to database.
          </div>
        </div>
      </div>
    );
  }

  const detail = await loadKycReviewDetail(supabase, id);
  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            Verification not found.{' '}
            <Link href="/admin/identity-verifications" className="text-indigo-600 underline">
              Back to list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const docs: KycDoc[] = [
    { label: 'ID front', url: detail.front_url },
    { label: 'ID back', url: detail.back_url },
    { label: 'Holding ID', url: detail.holding_id_url },
    { label: 'Location photo', url: detail.location_photo_url },
  ];

  const isPending = detail.status === 'pending';
  const submitted = detail.created_at
    ? new Date(detail.created_at).toLocaleString()
    : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href="/admin/identity-verifications"
          className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
        >
          ← Back to verifications
        </Link>

        <header className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <UserAvatar
              name={detail.account.name}
              avatarUrl={detail.account.avatarUrl}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{detail.account.name}</h1>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    detail.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : detail.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : detail.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {detail.status === 'pending'
                    ? 'Pending'
                    : detail.status === 'verified'
                      ? 'Verified'
                      : detail.status === 'rejected'
                        ? 'Rejected'
                        : detail.status}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{detail.account.email}</p>
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {detail.account.phone && (
                  <div>
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="text-gray-900">{detail.account.phone}</dd>
                  </div>
                )}
                {detail.account.city && (
                  <div>
                    <dt className="text-gray-500">App location</dt>
                    <dd className="text-gray-900">{detail.account.city}</dd>
                  </div>
                )}
                {detail.account.userType && (
                  <div>
                    <dt className="text-gray-500">Account type</dt>
                    <dd className="text-gray-900 capitalize">{detail.account.userType}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500">Submitted</dt>
                  <dd className="text-gray-900">{submitted}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Document</dt>
                  <dd className="text-gray-900">{documentTypeLabel(detail.document_type)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">ID holder</dt>
                  <dd className="text-gray-900">
                    {whoseIdLabel(detail.whose_id)}
                    {detail.relationship ? ` · ${detail.relationship}` : ''}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Uploaded documents</h2>
          <KycDocumentGallery docs={docs} />
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Learning profile</h2>
          <dl className="space-y-3 text-sm">
            {detail.learningContext.learningPath && (
              <div>
                <dt className="text-gray-500">Learning path</dt>
                <dd className="text-gray-900">{detail.learningContext.learningPath}</dd>
              </div>
            )}
            {detail.learningContext.subjects.length > 0 && (
              <div>
                <dt className="text-gray-500">Subjects / interests</dt>
                <dd className="text-gray-900">{detail.learningContext.subjects.join(', ')}</dd>
              </div>
            )}
            {detail.learningContext.goals.length > 0 && (
              <div>
                <dt className="text-gray-500">Goals</dt>
                <dd className="text-gray-900">{detail.learningContext.goals.join(', ')}</dd>
              </div>
            )}
            {detail.learningContext.challenges.length > 0 && (
              <div>
                <dt className="text-gray-500">Challenges</dt>
                <dd className="text-gray-900">{detail.learningContext.challenges.join(', ')}</dd>
              </div>
            )}
            {detail.learningContext.preferredLocation && (
              <div>
                <dt className="text-gray-500">Preferred session location</dt>
                <dd className="text-gray-900">{detail.learningContext.preferredLocation}</dd>
              </div>
            )}
            {!detail.learningContext.learningPath &&
              detail.learningContext.subjects.length === 0 &&
              detail.learningContext.goals.length === 0 && (
                <p className="text-gray-500">No survey details on file yet.</p>
              )}
          </dl>
        </section>

        {detail.booking && (
          <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Booking context</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-500">Format</dt>
                <dd className="text-gray-900 font-medium">
                  {locationBadge(detail.booking.location)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-900 capitalize">{detail.booking.status}</dd>
              </div>
              {detail.booking.paymentPlan && (
                <div>
                  <dt className="text-gray-500">Payment plan</dt>
                  <dd className="text-gray-900">{detail.booking.paymentPlan}</dd>
                </div>
              )}
              {detail.bookingSummary.scheduleLabel &&
                detail.bookingSummary.scheduleLabel !== '—' && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Schedule</dt>
                    <dd className="text-gray-900">{detail.bookingSummary.scheduleLabel}</dd>
                  </div>
                )}
              {detail.booking.address && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Address</dt>
                  <dd className="text-gray-900">{detail.booking.address}</dd>
                </div>
              )}
              {detail.booking.locationDescription && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Location notes</dt>
                  <dd className="text-gray-900">{detail.booking.locationDescription}</dd>
                </div>
              )}
              {detail.booking.learnerSubjects && (
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Subjects by learner</dt>
                  <dd className="text-gray-900">
                    {Object.entries(detail.booking.learnerSubjects)
                      .map(([name, subs]) => `${name}: ${subs.join(', ')}`)
                      .join(' · ')}
                  </dd>
                </div>
              )}
            </dl>

            {detail.tutor && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Requested tutor</h3>
                <div className="flex gap-3 items-start">
                  <UserAvatar
                    name={detail.tutor.name}
                    avatarUrl={detail.tutor.avatarUrl}
                    size="sm"
                  />
                  <div>
                    {detail.tutor.profileId ? (
                      <Link
                        href={`/admin/tutors/${detail.tutor.profileId}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {detail.tutor.name}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-900">{detail.tutor.name}</p>
                    )}
                    {detail.tutor.email && (
                      <p className="text-sm text-gray-500">{detail.tutor.email}</p>
                    )}
                    {detail.tutor.subjects.length > 0 && (
                      <p className="text-sm text-gray-700 mt-1">
                        Teaches: {detail.tutor.subjects.join(', ')}
                      </p>
                    )}
                    {detail.tutor.rating != null && (
                      <p className="text-xs text-gray-500 mt-1">
                        Admin rating: {detail.tutor.rating}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {!isPending && detail.rejection_reason && (
          <section className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-900">
            <strong>Rejection reason:</strong> {detail.rejection_reason}
          </section>
        )}

        {isPending && (
          <KycReviewActions
            verificationId={detail.id}
            accountId={detail.account_id}
            bookingRequestId={detail.booking_request_id}
          />
        )}
      </main>
    </div>
  );
}
