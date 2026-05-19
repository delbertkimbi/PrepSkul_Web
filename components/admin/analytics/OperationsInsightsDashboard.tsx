'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COMMISSION_RATE, TUTOR_EARNINGS_RATE } from '@/lib/offline-ops-constants';

type Scope = 'on' | 'off' | 'combined';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => {
  if (!r.ok) throw new Error('Failed to load operations insights');
  return r.json();
});

function money(n: number) {
  return Number(n || 0).toLocaleString();
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
              rows.map((row, i) => (
                <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                  <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">{row.month}</td>
                  <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                    <TutorNamesDropdown names={row.tutorNames} />
                  </td>
                  <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">{money(row.revenue)}</td>
                  <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">{money(row.commission)}</td>
                  <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">{money(row.tutorShare)}</td>
                  <td className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">{row.studentCount}</td>
                </tr>
              ))
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
}: {
  title: string;
  headers: string[];
  rows: (string | number)[][];
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
              rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-slate-800 border-t border-slate-100 whitespace-nowrap">
                      {typeof cell === 'number' ? money(cell) : cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function OperationsInsightsDashboard() {
  const [scope, setScope] = useState<Scope>('off');
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

  const tutorRows =
    data?.tutorSummary?.map((t: Record<string, unknown>) => [
      String(t.tutorName),
      String(t.totalSessions),
      money(Number(t.totalRevenueXaf)),
      money(Number(t.prepskulProfit)),
      money(Number(t.tutorEarnings)),
      String(t.state),
    ]) || [];

  const monthlyRows =
    data?.monthlySummary?.map((m: Record<string, unknown>) => ({
      month: String(m.month),
      tutorNames: normalizeTutorNames(m.tutorNames ?? m.tutorInitials ?? ''),
      revenue: Number(m.revenue || 0),
      commission: Number(m.commission || 0),
      tutorShare: Number(m.tutorShare || 0),
      studentCount: Number(m.studentCount || 0),
    })) || [];

  const grandRows = data?.grandTotals
    ? [
        ['Sessions revenue', money(Number(data.grandTotals.sessionsRevenue))],
        ['PrepSkul profit (' + commissionPct + '%)', money(Number(data.grandTotals.prepskulProfit))],
        ['Tutor earnings (' + tutorPct + '%)', money(Number(data.grandTotals.tutorEarnings))],
        ['Total learner payments', money(Number(data.grandTotals.totalRevenue))],
      ]
    : [];

  return (
    <section className="mt-10 border-t border-gray-200 pt-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1B2C4F]">Operations insights</h2>
          <p className="text-sm text-gray-600 mt-1">
            Offline revenue totals include historical imports. Active live operations still drive current-state totals; admins control operation state on the detail page.
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

      {totals && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Sessions tracked', value: totals.sessions },
            { label: 'Learner payments (XAF)', value: money(totals.revenue) },
            { label: `PrepSkul profit (${commissionPct}%)`, value: money(totals.commission) },
            { label: `Tutor earnings (${tutorPct}%)`, value: money(totals.tutorEarnings ?? Math.round(totals.revenue * TUTOR_EARNINGS_RATE)) },
          ].map((c) => (
            <div key={c.label} className="bg-white border border-[#1B2C4F]/15 rounded-lg p-4 shadow-sm">
              <p className="text-xs uppercase text-slate-500 font-medium">{c.label}</p>
              <p className="text-xl font-bold text-[#1B2C4F] mt-1 tabular-nums">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {scope !== 'on' && (
        <OpsTable
          title="Offline operations (by period)"
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

      {scope !== 'on' && tutorRows.length > 0 && (
        <OpsTable
          title="Tutor summary"
          headers={['Tutor', 'Total sessions', 'Revenue', 'PrepSkul profit', 'Tutor earnings', 'State']}
          rows={tutorRows}
        />
      )}

      {monthlyRows.length > 0 && <MonthlySummaryTable rows={monthlyRows} />}

      {grandRows.length > 0 && scope === 'off' && (
        <OpsTable title="Grand totals (offline)" headers={['Item', 'Amount (XAF)']} rows={grandRows} />
      )}
    </section>
  );
}
