import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, appointmentAPI } from '../../api/endpoints';
import {
  Calendar, Users, DollarSign, TrendingUp,
  AlertTriangle, FileText, Clock, Activity
} from 'lucide-react';
import { formatCurrency, formatDate, statusColors, cn } from '../../utils/helpers';
import StatsCard from '../../components/ui/StatsCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import useAuthStore from '../../store/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.get().then(r => r.data.data),
    refetchInterval: 60000,
  });

  const { data: todayAppts } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: () => appointmentAPI.today().then(r => r.data.data),
  });

  if (isLoading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const stats = dashData || {};

  const revenueData = [
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 }, { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Good morning, {user?.fullName?.split(' ')[0] || 'Doctor'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening at your clinic today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments ?? 0}
          subtitle="Scheduled for today"
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Patients Seen Today"
          value={stats.patientsSeenToday ?? 0}
          subtitle="Consultations completed"
          icon={Users}
          color="green"
        />
        <StatsCard
          title="Revenue Today"
          value={formatCurrency(stats.revenueToday ?? 0)}
          subtitle="Collected payments"
          icon={DollarSign}
          color="teal"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats.revenueThisMonth ?? 0)}
          subtitle="This month"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Outstanding"
          value={formatCurrency(stats.outstandingPayments ?? 0)}
          subtitle="Pending payments"
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Insurance Claims"
          value={stats.pendingInsuranceClaims ?? 0}
          subtitle="Pending approval"
          icon={FileText}
          color="red"
        />
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients ?? 0}
          subtitle={`${stats.activePatients ?? 0} active`}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems ?? 0}
          subtitle="Need reorder"
          icon={Activity}
          color="red"
        />
      </div>

      {/* Charts + Today's appointments */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [formatCurrency(val), 'Revenue']} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Queue</h3>
            <span className="badge bg-blue-50 text-blue-600">{todayAppts?.length || 0} total</span>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {(todayAppts || []).slice(0, 8).map((appt, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                  {appt.startTime?.slice(0, 5) || '--'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {appt.patient?.firstName} {appt.patient?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{appt.service?.name || appt.chiefComplaint || 'Consultation'}</p>
                </div>
                <Badge status={appt.status}>{appt.status?.charAt(0) + appt.status?.slice(1).toLowerCase()}</Badge>
              </div>
            ))}
            {(!todayAppts || todayAppts.length === 0) && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No appointments today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
