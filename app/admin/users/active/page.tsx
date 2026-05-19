import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import ActiveUsersClient from './ActiveUsersClient';

export default async function ActiveUsersPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');

  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveUsersClient />
      </main>
    </div>
  );
}
