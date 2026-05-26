'use client';

import useSWR from 'swr';
import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { COMMISSION_RATE, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';

type Scope = 'on' | 'off' | 'combined';
type ViewMode = 'tables' | 'charts';

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((r) => {
    if (!r.ok) throw new Error('Failed to load operations insights');
    return r.json();
  });

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

function formatMonthLabel(monthKey: string) {
  if (!monthKey || monthKey.length < 7) return monthKey;
  const [y, m] = monthKey.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function normalizeTutorNames(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((part) => part.trim()).filter(Boolean);
  }
  return [];
}

function TutorNamesDropdown({ names }: { names: string[] }) {
  const [open, setOpen] = useState(false);
  const clean = names.filter(Boolean);
  if (!clean.length) return <span>—</span>;
  if (clean.length === 1) return <span>{clean[0]}</span>;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-[#1B2C4F]/20 bg-white px-2 py-1 text-xs font-medium text-[#1B2C4F] hover:bg-slate-50"
      >
        {clean.length} tutors
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 min-w-[180px] rounded-md border border-slate-200 bg-white p-2 shadow-lg">
          <ul className="space-y-1 text-xs text-slate-700">
            {clean.map((name) => (
              <li key={name} className="px-1 py-0.5">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function MonthlySummaryTable({
  rows,
}: {
  rows: Array<{
    month: string;
    tutorNames: string[];
    revenue: number;
    commission: number;
    tutorShare: number;
    studentCount: number;
  }>;
}) {
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCommission = rows.reduce((s, r) => s + r.commission, 0);
  const totalTutor = rows.reduce((s, r) => s + r.tutorShare, 0);
  const totalStudents = rows.reduce((s, r) => s + r.studentCount, 0);

  return (
    <div className="bg-white border border-[#1B2C4F]/15 rounded-lg overflow-hidden shadow-sm">
      <h3 className="text-sm font-bold text-white bg-[#1B2C4F] px-4 py-3">Monthly summary</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#2d4a3e] text-left text-xs uppercase text-white">
              {['Month', 'Tutors', 'Revenue', 'PrepSkul profit', 'Tutor earnings', 'Students'].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No data for this view yet.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row, i) => (
                  <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                    <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      {formatMonthLabel(row.month)}
                    </td>
                    <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      <TutorNamesDropdown names={row.tutorNames} />
                    </td>
                    <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      {money(row.revenue)}
                    </td>
                    <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      {money(row.commission)}
                    </td>
                    <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      {money(row.tutorShare)}
                    </td>
                    <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      {row.studentCount}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#1B2C4F]/8 font-semibold">
                  <td className="px-3 py-2 border-t border-slate-200">Total</td>
                  <td className="px-3 py-2 border-t border-slate-200">—</td>
                  <td className="px-3 py-2 border-t border-slate-200">{money(totalRevenue)}</td>
                  <td className="px-3 py-2 border-t border-slate-200">{money(totalCommission)}</td>
                  <td className="px-3 py-2 border-t border-slate-200">{money(totalTutor)}</td>
                  <td className="px-3 py-2 border-t border-slate-200">{totalStudents}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpsTable({
  title,
  headers,
  rows,
  footerRow,
}: {
  title: string;
  headers: string[];
  rows: (string | number | ReactNode)[][];
  footerRow?: (string | number | ReactNode)[];
}) {
  return (
    <div className="bg-white border border-[#1B2C4F]/15 rounded-lg overflow-hidden shadow-sm">
      <h3 className="text-sm font-bold text-white bg-[#1B2C4F] px-4 py-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#2d4a3e] text-left text-xs uppercase text-white">
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-6 text-center text-slate-500">
                  No data for this view yet.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                        {typeof cell === 'number' ? money(cell) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
                {footerRow && (
                  <tr className="bg-[#1B2C4F]/8 font-semibold">
                    {footerRow.map((cell, j) => (
                      <td key={j} className="px-3 py-2 border-t border-slate-200 whitespace-nowrap">
                        {typeof cell === 'number' ? money(cell) : cell}
                      </td>
                    ))}
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlyCharts({
  rows,
}: {
  rows: Array<{ month: string; revenue: number; commission: number; studentCount: number }>;
}) {
  const chartData = rows.map((r) => ({
    month: formatMonthLabel(r.month),
    revenue: r.revenue,
    profit: r.commission,
    students: r.studentCount,
  }));

  if (!chartData.length) {
    return <p className="text-sm text-slate-500">No monthly data to chart yet.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="bg-white border border-[#1B2C4F]/15 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#1B2C4F] mb-4">Revenue &amp; PrepSkul profit by month</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => money(v)} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#4A6FBF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="PrepSkul profit" fill="#1B2C4F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white border border-[#1B2C4F]/15 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-bold text-[#1B2C4F] mb-4">Students by month</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" name="Students" stroke="#eab308" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function TutorPerformanceChart({
  rows,
}: {
  rows: Array<{ tutorName: string; totalSessions: number; totalRevenueXaf: number }>;
}) {
  const chartData = rows
    .slice()
    .sort((a, b) => b.totalRevenueXaf - a.totalRevenueXaf)
    .slice(0, 12)
    .map((t) => ({
      name: t.tutorName.length > 14 ? `${t.tutorName.slice(0, 12)}…` : t.tutorName,
      sessions: t.totalSessions,
      revenue: t.totalRevenueXaf,
    }));

  if (!chartData.length) return null;

  return (
    <div className="bg-white border border-[#1B2C4F]/15 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-bold text-[#1B2C4F] mb-4">Tutor performance (top by revenue)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => money(v)} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue (XAF)" fill="#c53030" radius={[0, 4, 4, 0]} />
            <Bar dataKey="sessions" name="Sessions" fill="#4A6FBF" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function OperationsInsightsDashboard() {
  const [scope, setScope] = useState<Scope>('off');
  const [viewMode, setViewMode] = useState<ViewMode>('tables');
  const { data, error, isLoading } = useSWR(`/api/admin/analytics/operations-insights?scope=${scope}`, fetcher, {
    refreshInterval: 60000,
  });

  const tabs: { id: Scope; label: string }[] = [
    { id: 'off', label: 'Off-platform' },
    { id: 'on', label: 'On-platform' },
    { id: 'combined', label: 'Combined' },
  ];

  const totals = data?.totals;
  const commissionPct = Math.round(COMMISSION_RATE * 100);
  const tutorPct = Math.round(TUTOR_EARNINGS_RATE * 100);

  const periodRows =
    data?.records?.map((r: Record<string, unknown>) => [
      String(r.tutorName),
      String(r.parentName || '—'),
      String(r.students),
      String(r.sessionsPerWeek ?? '—'),
      String(r.location || '—'),
      money(Number(r.payPerMonth)),
      String(r.payMonths),
      String(r.startMonth),
      String(r.state),
      money(Number(r.revenue)),
      money(Number(r.prepskulProfit)),
      money(Number(r.tutorEarnings)),
    ]) || [];

  const tutorSummaryRaw =
    data?.tutorSummary?.map((t: Record<string, unknown>) => ({
      tutorName: String(t.tutorName),
      totalSessions: Number(t.totalSessions),
      totalRevenueXaf: Number(t.totalRevenueXaf),
      prepskulProfit: Number(t.prepskulProfit),
      tutorEarnings: Number(t.tutorEarnings),
      state: String(t.state),
    })) || [];

  const tutorRows = tutorSummaryRaw.map((t) => [
    t.tutorName,
    t.totalSessions,
    t.totalRevenueXaf,
    t.prepskulProfit,
    t.tutorEarnings,
    t.state,
  ]);

  const tutorFooter: (string | number)[] | undefined = tutorRows.length
    ? [
        'Total',
        tutorSummaryRaw.reduce((s, t) => s + t.totalSessions, 0),
        tutorSummaryRaw.reduce((s, t) => s + t.totalRevenueXaf, 0),
        tutorSummaryRaw.reduce((s, t) => s + t.prepskulProfit, 0),
        tutorSummaryRaw.reduce((s, t) => s + t.tutorEarnings, 0),
        '—',
      ]
    : undefined;

  const monthlyRows =
    data?.monthlySummary?.map((m: Record<string, unknown>) => ({
      month: String(m.month),
      tutorNames: normalizeTutorNames(m.tutorNames ?? m.tutorInitials ?? ''),
      revenue: Number(m.revenue || 0),
      commission: Number(m.commission || 0),
      tutorShare: Number(m.tutorShare || 0),
      studentCount: Number(m.studentCount || 0),
    })) || [];

  const grandTotals = data?.grandTotals;
  const grandRows = grandTotals
    ? [
        ['Sessions revenue', money(Number(grandTotals.sessionsRevenue))],
        [`PrepSkul profit (${commissionPct}%)`, money(Number(grandTotals.prepskulProfit))],
        [`Tutor earnings (${tutorPct}%)`, money(Number(grandTotals.tutorEarnings))],
        ['Total learner payments', money(Number(grandTotals.totalRevenue))],
      ]
    : [];

  const showOfflineTables = scope !== 'on';

  return (
    <section className="mt-10 border-t border-gray-200 pt-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1B2C4F]">Operations insights</h2>
          <p className="text-sm text-gray-600 mt-1">
            Revenue, tutors, and monthly trends. Historical imports count toward offline totals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <div className="flex rounded-lg border border-slate-300 overflow-hidden">
            {(['tables', 'charts'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm font-medium capitalize ${
                  viewMode === mode ? 'bg-slate-700 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading insights…</p>}
      {error && <p className="text-sm text-red-600">Could not load operations insights.</p>}

      {totals && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Sessions tracked', value: totals.sessions },
            { label: 'Learner payments (XAF)', value: money(totals.revenue) },
            { label: `PrepSkul profit (${commissionPct}%)`, value: money(totals.commission) },
            {
              label: `Tutor earnings (${tutorPct}%)`,
              value: money(totals.tutorEarnings ?? Math.round(totals.revenue * TUTOR_EARNINGS_RATE)),
            },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-[#1B2C4F]/15 rounded-lg p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-500 font-medium">{c.label}</p>
              <p className="text-xl font-bold text-[#1B2C4F] mt-1 tabular-nums">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'charts' ? (
        <div className="space-y-6">
          <MonthlyCharts rows={monthlyRows} />
          {tutorSummaryRaw.length > 0 && <TutorPerformanceChart rows={tutorSummaryRaw} />}
        </div>
      ) : (
        <>
          {showOfflineTables && (
            <OpsTable
              title={scope === 'combined' ? 'All operations (by period)' : 'Offline operations (by period)'}
              headers={[
                'Tutor',
                'Parent',
                'Student(s)',
                'Sessions/wk',
                'Location',
                'Pay/mo (XAF)',
                'Pay months',
                'Start',
                'State',
                'Revenue',
                'PrepSkul profit',
                'Tutor earnings',
              ]}
              rows={periodRows}
            />
          )}

          {tutorRows.length > 0 && (
            <OpsTable
              title="Tutor summary"
              headers={['Tutor', 'Total sessions', 'Revenue', 'PrepSkul profit', 'Tutor earnings', 'State']}
              rows={tutorRows}
              footerRow={tutorFooter}
            />
          )}

          {monthlyRows.length > 0 && <MonthlySummaryTable rows={monthlyRows} />}

          {grandRows.length > 0 && (
            <OpsTable title={`Grand totals (${scope})`} headers={['Item', 'Amount (XAF)']} rows={grandRows} />
          )}
        </>
      )}
    </section>
  );
}
