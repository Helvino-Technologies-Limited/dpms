import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Building2, Users, Package, Shield } from 'lucide-react';
import { tenantAPI } from '../../api/endpoints';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('clinic');
  const queryClient = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-profile'],
    queryFn: () => tenantAPI.getProfile().then(r => r.data.data),
  });

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: tenant,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tenantAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tenant-profile']);
      toast.success('Clinic profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const tabs = [
    { id: 'clinic', label: 'Clinic Profile', icon: Building2 },
    { id: 'subscription', label: 'Subscription', icon: Shield },
  ];

  if (isLoading) return <div className="py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your clinic configuration" />

      {/* Tab nav */}
      <div className="flex border-b border-gray-100 gap-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors ${activeTab === id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'clinic' && (
        <form onSubmit={handleSubmit(data => updateMutation.mutate(data))} className="max-w-2xl space-y-4">
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900">Clinic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Clinic Name" {...register('clinicName')} />
              <Input label="Owner Name" value={tenant?.ownerName || ''} readOnly className="bg-gray-50 cursor-not-allowed" />
              <Input label="Phone" {...register('phone')} />
              <Input label="Email" value={tenant?.email || ''} readOnly className="bg-gray-50 cursor-not-allowed" />
              <Input label="Address" {...register('address')} />
              <Input label="City" {...register('city')} />
              <Input label="Country" {...register('country')} />
              <Input label="Website" {...register('website')} />
              <Input label="Tax Number" {...register('taxNumber')} />
              <Input label="License Number" value={tenant?.licenseNumber || ''} readOnly className="bg-gray-50 cursor-not-allowed" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={updateMutation.isPending} disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'subscription' && (
        <div className="max-w-lg">
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900">Subscription Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`badge ${tenant?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : tenant?.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {tenant?.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="text-sm font-medium text-gray-800">{tenant?.subscriptionPlan || 'Trial'}</span>
              </div>
              {tenant?.trialEndDate && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Trial Ends</span>
                  <span className="text-sm font-medium text-gray-800">{tenant?.trialEndDate}</span>
                </div>
              )}
              {tenant?.subscriptionEndDate && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Subscription Ends</span>
                  <span className="text-sm font-medium text-gray-800">{tenant?.subscriptionEndDate}</span>
                </div>
              )}
            </div>
            <div className="pt-2">
              <a href="mailto:helvinotechltd@gmail.com?subject=DPMS Subscription Upgrade"
                className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors">
                Upgrade / Renew Plan
              </a>
              <p className="text-center text-xs text-gray-400 mt-2">Contact: helvinotechltd@gmail.com | 0703445756</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
