import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import AmbassadorHeader from '@/components/ambassador-header';
import { Footer } from '@/components/footer';
import AmbassadorDashboardClient from './AmbassadorDashboardClient';

export default async function AmbassadorDashboardPage() {
  const user = await getServerSession();
  if (!user?.email) {
    redirect('/ambassadors/login');
  }

  const adminClient = getSupabaseAdmin();
  const { data: ambassador } = await adminClient
    .from('ambassadors')
    .select('id, full_name, email, application_status')
    .eq('application_status', 'approved')
    .ilike('email', `%${user.email.trim()}%`)
    .maybeSingle();
  if (!ambassador) {
    redirect('/ambassadors/login?error=not_approved');
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AmbassadorHeader />
      <main className="flex-1">
        <AmbassadorDashboardClient ambassadorId={ambassador.id} />
      </main>
      <Footer />
    </div>
  );
}
