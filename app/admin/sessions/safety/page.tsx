import Link from 'next/link';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminNav from '../../components/AdminNav';
import { Shield, AlertTriangle, AlertCircle, Calendar, MapPin } from 'lucide-react';

/**
 * Admin Safety & Activity overview.
 * Today's onsite stats, safety incidents, session_took_place disputes, and safety-relevant sessions table.
 */
export default async function SafetyPage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">Failed to connect to database.</div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  // Today's individual_sessions (onsite + online)
  const { data: todaySessions } = await supabase
    .from('individual_sessions')
    .select('id, status, location, scheduled_date, scheduled_time')
    .eq('scheduled_date', today);

  const onsiteScheduled = (todaySessions || []).filter((s: { location?: string }) => s.location === 'onsite').length;
  const onsiteStarted = (todaySessions || []).filter((s: { status: string; location?: string }) => s.location === 'onsite' && s.status === 'in_progress').length;
  const onsiteCompleted = (todaySessions || []).filter((s: { status: string; location?: string }) => s.location === 'onsite' && s.status === 'completed').length;

  // Safety incidents (new, by severity)
  const { data: incidents } = await supabase
    .from('safety_incidents')
    .select('id, severity, resolved, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const newIncidents = (incidents || []).filter((i: { resolved?: boolean }) => !i.resolved);
  const criticalCount = newIncidents.filter((i: { severity: string }) => i.severity === 'critical').length;
  const warningCount = newIncidents.filter((i: { severity: string }) => i.severity === 'warning').length;

  // Sessions with session_took_place no/partially
  const { data: disputeFeedback } = await supabase
    .from('session_feedback')
    .select('session_id, session_took_place, session_took_place_notes')
    .in('session_took_place', ['no', 'partially']);

  const disputeCount = (disputeFeedback || []).length;

  // Safety-relevant sessions: join individual_sessions with session_risk_view (last 50 by risk)
  const { data: riskRows } = await supabase
    .from('session_risk_view')
    .select('session_id, risk_score, risk_bucket, parent_dispute, low_rating, tutor_late, location_deviation, has_incident')
    .order('risk_score', { ascending: false })
    .limit(50);

  const sessionIds = (riskRows || []).map((r: { session_id: string }) => r.session_id).filter(Boolean);
  let sessionsWithDetails: Array<Record<string, unknown>> = [];
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase
      .from('individual_sessions')
      .select(`
        id,
        status,
        location,
        scheduled_date,
        scheduled_time,
        tutor_id,
        learner_id,
        parent_id
      `)
      .in('id', sessionIds);
    const sessionMap = new Map((sessions || []).map((s: { id: string }) => [s.id, s]));
    const profileIds = Array.from(
      new Set(
        (sessions || []).flatMap(
          (s: { tutor_id?: string; learner_id?: string; parent_id?: string }) =>
            [s.tutor_id, s.learner_id, s.parent_id].filter(Boolean) as string[],
        ),
      ),
    );
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', profileIds);
    const profileMap = new Map((profiles || []).map((p: { id: string; full_name?: string }) => [p.id, { name: p.full_name || '—' }]));
    sessionsWithDetails = (riskRows || []).map((r: Record<string, unknown>) => {
      const session = sessionMap.get(r.session_id as string);
      if (!session) return null;
      const tutorName = profileMap.get((session as { tutor_id?: string }).tutor_id)?.name ?? '—';
      const learnerId = (session as { learner_id?: string }).learner_id || (session as { parent_id?: string }).parent_id;
      const learnerName = learnerId ? profileMap.get(learnerId)?.name ?? '—' : '—';
      return {
        ...r,
        session,
        tutorName,
        learnerName,
        time: `${(session as { scheduled_date?: string }).scheduled_date} ${(session as { scheduled_time?: string }).scheduled_time}`,
      };
    }).filter(Boolean) as Array<Record<string, unknown>>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-8 h-8 text-indigo-600" />
            Safety & Activity
          </h1>
          <p className="text-gray-600">Onsite session overview, incidents, and disputes</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Today (onsite)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{onsiteScheduled} scheduled</p>
            <p className="text-sm text-gray-500 mt-1">{onsiteStarted} started · {onsiteCompleted} completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">Safety incidents</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{newIncidents.length} new</p>
            <p className="text-sm text-gray-500 mt-1">{criticalCount} critical · {warningCount} warning</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Disputes</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{disputeCount}</p>
            <p className="text-sm text-gray-500 mt-1">session_took_place no/partially</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <Link href="/admin/incidents" className="block text-indigo-600 font-medium hover:underline">
              View all incidents →
            </Link>
            <p className="text-sm text-gray-500 mt-1">Filter and resolve</p>
          </div>
        </div>

        {/* Dispute runbook note */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Dispute handling (session_took_place no/partially)</h3>
          <p className="text-sm text-amber-800">
            When family reports the session did not take place: open the session from Safety-relevant sessions or Incidents, review Safety summary (tutor check-in/out, deviations) and session_took_place_notes. Resolve incidents and follow payment-eligibility rules. Runbook: <code className="bg-amber-100 px-1 rounded">prepskul_app/docs/ADMIN_DISPUTE_RUNBOOK.md</code>
          </p>
        </div>

        {/* Safety-relevant sessions table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Safety-relevant sessions (by risk)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flags</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessionsWithDetails.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No safety-relevant sessions</td>
                  </tr>
                )}
                {sessionsWithDetails.map((row) => {
                  const s = row.session as { id: string; status: string; location?: string };
                  const riskBucket = row.risk_bucket as string;
                  const flags: string[] = [];
                  if (row.parent_dispute) flags.push('dispute');
                  if (row.low_rating) flags.push('low_rating');
                  if (row.tutor_late) flags.push('late');
                  if (row.location_deviation) flags.push('deviation');
                  if (row.has_incident) flags.push('incident');
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{String(row.time)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{String(row.tutorName)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{String(row.learnerName)}</td>
                      <td className="px-4 py-2 text-sm">{s.location === 'onsite' ? <MapPin className="w-4 h-4 text-amber-600" /> : 'Online'}</td>
                      <td className="px-4 py-2 text-sm">{s.status}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          riskBucket === 'high' ? 'bg-red-100 text-red-800' :
                          riskBucket === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.risk_score} ({riskBucket})
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">{flags.join(', ') || '—'}</td>
                      <td className="px-4 py-2">
                        <Link href={`/admin/sessions/${s.id}`} className="text-indigo-600 hover:underline text-sm font-medium">View</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
