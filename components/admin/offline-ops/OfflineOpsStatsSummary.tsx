'use client';

import type { OfflineOpsRecord } from '@/app/admin/offline-ops/OfflineOpsListClient';

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

export default function OfflineOpsStatsSummary({ records }: { records: OfflineOpsRecord[] }) {
  const total = records.length;
  const active = records.filter((r) => r.onboarding_stage === 'active_sessions').length;
  const matched = records.filter((r) => r.onboarding_stage === 'matched').length;
  const leads = records.filter((r) => ['new_lead', 'qualified'].includes(r.onboarding_stage)).length;
  const paid = records.filter((r) => r.payment_status === 'paid').length;
  const revenue = records.reduce((s, r) => s + Number(r.amount_paid || 0), 0);

  const cards = [
    { label: 'Total records', value: String(total) },
    { label: 'Active sessions', value: String(active) },
    { label: 'Matched', value: String(matched) },
    { label: 'In pipeline', value: String(leads) },
    { label: 'Marked paid', value: String(paid) },
    { label: 'Amount recorded (XAF)', value: money(revenue) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-[#1B2C4F]/15 rounded-lg p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{c.label}</p>
          <p className="text-2xl font-bold text-[#1B2C4F] mt-2 tabular-nums">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
