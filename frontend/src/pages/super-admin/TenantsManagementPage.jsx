import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Search, Building2, Users, Activity, Clock, CheckCircle, XCircle,
  MoreVertical, RefreshCw, Trash2, ChevronDown, Mail, Phone, MapPin, X
} from 'lucide-react';
import { superAdminAPI } from '../../api/endpoints';

const STATUS_OPTIONS = ['ALL', 'TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED'];

const STATUS_BADGE = {
  TRIAL: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border border-red-500/20',
  EXPIRED: 'bg-slate-500/10 text-slate-400 border border-slate-600',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border border-slate-600',
};

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, danger }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${danger ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function TenantDetailModal({ tenant, onClose }) {
  if (!tenant) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold">{tenant.clinicName}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Status</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[tenant.status]}`}>{tenant.status}</span>
          </div>
          {[
            { label: 'Owner', value: tenant.ownerName },
            { label: 'Email', value: tenant.email, icon: Mail },
            { label: 'Phone', value: tenant.phone, icon: Phone },
            { label: 'Location', value: [tenant.city, tenant.country].filter(Boolean).join(', ') || '—', icon: MapPin },
            { label: 'Plan', value: tenant.subscriptionPlan || 'N/A' },
            { label: 'Trial End', value: tenant.trialEndDate || '—' },
            { label: 'Subscription Start', value: tenant.subscriptionStartDate || '—' },
            { label: 'Subscription End', value: tenant.subscriptionEndDate || '—' },
            { label: 'Registered', value: tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{label}</span>
              <span className="text-white text-sm">{value}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{tenant.userCount}</p>
              <p className="text-slate-400 text-xs">Staff Users</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{tenant.patientCount}</p>
              <p className="text-slate-400 text-xs">Patients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionMenu({ tenant, onStatusChange, onExtendTrial, onDelete }) {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'Activate', value: 'ACTIVE', show: tenant.status !== 'ACTIVE' },
    { label: 'Suspend', value: 'SUSPENDED', show: tenant.status !== 'SUSPENDED', danger: true },
    { label: 'Mark Expired', value: 'EXPIRED', show: tenant.status !== 'EXPIRED', danger: true },
    { label: 'Extend Trial (+7 days)', action: onExtendTrial, show: true },
    { label: 'Delete Tenant', action: onDelete, show: true, danger: true },
  ].filter(a => a.show);

  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 min-w-44 overflow-hidden">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={() => {
                  setOpen(false);
                  if (a.value) onStatusChange(a.value);
                  else a.action();
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${a.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300 hover:bg-slate-700'}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TenantsManagementPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, tenant, value }
  const qc = useQueryClient();

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['super-admin-tenants'],
    queryFn: () => superAdminAPI.listTenants().then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => superAdminAPI.updateStatus(id, status),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['super-admin-tenants']); qc.invalidateQueries(['super-admin-stats']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update status'),
  });

  const extendMutation = useMutation({
    mutationFn: (id) => superAdminAPI.extendTrial(id, 7),
    onSuccess: () => { toast.success('Trial extended by 7 days'); qc.invalidateQueries(['super-admin-tenants']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to extend trial'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => superAdminAPI.deleteTenant(id),
    onSuccess: () => { toast.success('Tenant deleted'); qc.invalidateQueries(['super-admin-tenants']); qc.invalidateQueries(['super-admin-stats']); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete tenant'),
  });

  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'status') statusMutation.mutate({ id: confirm.tenant.id, status: confirm.value });
    if (confirm.type === 'extend') extendMutation.mutate(confirm.tenant.id);
    if (confirm.type === 'delete') deleteMutation.mutate(confirm.tenant.id);
    setConfirm(null);
  };

  const filtered = tenants.filter(t => {
    const matchSearch = !search ||
      t.clinicName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.ownerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white text-2xl font-bold">Tenant Management</h1>
        <p className="text-slate-400 text-sm mt-1">{tenants.length} clinic{tenants.length !== 1 ? 's' : ''} registered</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clinics, owners, emails..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-500">Loading tenants...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No clinics found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinic</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Trial / Plan</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Users</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Patients</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors cursor-pointer" onClick={() => setSelectedTenant(t)}>
                    <td className="px-5 py-3.5">
                      <p className="text-white text-sm font-medium">{t.clinicName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{t.ownerName}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-slate-300 text-sm">{t.email}</p>
                      <p className="text-slate-500 text-xs">{t.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {t.trialEndDate ? (
                        <p className="text-slate-300 text-sm">Trial ends {t.trialEndDate}</p>
                      ) : t.subscriptionPlan ? (
                        <p className="text-slate-300 text-sm">{t.subscriptionPlan}</p>
                      ) : (
                        <p className="text-slate-600 text-sm">—</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-white text-sm">{t.userCount}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-white text-sm">{t.patientCount}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[t.status] || STATUS_BADGE.EXPIRED}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        tenant={t}
                        onStatusChange={(status) => setConfirm({ type: 'status', tenant: t, value: status })}
                        onExtendTrial={() => setConfirm({ type: 'extend', tenant: t })}
                        onDelete={() => setConfirm({ type: 'delete', tenant: t })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TenantDetailModal tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />

      <ConfirmModal
        isOpen={!!confirm}
        title={
          confirm?.type === 'delete' ? 'Delete Tenant' :
          confirm?.type === 'extend' ? 'Extend Trial' :
          `Set Status: ${confirm?.value}`
        }
        message={
          confirm?.type === 'delete'
            ? `Permanently delete "${confirm?.tenant?.clinicName}" and all its data? This cannot be undone.`
            : confirm?.type === 'extend'
            ? `Extend trial for "${confirm?.tenant?.clinicName}" by 7 days?`
            : `Change status of "${confirm?.tenant?.clinicName}" to ${confirm?.value}?`
        }
        danger={confirm?.type === 'delete' || confirm?.value === 'SUSPENDED'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
