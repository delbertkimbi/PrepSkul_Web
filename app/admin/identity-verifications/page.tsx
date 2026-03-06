import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';

/**
 * Admin KYC (Identity Verification) review screen.
 *
 * - Lists pending identity_verifications for parent/learner accounts
 * - Allows admin to approve (mark profile.identity_verified_at) or reject with reason
 *
 * Note: This implementation uses Supabase Row Level Security:
 * - identity_verifications: admins can update (see migration 069)
 * - profiles: admins can update is_admin / identity_verified_at (existing policy)
 */
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

  // Fetch pending + recently handled verifications (latest first)
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
        status,
        rejection_reason,
        created_at,
        verified_at,
        verified_by
      `
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const accountIds = Array.from(
    new Set((verifications || []).map((v: { account_id: string }) => v.account_id))
  );

  let profiles: Array<{ id: string; full_name?: string | null; email?: string | null }> = [];
  if (accountIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', accountIds);
    profiles = (profileRows || []) as Array<{ id: string; full_name?: string | null; email?: string | null }>;
  }
  const profileMap = new Map(
    profiles.map((p) => [
      p.id,
      {
        name: p.full_name || p.email || '—',
        email: p.email || '—',
      },
    ])
  );

  const pending = (verifications || []).filter(
    (v: { status: string }) => v.status === 'pending'
  ) as Array<Record<string, any>>;
  const handled = (verifications || []).filter(
    (v: { status: string }) => v.status !== 'pending'
  ) as Array<Record<string, any>>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verifications (KYC)</h1>
          <p className="text-gray-600">
            Review and approve parent/learner identity verification for onsite bookings. Approving a
            verification marks the account as <span className="font-semibold">Identity verified</span>{' '}
            so future onsite payments are not blocked.
          </p>
        </div>

        {/* Pending verifications */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending ({pending.length})
            </h2>
            <p className="text-xs text-gray-500">
              Check document clarity & name match. Approve only if you would trust this household for onsite.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Whose ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Document
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Submitted
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Files
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pending.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      No pending verifications.
                    </td>
                  </tr>
                )}
                {pending.map((v) => {
                  const profile = profileMap.get(v.account_id as string);
                  const createdAt = v.created_at
                    ? new Date(v.created_at as string).toLocaleString()
                    : '—';
                  const docLabel =
                    v.document_type === 'national_id'
                      ? 'National ID'
                      : v.document_type === 'passport'
                      ? 'Passport'
                      : v.document_type === 'voter_card'
                      ? 'Voter card'
                      : v.document_type === 'drivers_licence'
                      ? 'Driver’s licence'
                      : v.document_type === 'residence_permit'
                      ? 'Residence permit'
                      : 'Other';
                  const whoseLabel =
                    v.whose_id === 'self'
                      ? 'Account owner'
                      : v.whose_id === 'parent_guardian'
                      ? 'Parent / guardian'
                      : 'Other adult';

                  return (
                    <tr key={v.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {profile?.name ?? '—'}
                        </div>
                        <div className="text-xs text-gray-500">{profile?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>{whoseLabel}</div>
                        {v.relationship && (
                          <div className="text-xs text-gray-500">
                            Relationship: {String(v.relationship)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>{docLabel}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{createdAt}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <a
                            href={v.front_url as string}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline text-xs"
                          >
                            View front
                          </a>
                          {v.back_url && (
                            <a
                              href={v.back_url as string}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline text-xs"
                            >
                              View back
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <form
                          action={async (formData) => {
                            'use server';
                            const supa = await createServerSupabaseClient();
                            const id = formData.get('id') as string;
                            const accountId = formData.get('account_id') as string;

                            // Mark verification as verified
                            await supa
                              .from('identity_verifications')
                              .update({
                                status: 'verified',
                                verified_at: new Date().toISOString(),
                                verified_by: user.id,
                                updated_at: new Date().toISOString(),
                              })
                              .eq('id', id);

                            // Mark profile as identity verified (one-time flag)
                            await supa
                              .from('profiles')
                              .update({
                                identity_verified_at: new Date().toISOString(),
                              })
                              .eq('id', accountId);
                          }}
                          className="inline"
                        >
                          <input type="hidden" name="id" value={String(v.id)} />
                          <input
                            type="hidden"
                            name="account_id"
                            value={String(v.account_id)}
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center px-3 py-1.5 border border-green-600 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                          >
                            Approve
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recently handled verifications */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">History</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Account
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Verified at
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {handled.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-gray-500 text-sm"
                    >
                      No completed verifications yet.
                    </td>
                  </tr>
                )}
                {handled.map((v) => {
                  const profile = profileMap.get(v.account_id as string);
                  const verifiedAt = v.verified_at
                    ? new Date(v.verified_at as string).toLocaleString()
                    : '—';
                  const statusLabel =
                    v.status === 'verified'
                      ? 'Verified'
                      : v.status === 'rejected'
                      ? 'Rejected'
                      : String(v.status);

                  return (
                    <tr key={v.id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {profile?.name ?? '—'}
                        </div>
                        <div className="text-xs text-gray-500">{profile?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            v.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : v.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{verifiedAt}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {v.rejection_reason
                          ? String(v.rejection_reason)
                          : v.status === 'verified'
                          ? 'Approved'
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

