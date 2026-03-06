import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { appointmentAPI, patientAPI, staffAPI, serviceAPI } from '../../api/endpoints';
import { formatDate, cn } from '../../utils/helpers';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const STATUSES = ['SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW'];

export default function AppointmentsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentAPI.list({ page: 0, size: 50 }).then(r => r.data.data.content),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientAPI.list({ size: 200 }).then(r => r.data.data.content),
  });

  const { data: dentists } = useQuery({
    queryKey: ['dentists'],
    queryFn: () => staffAPI.dentists().then(r => r.data.data),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.list().then(r => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm();

  const createMutation = useMutation({
    mutationFn: (data) => appointmentAPI.create({
      ...data,
      patientId: Number(data.patientId),
      dentistId: Number(data.dentistId),
      serviceId: data.serviceId ? Number(data.serviceId) : null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Appointment scheduled!');
      setModalOpen(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error creating appointment'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Status updated');
    },
  });

  const patientOptions = (patients || []).map(p => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName} (${p.patientNumber})`,
  }));
  const dentistOptions = (dentists || []).map(d => ({
    value: d.id,
    label: `Dr. ${d.firstName} ${d.lastName}`,
  }));
  const serviceOptions = (services || []).map(s => ({
    value: s.id,
    label: s.name,
  }));

  const getApptsByDay = (day) =>
    (appointments || []).filter(a => {
      try { return isSameDay(new Date(a.appointmentDate), day); } catch { return false; }
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Appointments"
        subtitle="Schedule and manage patient appointments"
        actions={
          <div className="flex gap-2">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              {['list', 'week'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition-colors capitalize',
                    viewMode === mode
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4" /> Schedule
            </Button>
          </div>
        }
      />

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentWeek(d => addDays(d, -7))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-gray-900">
              {format(weekStart, 'MMM dd')} – {format(addDays(weekStart, 6), 'MMM dd, yyyy')}
            </h3>
            <button
              onClick={() => setCurrentWeek(d => addDays(d, 7))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayAppts = getApptsByDay(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'rounded-xl border p-2 min-h-32',
                    isToday ? 'border-primary-300 bg-primary-50' : 'border-gray-100 bg-gray-50'
                  )}
                >
                  <p className={cn(
                    'text-xs font-semibold text-center mb-2',
                    isToday ? 'text-primary-700' : 'text-gray-500'
                  )}>
                    {format(day, 'EEE')}
                  </p>
                  <p className={cn(
                    'text-lg font-bold text-center mb-2',
                    isToday ? 'text-primary-700' : 'text-gray-800'
                  )}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-1">
                    {dayAppts.slice(0, 3).map(a => (
                      <div
                        key={a.id}
                        className="text-xs bg-white rounded-lg px-2 py-1 border border-gray-100 truncate shadow-sm"
                      >
                        <span className="font-medium text-gray-700">
                          {a.startTime?.slice(0, 5)}
                        </span>
                        <span className="text-gray-400 ml-1 truncate block">
                          {a.patient?.firstName}
                        </span>
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <p className="text-xs text-center text-primary-500 font-medium">
                        +{dayAppts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card !p-0">
          {isLoading ? (
            <div className="py-12"><LoadingSpinner size="lg" /></div>
          ) : !appointments || appointments.length === 0 ? (
            <EmptyState
              title="No appointments found"
              description="Schedule your first appointment to get started."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="w-4 h-4" /> Schedule Appointment
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Ref</th>
                    <th className="table-header">Patient</th>
                    <th className="table-header">Dentist</th>
                    <th className="table-header">Date & Time</th>
                    <th className="table-header">Service</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map(appt => (
                    <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-400">
                        {appt.appointmentNumber || `#${appt.id}`}
                      </td>
                      <td className="table-cell">
                        <p className="font-medium text-gray-800">
                          {appt.patient?.firstName} {appt.patient?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{appt.patient?.phone}</p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm text-gray-700">
                          Dr. {appt.dentist?.firstName} {appt.dentist?.lastName}
                        </p>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm font-medium text-gray-800">
                          {formatDate(appt.appointmentDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {appt.startTime?.slice(0, 5)}
                          {appt.endTime ? ` – ${appt.endTime.slice(0, 5)}` : ''}
                        </p>
                      </td>
                      <td className="table-cell text-xs text-gray-500">
                        {appt.service?.name || appt.chiefComplaint || '—'}
                      </td>
                      <td className="table-cell">
                        <Badge status={appt.status}>
                          {appt.status?.charAt(0) + appt.status?.slice(1).toLowerCase().replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <select
                          value={appt.status}
                          onChange={e => statusMutation.mutate({ id: appt.id, status: e.target.value })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title="Schedule Appointment"
        size="lg"
      >
        <form onSubmit={handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
          <Select
            label="Patient *"
            options={patientOptions}
            placeholder="Select patient"
            {...register('patientId', { required: true })}
          />
          <Select
            label="Dentist *"
            options={dentistOptions}
            placeholder="Select dentist"
            {...register('dentistId', { required: true })}
          />
          <Select
            label="Service"
            options={serviceOptions}
            placeholder="Select service (optional)"
            {...register('serviceId')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              {...register('appointmentDate', { required: true })}
            />
            <Input
              label="Start Time *"
              type="time"
              {...register('startTime', { required: true })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="End Time"
              type="time"
              {...register('endTime')}
            />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" className="rounded" {...register('isWalkIn')} />
                Walk-in patient
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Chief Complaint</label>
            <textarea
              className="input-field mt-1 h-20 resize-none"
              placeholder="Reason for visit..."
              {...register('chiefComplaint')}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="input-field mt-1 h-16 resize-none"
              placeholder="Additional notes..."
              {...register('notes')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => { setModalOpen(false); reset(); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Schedule Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
