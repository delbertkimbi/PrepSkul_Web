import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../../../components/AdminNav';
import ReachoutEditClient from './ReachoutEditClient';

export default async function ReachoutEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: record, error } = await supabase
    .from('reachout_track')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !record) notFound();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Reachout Record</h1>
          <p className="text-gray-600 mt-1">
            Update this customer record after follow-up. All fields are required.
          </p>
        </div>
        <ReachoutEditClient record={record} />
      </main>
    </div>
  );
}
