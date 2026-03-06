import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Users, UserCheck, Clock, Ban, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { superAdminAPI } from '../../api/endpoints';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  TRIAL: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border border-red-500/20',
  EXPIRED: 'bg-slate-500/10 text-slate-400 border border-slate-600',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border border-slate-600',
};

export default function SuperAdminDashboard() {
  const { data: statsData } = useQuery({
    queryKey: ['super-admin-stats'],
    queryFn: () => superAdminAPI.getStats().then(r => r.data.data),
  });

  const { data: tenants } = useQuery({
    queryKey: ['super-admin-tenants'],
    queryFn: () => superAdminAPI.listTenants().then(r => r.data.data),
  });

  const stats = statsData || {};
  const recent = (tenants || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Platform Overview</h1>
        <p className="text-slate-400 text-sm mt-1">All clinics and usage across DPMS</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clinics" value={stats.totalTenants} icon={Building2} color="bg-indigo-500/20 text-indigo-400" />
        <StatCard label="Active" value={stats.activeTenants} icon={UserCheck} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard label="On Trial" value={stats.trialTenants} icon={Clock} color="bg-amber-500/20 text-amber-400" />
        <StatCard label="Suspended" value={stats.suspendedTenants} icon={Ban} color="bg-red-500/20 text-red-400" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-sky-500/20 text-sky-400" sub="Across all clinics" />
        <StatCard label="Total Patients" value={stats.totalPatients} icon={Activity} color="bg-purple-500/20 text-purple-400" sub="Across all clinics" />
      </div>

      {/* Recent tenants */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Recent Clinics</h2>
          <Link to="/super-admin/tenants" className="flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-800">
          {recent.length === 0 && (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">No clinics registered yet</div>
          )}
          {recent.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors">
              <div>
                <p className="text-white text-sm font-medium">{t.clinicName}</p>
                <p className="text-slate-400 text-xs mt-0.5">{t.email} · {t.city || t.country || '—'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-slate-300 text-xs">{t.userCount} users</p>
                  <p className="text-slate-500 text-xs">{t.patientCount} patients</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[t.status] || STATUS_BADGE.EXPIRED}`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
