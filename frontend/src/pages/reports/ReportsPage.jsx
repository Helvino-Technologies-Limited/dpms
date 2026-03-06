import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Download, Filter } from 'lucide-react';
import api from '../../api/axios';
import { patientAPI } from '../../api/endpoints';
import { formatCurrency, formatDate } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#6366f1'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('financial');
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard-report'],
    queryFn: () => api.get('/dashboard').then(r => r.data.data),
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices-report'],
    queryFn: () => api.get('/invoices', { params: { page: 0, size: 200 } }).then(r => r.data.data.content),
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments-report'],
    queryFn: () => api.get('/appointments', { params: { page: 0, size: 200 } }).then(r => r.data.data.content),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-report'],
    queryFn: () => patientAPI.list({ size: 200 }).then(r => r.data.data.content),
  });

  const { data: staff } = useQuery({
    queryKey: ['staff-report'],
    queryFn: () => api.get('/staff').then(r => r.data.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services-report'],
    queryFn: () => api.get('/services').then(r => r.data.data),
  });

  // Build monthly revenue data from invoices
  const monthlyRevenue = (() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { month: format(d, 'MMM yyyy'), key: format(d, 'yyyy-MM'), revenue: 0, invoices: 0 };
    });
    (invoices || []).forEach(inv => {
      if (!inv.invoiceDate) return;
      const key = inv.invoiceDate.slice(0, 7);
      const m = months.find(m => m.key === key);
      if (m) {
        m.revenue += Number(inv.amountPaid || 0);
        m.invoices += 1;
      }
    });
    return months;
  })();

  // Payment method breakdown
  const paymentBreakdown = (() => {
    const map = {};
    (invoices || []).forEach(inv => {
      const method = inv.paymentMethod || 'UNKNOWN';
      map[method] = (map[method] || 0) + Number(inv.amountPaid || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  })();

  // Invoice status breakdown
  const invoiceStatusData = (() => {
    const map = {};
    (invoices || []).forEach(inv => { map[inv.paymentStatus] = (map[inv.paymentStatus] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Appointment status breakdown
  const apptStatusData = (() => {
    const map = {};
    (appointments || []).forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Patients by gender
  const patientsByGender = (() => {
    const map = {};
    (patients || []).forEach(p => { const g = p.gender || 'UNKNOWN'; map[g] = (map[g] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  // Dentist revenue
  const dentistRevenue = (() => {
    const map = {};
    (invoices || []).forEach(inv => {
      if (!inv.dentist) return;
      const name = `Dr. ${inv.dentist.firstName} ${inv.dentist.lastName}`;
      map[name] = (map[name] || 0) + Number(inv.amountPaid || 0);
    });
    return Object.entries(map).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue);
  })();

  // Monthly appointments
  const monthlyAppts = (() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { month: format(d, 'MMM'), key: format(d, 'yyyy-MM'), appointments: 0, completed: 0, noShow: 0 };
    });
    (appointments || []).forEach(a => {
      if (!a.appointmentDate) return;
      const key = a.appointmentDate.slice(0, 7);
      const m = months.find(m => m.key === key);
      if (m) {
        m.appointments += 1;
        if (a.status === 'COMPLETED') m.completed += 1;
        if (a.status === 'NO_SHOW') m.noShow += 1;
      }
    });
    return months;
  })();

  const totalRevenue = (invoices || []).reduce((s, i) => s + Number(i.amountPaid || 0), 0);
  const totalOutstanding = (invoices || []).reduce((s, i) => s + Number(i.balance || 0), 0);
  const totalInvoices = (invoices || []).length;
  const paidInvoices = (invoices || []).filter(i => i.paymentStatus === 'PAID').length;

  const tabs = [
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'staff', label: 'Staff', icon: TrendingUp },
  ];

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Financial, clinical and operational insights"
        actions={
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field !py-1.5 text-xs w-36" />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field !py-1.5 text-xs w-36" />
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: `${totalInvoices} invoices`, color: 'text-green-600 bg-green-50' },
          { label: 'Outstanding', value: formatCurrency(totalOutstanding), sub: `${totalInvoices - paidInvoices} unpaid`, color: 'text-red-600 bg-red-50' },
          { label: 'Total Patients', value: (patients || []).length, sub: `${(patients || []).filter(p => p.isActive).length} active`, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Appointments', value: (appointments || []).length, sub: `${(appointments || []).filter(a => a.status === 'COMPLETED').length} completed`, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card !p-4">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-1 px-2 py-0.5 rounded-lg inline-block ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-gray-100 gap-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${activeTab === id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Monthly Revenue (KES)</h3>
                <Button size="sm" variant="secondary" onClick={() => exportCSV(monthlyRevenue, 'monthly-revenue')}>
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={invoiceStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false} fontSize={11}>
                    {invoiceStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Invoice Count</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="invoices" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} name="Invoices" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
                <Button size="sm" variant="secondary" onClick={() => exportCSV((invoices || []).slice(0, 50).map(i => ({ invoice: i.invoiceNumber, patient: `${i.patient?.firstName} ${i.patient?.lastName}`, total: i.totalAmount, paid: i.amountPaid, status: i.paymentStatus, date: i.invoiceDate })), 'invoices')}>
                  <Download className="w-3 h-3" /> CSV
                </Button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {(invoices || []).slice(0, 10).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{inv.patient?.firstName} {inv.patient?.lastName}</p>
                      <p className="text-xs text-gray-400">{formatDate(inv.invoiceDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(inv.totalAmount)}</p>
                      <span className={`badge text-xs ${inv.paymentStatus === 'PAID' ? 'bg-green-50 text-green-600' : inv.paymentStatus === 'PENDING' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>{inv.paymentStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dentist revenue table */}
          {dentistRevenue.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Revenue by Dentist</h3>
                <Button size="sm" variant="secondary" onClick={() => exportCSV(dentistRevenue, 'dentist-revenue')}>
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100"><th className="table-header">Dentist</th><th className="table-header">Revenue</th><th className="table-header">% of Total</th><th className="table-header">Bar</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {dentistRevenue.map(({ name, revenue }) => (
                      <tr key={name} className="hover:bg-gray-50/50">
                        <td className="table-cell font-medium text-gray-800">{name}</td>
                        <td className="table-cell font-semibold text-green-600">{formatCurrency(revenue)}</td>
                        <td className="table-cell text-gray-500">{totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : 0}%</td>
                        <td className="table-cell w-48">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-primary-500 h-2 rounded-full" style={{ width: totalRevenue > 0 ? `${(revenue / totalRevenue) * 100}%` : '0%' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Monthly Appointment Trends</h3>
                <Button size="sm" variant="secondary" onClick={() => exportCSV(monthlyAppts, 'appointments-monthly')}>
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyAppts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="noShow" fill="#ef4444" radius={[4, 4, 0, 0]} name="No Show" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Status Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={apptStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {apptStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Appointment Statistics Summary</h3>
              <Button size="sm" variant="secondary" onClick={() => exportCSV(apptStatusData, 'appointment-status')}>
                <Download className="w-3 h-3" /> Export
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {apptStatusData.map(({ name, value }, i) => (
                <div key={name} className="text-center p-3 rounded-xl bg-gray-50">
                  <p className="text-2xl font-bold" style={{ color: COLORS[i % COLORS.length] }}>{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{name?.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Patients by Gender</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={patientsByGender} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                    {patientsByGender.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Patient Summary</h3>
                <Button size="sm" variant="secondary" onClick={() => exportCSV((patients || []).map(p => ({ id: p.patientNumber, name: `${p.firstName} ${p.lastName}`, phone: p.phone, email: p.email, gender: p.gender, dob: p.dateOfBirth, insurance: p.insuranceProvider, status: p.isActive ? 'Active' : 'Inactive' })), 'patients')}>
                  <Download className="w-3 h-3" /> Export All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Registered', value: (patients || []).length, color: 'bg-blue-50 text-blue-700' },
                  { label: 'Active', value: (patients || []).filter(p => p.isActive).length, color: 'bg-green-50 text-green-700' },
                  { label: 'With Insurance', value: (patients || []).filter(p => p.insuranceProvider).length, color: 'bg-purple-50 text-purple-700' },
                  { label: 'With Allergies', value: (patients || []).filter(p => p.allergies).length, color: 'bg-red-50 text-red-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-sm mt-1 font-medium opacity-80">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recently Registered Patients</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Patient No.</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Gender</th>
                  <th className="table-header">Insurance</th>
                  <th className="table-header">Registered</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(patients || []).slice(0, 15).map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="table-cell font-medium text-gray-800">{p.firstName} {p.lastName}</td>
                      <td className="table-cell font-mono text-xs text-gray-400">{p.patientNumber}</td>
                      <td className="table-cell text-gray-500">{p.phone || '—'}</td>
                      <td className="table-cell text-gray-500">{p.gender || '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{p.insuranceProvider || '—'}</td>
                      <td className="table-cell text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Dentist Revenue Performance</h3>
                <Button size="sm" variant="secondary" onClick={() => exportCSV(dentistRevenue, 'dentist-performance')}>
                  <Download className="w-3 h-3" /> Export
                </Button>
              </div>
              {dentistRevenue.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No revenue data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dentistRevenue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Staff by Role</h3>
              {(() => {
                const roleMap = {};
                (staff || []).forEach(s => { roleMap[s.role] = (roleMap[s.role] || 0) + 1; });
                const roleData = Object.entries(roleMap).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));
                return (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={roleData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false} fontSize={10}>
                        {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Staff Directory</h3>
              <Button size="sm" variant="secondary" onClick={() => exportCSV((staff || []).map(s => ({ name: `${s.firstName} ${s.lastName}`, email: s.email, phone: s.phone, role: s.role, specialization: s.specialization || '' })), 'staff')}>
                <Download className="w-3 h-3" /> Export
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Phone</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Specialization</th>
                  <th className="table-header">Appointments</th>
                  <th className="table-header">Revenue Generated</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {(staff || []).map(s => {
                    const staffAppts = (appointments || []).filter(a => a.dentist?.id === s.id).length;
                    const staffRevenue = (invoices || []).filter(i => i.dentist?.id === s.id).reduce((sum, i) => sum + Number(i.amountPaid || 0), 0);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50">
                        <td className="table-cell font-medium text-gray-800">{s.firstName} {s.lastName}</td>
                        <td className="table-cell text-gray-500 text-xs">{s.email}</td>
                        <td className="table-cell text-gray-500">{s.phone || '—'}</td>
                        <td className="table-cell"><span className="badge bg-blue-50 text-blue-700 text-xs">{s.role?.replace(/_/g, ' ')}</span></td>
                        <td className="table-cell text-gray-500 text-xs">{s.specialization || '—'}</td>
                        <td className="table-cell text-gray-700">{staffAppts}</td>
                        <td className="table-cell font-semibold text-green-600">{staffRevenue > 0 ? formatCurrency(staffRevenue) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
