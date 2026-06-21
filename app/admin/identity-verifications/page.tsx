import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  enrichVerificationList,
  type KycVerificationRow,
} from '@/lib/admin/kyc-review-data';
import AdminNav from '../components/AdminNav';
import KycVerificationCard from './components/KycVerificationCard';
import KycHistoryCard from './components/KycHistoryCard';

const FULL_SELECT = `
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
`;

const BASE_SELECT = `
        id,
        account_id,
        document_type,
        whose_id,
        relationship,
        front_url,
        back_url,
        status,
        rejection_reason,
        created_at,
  verified_at
`;

async function loadVerifications() {
  const admin = getSupabaseAdmin();

  const full = await admin
    .from('identity_verifications')
    .select(FULL_SELECT)
    .order('created_at', { ascending: false })
    .limit(100);

  if (!full.error) {
    return { rows: (full.data || []) as KycVerificationRow[], queryError: null };
  }

  console.warn('[identity-verifications] extended select failed, retrying base columns:', full.error.message);

  const base = await admin
    .from('identity_verifications')
    .select(BASE_SELECT)
    .order('created_at', { ascending: false })
    .limit(100);

  if (base.error) {
    return { rows: [] as KycVerificationRow[], queryError: base.error.message };
  }

  return {
    rows: (base.data || []).map((row) => ({
      ...(row as KycVerificationRow),
      holding_id_url: null,
      location_photo_url: null,
      booking_request_id: null,
    })),
    queryError: null,
  };
}

export default async function IdentityVerificationsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  let rows: KycVerificationRow[] = [];
  let queryError: string | null = null;
  let enrichError: string | null = null;

  try {
    const loaded = await loadVerifications();
    rows = loaded.rows;
    queryError = loaded.queryError;
  } catch (err) {
    console.error('[identity-verifications] admin client error:', err);
    queryError =
      err instanceof Error ? err.message : 'Could not connect to database (check service role key).';
  }

  const pendingRows = rows.filter((v) => v.status === 'pending');
  const handledRows = rows.filter((v) => v.status !== 'pending');

  let pendingItems: Awaited<ReturnType<typeof enrichVerificationList>> = [];
  if (!queryError && pendingRows.length > 0) {
    try {
      pendingItems = await enrichVerificationList(getSupabaseAdmin(), pendingRows);
    } catch (err) {
      console.error('[identity-verifications] enrich failed:', err);
      enrichError = err instanceof Error ? err.message : 'Could not load submission details.';
    }
  }

  const handledAccountIds = Array.from(new Set(handledRows.map((v) => v.account_id)));
  let profileMap = new Map<string, { name: string; email: string }>();
  if (handledAccountIds.length > 0 && !queryError) {
    try {
      const { data: profileRows } = await getSupabaseAdmin()
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
    } catch (err) {
      console.error('[identity-verifications] profile lookup failed:', err);
    }
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

        {queryError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            Could not load verifications: {queryError}
          </div>
        )}

        {enrichError && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Some submission details could not be loaded: {enrichError}. Pending count:{' '}
            {pendingRows.length}.
          </div>
        )}

        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending ({pendingItems.length || pendingRows.length})
            </h2>
            <p className="text-xs text-gray-500 max-w-xl">
              Check document clarity and name match. Approve only if you would trust this household
              for onsite.
            </p>
          </div>

          {pendingItems.length === 0 && pendingRows.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-gray-500 text-sm">
                      No pending verifications.
            </div>
          ) : pendingItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingItems.map((item) => (
                <KycVerificationCard key={item.id} item={item} variant="pending" />
              ))}
                        </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-8 text-center text-gray-500 text-sm">
              {pendingRows.length} pending submission(s) — open from history once details load, or
              refresh after deploy.
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
