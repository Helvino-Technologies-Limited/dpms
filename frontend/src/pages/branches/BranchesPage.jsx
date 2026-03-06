import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Building2, Phone, Mail, MapPin, User, Edit, Trash2 } from 'lucide-react';
import { branchAPI } from '../../api/endpoints';
import { cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function BranchesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchAPI.list().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => selected
      ? branchAPI.update(selected.id, data)
      : branchAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['branches']);
      toast.success(selected ? 'Branch updated!' : 'Branch created!');
      setModalOpen(false);
      reset();
      setSelected(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error saving branch'),
  });

  const openAdd = () => {
    setSelected(null);
    reset({});
    setModalOpen(true);
  };

  const openEdit = (branch) => {
    setSelected(branch);
    reset({
      name: branch.name,
      address: branch.address || '',
      city: branch.city || '',
      phone: branch.phone || '',
      email: branch.email || '',
      managerName: branch.managerName || '',
      isMainBranch: branch.isMainBranch || false,
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Branch Management"
        subtitle={`${(branches || []).length} clinic location${(branches || []).length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Branch
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Branches</p>
            <p className="text-2xl font-bold text-gray-900">{(branches || []).length}</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold text-gray-900">{(branches || []).filter(b => b.isActive).length}</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Main Branch</p>
            <p className="text-sm font-semibold text-gray-700 truncate">
              {(branches || []).find(b => b.isMainBranch)?.name || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      {isLoading ? (
        <LoadingSpinner className="py-12" size="lg" />
      ) : (branches || []).length === 0 ? (
        <EmptyState
          title="No branches yet"
          description="Add your first clinic branch to get started with multi-location management."
          action={<Button onClick={openAdd}><Plus className="w-4 h-4" /> Add First Branch</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(branches || []).map(branch => (
            <div key={branch.id} className={cn(
              'card hover:shadow-md transition-all duration-200 relative',
              branch.isMainBranch && 'border-primary-200 bg-primary-50/30'
            )}>
              {branch.isMainBranch && (
                <div className="absolute top-3 right-3">
                  <span className="badge bg-primary-100 text-primary-700 text-xs font-semibold">
                    Main Branch
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  branch.isMainBranch ? 'bg-primary-100' : 'bg-gray-100'
                )}>
                  <Building2 className={cn('w-6 h-6', branch.isMainBranch ? 'text-primary-600' : 'text-gray-500')} />
                </div>
                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="font-bold text-gray-900 text-base">{branch.name}</h3>
                  <span className={cn('badge text-xs mt-1', branch.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500')}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(branch.address || branch.city) && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{[branch.address, branch.city].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${branch.phone}`} className="hover:text-primary-600 transition-colors">{branch.phone}</a>
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${branch.email}`} className="hover:text-primary-600 transition-colors truncate">{branch.email}</a>
                  </div>
                )}
                {branch.managerName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{branch.managerName}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={() => openEdit(branch)}
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelected(null); reset(); }}
        title={selected ? 'Edit Branch' : 'Add New Branch'}
        size="md"
      >
        <form onSubmit={handleSubmit(data => saveMutation.mutate(data))} className="space-y-4">
          <Input
            label="Branch Name *"
            placeholder="e.g. Westlands Branch"
            error={errors.name?.message}
            {...register('name', { required: 'Branch name is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Address"
              placeholder="Street address"
              {...register('address')}
            />
            <Input
              label="City"
              placeholder="e.g. Nairobi"
              {...register('city')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="0712345678"
              {...register('phone')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="branch@clinic.com"
              {...register('email')}
            />
          </div>

          <Input
            label="Branch Manager Name"
            placeholder="Full name of branch manager"
            {...register('managerName')}
          />

          <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-xl">
            <input
              type="checkbox"
              id="isMainBranch"
              className="w-4 h-4 rounded text-primary-600"
              {...register('isMainBranch')}
            />
            <label htmlFor="isMainBranch" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">Set as Main Branch</span>
              <span className="text-gray-400 ml-1">(Headquarters / Primary Location)</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => { setModalOpen(false); setSelected(null); reset(); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {selected ? 'Update Branch' : 'Create Branch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
