'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { GrowthRateBar } from '@/components/dashboard/GrowthChart';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

type Scope = 'on' | 'off' | 'combined';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error('Failed to load operations insights');
  return r.json();
});

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

export default function OperationsInsightsDashboard() {
  const [scope, setScope] = useState<Scope>('combined');
  const { data, error, isLoading } = useSWR(
    `/api/admin/analytics/operations-insights?scope=${scope}`,
    fetcher,
    { refreshInterval: 60000 }
  );

  const tabs: { id: Scope; label: string }[] = [
    { id: 'on', label: 'On-platform' },
    { id: 'off', label: 'Off-platform' },
    { id: 'combined', label: 'Combined' },
  ];

  const chartData = data?.charts?.monthlyRevenueVsCommission || [];
  const tutorChart = (data?.charts?.tutorPerformance || []).map(
    (t: { tutor: string; revenue: number }) => ({
      name: (t.tutor || 'Tutor').split(' ')[0],
      value: t.revenue,
    })
  );

  return (
    <section className="mt-10 border-t border-gray-200 pt-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1B2C4F]">Operations insights</h2>
          <p className="text-sm text-gray-600 mt-1">
            Offline scheduling periods vs on-platform session payments. Commission uses configured rate.
          </p>
        </div>
        <div className="flex rounded-lg border border-[#1B2C4F]/20 overflow-hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setScope(t.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                scope === t.id ? 'bg-[#1B2C4F] text-white' : 'bg-white text-[#1B2C4F] hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading insights…</p>}
      {error && <p className="text-sm text-red-600">Could not load operations insights.</p>}

      {data?.totals && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-medium">Sessions</p>
            <p className="text-2xl font-bold text-[#1B2C4F] mt-1">{data.totals.sessions}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-medium">Revenue (XAF)</p>
            <p className="text-2xl font-bold text-[#1B2C4F] mt-1">{money(data.totals.revenue)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-medium">Commission (XAF)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{money(data.totals.commission)}</p>
          </div>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Monthly revenue vs commission</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => money(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#1B2C4F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commission" name="Commission" fill="#4A6FBF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tutorChart.length > 0 && scope !== 'on' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Tutor revenue (offline periods)</h3>
          <GrowthRateBar data={tutorChart} />
        </div>
      )}

      {data?.records?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 px-4 py-3 border-b">Period records</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">Tutor</th>
                  <th className="px-4 py-2">Students</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Start</th>
                  <th className="px-4 py-2">State</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r: Record<string, unknown>, i: number) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-2">{String(r.tutorName)}</td>
                    <td className="px-4 py-2">{String(r.students)}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate">{String(r.location)}</td>
                    <td className="px-4 py-2">{String(r.startMonth)}</td>
                    <td className="px-4 py-2 capitalize">{String(r.state)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{money(Number(r.revenue))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
