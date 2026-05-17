import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import OfflineOpsFormClient from './OfflineOpsFormClient';

export default async function NewOfflineOpsPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNav />
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <OfflineOpsFormClient />
      </main>
    </div>
  );
}
