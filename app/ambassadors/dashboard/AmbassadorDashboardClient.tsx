'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Target,
  FileCheck,
  GraduationCap,
  Plus,
  Pencil,
  LogOut,
  Megaphone,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const LEAD_SOURCES = [
  'Campus conversation',
  'WhatsApp',
  'Instagram',
  'Telegram',
  'Friend referral',
  'Event / Community outreach',
] as const;

const LEAD_STATUSES = ['Contacted', 'Interested', 'Follow Up Needed', 'Applied', 'Enrolled'] as const;

const ACTIVITY_TYPES = [
  'WhatsApp Community',
  'Telegram Group',
  'Discord Community',
  'Campus Event',
  'Classroom Talk',
  'Online Community',
] as const;

export type Lead = {
  id: string;
  ambassador_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  school: string;
  course_interest: string;
  lead_source: string;
  outreach_activity_id: string | null;
  status: string;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
  outreach_activities?: {
    activity_name: string;
    photo_url_1?: string | null;
    photo_url_2?: string | null;
  } | null;
};

export type OutreachActivity = {
  id: string;
  ambassador_id: string;
  activity_name: string;
  activity_type: string;
  community_link: string | null;
  estimated_audience: number | null;
  description: string | null;
  date: string;
  created_at: string;
  photo_url_1?: string | null;
  photo_url_2?: string | null;
  leads_count?: number;
};

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function AmbassadorDashboardClient({
  ambassadorId,
}: {
  ambassadorId: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'leads' | 'outreach'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<OutreachActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showOutreachForm, setShowOutreachForm] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [quickStatusLeadId, setQuickStatusLeadId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from('ambassador_leads')
      .select('*, outreach_activities(activity_name, photo_url_1, photo_url_2)')
      .order('created_at', { ascending: false });
    setLeads((data as Lead[]) || []);
  }, []);

  const fetchActivities = useCallback(async () => {
    const { data: activitiesData } = await supabase
      .from('outreach_activities')
      .select('*')
      .order('date', { ascending: false });
    const list = (activitiesData as OutreachActivity[]) || [];
    const withCounts = await Promise.all(
      list.map(async (a) => {
        const { count } = await supabase
          .from('ambassador_leads')
          .select('*', { count: 'exact', head: true })
          .eq('outreach_activity_id', a.id);
        return { ...a, leads_count: count ?? 0 };
      })
    );
    setActivities(withCounts);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchLeads(), fetchActivities()]);
      setLoading(false);
    })();
  }, [fetchLeads, fetchActivities]);

  const metrics = {
    total: leads.length,
    interested: leads.filter((l) => l.status === 'Interested').length,
    applied: leads.filter((l) => l.status === 'Applied').length,
    enrolled: leads.filter((l) => l.status === 'Enrolled').length,
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/ambassadors');
    router.refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambassador Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your leads and outreach activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ambassadors"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Back to Ambassadors
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'leads' as const, label: 'My Leads' },
            { id: 'outreach' as const, label: 'Outreach Activities' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeTab === 'leads' ? (
        <LeadsTab
          ambassadorId={ambassadorId}
          leads={leads}
          activities={activities}
          metrics={metrics}
          showLeadForm={showLeadForm}
          setShowLeadForm={setShowLeadForm}
          editingLeadId={editingLeadId}
          setEditingLeadId={setEditingLeadId}
          quickStatusLeadId={quickStatusLeadId}
          setQuickStatusLeadId={setQuickStatusLeadId}
          onRefresh={() => { fetchLeads(); fetchActivities(); }}
        />
      ) : (
        <OutreachTab
          ambassadorId={ambassadorId}
          activities={activities}
          leads={leads}
          showOutreachForm={showOutreachForm}
          setShowOutreachForm={setShowOutreachForm}
          onRefresh={fetchActivities}
        />
      )}
    </div>
  );
}

// Leads tab: metrics, add form, table
function LeadsTab({
  ambassadorId,
  leads,
  activities,
  metrics,
  showLeadForm,
  setShowLeadForm,
  editingLeadId,
  setEditingLeadId,
  quickStatusLeadId,
  setQuickStatusLeadId,
  onRefresh,
}: {
  ambassadorId: string;
  leads: Lead[];
  activities: OutreachActivity[];
  metrics: { total: number; interested: number; applied: number; enrolled: number };
  showLeadForm: boolean;
  setShowLeadForm: (v: boolean) => void;
  editingLeadId: string | null;
  setEditingLeadId: (v: string | null) => void;
  quickStatusLeadId: string | null;
  setQuickStatusLeadId: (v: string | null) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Users className="h-4 w-4" />
              Total Leads
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Target className="h-4 w-4" />
              Interested
            </div>
            <p className="text-2xl font-bold text-primary mt-1">{metrics.interested}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <FileCheck className="h-4 w-4" />
              Applied
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{metrics.applied}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <GraduationCap className="h-4 w-4" />
              Enrolled
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{metrics.enrolled}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Leads</CardTitle>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setShowLeadForm(true);
              setEditingLeadId(null);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Lead
          </Button>
        </CardHeader>
        <CardContent>
          {showLeadForm && (
            <LeadForm
              ambassadorId={ambassadorId}
              activities={activities}
              editingLead={editingLeadId ? leads.find((l) => l.id === editingLeadId) : null}
              onSuccess={() => {
                onRefresh();
                setShowLeadForm(false);
                setEditingLeadId(null);
              }}
              onCancel={() => {
                setShowLeadForm(false);
                setEditingLeadId(null);
              }}
            />
          )}
          <LeadsTable
            leads={leads}
            quickStatusLeadId={quickStatusLeadId}
            setQuickStatusLeadId={setQuickStatusLeadId}
            onEdit={(id) => {
              setEditingLeadId(id);
              setShowLeadForm(true);
            }}
            onStatusUpdate={onRefresh}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function LeadForm({
  ambassadorId,
  activities,
  editingLead,
  onSuccess,
  onCancel,
}: {
  ambassadorId: string;
  activities: OutreachActivity[];
  editingLead: Lead | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: editingLead?.full_name ?? '',
    phone: editingLead?.phone ?? '',
    email: editingLead?.email ?? '',
    city: editingLead?.city ?? '',
    school: editingLead?.school ?? '',
    course_interest: editingLead?.course_interest ?? '',
    lead_source: editingLead?.lead_source ?? ('' as string),
    outreach_activity_id: editingLead?.outreach_activity_id ?? '',
    status: editingLead?.status ?? 'Contacted',
    notes: editingLead?.notes ?? '',
    follow_up_date: editingLead?.follow_up_date ?? '',
  });

  useEffect(() => {
    setForm({
      full_name: editingLead?.full_name ?? '',
      phone: editingLead?.phone ?? '',
      email: editingLead?.email ?? '',
      city: editingLead?.city ?? '',
      school: editingLead?.school ?? '',
      course_interest: editingLead?.course_interest ?? '',
      lead_source: editingLead?.lead_source ?? ('' as string),
      outreach_activity_id: editingLead?.outreach_activity_id ?? '',
      status: editingLead?.status ?? 'Contacted',
      notes: editingLead?.notes ?? '',
      follow_up_date: editingLead?.follow_up_date ?? '',
    });
  }, [editingLead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ambassador_id: ambassadorId,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || null,
        city: form.city.trim(),
        school: form.school.trim(),
        course_interest: form.course_interest.trim(),
        lead_source: form.lead_source,
        outreach_activity_id: form.outreach_activity_id || null,
        status: form.status,
        notes: form.notes?.trim() || null,
        follow_up_date: form.follow_up_date || null,
      };
      if (editingLead) {
        const { error: err } = await supabase
          .from('ambassador_leads')
          .update(payload)
          .eq('id', editingLead.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('ambassador_leads').insert(payload);
        if (err) throw err;
      }
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-medium text-gray-900">{editingLead ? 'Edit Lead' : 'New Lead'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>Phone *</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>Email (optional)</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>City *</Label>
          <Input
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>School / University *</Label>
          <Input
            value={form.school}
            onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
            required
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>Specific Area of Interest *</Label>
          <Input
            value={form.course_interest}
            onChange={(e) => setForm((f) => ({ ...f, course_interest: e.target.value }))}
            required
            className="mt-1 border-gray-300"
            placeholder="e.g. Mathematics, Exam prep, Study skills"
          />
        </div>
        <div>
          <Label>Lead Source *</Label>
          <Select
            value={form.lead_source}
            onValueChange={(v) => setForm((f) => ({ ...f, lead_source: v }))}
            required
          >
            <SelectTrigger className="mt-1 border-gray-300">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Outreach Activity (optional)</Label>
          <Select
            value={form.outreach_activity_id || 'none'}
            onValueChange={(v) => setForm((f) => ({ ...f, outreach_activity_id: v === 'none' ? '' : v }))}
          >
            <SelectTrigger className="mt-1 border-gray-300">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {activities.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.activity_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status *</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
          >
            <SelectTrigger className="mt-1 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {form.status === 'Follow Up Needed' && (
          <div>
            <Label>Follow-up Date</Label>
            <Input
              type="date"
              value={form.follow_up_date}
              onChange={(e) => setForm((f) => ({ ...f, follow_up_date: e.target.value }))}
              className="mt-1 border-gray-300"
            />
          </div>
        )}
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="mt-1 border-gray-300"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {editingLead ? 'Save' : 'Add Lead'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function LeadsTable({
  leads,
  quickStatusLeadId,
  setQuickStatusLeadId,
  onEdit,
  onStatusUpdate,
}: {
  leads: Lead[];
  quickStatusLeadId: string | null;
  setQuickStatusLeadId: (v: string | null) => void;
  onEdit: (id: string) => void;
  onStatusUpdate: () => void;
}) {
  const updateStatus = async (leadId: string, status: string) => {
    await supabase.from('ambassador_leads').update({ status }).eq('id', leadId);
    setQuickStatusLeadId(null);
    onStatusUpdate();
  };

  if (leads.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">No leads yet. Add your first lead above.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 font-medium text-gray-700">Name</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Phone</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Specific Area of Interest</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Status</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Outreach Source</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Date Added</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Follow-Up</th>
            <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="py-3 px-2">{lead.full_name}</td>
              <td className="py-3 px-2">{lead.phone}</td>
              <td className="py-3 px-2">{lead.course_interest}</td>
              <td className="py-3 px-2">
                {quickStatusLeadId === lead.id ? (
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateStatus(lead.id, v)}
                    onOpenChange={(open) => !open && setQuickStatusLeadId(null)}
                  >
                    <SelectTrigger className="w-[140px] h-8 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuickStatusLeadId(lead.id)}
                    className="text-left text-primary hover:underline"
                  >
                    {lead.status}
                  </button>
                )}
              </td>
              <td className="py-3 px-2">
                {lead.outreach_activities?.activity_name ?? lead.lead_source}
                {lead.outreach_activities &&
                  (lead.outreach_activities.photo_url_1 || lead.outreach_activities.photo_url_2) && (
                    <div className="mt-1 flex gap-2 flex-wrap">
                      {lead.outreach_activities.photo_url_1 && (
                        <a
                          href={lead.outreach_activities.photo_url_1}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Photo 1
                        </a>
                      )}
                      {lead.outreach_activities.photo_url_2 && (
                        <a
                          href={lead.outreach_activities.photo_url_2}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Photo 2
                        </a>
                      )}
                    </div>
                  )}
              </td>
              <td className="py-3 px-2">{formatDate(lead.created_at)}</td>
              <td className="py-3 px-2">{formatDate(lead.follow_up_date)}</td>
              <td className="py-3 px-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => onEdit(lead.id)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Outreach tab
function OutreachTab({
  ambassadorId,
  activities,
  leads,
  showOutreachForm,
  setShowOutreachForm,
  onRefresh,
}: {
  ambassadorId: string;
  activities: OutreachActivity[];
  leads: Lead[];
  showOutreachForm: boolean;
  setShowOutreachForm: (v: boolean) => void;
  onRefresh: () => void;
}) {
  const [viewingActivityId, setViewingActivityId] = useState<string | null>(null);
  const activityLeads = viewingActivityId
    ? leads.filter((l) => l.outreach_activity_id === viewingActivityId)
    : [];

  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Outreach Activities</CardTitle>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowOutreachForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </CardHeader>
        <CardContent>
          {showOutreachForm && (
            <OutreachForm
              ambassadorId={ambassadorId}
              onSuccess={() => {
                onRefresh();
                setShowOutreachForm(false);
              }}
              onCancel={() => setShowOutreachForm(false)}
            />
          )}
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No outreach activities yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Activity Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Audience Size</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Leads Generated</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setViewingActivityId(viewingActivityId === a.id ? null : a.id)}
                    >
                      <td className="py-3 px-2 font-medium">{a.activity_name}</td>
                      <td className="py-3 px-2">{a.activity_type}</td>
                      <td className="py-3 px-2">{a.estimated_audience ?? '—'}</td>
                      <td className="py-3 px-2">{formatDate(a.date)}</td>
                      <td className="py-3 px-2">{a.leads_count ?? 0}</td>
                      <td className="py-3 px-2">
                        <button
                          type="button"
                          className="text-primary hover:underline text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingActivityId(viewingActivityId === a.id ? null : a.id);
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
          )}
          {viewingActivityId && activityLeads.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Leads from this activity</h4>
              <ul className="space-y-1 text-sm">
                {activityLeads.map((l) => (
                  <li key={l.id}>
                    {l.full_name} — {l.phone} — {l.status}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => setViewingActivityId(null)}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OutreachForm({
  ambassadorId,
  onSuccess,
  onCancel,
}: {
  ambassadorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    activity_name: '',
    activity_type: '' as string,
    community_link: '',
    estimated_audience: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (photos.length !== 2) {
        setError('Please upload exactly two photos for this outreach activity.');
        setSaving(false);
        return;
      }

      const bucket = 'ambassador_outreach';
      const uploadedUrls: string[] = [];

      for (let i = 0; i < photos.length; i += 1) {
        const file = photos[i];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Photos must be JPG, PNG, or WEBP images.');
        }
        if (file.size > 2 * 1024 * 1024) {
          throw new Error('Each photo must be less than 2MB.');
        }

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${ambassadorId}/${timestamp}-${i + 1}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false, contentType: file.type });

        if (uploadError) {
          throw new Error(`Photo upload failed: ${uploadError.message}`);
        }

        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
        uploadedUrls.push(publicData.publicUrl);
      }

      const { error: err } = await supabase.from('outreach_activities').insert({
        ambassador_id: ambassadorId,
        activity_name: form.activity_name.trim(),
        activity_type: form.activity_type,
        platform: 'N/A',
        community_link: form.community_link?.trim() || null,
        estimated_audience: form.estimated_audience ? parseInt(form.estimated_audience, 10) : null,
        date: form.date,
        description: form.description?.trim() || null,
        photo_url_1: uploadedUrls[0],
        photo_url_2: uploadedUrls[1],
      });
      if (err) throw err;
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
      <h3 className="font-medium text-gray-900">New Outreach Activity</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Activity Name *</Label>
          <Input
            value={form.activity_name}
            onChange={(e) => setForm((f) => ({ ...f, activity_name: e.target.value }))}
            required
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>Activity Type *</Label>
          <Select
            value={form.activity_type}
            onValueChange={(v) => setForm((f) => ({ ...f, activity_type: v }))}
            required
          >
            <SelectTrigger className="mt-1 border-gray-300">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {['WhatsApp Community', 'Telegram Group', 'Online Community'].includes(form.activity_type) && (
          <div>
            <Label>Community Link</Label>
            <Input
              value={form.community_link}
              onChange={(e) => setForm((f) => ({ ...f, community_link: e.target.value }))}
              className="mt-1 border-gray-300"
              placeholder="e.g. WhatsApp/Telegram/online community invite link"
            />
          </div>
        )}
        <div>
          <Label>Estimated Audience Size</Label>
          <Input
            type="number"
            min={0}
            value={form.estimated_audience}
            onChange={(e) => setForm((f) => ({ ...f, estimated_audience: e.target.value }))}
            className="mt-1 border-gray-300"
          />
        </div>
        <div>
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
            className="mt-1 border-gray-300"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Photos of this activity (2 required)</Label>
          <div className="mt-1 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3">
            <label className="flex flex-col gap-2 cursor-pointer">
              <span className="text-sm font-medium text-gray-800">
                Click to choose photos or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                Please upload <span className="font-semibold">exactly two clear photos</span> that show this
                outreach activity — for example, a group or community photo that includes you, or a screenshot
                of an online session (Google Meet, Zoom, WhatsApp call) with the people you reached.
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []).slice(0, 2);
                  setPhotos(selected);
                }}
                className="hidden"
              />
            </label>
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200"
                  >
                    {idx === 0 ? 'Photo 1:' : 'Photo 2:'}&nbsp;{file.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <Label>Description / Notes</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="mt-1 border-gray-300"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Add Activity
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
