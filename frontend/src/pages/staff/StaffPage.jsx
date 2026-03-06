import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit, UserX } from 'lucide-react';
import { staffAPI } from '../../api/endpoints';
import { getInitials, cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const ROLES = [
  { value: 'DENTIST', label: 'Dentist' },
  { value: 'DENTAL_ASSISTANT', label: 'Dental Assistant' },
  { value: 'RECEPTIONIST', label: 'Receptionist' },
  { value: 'CASHIER', label: 'Cashier' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
  { value: 'CLINIC_MANAGER', label: 'Clinic Manager' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
];

const ROLE_COLORS = {
  DENTIST: 'bg-blue-100 text-blue-700',
  DENTAL_ASSISTANT: 'bg-teal-100 text-teal-700',
  RECEPTIONIST: 'bg-green-100 text-green-700',
  CASHIER: 'bg-yellow-100 text-yellow-700',
  LAB_TECHNICIAN: 'bg-purple-100 text-purple-700',
  CLINIC_MANAGER: 'bg-orange-100 text-orange-700',
  ACCOUNTANT: 'bg-indigo-100 text-indigo-700',
  TENANT_ADMIN: 'bg-red-100 text-red-700',
};

export default function StaffPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => staffAPI.list().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => selected ? staffAPI.update(selected.id, data) : staffAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success(selected ? 'Staff updated!' : 'Staff member added!');
      setModalOpen(false);
      reset();
      setSelected(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error saving staff'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => staffAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff']);
      toast.success('Staff member deactivated');
    },
  });

  const openEdit = (member) => {
    setSelected(member);
    reset({ firstName: member.firstName, lastName: member.lastName, email: member.email, phone: member.phone || '', role: member.role, specialization: member.specialization || '', licenseNumber: member.licenseNumber || '' });
    setModalOpen(true);
  };

  const openAdd = () => { setSelected(null); reset({}); setModalOpen(true); };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Staff Management"
        subtitle={`${(staff || []).length} team members`}
        actions={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Staff</Button>}
      />

      {isLoading ? (
        <div className="py-12"><LoadingSpinner size="lg" /></div>
      ) : (staff || []).length === 0 ? (
        <EmptyState title="No staff members" description="Add your first team member." action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Staff</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(staff || []).map(member => (
            <div key={member.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-bold flex-shrink-0">
                  {getInitials(`${member.firstName} ${member.lastName}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{member.firstName} {member.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <span className={cn('badge text-xs', ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-600')}>
                  {member.role?.replace(/_/g, ' ')}
                </span>
                {member.specialization && <p className="text-xs text-gray-500">{member.specialization}</p>}
                {member.phone && <p className="text-xs text-gray-400">{member.phone}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" onClick={() => openEdit(member)} className="flex-1 justify-center">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <button
                  onClick={() => { if (confirm('Deactivate this staff member?')) deactivateMutation.mutate(member.id); }}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); reset(); }}
        title={selected ? 'Edit Staff Member' : 'Add Staff Member'} size="md">
        <form onSubmit={handleSubmit(data => saveMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" error={errors.firstName?.message} {...register('firstName', { required: 'Required' })} />
            <Input label="Last Name *" error={errors.lastName?.message} {...register('lastName', { required: 'Required' })} />
            <Input label="Email *" type="email" error={errors.email?.message} {...register('email', { required: 'Required' })} />
            <Input label="Phone" {...register('phone')} />
          </div>
          <Select label="Role *" options={ROLES} placeholder="Select role" {...register('role', { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Specialization" placeholder="e.g. Orthodontics" {...register('specialization')} />
            <Input label="License Number" {...register('licenseNumber')} />
          </div>
          {!selected && (
            <Input label="Temporary Password" type="password" placeholder="Min 8 characters" {...register('password')} helper="Staff member should change this on first login." />
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>{selected ? 'Update' : 'Add Staff'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
