import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import OfflineUsersListClient from './OfflineUsersListClient';

export default async function OfflineUsersPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  if (!(await isAdmin(user.id))) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="w-full px-4 sm:px-6 lg:px-10 py-6 max-w-[1600px] mx-auto">
        <OfflineUsersListClient />
      </main>
    </div>
  );
}
