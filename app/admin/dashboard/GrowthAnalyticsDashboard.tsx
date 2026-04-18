'use client';

import useSWR from 'swr';
import MetricCard from '@/components/dashboard/MetricCard';
import TabsNavigation from '@/components/dashboard/TabsNavigation';
import ActivityTable from '@/components/dashboard/ActivityTable';
import {
  AreaActivityChart,
  GrowthRateBar,
  LineGrowthChart,
  PaymentStatusChart,
} from '@/components/dashboard/GrowthChart';
import { useMemo, useState } from 'react';

type DashboardTab = 'overview' | 'users' | 'logins' | 'sessions' | 'payments' | 'growth';

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
};

function EmptyState() {
  return <p className="text-sm text-gray-500">No data available yet.</p>;
}

export default function GrowthAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const users = useSWR('/api/admin/analytics/users', fetcher, { refreshInterval: 30000 });
  const logins = useSWR('/api/admin/analytics/logins', fetcher, { refreshInterval: 30000 });
  const sessions = useSWR('/api/admin/analytics/sessions', fetcher, { refreshInterval: 30000 });
  const payments = useSWR('/api/admin/analytics/payments', fetcher, { refreshInterval: 30000 });
  const growth = useSWR('/api/admin/analytics/growth', fetcher, { refreshInterval: 30000 });

  const loading = users.isLoading || logins.isLoading || sessions.isLoading || payments.isLoading || growth.isLoading;

  const hasError = users.error || logins.error || sessions.error || payments.error || growth.error;

  const growthRateCards = useMemo(() => {
    if (!growth.data?.growth) return [];
    return [
      { name: 'User growth', value: growth.data.growth.users.rate },
      { name: 'Session growth', value: growth.data.growth.sessions.rate },
      { name: 'Revenue growth', value: growth.data.growth.revenue.rate },
    ];
  }, [growth.data]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Growth Analytics Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Monitor platform users, login activity, sessions, payments, and growth trends.
        </p>
        <a
          href="/admin/offline-ops/new"
          className="inline-block mt-3 text-sm font-medium text-[#1B2C4F] hover:text-[#4A6FBF]"
        >
          + Add offline operations record
        </a>
      </div>

      <TabsNavigation active={activeTab} onChange={(next) => setActiveTab(next)} />

      {loading && <p className="text-sm text-gray-500">Loading metrics...</p>}

      {hasError && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
          Some analytics data could not be loaded right now. Please refresh.
        </div>
      )}

      {!loading && activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Total Users" value={users.data?.totals?.totalUsers ?? 0} />
            <MetricCard title="Total Sessions Booked" value={sessions.data?.totals?.totalBooked ?? 0} />
            <MetricCard title="Completed Payments" value={payments.data?.totals?.completedPayments ?? 0} />
            <MetricCard
              title="Weekly User Growth"
              value={`${users.data?.growth?.weeklyGrowthRate ?? 0}%`}
              trend={users.data?.growth?.weeklyGrowthRate ?? 0}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">User growth (last 30 days)</h3>
              {users.data?.charts?.dailySignupsLast30Days?.length ? (
                <LineGrowthChart data={users.data.charts.dailySignupsLast30Days} />
              ) : (
                <EmptyState />
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Login activity (last 30 days)</h3>
              {logins.data?.charts?.dailyLoginsLast30Days?.length ? (
                <AreaActivityChart data={logins.data.charts.dailyLoginsLast30Days} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Total users" value={users.data?.totals?.totalUsers ?? 0} />
            <MetricCard title="Tutors" value={users.data?.totals?.totalTutors ?? 0} />
            <MetricCard title="Parents" value={users.data?.totals?.totalParents ?? 0} />
            <MetricCard title="Students" value={users.data?.totals?.totalStudents ?? 0} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ActivityTable
              title="Signup periods"
              rows={[
                { label: 'Daily signups', value: users.data?.signups?.daily ?? 0 },
                { label: 'Weekly signups', value: users.data?.signups?.weekly ?? 0 },
                { label: 'Monthly signups', value: users.data?.signups?.monthly ?? 0 },
                { label: 'Yearly signups', value: users.data?.signups?.yearly ?? 0 },
              ]}
            />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">User growth line chart</h3>
              {users.data?.charts?.dailySignupsLast30Days?.length ? (
                <LineGrowthChart data={users.data.charts.dailySignupsLast30Days} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
          <ActivityTable
            title="On-platform vs off-platform users"
            rows={[
              {
                label: 'On-platform users',
                value: users.data?.platformBreakdown?.onPlatform?.totalUsers ?? 0,
              },
              {
                label: 'Off-platform users',
                value: users.data?.platformBreakdown?.offPlatform?.totalUsers ?? 0,
              },
            ]}
          />
        </div>
      )}

      {!loading && activeTab === 'logins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Logins today" value={logins.data?.logins?.daily ?? 0} />
            <MetricCard title="Logins this week" value={logins.data?.logins?.weekly ?? 0} />
            <MetricCard title="Logins this month" value={logins.data?.logins?.monthly ?? 0} />
            <MetricCard title="Logins this year" value={logins.data?.logins?.yearly ?? 0} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ActivityTable
              title="Active users"
              rows={[
                { label: 'DAU', value: logins.data?.activeUsers?.dau ?? 0 },
                { label: 'WAU', value: logins.data?.activeUsers?.wau ?? 0 },
                { label: 'MAU', value: logins.data?.activeUsers?.mau ?? 0 },
              ]}
            />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Login activity chart</h3>
              {logins.data?.charts?.dailyLoginsLast30Days?.length ? (
                <AreaActivityChart data={logins.data.charts.dailyLoginsLast30Days} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Total booked" value={sessions.data?.totals?.totalBooked ?? 0} />
            <MetricCard title="Pending tutor approval" value={sessions.data?.totals?.pendingTutorApproval ?? 0} />
            <MetricCard title="Approved sessions" value={sessions.data?.totals?.approved ?? 0} />
            <MetricCard title="Completed sessions" value={sessions.data?.totals?.completed ?? 0} />
          </div>
          <ActivityTable
            title="Session periods"
            rows={[
              { label: 'Daily', value: sessions.data?.periods?.daily ?? 0 },
              { label: 'Weekly', value: sessions.data?.periods?.weekly ?? 0 },
              { label: 'Monthly', value: sessions.data?.periods?.monthly ?? 0 },
              { label: 'Yearly', value: sessions.data?.periods?.yearly ?? 0 },
            ]}
          />
          <ActivityTable
            title="On-platform vs off-platform sessions"
            rows={[
              {
                label: 'On-platform booked',
                value: sessions.data?.platformBreakdown?.onPlatform?.totalBooked ?? 0,
              },
              {
                label: 'Off-platform booked',
                value: sessions.data?.platformBreakdown?.offPlatform?.totalBooked ?? 0,
              },
              {
                label: 'On-platform completed',
                value: sessions.data?.platformBreakdown?.onPlatform?.completed ?? 0,
              },
              {
                label: 'Off-platform completed',
                value: sessions.data?.platformBreakdown?.offPlatform?.completed ?? 0,
              },
            ]}
          />
        </div>
      )}

      {!loading && activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Completed payments" value={payments.data?.totals?.completedPayments ?? 0} />
            <MetricCard title="Failed payments" value={payments.data?.totals?.failedPayments ?? 0} />
            <MetricCard title="Pending payments" value={payments.data?.totals?.pendingPayments ?? 0} />
            <MetricCard title="Monthly payment volume" value={`${(payments.data?.volume?.monthly ?? 0).toLocaleString()} XAF`} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ActivityTable
              title="Real vs sandbox payments"
              rows={[
                {
                  label: 'Real transactions',
                  value: `${payments.data?.environmentBreakdown?.real?.transactions ?? 0} (${(payments.data?.environmentBreakdown?.real?.volume ?? 0).toLocaleString()} XAF)`,
                },
                {
                  label: 'Sandbox transactions',
                  value: `${payments.data?.environmentBreakdown?.sandbox?.transactions ?? 0} (${(payments.data?.environmentBreakdown?.sandbox?.volume ?? 0).toLocaleString()} XAF)`,
                },
                {
                  label: 'Real completed',
                  value: payments.data?.environmentBreakdown?.real?.completedPayments ?? 0,
                },
                {
                  label: 'Sandbox completed',
                  value: payments.data?.environmentBreakdown?.sandbox?.completedPayments ?? 0,
                },
              ]}
            />
            <ActivityTable
              title="On-platform vs off-platform payments"
              rows={[
                {
                  label: 'On-platform transactions',
                  value: `${payments.data?.platformBreakdown?.onPlatform?.transactions ?? 0} (${(payments.data?.platformBreakdown?.onPlatform?.volume ?? 0).toLocaleString()} XAF)`,
                },
                {
                  label: 'Off-platform transactions',
                  value: `${payments.data?.platformBreakdown?.offPlatform?.transactions ?? 0} (${(payments.data?.platformBreakdown?.offPlatform?.volume ?? 0).toLocaleString()} XAF)`,
                },
                {
                  label: 'On-platform completed',
                  value: payments.data?.platformBreakdown?.onPlatform?.completedPayments ?? 0,
                },
                {
                  label: 'Off-platform completed',
                  value: payments.data?.platformBreakdown?.offPlatform?.completedPayments ?? 0,
                },
              ]}
            />
            <ActivityTable
              title="Status by environment"
              rows={[
                {
                  label: 'Real failed / pending',
                  value: `${payments.data?.environmentBreakdown?.real?.failedPayments ?? 0} / ${payments.data?.environmentBreakdown?.real?.pendingPayments ?? 0}`,
                },
                {
                  label: 'Sandbox failed / pending',
                  value: `${payments.data?.environmentBreakdown?.sandbox?.failedPayments ?? 0} / ${payments.data?.environmentBreakdown?.sandbox?.pendingPayments ?? 0}`,
                },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ActivityTable
              title="Payment volume"
              rows={[
                { label: 'Daily volume', value: `${(payments.data?.volume?.daily ?? 0).toLocaleString()} XAF` },
                { label: 'Weekly volume', value: `${(payments.data?.volume?.weekly ?? 0).toLocaleString()} XAF` },
                { label: 'Monthly volume', value: `${(payments.data?.volume?.monthly ?? 0).toLocaleString()} XAF` },
                { label: 'Yearly volume', value: `${(payments.data?.volume?.yearly ?? 0).toLocaleString()} XAF` },
              ]}
            />
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Payment success vs failure</h3>
              {payments.data?.charts?.statusBreakdown?.length ? (
                <PaymentStatusChart data={payments.data.charts.statusBreakdown} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'growth' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <MetricCard title="User growth rate" value={`${growth.data?.growth?.users?.rate ?? 0}%`} trend={growth.data?.growth?.users?.rate ?? 0} />
            <MetricCard title="Session growth rate" value={`${growth.data?.growth?.sessions?.rate ?? 0}%`} trend={growth.data?.growth?.sessions?.rate ?? 0} />
            <MetricCard title="Revenue growth rate" value={`${growth.data?.growth?.revenue?.rate ?? 0}%`} trend={growth.data?.growth?.revenue?.rate ?? 0} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Growth rate chart</h3>
            {growthRateCards.length ? <GrowthRateBar data={growthRateCards} /> : <EmptyState />}
          </div>
        </div>
      )}
    </div>
  );
}
