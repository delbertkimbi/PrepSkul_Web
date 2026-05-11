'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, User, Calendar, MessageCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export type OfflineOpsRecord = {
  id: string;
  agent_name: string;
  source_channel: string;
  customer_name: string;
  customer_whatsapp: string;
  customer_role: 'Parent' | 'Student';
  number_of_learners: number;
  learner_educational_level: string;
  subjects_of_interest: string;
  tutor_match_type: 'platform_tutor' | 'off_platform_tutor';
  delivery_mode: 'online' | 'onsite' | 'hybrid';
  onboarding_stage: 'new_lead' | 'qualified' | 'matched' | 'active_sessions' | 'completed' | 'dropped';
  sessions_completed: number;
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  payment_environment: 'real' | 'sandbox';
  amount_paid: number;
  started_at: string | null;
  next_followup_at: string | null;
  notes: string;
  converted_to_platform: boolean;
  created_at: string;
  updated_at: string;
};

interface Props {
  records: OfflineOpsRecord[];
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function stageBadge(stage: OfflineOpsRecord['onboarding_stage']) {
  switch (stage) {
    case 'completed':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'active_sessions':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'matched':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'qualified':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'dropped':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'new_lead':
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function OfflineOpsListClient({ records }: Props) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = records;
    if (search.trim()) {
      const normalized = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(normalized) ||
          r.customer_whatsapp.replace(/\D/g, '').includes(normalized.replace(/\D/g, ''))
      );
    }
    if (stageFilter !== 'all') list = list.filter((r) => r.onboarding_stage === stageFilter);
    if (sourceFilter !== 'all') list = list.filter((r) => r.source_channel === sourceFilter);
    return list;
  }, [records, search, stageFilter, sourceFilter]);

  const summary = useMemo(() => {
    return {
      total: records.length,
      active: records.filter((r) => ['active_sessions', 'completed'].includes(r.onboarding_stage)).length,
      paid: records.filter((r) => r.payment_status === 'paid').length,
      converted: records.filter((r) => r.converted_to_platform).length,
    };
  }, [records]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-none border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total offline records</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</p>
        </div>
        <div className="bg-white rounded-none border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Active/completed journeys</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{summary.active}</p>
        </div>
        <div className="bg-white rounded-none border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{summary.paid}</p>
        </div>
        <div className="bg-white rounded-none border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Converted to platform</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{summary.converted}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name or WhatsApp number"
            className="pl-9 border-gray-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-[180px] border-gray-300">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              <SelectItem value="new_lead">New lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="active_sessions">Active sessions</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="dropped">Dropped</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-[200px] border-gray-300">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              <SelectItem value="whatsapp_ads">WhatsApp ads</SelectItem>
              <SelectItem value="whatsapp_direct">WhatsApp direct</SelectItem>
              <SelectItem value="phone_call">Phone call</SelectItem>
              <SelectItem value="walk_in">Walk-in</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-none p-12 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No offline operation records found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const expanded = expandedId === record.id;
            return (
              <div key={record.id} className="bg-white border border-gray-200 rounded-none overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : record.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-medium text-gray-900">{record.customer_name}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${stageBadge(record.onboarding_stage)}`}>
                      {record.onboarding_stage.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{record.customer_role}</span>
                    <span className="text-sm text-gray-600">{record.customer_whatsapp}</span>
                    <span className="ml-auto text-xs text-[#4A6FBF] font-medium">{expanded ? 'Less' : 'More'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {record.agent_name}</span>
                    <span>{record.source_channel.replace('_', ' ')}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(record.created_at)}</span>
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/70 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p><span className="text-gray-500">Learners:</span> {record.number_of_learners}</p>
                    <p><span className="text-gray-500">Learning level:</span> {record.learner_educational_level}</p>
                    <p><span className="text-gray-500">Subjects:</span> {record.subjects_of_interest}</p>
                    <p><span className="text-gray-500">Delivery:</span> {record.delivery_mode}</p>
                    <p><span className="text-gray-500">Tutor match:</span> {record.tutor_match_type.replace('_', ' ')}</p>
                    <p><span className="text-gray-500">Sessions completed:</span> {record.sessions_completed}</p>
                    <p><span className="text-gray-500">Payment status:</span> {record.payment_status}</p>
                    <p><span className="text-gray-500">Amount paid:</span> {Number(record.amount_paid || 0).toLocaleString()} XAF ({record.payment_environment})</p>
                    <p><span className="text-gray-500">Start date:</span> {formatDate(record.started_at)}</p>
                    <p><span className="text-gray-500">Next follow-up:</span> {formatDate(record.next_followup_at)}</p>
                    <p className="md:col-span-2"><span className="text-gray-500">Notes:</span> {record.notes}</p>
                    <div className="md:col-span-2 pt-2">
                      <Link
                        href={`/admin/offline-ops/${record.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm bg-[#1B2C4F] text-white"
                      >
                        Open full tracking page
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
