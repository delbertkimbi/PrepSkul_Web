'use client';

import useSWR from 'swr';
import MetricCard from '@/components/dashboard/MetricCard';

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

export default function GrowthAnalyticsDashboard() {
  const users = useSWR('/api/admin/analytics/users', fetcher, { refreshInterval: 30000 });
  const sessions = useSWR('/api/admin/analytics/sessions', fetcher, { refreshInterval: 30000 });
  const payments = useSWR('/api/admin/analytics/payments', fetcher, { refreshInterval: 30000 });

  const loading = users.isLoading || sessions.isLoading || payments.isLoading;
  const hasError = users.error || sessions.error || payments.error;

  const offlinePaid = payments.data?.totals?.offlineCompletedPayments ?? 0;
  const offlineVolume = payments.data?.volume?.offlineYearly ?? 0;
  const sandboxFapshi = payments.data?.totals?.sandboxFapshiPayments ?? 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics overview</h1>
        <p className="text-sm text-gray-600 mt-1">
          Fapshi totals are production only. Offline includes enrollments and offline-linked session
          checkouts. Sandbox/test Fapshi is excluded from headline counts.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading metrics…</p>}

      {hasError && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
          Some analytics data could not be loaded right now. Please refresh.
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <MetricCard title="Total users" value={users.data?.totals?.totalUsers ?? 0} />
          <MetricCard title="Total sessions booked" value={sessions.data?.totals?.totalBooked ?? 0} />
          <MetricCard
            title="On-platform Fapshi (production)"
            value={payments.data?.totals?.completedPayments ?? 0}
          />
          <MetricCard title="Offline payments (production)" value={offlinePaid} />
          <MetricCard
            title="Offline revenue (production XAF)"
            value={money(offlineVolume)}
          />
          {(payments.data?.totals?.bookingPaymentsPaid ?? 0) > 0 && (
            <MetricCard
              title="Booking Fapshi (production)"
              value={payments.data?.totals?.bookingPaymentsPaid ?? 0}
            />
          )}
          {sandboxFapshi > 0 && (
            <MetricCard
              title="Fapshi sandbox (excluded)"
              value={sandboxFapshi}
            />
          )}
          <MetricCard
            title="Weekly user growth"
            value={`${users.data?.growth?.weeklyGrowthRate ?? 0}%`}
            trend={users.data?.growth?.weeklyGrowthRate ?? 0}
          />
        </div>
      )}
    </div>
  );
}
