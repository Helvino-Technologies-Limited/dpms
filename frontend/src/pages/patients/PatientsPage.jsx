import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Edit, Trash2, Users, Phone, Mail } from 'lucide-react';
import { patientAPI } from '../../api/endpoints';
import { formatDate, getInitials, cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().min(10).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['patients', search, page],
    queryFn: () => patientAPI.list({ search, page, size: 20 }).then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (data) => selectedPatient
      ? patientAPI.update(selectedPatient.id, data)
      : patientAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
      toast.success(selectedPatient ? 'Patient updated!' : 'Patient registered!');
      setModalOpen(false);
      reset();
      setSelectedPatient(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error saving patient'),
  });

  const openEdit = (patient) => {
    setSelectedPatient(patient);
    reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone || '',
      email: patient.email || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || '',
      allergies: patient.allergies || '',
      medicalHistory: patient.medicalHistory || '',
      emergencyContactName: patient.emergencyContactName || '',
      emergencyContactPhone: patient.emergencyContactPhone || '',
      insuranceProvider: patient.insuranceProvider || '',
      insurancePolicyNumber: patient.insurancePolicyNumber || '',
    });
    setModalOpen(true);
  };

  const openAdd = () => {
    setSelectedPatient(null);
    reset({});
    setModalOpen(true);
  };

  const patients = data?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Patients"
        subtitle={`${data?.totalElements || 0} total patients`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Patient
          </Button>
        }
      />

      {/* Search */}
      <div className="card !p-3">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or patient number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none flex-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card !p-0">
        {isLoading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : patients.length === 0 ? (
          <EmptyState title="No patients found" description="Register your first patient to get started." action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Add Patient</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Patient</th>
                  <th className="table-header">Patient No.</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">DOB</th>
                  <th className="table-header">Insurance</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold flex-shrink-0">
                          {getInitials(`${patient.firstName} ${patient.lastName}`)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                          <p className="text-xs text-gray-400">{patient.gender || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-gray-500">{patient.patientNumber}</td>
                    <td className="table-cell">
                      <div className="space-y-0.5">
                        {patient.phone && <p className="text-xs flex items-center gap-1 text-gray-600"><Phone className="w-3 h-3" />{patient.phone}</p>}
                        {patient.email && <p className="text-xs flex items-center gap-1 text-gray-500"><Mail className="w-3 h-3" />{patient.email}</p>}
                      </div>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{formatDate(patient.dateOfBirth) || '-'}</td>
                    <td className="table-cell text-xs text-gray-500">{patient.insuranceProvider || '-'}</td>
                    <td className="table-cell">
                      <span className={cn('badge', patient.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setSelectedPatient(patient); setViewModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(patient)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {data.page + 1} of {data.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={data.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={data.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedPatient(null); reset(); }}
        title={selectedPatient ? 'Edit Patient' : 'Register New Patient'} size="xl">
        <form onSubmit={handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last Name *" error={errors.lastName?.message} {...register('lastName')} />
            <Input label="Phone" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
            <Select label="Gender" options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]}
              placeholder="Select gender" {...register('gender')} />
            <Input label="Blood Group" placeholder="A+, B-, O+" {...register('bloodGroup')} />
            <Input label="Address" {...register('address')} />
          </div>
          <hr className="border-gray-100" />
          <h3 className="font-medium text-gray-700 text-sm">Medical Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Allergies</label>
              <textarea className="input-field mt-1 h-20 resize-none" placeholder="List known allergies..." {...register('allergies')} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Medical History</label>
              <textarea className="input-field mt-1 h-20 resize-none" placeholder="Relevant medical history..." {...register('medicalHistory')} />
            </div>
          </div>
          <hr className="border-gray-100" />
          <h3 className="font-medium text-gray-700 text-sm">Emergency Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Name" {...register('emergencyContactName')} />
            <Input label="Contact Phone" {...register('emergencyContactPhone')} />
          </div>
          <hr className="border-gray-100" />
          <h3 className="font-medium text-gray-700 text-sm">Insurance</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Insurance Provider" {...register('insuranceProvider')} />
            <Input label="Policy Number" {...register('insurancePolicyNumber')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>
              {selectedPatient ? 'Update Patient' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Patient Details" size="lg">
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold">
                {getInitials(`${selectedPatient.firstName} ${selectedPatient.lastName}`)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                <p className="text-gray-500 font-mono text-sm">{selectedPatient.patientNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Phone', selectedPatient.phone],
                ['Email', selectedPatient.email],
                ['Date of Birth', formatDate(selectedPatient.dateOfBirth)],
                ['Gender', selectedPatient.gender],
                ['Blood Group', selectedPatient.bloodGroup],
                ['Address', selectedPatient.address],
                ['Insurance', selectedPatient.insuranceProvider],
                ['Policy No.', selectedPatient.insurancePolicyNumber],
              ].map(([label, val]) => val && (
                <div key={label}>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="font-medium text-gray-800">{val}</p>
                </div>
              ))}
            </div>
            {selectedPatient.allergies && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-red-600 mb-1">⚠ Allergies</p>
                <p className="text-sm text-red-700">{selectedPatient.allergies}</p>
              </div>
            )}
            {selectedPatient.medicalHistory && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 mb-1">Medical History</p>
                <p className="text-sm text-blue-700">{selectedPatient.medicalHistory}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
