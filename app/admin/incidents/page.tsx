import Link from 'next/link';
import { createServerSupabaseClient, getServerSession, isAdmin } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import AdminNav from '../components/AdminNav';
import { AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Safety incidents list. Filter by severity, type, status. Unresolved first.
 */
export default async function IncidentsPage() {
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

  const { data: incidents } = await supabase
    .from('safety_incidents')
    .select('id, session_id, reported_by, role, severity, type, message, created_at, resolved, resolved_at, resolution_notes')
    .order('resolved', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200);

  const list = (incidents || []) as Array<{
    id: string;
    session_id: string;
    role: string;
    severity: string;
    type: string;
    message: string;
    created_at: string;
    resolved?: boolean;
    resolved_at?: string | null;
    resolution_notes?: string | null;
  }>;

  const unresolved = list.filter((i) => !i.resolved);
  const resolved = list.filter((i) => i.resolved);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            Safety Incidents
          </h1>
          <p className="text-gray-600">Review and resolve reported session issues</p>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">{unresolved.length} unresolved</span>
          <span className="text-sm text-gray-500">{resolved.length} resolved</span>
          <Link href="/admin/sessions/safety" className="text-sm text-indigo-600 hover:underline">← Safety overview</Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">When</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No incidents</td>
                  </tr>
                )}
                {list.map((i) => (
                  <tr key={i.id} className={!i.resolved ? 'bg-amber-50/50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(i.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        i.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        i.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {i.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">{i.type}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{i.role}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 max-w-xs truncate">{i.message}</td>
                    <td className="px-4 py-2">
                      {i.resolved ? (
                        <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                          <CheckCircle className="w-4 h-4" /> Resolved
                        </span>
                      ) : (
                        <span className="text-amber-700 text-sm font-medium">Open</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/admin/sessions/${i.session_id}`} className="text-indigo-600 hover:underline text-sm font-medium">View session</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
