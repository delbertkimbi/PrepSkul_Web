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
import { Users, Megaphone, TrendingUp, UserCheck, Trophy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type LeadRow = {
  id: string;
  ambassador_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  school: string;
  course_interest: string;
  status: string;
  lead_source: string;
  ambassador_name: string;
  created_at: string;
  outreach_activity_id: string | null;
  outreach_activity_name?: string | null;
  outreach_photo_url_1?: string | null;
  outreach_photo_url_2?: string | null;
  notes?: string | null;
  follow_up_date?: string | null;
};

type ActivityRow = {
  id: string;
  ambassador_id: string;
  activity_name: string;
  activity_type: string;
  estimated_audience: number | null;
  date: string;
  ambassador_name: string;
  description?: string | null;
  community_link?: string | null;
  photo_url_1?: string | null;
  photo_url_2?: string | null;
  leads_count?: number;
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function LeadDetailPanel({ lead, onClose }: { lead: LeadRow; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lead details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-gray-500">Name</span>
            <span>{lead.full_name}</span>
            <span className="text-gray-500">Phone</span>
            <span>{lead.phone}</span>
            <span className="text-gray-500">Email</span>
            <span>{lead.email ?? '—'}</span>
            <span className="text-gray-500">City</span>
            <span>{lead.city}</span>
            <span className="text-gray-500">School</span>
            <span>{lead.school}</span>
            <span className="text-gray-500">Course interest</span>
            <span>{lead.course_interest}</span>
            <span className="text-gray-500">Lead source</span>
            <span>{lead.lead_source}</span>
            <span className="text-gray-500">Status</span>
            <span>{lead.status}</span>
            <span className="text-gray-500">Ambassador</span>
            <span>{lead.ambassador_name}</span>
            <span className="text-gray-500">Date logged</span>
            <span>{formatDate(lead.created_at)}</span>
            {lead.follow_up_date && (
              <>
                <span className="text-gray-500">Follow-up date</span>
                <span>{formatDate(lead.follow_up_date)}</span>
              </>
            )}
          </div>
          {lead.notes && (
            <div>
              <span className="text-gray-500 block mb-1">Notes</span>
              <p className="text-gray-900">{lead.notes}</p>
            </div>
          )}
          {lead.outreach_activity_name && (
            <div>
              <span className="text-gray-500 block mb-1">Outreach activity</span>
              <p className="font-medium">{lead.outreach_activity_name}</p>
              <div className="flex flex-wrap gap-4 mt-2">
                {lead.outreach_photo_url_1 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs">Photo 1</span>
                    <img
                      src={lead.outreach_photo_url_1}
                      alt="Outreach activity 1"
                      className="rounded-lg border border-gray-200 max-w-full h-auto max-h-64 object-cover"
                    />
                  </div>
                )}
                {lead.outreach_photo_url_2 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs">Photo 2</span>
                    <img
                      src={lead.outreach_photo_url_2}
                      alt="Outreach activity 2"
                      className="rounded-lg border border-gray-200 max-w-full h-auto max-h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActivityDetailPanel({
  activity,
  leadsFromActivity,
  onClose,
}: {
  activity: ActivityRow & { leads_count?: number };
  leadsFromActivity: LeadRow[];
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Outreach activity details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-gray-500">Activity name</span>
            <span className="font-medium">{activity.activity_name}</span>
            <span className="text-gray-500">Activity type</span>
            <span>{activity.activity_type}</span>
            <span className="text-gray-500">Ambassador</span>
            <span>{activity.ambassador_name}</span>
            <span className="text-gray-500">Date</span>
            <span>{formatDate(activity.date)}</span>
            <span className="text-gray-500">Estimated audience</span>
            <span>{activity.estimated_audience ?? '—'}</span>
            <span className="text-gray-500">Leads generated</span>
            <span>{activity.leads_count ?? 0}</span>
            {activity.community_link && (
              <>
                <span className="text-gray-500">Community link</span>
                <a
                  href={activity.community_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {activity.community_link}
                </a>
              </>
            )}
          </div>
          {activity.description && (
            <div>
              <span className="text-gray-500 block mb-1">Description</span>
              <p className="text-gray-900">{activity.description}</p>
            </div>
          )}
          <div>
            <span className="text-gray-500 block mb-2">Photos</span>
            <div className="flex flex-wrap gap-4">
              {activity.photo_url_1 && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs">Photo 1</span>
                  <img
                    src={activity.photo_url_1}
                    alt="Activity 1"
                    className="rounded-lg border border-gray-200 max-w-full h-auto max-h-64 object-cover"
                  />
                </div>
              )}
              {activity.photo_url_2 && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs">Photo 2</span>
                  <img
                    src={activity.photo_url_2}
                    alt="Activity 2"
                    className="rounded-lg border border-gray-200 max-w-full h-auto max-h-64 object-cover"
                  />
                </div>
              )}
              {!activity.photo_url_1 && !activity.photo_url_2 && (
                <p className="text-gray-500">No photos uploaded.</p>
              )}
            </div>
          </div>
          {leadsFromActivity.length > 0 && (
            <div>
              <span className="text-gray-500 block mb-2">Leads from this activity</span>
              <ul className="space-y-1 text-sm border border-gray-200 rounded-lg p-3 bg-gray-50">
                {leadsFromActivity.map((l) => (
                  <li key={l.id}>
                    {l.full_name} — {l.phone} — {l.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
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
  ambassadors: { id: string; full_name: string; email: string; profile_image_url?: string | null }[];
  totalLeads: number;
  totalActivities: number;
}) {
  const HOT_LEAD_STATUSES = ['Contacted', 'Applied', 'Enrolled'];
  const leaderBoardFull = useMemo(() => {
    const byId: Record<string, { id: string; full_name: string; profile_image_url: string | null; hot_leads: number; outreach_count: number }> = {};
    ambassadors.forEach((a) => {
      byId[a.id] = {
        id: a.id,
        full_name: a.full_name,
        profile_image_url: a.profile_image_url ?? null,
        hot_leads: initialLeads.filter((l) => l.ambassador_id === a.id && HOT_LEAD_STATUSES.includes(l.status)).length,
        outreach_count: initialActivities.filter((act) => act.ambassador_id === a.id).length,
      };
    });
    return Object.values(byId)
      .sort((x, y) => {
        if (y.hot_leads !== x.hot_leads) return y.hot_leads - x.hot_leads;
        return (x.full_name || '').localeCompare(y.full_name || '');
      })
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [ambassadors, initialLeads, initialActivities]);

  const [activeView, setActiveView] = useState<'leads' | 'outreach' | 'leaderboard'>('leads');
  const [leaderBoardAvatar, setLeaderBoardAvatar] = useState<typeof leaderBoardFull[0] | null>(null);
  const [ambassadorFilter, setAmbassadorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedActivityDetailId, setSelectedActivityDetailId] = useState<string | null>(null);

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
    let list = initialActivities;
    if (ambassadorFilter !== 'all') {
      list = list.filter((a) => a.ambassador_id === ambassadorFilter);
    }
    return list.map((a) => ({
      ...a,
      leads_count: initialLeads.filter((l) => l.outreach_activity_id === a.id).length,
    }));
  }, [initialLeads, initialActivities, ambassadorFilter]);

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
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max">
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
          <button
            onClick={() => setActiveView('leaderboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeView === 'leaderboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Leader Board
          </button>
        </nav>
      </div>

      {activeView === 'leaderboard' ? (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Leader Board
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Ranked by hot leads (Contacted, Applied, Enrolled). Ties broken by name.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700 w-16">Rank</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Ambassador</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Hot Leads</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Outreach Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderBoardFull.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {entry.rank}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setLeaderBoardAvatar(entry)}
                            className="flex-shrink-0 rounded-full overflow-hidden ring-2 ring-gray-200 hover:ring-primary focus:ring-primary focus:outline-none transition-shadow w-10 h-10"
                          >
                            {entry.profile_image_url ? (
                              <img
                                src={entry.profile_image_url}
                                alt={entry.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                                {entry.full_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                          </button>
                          <span className="font-medium text-gray-900">{entry.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">{entry.hot_leads}</td>
                      <td className="py-3 px-2">{entry.outreach_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {leaderBoardFull.length === 0 && (
              <p className="text-gray-500 text-sm py-8 text-center">No ambassadors on the board yet.</p>
            )}
          </CardContent>
        </Card>
      ) : activeView === 'leads' ? (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">Leads</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Filter by ambassador, status, and date.</p>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
              <Select value={ambassadorFilter} onValueChange={setAmbassadorFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-300 min-w-0">
                  <SelectValue placeholder="Filter by ambassador" />
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
                <SelectTrigger className="w-full sm:w-[160px] border-gray-300 min-w-0">
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
                className="w-full sm:w-[140px] border-gray-300 min-w-0"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="w-full sm:w-[140px] border-gray-300 min-w-0"
              />
              <Input
                type="text"
                value={searchLead}
                onChange={(e) => setSearchLead(e.target.value)}
                placeholder="Search name, phone, course..."
                className="w-full sm:max-w-xs border-gray-300 min-w-0"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Lead Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Phone</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Course Interest</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Ambassador</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Lead Source</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Outreach Activity</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Date Logged</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
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
                      <td className="py-3 px-2">{l.outreach_activity_name ?? '—'}</td>
                      <td className="py-3 px-2">{formatDate(l.created_at)}</td>
                      <td className="py-3 px-2">
                        <button
                          type="button"
                          className="text-primary hover:underline text-sm font-medium"
                          onClick={() => setSelectedLeadId(selectedLeadId === l.id ? null : l.id)}
                        >
                          View more
                        </button>
                      </td>
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
            <p className="text-sm text-gray-500 mt-1">Filter by ambassador.</p>
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
              <Select value={ambassadorFilter} onValueChange={setAmbassadorFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-300 min-w-0">
                  <SelectValue placeholder="Filter by ambassador" />
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-sm border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Activity Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Ambassador</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Activity Type</th>
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
                      <td className="py-3 px-2">{a.activity_type}</td>
                      <td className="py-3 px-2">{a.estimated_audience ?? '—'}</td>
                      <td className="py-3 px-2">{a.leads_count ?? 0}</td>
                      <td className="py-3 px-2">{formatDate(a.date)}</td>
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="text-primary hover:underline mr-2"
                          onClick={() => setSelectedActivityId(selectedActivityId === a.id ? null : a.id)}
                        >
                          View leads
                        </button>
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => setSelectedActivityDetailId(selectedActivityDetailId === a.id ? null : a.id)}
                        >
                          View more
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

      {selectedLeadId && (() => {
        const lead = leadsFiltered.find((l) => l.id === selectedLeadId);
        return lead ? <LeadDetailPanel lead={lead} onClose={() => setSelectedLeadId(null)} /> : null;
      })()}
      {selectedActivityDetailId && (() => {
        const activity = activitiesWithCounts.find((a) => a.id === selectedActivityDetailId);
        const leadsFromActivity = initialLeads.filter((l) => l.outreach_activity_id === selectedActivityDetailId);
        return activity ? (
          <ActivityDetailPanel
            activity={activity}
            leadsFromActivity={leadsFromActivity}
            onClose={() => setSelectedActivityDetailId(null)}
          />
        ) : null;
      })()}
      {leaderBoardAvatar && (
        <Dialog open onOpenChange={(open) => !open && setLeaderBoardAvatar(null)}>
          <DialogContent className="max-w-sm p-0 overflow-hidden">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>{leaderBoardAvatar.full_name}</DialogTitle>
            </DialogHeader>
            <div className="p-4 pt-2">
              {leaderBoardAvatar.profile_image_url ? (
                <img
                  src={leaderBoardAvatar.profile_image_url}
                  alt={leaderBoardAvatar.full_name}
                  className="w-full h-auto rounded-lg object-cover"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                  No photo
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2 text-center">
                Rank #{leaderBoardAvatar.rank} · {leaderBoardAvatar.hot_leads} hot leads · {leaderBoardAvatar.outreach_count} outreach
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
