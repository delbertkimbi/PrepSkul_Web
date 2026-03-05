import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase-server';
import { getApprovedAmbassadorByEmail } from '@/lib/supabase-server';
import AmbassadorHeader from '@/components/ambassador-header';
import { Footer } from '@/components/footer';
import AmbassadorDashboardClient from './AmbassadorDashboardClient';

export default async function AmbassadorDashboardPage() {
  const user = await getServerSession();
  if (!user?.email) {
    redirect('/ambassadors/login');
  }

  const ambassador = await getApprovedAmbassadorByEmail(user.email);
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
