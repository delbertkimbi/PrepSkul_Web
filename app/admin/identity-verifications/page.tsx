import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import {
  enrichVerificationList,
  type KycVerificationRow,
} from '@/lib/admin/kyc-review-data';
import AdminNav from '../components/AdminNav';
import KycVerificationCard from './components/KycVerificationCard';
import KycHistoryCard from './components/KycHistoryCard';

export default async function IdentityVerificationsPage() {
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

  const { data: verifications } = await supabase
    .from('identity_verifications')
    .select(
      `
        id,
        account_id,
        document_type,
        whose_id,
        relationship,
        front_url,
        back_url,
        holding_id_url,
        location_photo_url,
        booking_request_id,
        status,
        rejection_reason,
        created_at,
        verified_at
      `
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (verifications || []) as KycVerificationRow[];
  const pendingRows = rows.filter((v) => v.status === 'pending');
  const handledRows = rows.filter((v) => v.status !== 'pending');

  const pendingItems = await enrichVerificationList(supabase, pendingRows);

  const handledAccountIds = Array.from(new Set(handledRows.map((v) => v.account_id)));
  let profileMap = new Map<string, { name: string; email: string }>();
  if (handledAccountIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', handledAccountIds);
    profileMap = new Map(
      (profileRows || []).map((p: { id: string; full_name?: string | null; email?: string | null }) => [
        p.id,
        {
          name: p.full_name || p.email || '—',
          email: p.email || '—',
        },
      ])
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Identity Verifications (KYC)
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-3xl">
            Review parent and learner identity for onsite bookings. Open a card to view uploaded
            documents and household context before approving or rejecting.
          </p>
        </div>

        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending ({pendingItems.length})
            </h2>
            <p className="text-xs text-gray-500 max-w-xl">
              Check document clarity and name match. Approve only if you would trust this household
              for onsite.
            </p>
          </div>

          {pendingItems.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-gray-500 text-sm">
              No pending verifications.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingItems.map((item) => (
                <KycVerificationCard key={item.id} item={item} variant="pending" />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
          {handledRows.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center text-gray-500 text-sm">
              No completed verifications yet.
            </div>
          ) : (
            <div className="space-y-2">
              {handledRows.map((v) => {
                const profile = profileMap.get(v.account_id);
                const verifiedAt = v.verified_at
                  ? new Date(v.verified_at).toLocaleString()
                  : null;
                const notes = v.rejection_reason
                  ? String(v.rejection_reason)
                  : v.status === 'verified'
                    ? 'Approved'
                    : '';

                return (
                  <KycHistoryCard
                    key={v.id}
                    id={v.id}
                    name={profile?.name ?? '—'}
                    email={profile?.email ?? '—'}
                    status={v.status}
                    verifiedAt={verifiedAt}
                    notes={notes}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
