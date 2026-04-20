'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
};

type OpsRow = {
  id: string;
  event_type: string;
  subject: string | null;
  payload: Record<string, unknown> | null;
  emails_sent: string[] | null;
  created_at: string;
};

export default function OperationsEventsClient() {
  const [eventType, setEventType] = useState('all');
  const [query, setQuery] = useState('');

  const endpoint = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', eventType);
    if (query.trim()) params.set('q', query.trim());
    params.set('limit', '300');
    return `/api/admin/operations/events?${params.toString()}`;
  }, [eventType, query]);

  const csvExportUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('type', eventType);
    if (query.trim()) params.set('q', query.trim());
    params.set('limit', '500');
    params.set('format', 'csv');
    return `/api/admin/operations/events?${params.toString()}`;
  }, [eventType, query]);

  const { data, isLoading, error, mutate } = useSWR(endpoint, fetcher, { refreshInterval: 20000 });

  const rows = (data?.rows || []) as OpsRow[];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Operational Events</h1>
          <p className="text-sm text-gray-600 mt-1">
            Audit reminders, onboarding runs, feedback replies, and delivery activity across operations.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={csvExportUrl}
            className="border border-gray-300 px-3 py-2 text-sm font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-none"
          >
            Export CSV
          </a>
          <button
            type="button"
            onClick={() => mutate()}
            className="border border-gray-300 px-3 py-2 text-sm font-medium text-[#1B2C4F] hover:bg-gray-50 rounded-none"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-none p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-500">Visible events</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.totals?.count ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">With outbound email</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{data?.totals?.withEmails ?? 0}</p>
          </div>
          <div className="text-xs text-gray-500 flex items-end">
            Last updated by auto-refresh every 20s.
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="w-full sm:w-[280px] border-gray-300 rounded-none">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            {(data?.filters?.eventTypes || []).map((type: string) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subject, payload or event type"
          className="border-gray-300 rounded-none"
        />
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading operational events...</p>}
      {error && (
        <div className="border border-red-200 bg-red-50 p-3 text-sm text-red-700 rounded-none">
          Could not load operational events right now.
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded-none text-sm text-gray-600">
          No operational events found for current filters.
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-none overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Event Type</th>
                <th className="py-2 px-3">Subject</th>
                <th className="py-2 px-3">Emails Sent</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const payloadPreview = JSON.stringify(row.payload || {}).slice(0, 260);
                return (
                  <tr key={row.id} className="border-b border-gray-50 align-top">
                    <td className="py-2 px-3 text-gray-700">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-block border border-gray-300 px-2 py-0.5 text-xs rounded-none">
                        {row.event_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-800">{row.subject || '—'}</td>
                    <td className="py-2 px-3 text-gray-700">
                      {Array.isArray(row.emails_sent) && row.emails_sent.length > 0
                        ? row.emails_sent.join(', ')
                        : 'None'}
                    </td>
                    <td className="py-2 px-3 text-gray-700 whitespace-pre-wrap">{payloadPreview}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

