'use client';

import { useState, useMemo } from 'react';
import { Search, UserPlus, User, MessageCircle, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

export type ReferralRecord = {
  id: string;
  ambassador_name: string;
  customer_name: string;
  customer_whatsapp: string;
  contact_date: string;
  additional_notes: string | null;
  created_at: string;
};

interface ReferralTrackListClientProps {
  records: ReferralRecord[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function ReferralTrackListClient({ records }: ReferralTrackListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.trim().toLowerCase();
    const qDigits = searchQuery.trim().replace(/\D/g, '');
    return records.filter((r) => {
      const matchName = r.ambassador_name?.toLowerCase().includes(q) || r.customer_name?.toLowerCase().includes(q);
      const matchWhatsApp = qDigits && (r.customer_whatsapp || '').replace(/\D/g, '').includes(qDigits);
      return matchName || matchWhatsApp;
    });
  }, [records, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by WhatsApp, ambassador name, or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-300 focus:border-[#4A6FBF] focus:ring-[#4A6FBF]/20"
        />
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery ? 'Try adjusting your search.' : 'No ambassador referrals yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-4"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#4A6FBF]" />
                <span className="font-medium text-gray-900">{record.customer_whatsapp}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{record.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <UserPlus className="h-4 w-4" />
                <span>{record.ambassador_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(record.contact_date)}</span>
              </div>
              {record.additional_notes && (
                <p className="w-full text-sm text-gray-600 mt-2 pl-6 border-l-2 border-gray-100">
                  {record.additional_notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
