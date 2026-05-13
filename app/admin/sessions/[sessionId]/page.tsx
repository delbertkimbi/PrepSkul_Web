import Link from 'next/link';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminNav from '../../components/AdminNav';
import ResolveIncidentForm from './ResolveIncidentForm';
import { MapPin, Clock, User, Shield } from 'lucide-react';

function humanizeSessionStatus(status: string | null | undefined) {
  const normalized = String(status || '').toLowerCase();
  if (!normalized) return 'unknown';
  if (normalized === 'pending_tutor_approval') return 'pending';
  if (normalized === 'pending_admin_review') return 'awaiting admin review';
  if (normalized === 'evaluated') return 'evaluated';
  if (normalized === 'not_attended') return 'not attended';
  return normalized.replaceAll('_', ' ');
}

/**
 * Admin session detail (individual_sessions): header, safety summary, timeline, resolve incidents.
 */
export default async function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
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

  const { data: session, error: sessionError } = await supabase
    .from('individual_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            Session not found or not an individual session. <Link href="/admin/sessions/safety" className="text-indigo-600 underline">Back to Safety</Link>
          </div>
        </div>
      </div>
    );
  }

  const tutorId = session.tutor_id as string | null;
  const learnerId = session.learner_id as string | null;
  const parentId = session.parent_id as string | null;
  const ids = [tutorId, learnerId, parentId].filter(Boolean) as string[];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', ids);
  const profileMap = new Map((profiles || []).map((p: { id: string; full_name?: string; email?: string }) => [p.id, p]));

  const { data: attendance } = await supabase
    .from('session_attendance')
    .select('id, user_type, check_in_time, check_out_time, check_in_verified, punctuality_status, location_deviations')
    .eq('session_id', sessionId)
    .order('check_in_time', { ascending: false });

  const { data: feedback } = await supabase
    .from('session_feedback')
    .select('session_took_place, session_took_place_notes, student_rating, student_feedback_submitted_at')
    .eq('session_id', sessionId)
    .maybeSingle();

  const { data: incidentList } = await supabase
    .from('safety_incidents')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  const { data: timelineRows } = await supabase
    .from('session_timeline_view')
    .select('*')
    .eq('session_id', sessionId)
    .order('event_time', { ascending: true });

  const { data: riskRow } = await supabase
    .from('session_risk_view')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  const tutor = tutorId ? profileMap.get(tutorId) : null;
  const learner = learnerId ? profileMap.get(learnerId) : null;
  const parent = parentId ? profileMap.get(parentId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin/sessions/safety" className="text-indigo-600 hover:underline text-sm font-medium">← Safety overview</Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Session details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5 text-gray-400" />
              <span><strong>Tutor:</strong> {tutor?.full_name ?? '—'} {tutor?.email ? `(${tutor.email})` : ''}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5 text-gray-400" />
              <span><strong>Learner:</strong> {learner?.full_name ?? '—'}</span>
            </div>
            {parent && (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <span><strong>Parent:</strong> {parent.full_name ?? '—'}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{String(session.scheduled_date)} {String(session.scheduled_time)} · {humanizeSessionStatus(session.status)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{session.location === 'onsite' ? `Onsite · ${session.address || '—'}` : 'Online'}</span>
            </div>
            {riskRow && (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="px-2 py-0.5 rounded text-sm font-medium bg-gray-100">Risk: {Number(riskRow.risk_score)} ({String(riskRow.risk_bucket)})</span>
              </div>
            )}
          </div>
        </div>

        {/* Safety summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety summary</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Attendance / check-in</p>
              <ul className="mt-1 text-sm text-gray-700">
                {(attendance || []).filter((a: { user_type: string }) => a.user_type === 'tutor').map((a: { id: string; check_in_time?: string; check_out_time?: string; check_in_verified?: boolean; punctuality_status?: string }) => (
                  <li key={a.id}>
                    Tutor: check-in {a.check_in_time ? new Date(a.check_in_time).toLocaleString() : '—'}
                    {a.check_in_verified ? ' (verified)' : ''}
                    {a.punctuality_status ? ` · ${a.punctuality_status}` : ''}
                    {a.check_out_time ? ` · check-out ${new Date(a.check_out_time).toLocaleString()}` : ''}
                  </li>
                ))}
                {(attendance || []).filter((a: { user_type: string }) => a.user_type !== 'tutor').map((a: { id: string; user_type: string; check_in_time?: string }) => (
                  <li key={a.id}>{a.user_type}: {a.check_in_time ? new Date(a.check_in_time).toLocaleString() : '—'}</li>
                ))}
                {(!attendance || attendance.length === 0) && <li>No attendance records</li>}
              </ul>
            </div>
            {(attendance || []).some((a: { location_deviations?: unknown }) => Array.isArray(a.location_deviations) && a.location_deviations.length > 0) && (
              <div>
                <p className="text-sm font-medium text-gray-500">Location deviations</p>
                <ul className="mt-1 text-sm text-gray-700">
                  {(attendance || []).flatMap((a: { id: string; user_type: string; location_deviations?: Array<{ timestamp?: string; distance_meters?: number }> }) =>
                    (Array.isArray(a.location_deviations) ? a.location_deviations : []).map((d, i) => (
                      <li key={`${a.id}-${i}`}>{a.user_type}: {d.timestamp ? new Date(d.timestamp).toLocaleString() : '—'} · {d.distance_meters ?? '—'} m</li>
                    ))
                  )}
                </ul>
              </div>
            )}
            {feedback && (
              <div>
                <p className="text-sm font-medium text-gray-500">Family feedback (session took place)</p>
                <p className="mt-1 text-sm text-gray-700">
                  {feedback.session_took_place ?? '—'}
                  {feedback.session_took_place_notes ? ` · ${feedback.session_took_place_notes}` : ''}
                  {feedback.student_rating != null ? ` · Rating: ${feedback.student_rating}` : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Incidents + resolve */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Safety incidents</h2>
          {(incidentList || []).length === 0 ? (
            <p className="text-sm text-gray-500">No incidents reported for this session.</p>
          ) : (
            <ul className="space-y-3">
              {(incidentList || []).map((inc: { id: string; severity: string; type: string; message: string; role: string; created_at: string; resolved?: boolean; resolution_notes?: string | null }) => (
                <li key={inc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${inc.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {inc.severity}
                      </span>
                      <span className="ml-2 text-sm text-gray-600">{inc.type}</span>
                      <span className="ml-2 text-sm text-gray-500">({inc.role})</span>
                      <p className="mt-1 text-sm text-gray-900">{inc.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(inc.created_at).toLocaleString()}</p>
                      {inc.resolved && inc.resolution_notes && (
                        <p className="mt-2 text-sm text-green-700">Resolved: {inc.resolution_notes}</p>
                      )}
                    </div>
                    {!inc.resolved && (
                      <ResolveIncidentForm incidentId={inc.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          {(timelineRows || []).length === 0 ? (
            <p className="text-sm text-gray-500">No timeline events.</p>
          ) : (
            <ul className="space-y-2">
              {(timelineRows || []).map((row: { event_time: string; event_type: string; actor_role: string; summary: string }, i: number) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-gray-400 shrink-0">{row.event_time ? new Date(row.event_time).toLocaleString() : '—'}</span>
                  <span className="font-medium text-gray-700">{row.event_type}</span>
                  <span className="text-gray-500">({row.actor_role})</span>
                  <span className="text-gray-600">{row.summary}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
