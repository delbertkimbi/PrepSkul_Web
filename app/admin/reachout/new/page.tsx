import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../components/AdminNav';
import ReachoutFormClient from './ReachoutFormClient';

export default async function NewReachoutPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Reachout Record</h1>
          <p className="text-gray-600 mt-1">
            Fill in the form below to log a customer reachout. All fields are required before submission.
          </p>
        </div>
        <ReachoutFormClient />
      </main>
    </div>
  );
}
