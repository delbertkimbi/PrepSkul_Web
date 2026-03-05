'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Megaphone, TrendingUp, UserCheck } from 'lucide-react';

type LeadRow = {
  id: string;
  ambassador_id: string;
  full_name: string;
  phone: string;
  course_interest: string;
  status: string;
  lead_source: string;
  ambassador_name: string;
  created_at: string;
  outreach_activity_id: string | null;
};

type ActivityRow = {
  id: string;
  activity_name: string;
  activity_type: string;
  platform: string;
  estimated_audience: number | null;
  date: string;
  ambassador_name: string;
  leads_count?: number;
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function AmbassadorOutreachClient({
  initialLeads,
  initialActivities,
  ambassadors,
  totalLeads,
  totalActivities,
}: {
  initialLeads: LeadRow[];
  initialActivities: ActivityRow[];
  ambassadors: { id: string; full_name: string; email: string }[];
  totalLeads: number;
  totalActivities: number;
}) {
  const [activeView, setActiveView] = useState<'leads' | 'outreach'>('leads');
  const [ambassadorFilter, setAmbassadorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const leadsFiltered = useMemo(() => {
    let list = initialLeads;
    if (ambassadorFilter !== 'all') {
      list = list.filter((l) => l.ambassador_id === ambassadorFilter);
    }
    if (statusFilter !== 'all') {
      list = list.filter((l) => l.status === statusFilter);
    }
    if (dateFrom) {
      list = list.filter((l) => l.created_at >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((l) => l.created_at <= dateTo + 'T23:59:59');
    }
    if (searchLead.trim()) {
      const q = searchLead.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.full_name?.toLowerCase().includes(q) ||
          l.phone?.includes(q) ||
          l.course_interest?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [initialLeads, ambassadorFilter, statusFilter, dateFrom, dateTo, searchLead, ambassadors]);

  const activitiesWithCounts = useMemo(() => {
    return initialActivities.map((a) => ({
      ...a,
      leads_count: initialLeads.filter((l) => l.outreach_activity_id === a.id).length,
    }));
  }, [initialLeads, initialActivities]);

  const funnel = useMemo(() => {
    const contacted = initialLeads.filter((l) => l.status === 'Contacted').length;
    const interested = initialLeads.filter((l) => l.status === 'Interested').length;
    const applied = initialLeads.filter((l) => l.status === 'Applied').length;
    const enrolled = initialLeads.filter((l) => l.status === 'Enrolled').length;
    return { contacted, interested, applied, enrolled };
  }, [initialLeads]);

  const leadsForActivity = useMemo(() => {
    if (!selectedActivityId) return [];
    return initialLeads.filter((l) => l.outreach_activity_id === selectedActivityId);
  }, [initialLeads, selectedActivityId]);

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users className="h-4 w-4" />
              Total Leads Logged
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Megaphone className="h-4 w-4" />
              Total Outreach Activities
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalActivities}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <UserCheck className="h-4 w-4" />
              Ambassadors (approved)
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{ambassadors.length}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <TrendingUp className="h-4 w-4" />
              Conversion Funnel
            </div>
            <div className="mt-2 text-xs space-y-1">
              <p>Contacted: <span className="font-medium">{funnel.contacted}</span></p>
              <p>Interested: <span className="font-medium text-primary">{funnel.interested}</span></p>
              <p>Applied: <span className="font-medium text-blue-600">{funnel.applied}</span></p>
              <p>Enrolled: <span className="font-medium text-green-600">{funnel.enrolled}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('leads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeView === 'leads'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ambassador Leads
          </button>
          <button
            onClick={() => setActiveView('outreach')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeView === 'outreach'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Outreach Activities
          </button>
        </nav>
      </div>

      {activeView === 'leads' ? (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Leads</CardTitle>
            <div className="flex flex-wrap gap-3 mt-2">
              <Select value={ambassadorFilter} onValueChange={setAmbassadorFilter}>
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="Ambassador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ambassadors</SelectItem>
                  {ambassadors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] border-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="Follow Up Needed">Follow Up Needed</SelectItem>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Enrolled">Enrolled</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-[140px] border-gray-300"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="w-[140px] border-gray-300"
              />
              <Input
                type="text"
                value={searchLead}
                onChange={(e) => setSearchLead(e.target.value)}
                placeholder="Search name, phone, course..."
                className="max-w-xs border-gray-300"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Lead Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Course Interest</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Ambassador</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Outreach Source</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Date Logged</th>
                  </tr>
                </thead>
                <tbody>
                  {leadsFiltered.map((l) => (
                    <tr key={l.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">{l.full_name}</td>
                      <td className="py-3 px-2">{l.phone}</td>
                      <td className="py-3 px-2">{l.course_interest}</td>
                      <td className="py-3 px-2">{l.status}</td>
                      <td className="py-3 px-2">{l.ambassador_name}</td>
                      <td className="py-3 px-2">{l.lead_source}</td>
                      <td className="py-3 px-2">{formatDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leadsFiltered.length === 0 && (
              <p className="text-gray-500 text-sm py-4">No leads match the filters.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Outreach Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Activity Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Ambassador</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Platform</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Audience Size</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Leads Generated</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activitiesWithCounts.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setSelectedActivityId(selectedActivityId === a.id ? null : a.id)}
                    >
                      <td className="py-3 px-2 font-medium">{a.activity_name}</td>
                      <td className="py-3 px-2">{a.ambassador_name}</td>
                      <td className="py-3 px-2">{a.platform}</td>
                      <td className="py-3 px-2">{a.estimated_audience ?? '—'}</td>
                      <td className="py-3 px-2">{a.leads_count ?? 0}</td>
                      <td className="py-3 px-2">{formatDate(a.date)}</td>
                      <td className="py-3 px-2">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedActivityId(selectedActivityId === a.id ? null : a.id);
                          }}
                        >
                          View leads
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activitiesWithCounts.length === 0 && (
              <p className="text-gray-500 text-sm py-4">No outreach activities yet.</p>
            )}
            {selectedActivityId && leadsForActivity.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Leads from this activity</h4>
                <ul className="space-y-1 text-sm">
                  {leadsForActivity.map((l) => (
                    <li key={l.id}>
                      {l.full_name} — {l.phone} — {l.status}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 text-sm text-primary hover:underline"
                  onClick={() => setSelectedActivityId(null)}
                >
                  Close
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
