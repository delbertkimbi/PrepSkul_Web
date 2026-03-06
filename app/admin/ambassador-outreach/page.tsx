import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import AmbassadorOutreachClient from './AmbassadorOutreachClient';

export default async function AmbassadorOutreachPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();

  const [leadsRes, activitiesRes, ambassadorsRes] = await Promise.all([
    supabase
      .from('ambassador_leads')
      .select(
        '*, ambassadors(full_name, email), outreach_activities(id, activity_name, photo_url_1, photo_url_2, activity_type, community_link, estimated_audience, description, date)'
      )
      .order('created_at', { ascending: false }),
    supabase
      .from('outreach_activities')
      .select('*, ambassadors(full_name, email)')
      .order('date', { ascending: false }),
    supabase
      .from('ambassadors')
      .select('id, full_name, email')
      .eq('application_status', 'approved')
      .order('full_name'),
  ]);

  const leads = (leadsRes.data || []).map((l: Record<string, unknown>) => ({
    ...l,
    ambassador_name: (l.ambassadors as { full_name?: string } | null)?.full_name ?? '—',
    outreach_activity_name: (l.outreach_activities as { activity_name?: string } | null)?.activity_name ?? null,
    outreach_photo_url_1: (l.outreach_activities as { photo_url_1?: string } | null)?.photo_url_1 ?? null,
    outreach_photo_url_2: (l.outreach_activities as { photo_url_2?: string } | null)?.photo_url_2 ?? null,
  }));
  const activities = (activitiesRes.data || []).map((a: Record<string, unknown>) => ({
    ...a,
    ambassador_name: (a.ambassadors as { full_name?: string } | null)?.full_name ?? '—',
  }));

  const { count: leadsCount } = await supabase
    .from('ambassador_leads')
    .select('*', { count: 'exact', head: true });
  const { count: activitiesCount } = await supabase
    .from('outreach_activities')
    .select('*', { count: 'exact', head: true });

  const ambassadors = ambassadorsRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ambassador Outreach Analytics</h1>
          <p className="text-gray-600 mt-1">
            View all ambassador leads and outreach activities. Filter by ambassador, status, and date.
          </p>
        </div>

        {(leadsRes.error || activitiesRes.error) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {leadsRes.error && <p>Leads: {leadsRes.error.message}</p>}
            {activitiesRes.error && <p>Activities: {activitiesRes.error.message}</p>}
            Ensure <code className="bg-red-100 px-1 rounded">ambassador_leads</code> and{' '}
            <code className="bg-red-100 px-1 rounded">outreach_activities</code> tables exist.
          </div>
        )}

        <AmbassadorOutreachClient
          initialLeads={leads}
          initialActivities={activities}
          ambassadors={ambassadors}
          totalLeads={leadsCount ?? 0}
          totalActivities={activitiesCount ?? 0}
        />
      </main>
    </div>
  );
}
