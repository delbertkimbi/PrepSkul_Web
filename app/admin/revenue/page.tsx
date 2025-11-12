import { redirect } from 'next/navigation';
import { getServerSession, isAdmin, createServerSupabaseClient } from '@/lib/supabase-server';
import AdminNav from '../components/AdminNav';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default async function RevenuePage() {
  const user = await getServerSession();
  if (!user) redirect('/admin/login');
  const adminStatus = await isAdmin(user.id);
  if (!adminStatus) redirect('/admin/login');

  const supabase = await createServerSupabaseClient();

  // Fetch all session payments
  const { data: allPayments } = await supabase
    .from('session_payments')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate totals
  const completedPayments = allPayments?.filter(p => p.payment_status === 'paid') || [];
  const pendingPayments = allPayments?.filter(p => p.payment_status === 'pending') || [];
  const failedPayments = allPayments?.filter(p => p.payment_status === 'failed') || [];

  const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingRevenue = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const failedRevenue = failedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // This month's revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCompletedPayments = completedPayments.filter(
    p => new Date(p.created_at) >= startOfMonth
  );
  const monthlyRevenue = monthlyCompletedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Last month's revenue for comparison
  const startOfLastMonth = new Date();
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  startOfLastMonth.setDate(1);
  startOfLastMonth.setHours(0, 0, 0, 0);
  const endOfLastMonth = new Date(startOfMonth.getTime() - 1);

  const lastMonthCompletedPayments = completedPayments.filter(
    p => new Date(p.created_at) >= startOfLastMonth && new Date(p.created_at) <= endOfLastMonth
  );
  const lastMonthRevenue = lastMonthCompletedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Calculate growth
  const growthPercentage = lastMonthRevenue > 0 
    ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : '0';

  // Get recent payments with lesson and user info
  let recentPaymentsWithDetails = [];
  if (allPayments) {
    const recent = allPayments.slice(0, 10);
    recentPaymentsWithDetails = await Promise.all(
      recent.map(async (payment) => {
        const { data: payer } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', payment.payer_id)
          .single();

        let sessionInfo = null;
        if (payment.session_id) {
          // Try individual_sessions first
          const { data: individualSession } = await supabase
            .from('individual_sessions')
            .select('scheduled_date, scheduled_time')
            .eq('id', payment.session_id)
            .maybeSingle();
          
          if (individualSession) {
            sessionInfo = { ...individualSession, session_type: 'recurring' };
          } else {
            // Try trial_sessions
            const { data: trialSession } = await supabase
              .from('trial_sessions')
              .select('scheduled_date, scheduled_time')
              .eq('id', payment.session_id)
              .maybeSingle();
            if (trialSession) {
              sessionInfo = { ...trialSession, session_type: 'trial' };
            }
          }
        }

        return {
          ...payment,
          payer,
          session: sessionInfo,
        };
      })
    );
  }

  // Top tutors by earnings
  const tutorEarnings = new Map();
  for (const payment of completedPayments) {
    if (payment.session_id) {
      // Try individual_sessions first
      const { data: individualSession } = await supabase
        .from('individual_sessions')
        .select('tutor_id')
        .eq('id', payment.session_id)
        .maybeSingle();
      
      let tutorId = individualSession?.tutor_id;
      
      if (!tutorId) {
        // Try trial_sessions
        const { data: trialSession } = await supabase
          .from('trial_sessions')
          .select('tutor_id')
          .eq('id', payment.session_id)
          .maybeSingle();
        tutorId = trialSession?.tutor_id;
      }

      if (tutorId) {
        const current = tutorEarnings.get(tutorId) || 0;
        // Calculate 85% of payment amount (tutor earnings)
        const tutorEarning = Number(payment.amount || 0) * 0.85;
        tutorEarnings.set(tutorId, current + tutorEarning);
      }
    }
  }

  // Get tutor names for top earners
  const topTutors = Array.from(tutorEarnings.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  let topTutorsWithNames = [];
  for (const [tutorId, earnings] of topTutors) {
    const { data: tutor } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', tutorId)
      .single();

    topTutorsWithNames.push({
      tutorId,
      tutorName: tutor?.full_name || 'Unknown',
      earnings,
    });
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      case 'failed':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Financial overview and payment tracking</p>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Revenue</p>
                  <p className="text-3xl font-bold mt-2">{totalRevenue.toLocaleString()}</p>
                  <p className="text-sm opacity-75 mt-1">XAF</p>
                </div>
                <DollarSign size={48} className="opacity-75" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">This Month</p>
                {Number(growthPercentage) >= 0 ? (
                  <span className="text-green-600 text-xs font-medium">↑ {growthPercentage}%</span>
                ) : (
                  <span className="text-red-600 text-xs font-medium">↓ {Math.abs(Number(growthPercentage))}%</span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">XAF</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{pendingRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{pendingPayments.length} payments</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{failedRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{failedPayments.length} transactions</p>
            </div>
          </div>

          {/* Top Tutors */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Top Earning Tutors
            </h2>
            {topTutorsWithNames.length === 0 ? (
              <p className="text-gray-500 text-sm">No earnings data yet.</p>
            ) : (
              <div className="space-y-3">
                {topTutorsWithNames.map((tutor, index) => (
                  <div key={tutor.tutorId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{tutor.tutorName}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{tutor.earnings.toLocaleString()} XAF</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h2>
            <div className="space-y-3">
              {recentPaymentsWithDetails.length === 0 ? (
                <p className="text-gray-500 text-sm">No payments yet.</p>
              ) : (
                recentPaymentsWithDetails.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(payment.payment_status)}`}>
                          {getStatusIcon(payment.payment_status)}
                          {payment.payment_status?.charAt(0).toUpperCase() + payment.payment_status?.slice(1)}
                        </span>
                        {payment.session && (
                          <span className="text-sm text-gray-600">
                            {payment.session.session_type === 'trial' ? 'Trial' : 'Recurring'} Session
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {payment.payer?.full_name || 'Unknown'} • {payment.payer?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(payment.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{Number(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">XAF</p>
                      {payment.payment_method && (
                        <p className="text-xs text-gray-500 mt-1">{payment.payment_method}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


                        </span>
                        {payment.session && (
                          <span className="text-sm text-gray-600">
                            {payment.session.session_type === 'trial' ? 'Trial' : 'Recurring'} Session
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {payment.payer?.full_name || 'Unknown'} • {payment.payer?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(payment.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{Number(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">XAF</p>
                      {payment.payment_method && (
                        <p className="text-xs text-gray-500 mt-1">{payment.payment_method}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


                        </span>
                        {payment.session && (
                          <span className="text-sm text-gray-600">
                            {payment.session.session_type === 'trial' ? 'Trial' : 'Recurring'} Session
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">
                        {payment.payer?.full_name || 'Unknown'} • {payment.payer?.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(payment.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{Number(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">XAF</p>
                      {payment.payment_method && (
                        <p className="text-xs text-gray-500 mt-1">{payment.payment_method}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

