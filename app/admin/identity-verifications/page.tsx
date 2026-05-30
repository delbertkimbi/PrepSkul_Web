import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import AdminNav from '../components/AdminNav';
import IdentityVerificationsClient, {
  type IdentityVerificationRow,
  type AccountProfile,
} from './IdentityVerificationsClient';

export default async function IdentityVerificationsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const admin = getSupabaseAdmin();

  const { data: verifications, error } = await admin
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
        verified_at,
        verified_by
      `
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[identity-verifications] fetch error:', error);
  }

  const rows = (verifications || []) as IdentityVerificationRow[];
  const accountIds = Array.from(new Set(rows.map((v) => v.account_id)));

  const profilesByAccountId: Record<string, AccountProfile> = {};
  if (accountIds.length > 0) {
    const { data: profileRows } = await admin
      .from('profiles')
      .select('id, full_name, email')
      .in('id', accountIds);

    for (const p of profileRows || []) {
      profilesByAccountId[p.id as string] = {
        name: (p.full_name as string) || (p.email as string) || '—',
        email: (p.email as string) || '—',
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <IdentityVerificationsClient
          initialVerifications={rows}
          profilesByAccountId={profilesByAccountId}
        />
      </main>
    </div>
  );
}
