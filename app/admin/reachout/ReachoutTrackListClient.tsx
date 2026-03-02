'use client';

import { useState, useMemo } from 'react';
import { Search, MessageCircle, User, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ReachoutRecord = {
  id: string;
  agent_name: string;
  customer_whatsapp: string;
  customer_role: string;
  number_of_learners: string;
  learner_educational_level: string;
  subjects_of_interest: string;
  examination_status: string;
  session_type_preference: string;
  frequency_of_sessions: string;
  start_date_time_preference: string;
  price_range: string;
  next_followup_at: string | null;
  followup_context: string;
  additional_info: string;
  created_at: string;
  updated_at: string;
};

interface ReachoutTrackListClientProps {
  records: ReachoutRecord[];
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function ReachoutTrackListClient({ records }: ReachoutTrackListClientProps) {
  const [searchWhatsApp, setSearchWhatsApp] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    let list = records;
    if (searchWhatsApp.trim()) {
      const q = searchWhatsApp.trim().replace(/\D/g, '');
      list = list.filter((r) =>
        (r.customer_whatsapp || '').replace(/\D/g, '').includes(q)
      );
    }
    if (roleFilter !== 'all') {
      list = list.filter((r) => r.customer_role === roleFilter);
    }
    return list;
  }, [records, searchWhatsApp, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by WhatsApp number..."
            value={searchWhatsApp}
            onChange={(e) => setSearchWhatsApp(e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] border-gray-300">
            <SelectValue placeholder="Customer role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="Parent">Parent</SelectItem>
            <SelectItem value="Student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No records found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchWhatsApp || roleFilter !== 'all'
              ? 'Try adjusting the search or filters.'
              : 'No reachout records yet. Create one from "New reachout record".'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full flex flex-wrap items-center gap-4 p-4 text-left hover:bg-gray-50/80 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <MessageCircle className="h-4 w-4 shrink-0 text-[#4A6FBF]" />
                      <span className="font-medium truncate">{record.customer_whatsapp}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {record.customer_role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{record.agent_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(record.created_at)}</span>
                  </div>
                  <span className="ml-auto text-sm text-[#4A6FBF] font-medium">
                    {isExpanded ? 'Less' : 'More'}
                  </span>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Learners:</span>{' '}
                      {record.number_of_learners}
                    </div>
                    <div>
                      <span className="text-gray-500">Educational level:</span>{' '}
                      {record.learner_educational_level}
                    </div>
                    <div>
                      <span className="text-gray-500">Subjects:</span>{' '}
                      {record.subjects_of_interest}
                    </div>
                    <div>
                      <span className="text-gray-500">Examination:</span>{' '}
                      {record.examination_status}
                    </div>
                    <div>
                      <span className="text-gray-500">Session type:</span>{' '}
                      {record.session_type_preference}
                    </div>
                    <div>
                      <span className="text-gray-500">Frequency:</span>{' '}
                      {record.frequency_of_sessions}
                    </div>
                    <div>
                      <span className="text-gray-500">Start preference:</span>{' '}
                      {record.start_date_time_preference}
                    </div>
                    <div>
                      <span className="text-gray-500">Price range:</span>{' '}
                      {record.price_range}
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Next follow-up:</span>{' '}
                      {formatDate(record.next_followup_at)}
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 block mb-1">Follow-up context:</span>
                      <p className="text-gray-900 whitespace-pre-wrap">{record.followup_context}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 block mb-1">Additional info:</span>
                      <p className="text-gray-900 whitespace-pre-wrap">{record.additional_info}</p>
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
