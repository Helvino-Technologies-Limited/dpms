import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Shield } from 'lucide-react';
import { insuranceAPI } from '../../api/endpoints';
import { formatDate, formatCurrency } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function InsurancePage() {
  const [providerModal, setProviderModal] = useState(false);
  const [activeTab, setActiveTab] = useState('claims');
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: providers } = useQuery({
    queryKey: ['insurance-providers'],
    queryFn: () => insuranceAPI.listProviders().then(r => r.data.data),
  });

  const { data: claimsData, isLoading } = useQuery({
    queryKey: ['insurance-claims', page],
    queryFn: () => insuranceAPI.listClaims({ page, size: 20 }).then(r => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm();

  const createProviderMutation = useMutation({
    mutationFn: (data) => insuranceAPI.createProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['insurance-providers']);
      toast.success('Insurance provider added!');
      setProviderModal(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error adding provider'),
  });

  const claims = claimsData?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Insurance Management"
        subtitle="Manage insurance providers and claims"
        actions={<Button onClick={() => setProviderModal(true)}><Plus className="w-4 h-4" /> Add Provider</Button>}
      />

      {/* Providers summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(providers || []).slice(0, 4).map(p => (
          <div key={p.id} className="card !p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.code || 'Active'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-6">
        {['claims', 'providers'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Claims */}
      {activeTab === 'claims' && (
        <div className="card !p-0">
          {isLoading ? (
            <div className="py-12"><LoadingSpinner size="lg" /></div>
          ) : claims.length === 0 ? (
            <EmptyState title="No insurance claims" description="Claims submitted for patients will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="table-header">Claim #</th>
                    <th className="table-header">Patient</th>
                    <th className="table-header">Provider</th>
                    <th className="table-header">Submission</th>
                    <th className="table-header">Claim Amount</th>
                    <th className="table-header">Approved</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map(claim => (
                    <tr key={claim.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-400">{claim.claimNumber}</td>
                      <td className="table-cell font-medium text-gray-800">{claim.patient?.firstName} {claim.patient?.lastName}</td>
                      <td className="table-cell text-sm text-gray-600">{claim.insuranceProvider?.name}</td>
                      <td className="table-cell text-xs text-gray-500">{formatDate(claim.submissionDate)}</td>
                      <td className="table-cell font-medium">{claim.claimAmount ? formatCurrency(claim.claimAmount) : '—'}</td>
                      <td className="table-cell text-green-600 font-medium">{claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '—'}</td>
                      <td className="table-cell"><Badge status={claim.status}>{claim.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Providers list */}
      {activeTab === 'providers' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(providers || []).length === 0 ? (
            <div className="col-span-3">
              <EmptyState title="No providers" description="Add your first insurance provider." action={<Button onClick={() => setProviderModal(true)}><Plus className="w-4 h-4" /> Add Provider</Button>} />
            </div>
          ) : (providers || []).map(p => (
            <div key={p.id} className="card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.code || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                {p.phone && <p>📞 {p.phone}</p>}
                {p.email && <p>✉️ {p.email}</p>}
                {p.contactPerson && <p>👤 {p.contactPerson}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Provider Modal */}
      <Modal isOpen={providerModal} onClose={() => { setProviderModal(false); reset(); }} title="Add Insurance Provider" size="md">
        <form onSubmit={handleSubmit(data => createProviderMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Provider Name *" {...register('name', { required: true })} />
            <Input label="Code" placeholder="e.g. AAR, NHIF" {...register('code')} />
            <Input label="Contact Person" {...register('contactPerson')} />
            <Input label="Phone" {...register('phone')} />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Claims Email" type="email" {...register('claimsEmail')} />
          </div>
          <Input label="Address" {...register('address')} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setProviderModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createProviderMutation.isPending}>Add Provider</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
