import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Eye, Edit, Search, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { patientAPI, staffAPI } from '../../api/endpoints';
import { formatDate, formatCurrency, cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const PLAN_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

const STATUS_COLORS = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  ON_HOLD: 'bg-gray-100 text-gray-600',
};

const TEETH = [
  11,12,13,14,15,16,17,18,
  21,22,23,24,25,26,27,28,
  31,32,33,34,35,36,37,38,
  41,42,43,44,45,46,47,48,
];

export default function TreatmentsPage() {
  const [planModal, setPlanModal] = useState(false);
  const [recordModal, setRecordModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [page, setPage] = useState(0);
  const [patientSearch, setPatientSearch] = useState('');
  const [filterPatientId, setFilterPatientId] = useState(null);
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['treatment-plans', page],
    queryFn: () => api.get('/treatment-plans', { params: { page, size: 20 } }).then(r => r.data.data),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-search-tx', patientSearch],
    queryFn: () => patientAPI.list({ search: patientSearch, size: 10 }).then(r => r.data.data.content),
    enabled: patientSearch.length > 1,
  });

  const { data: dentists } = useQuery({
    queryKey: ['dentists'],
    queryFn: () => staffAPI.dentists().then(r => r.data.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/services').then(r => r.data.data),
  });

  const { data: planRecords } = useQuery({
    queryKey: ['treatment-records', selectedPlan?.id],
    queryFn: () => api.get(`/treatment-plans/${selectedPlan.id}/records`).then(r => r.data.data),
    enabled: !!selectedPlan && viewModal,
  });

  const {
    register: regPlan, handleSubmit: handlePlan, reset: resetPlan,
    setValue: setPlanVal, watch: watchPlan, formState: { errors: planErrors }
  } = useForm();

  const {
    register: regRecord, handleSubmit: handleRecord, reset: resetRecord,
  } = useForm();

  const [selectedPatientForPlan, setSelectedPatientForPlan] = useState(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const createPlanMutation = useMutation({
    mutationFn: (data) => api.post('/treatment-plans', {
      ...data,
      patientId: selectedPatientForPlan?.id,
      dentistId: Number(data.dentistId),
      estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : null,
      totalPhases: data.totalPhases ? Number(data.totalPhases) : 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['treatment-plans']);
      toast.success('Treatment plan created!');
      setPlanModal(false);
      resetPlan();
      setSelectedPatientForPlan(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error creating plan'),
  });

  const addRecordMutation = useMutation({
    mutationFn: (data) => api.post('/treatment-records', {
      ...data,
      treatmentPlanId: selectedPlan?.id,
      patientId: selectedPlan?.patient?.id,
      dentistId: Number(data.dentistId),
      serviceId: data.serviceId ? Number(data.serviceId) : null,
      cost: data.cost ? Number(data.cost) : null,
      phaseNumber: data.phaseNumber ? Number(data.phaseNumber) : 1,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['treatment-records', selectedPlan?.id]);
      queryClient.invalidateQueries(['treatment-plans']);
      toast.success('Treatment record added!');
      setRecordModal(false);
      resetRecord();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error adding record'),
  });

  const updatePlanStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/treatment-plans/${id}/status`, null, { params: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['treatment-plans']);
      toast.success('Status updated');
    },
  });

  const plans = plansData?.content || [];
  const dentistOptions = (dentists || []).map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }));
  const serviceOptions = (services || []).map(s => ({ value: s.id, label: s.name }));
  const toothOptions = TEETH.map(t => ({ value: String(t), label: `Tooth ${t}` }));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Treatment Plans"
        subtitle={`${plansData?.totalElements || 0} treatment plans`}
        actions={
          <Button onClick={() => { setSelectedPatientForPlan(null); resetPlan(); setPlanModal(true); }}>
            <Plus className="w-4 h-4" /> New Treatment Plan
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: plansData?.totalElements || 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'In Progress', value: plans.filter(p => p.status === 'IN_PROGRESS').length, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Completed', value: plans.filter(p => p.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Pending', value: plans.filter(p => p.status === 'PENDING').length, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card !p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plans Table */}
      <div className="card !p-0">
        {isLoading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : plans.length === 0 ? (
          <EmptyState
            title="No treatment plans"
            description="Create a treatment plan to start tracking patient care."
            action={<Button onClick={() => setPlanModal(true)}><Plus className="w-4 h-4" /> New Plan</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Plan #</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Dentist</th>
                  <th className="table-header">Title / Diagnosis</th>
                  <th className="table-header">Start Date</th>
                  <th className="table-header">Phases</th>
                  <th className="table-header">Est. Cost</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell font-mono text-xs text-gray-400">{plan.planNumber || `#${plan.id}`}</td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-800">{plan.patient?.firstName} {plan.patient?.lastName}</p>
                      <p className="text-xs text-gray-400">{plan.patient?.patientNumber}</p>
                    </td>
                    <td className="table-cell text-sm text-gray-600">
                      Dr. {plan.dentist?.firstName} {plan.dentist?.lastName}
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-800 text-sm">{plan.title || '—'}</p>
                      <p className="text-xs text-gray-400 truncate max-w-48">{plan.diagnosis || '—'}</p>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{formatDate(plan.startDate)}</td>
                    <td className="table-cell text-sm text-gray-700">
                      {plan.completedPhases || 0} / {plan.totalPhases || 1}
                    </td>
                    <td className="table-cell text-sm text-gray-700">
                      {plan.estimatedCost ? formatCurrency(plan.estimatedCost) : '—'}
                    </td>
                    <td className="table-cell">
                      <select
                        value={plan.status || 'PENDING'}
                        onChange={e => updatePlanStatusMutation.mutate({ id: plan.id, status: e.target.value })}
                        className={cn('text-xs border rounded-lg px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-primary-500', STATUS_COLORS[plan.status] || 'bg-gray-50 text-gray-600')}
                      >
                        {PLAN_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setSelectedPlan(plan); setViewModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        ><Eye className="w-4 h-4" /></button>
                        <button
                          onClick={() => { setSelectedPlan(plan); resetRecord(); setRecordModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add treatment record"
                        ><Plus className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {plansData && plansData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {plansData.page + 1} of {plansData.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={plansData.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={plansData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      <Modal isOpen={planModal} onClose={() => { setPlanModal(false); resetPlan(); setSelectedPatientForPlan(null); }} title="Create Treatment Plan" size="xl">
        <form onSubmit={handlePlan(data => createPlanMutation.mutate(data))} className="space-y-4">
          {/* Patient search */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Patient *</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mt-1 bg-white">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient..."
                value={selectedPatientForPlan ? `${selectedPatientForPlan.firstName} ${selectedPatientForPlan.lastName}` : patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setSelectedPatientForPlan(null); setShowPatientDropdown(true); }}
                className="text-sm outline-none flex-1"
              />
              {selectedPatientForPlan && (
                <button type="button" onClick={() => { setSelectedPatientForPlan(null); setPatientSearch(''); }} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
              )}
            </div>
            {showPatientDropdown && patients && patients.length > 0 && !selectedPatientForPlan && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                {patients.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => { setSelectedPatientForPlan(p); setPatientSearch(''); setShowPatientDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                    <span className="font-medium">{p.firstName} {p.lastName}</span>
                    <span className="text-gray-400 ml-2 font-mono text-xs">{p.patientNumber}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Select label="Assigned Dentist *" options={dentistOptions} placeholder="Select dentist" {...regPlan('dentistId', { required: true })} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Plan Title" placeholder="e.g. Full Mouth Rehabilitation" {...regPlan('title')} />
            <Input label="Start Date" type="date" {...regPlan('startDate')} />
            <Input label="Expected End Date" type="date" {...regPlan('expectedEndDate')} />
            <Input label="Estimated Cost (KES)" type="number" min="0" step="0.01" {...regPlan('estimatedCost')} />
            <Input label="Total Phases" type="number" min="1" defaultValue={1} {...regPlan('totalPhases')} />
            <Select label="Status" options={PLAN_STATUSES} {...regPlan('status')} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Diagnosis</label>
            <textarea className="input-field mt-1 h-20 resize-none" placeholder="Clinical diagnosis details..." {...regPlan('diagnosis')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Treatment Description</label>
            <textarea className="input-field mt-1 h-20 resize-none" placeholder="Describe the treatment approach..." {...regPlan('treatmentDescription')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setPlanModal(false); resetPlan(); setSelectedPatientForPlan(null); }}>Cancel</Button>
            <Button type="submit" loading={createPlanMutation.isPending} disabled={!selectedPatientForPlan}>Create Plan</Button>
          </div>
        </form>
      </Modal>

      {/* Add Record Modal */}
      <Modal isOpen={recordModal} onClose={() => { setRecordModal(false); resetRecord(); }} title={`Add Treatment Record — ${selectedPlan?.patient?.firstName} ${selectedPlan?.patient?.lastName}`} size="lg">
        <form onSubmit={handleRecord(data => addRecordMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Dentist *" options={dentistOptions} placeholder="Select dentist" {...regRecord('dentistId', { required: true })} />
            <Select label="Service / Procedure" options={serviceOptions} placeholder="Select service" {...regRecord('serviceId')} />
            <Input label="Treatment Date" type="date" {...regRecord('treatmentDate')} />
            <Select label="Tooth Number" options={toothOptions} placeholder="Select tooth (optional)" {...regRecord('toothNumber')} />
            <Input label="Cost (KES)" type="number" min="0" step="0.01" {...regRecord('cost')} />
            <Input label="Phase Number" type="number" min="1" defaultValue={1} {...regRecord('phaseNumber')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Findings</label>
            <textarea className="input-field mt-1 h-16 resize-none" placeholder="Clinical findings..." {...regRecord('findings')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Procedure Done</label>
            <textarea className="input-field mt-1 h-16 resize-none" placeholder="Describe procedure performed..." {...regRecord('procedureDone')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Clinical Notes</label>
            <textarea className="input-field mt-1 h-16 resize-none" placeholder="Additional clinical notes..." {...regRecord('clinicalNotes')} />
          </div>
          <Select label="Status" options={[{ value: 'COMPLETED', label: 'Completed' }, { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'PENDING', label: 'Pending' }]} {...regRecord('status')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setRecordModal(false); resetRecord(); }}>Cancel</Button>
            <Button type="submit" loading={addRecordMutation.isPending}>Save Record</Button>
          </div>
        </form>
      </Modal>

      {/* View Plan Modal */}
      <Modal isOpen={viewModal} onClose={() => { setViewModal(false); setSelectedPlan(null); }} title="Treatment Plan Details" size="xl">
        {selectedPlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{selectedPlan.patient?.firstName} {selectedPlan.patient?.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Patient No.</span><span className="font-mono text-xs">{selectedPlan.patient?.patientNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Dentist</span><span className="font-medium">Dr. {selectedPlan.dentist?.firstName} {selectedPlan.dentist?.lastName}</span></div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Plan Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Start Date</span><span>{formatDate(selectedPlan.startDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Expected End</span><span>{formatDate(selectedPlan.expectedEndDate)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Estimated Cost</span><span className="font-medium">{selectedPlan.estimatedCost ? formatCurrency(selectedPlan.estimatedCost) : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Progress</span><span>{selectedPlan.completedPhases || 0} / {selectedPlan.totalPhases || 1} phases</span></div>
                </div>
              </div>
            </div>

            {selectedPlan.diagnosis && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">Diagnosis</p>
                <p className="text-sm text-blue-800">{selectedPlan.diagnosis}</p>
              </div>
            )}
            {selectedPlan.treatmentDescription && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 mb-1">Treatment Description</p>
                <p className="text-sm text-gray-700">{selectedPlan.treatmentDescription}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Treatment Records</h4>
                <Button size="sm" onClick={() => { setRecordModal(true); setViewModal(false); }}>
                  <Plus className="w-3 h-3" /> Add Record
                </Button>
              </div>
              {planRecords && planRecords.length > 0 ? (
                <div className="space-y-3">
                  {planRecords.map((record, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">Phase {record.phaseNumber}</span>
                          {record.toothNumber && <span className="badge bg-blue-50 text-blue-600">Tooth {record.toothNumber}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{formatDate(record.treatmentDate)}</span>
                          <span className={cn('badge', STATUS_COLORS[record.status] || 'bg-gray-100 text-gray-500')}>{record.status}</span>
                        </div>
                      </div>
                      {record.service && <p className="text-sm font-medium text-gray-700">{record.service.name}</p>}
                      {record.procedureDone && <p className="text-sm text-gray-600 mt-1">{record.procedureDone}</p>}
                      {record.clinicalNotes && <p className="text-xs text-gray-400 mt-1 italic">{record.clinicalNotes}</p>}
                      {record.cost && <p className="text-sm font-semibold text-green-600 mt-1">{formatCurrency(record.cost)}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                  No treatment records yet. Add the first record.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
