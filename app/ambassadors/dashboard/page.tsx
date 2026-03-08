import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import AmbassadorHeader from '@/components/ambassador-header';
import { Footer } from '@/components/footer';
import AmbassadorDashboardClient from './AmbassadorDashboardClient';

const HOT_LEAD_STATUSES = ['Contacted', 'Applied', 'Enrolled'];

export type LeaderBoardEntry = {
  rank: number;
  id: string;
  full_name: string;
  profile_image_url: string | null;
  hot_leads: number;
  outreach_count: number;
};

export default async function AmbassadorDashboardPage() {
  const user = await getServerSession();
  if (!user?.email) {
    redirect('/ambassadors/login');
  }

  const adminClient = getSupabaseAdmin();
  const { data, error } = await adminClient
    .from('ambassadors')
    .select('id, full_name, email, application_status, approved_at')
    .eq('application_status', 'approved')
    .ilike('email', `%${user.email.trim()}%`)
    .order('approved_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Ambassador dashboard lookup error:', error);
  }

  const ambassador = data?.[0];
  if (!ambassador) {
    redirect('/ambassadors/login?error=not_approved');
  }

  // Fetch leader board: approved ambassadors with profile_image_url, hot lead count, outreach count
  const { data: allAmbassadors } = await adminClient
    .from('ambassadors')
    .select('id, full_name, profile_image_url')
    .eq('application_status', 'approved')
    .order('full_name');

  const { data: allLeads } = await adminClient
    .from('ambassador_leads')
    .select('ambassador_id, status');

  const { data: allActivities } = await adminClient
    .from('outreach_activities')
    .select('ambassador_id');

  const hotCountByAmbassador: Record<string, number> = {};
  const outreachCountByAmbassador: Record<string, number> = {};
  (allLeads || []).forEach((l: { ambassador_id: string; status: string }) => {
    if (HOT_LEAD_STATUSES.includes(l.status)) {
      hotCountByAmbassador[l.ambassador_id] = (hotCountByAmbassador[l.ambassador_id] ?? 0) + 1;
    }
  });
  (allActivities || []).forEach((a: { ambassador_id: string }) => {
    outreachCountByAmbassador[a.ambassador_id] = (outreachCountByAmbassador[a.ambassador_id] ?? 0) + 1;
  });

  const leaderBoard: LeaderBoardEntry[] = (allAmbassadors || [])
    .map((a: { id: string; full_name: string; profile_image_url: string | null }) => ({
      id: a.id,
      full_name: a.full_name,
      profile_image_url: a.profile_image_url ?? null,
      hot_leads: hotCountByAmbassador[a.id] ?? 0,
      outreach_count: outreachCountByAmbassador[a.id] ?? 0,
    }))
    .sort((x, y) => {
      if (y.hot_leads !== x.hot_leads) return y.hot_leads - x.hot_leads;
      return (x.full_name || '').localeCompare(y.full_name || '');
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AmbassadorHeader />
      <main className="flex-1">
        <AmbassadorDashboardClient
          ambassadorId={ambassador.id}
          leaderBoard={leaderBoard}
        />
      </main>
      <Footer />
    </div>
  );
}
