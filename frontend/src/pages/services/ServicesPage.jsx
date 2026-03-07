import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, X, Clock, FlaskConical,
  Stethoscope, DollarSign, Tag, FileCode, ChevronDown
} from 'lucide-react';
import { serviceAPI } from '../../api/endpoints';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CATEGORIES = [
  'General Dentistry',
  'Orthodontics',
  'Oral Surgery',
  'Endodontics',
  'Periodontics',
  'Cosmetic Dentistry',
  'Pediatric Dentistry',
  'Radiology / Imaging',
  'Prosthodontics',
  'Emergency',
  'Other',
];

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  durationMinutes: z.coerce.number().min(1, 'Duration required').optional().or(z.literal('')),
  procedureCode: z.string().optional(),
  description: z.string().optional(),
  requiresLab: z.boolean().optional(),
});

function ServiceModal({ service, onClose }) {
  const qc = useQueryClient();
  const isEdit = !!service;

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? {
      name: service.name,
      category: service.category || '',
      price: service.price,
      durationMinutes: service.durationMinutes || '',
      procedureCode: service.procedureCode || '',
      description: service.description || '',
      requiresLab: service.requiresLab || false,
    } : { requiresLab: false },
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? serviceAPI.update(service.id, data)
      : serviceAPI.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Service updated' : 'Service created');
      qc.invalidateQueries(['services']);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save service'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit Service' : 'Add New Service'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="p-6 space-y-4">
          <Input label="Service Name *" placeholder="e.g. Dental Cleaning" error={errors.name?.message} {...register('name')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category *</label>
            <div className="relative">
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (KES) *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              min="1"
              placeholder="30"
              error={errors.durationMinutes?.message}
              {...register('durationMinutes')}
            />
          </div>

          <Input
            label="Procedure Code"
            placeholder="e.g. D1110"
            error={errors.procedureCode?.message}
            {...register('procedureCode')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Brief description of the service..."
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('requiresLab')} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Requires laboratory work</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1 justify-center" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 justify-center" loading={mutation.isPending}>
              {isEdit ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CATEGORY_COLORS = {
  'General Dentistry': 'bg-blue-50 text-blue-700',
  'Orthodontics': 'bg-purple-50 text-purple-700',
  'Oral Surgery': 'bg-red-50 text-red-700',
  'Endodontics': 'bg-orange-50 text-orange-700',
  'Periodontics': 'bg-green-50 text-green-700',
  'Cosmetic Dentistry': 'bg-pink-50 text-pink-700',
  'Pediatric Dentistry': 'bg-yellow-50 text-yellow-700',
  'Radiology / Imaging': 'bg-indigo-50 text-indigo-700',
  'Prosthodontics': 'bg-teal-50 text-teal-700',
  'Emergency': 'bg-red-50 text-red-700',
  'Other': 'bg-gray-50 text-gray-600',
};

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalService, setModalService] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const qc = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.listAll().then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceAPI.delete(id),
    onSuccess: () => { toast.success('Service removed'); qc.invalidateQueries(['services']); setDeleteTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const activeServices = services.filter(s => s.isActive !== false);
  const categories = ['All', ...new Set(activeServices.map(s => s.category).filter(Boolean))];

  const filtered = activeServices.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase()) ||
      s.procedureCode?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Group by category
  const grouped = filtered.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  const totalRevenuePotential = filtered.reduce((sum, s) => sum + Number(s.price || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeServices.length} service{activeServices.length !== 1 ? 's' : ''} available</p>
        </div>
        <Button onClick={() => setModalService(null)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: activeServices.length, icon: Stethoscope, color: 'bg-primary-50 text-primary-600' },
          { label: 'Categories', value: categories.length - 1, icon: Tag, color: 'bg-purple-50 text-purple-600' },
          { label: 'Require Lab', value: activeServices.filter(s => s.requiresLab).length, icon: FlaskConical, color: 'bg-orange-50 text-orange-600' },
          { label: 'Avg Price', value: activeServices.length ? `KES ${Math.round(activeServices.reduce((s, x) => s + Number(x.price), 0) / activeServices.length).toLocaleString()}` : '—', icon: DollarSign, color: 'bg-green-50 text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">{label}</p>
              <p className="text-gray-900 font-bold text-lg">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services grouped by category */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Loading services...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Stethoscope className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No services found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first service to get started</p>
          <Button onClick={() => setModalService(null)} className="mt-4 gap-2" size="sm">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']}`}>
                  {category}
                </span>
                <span className="text-gray-400 text-sm">{items.length} service{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(service => (
                  <div key={service.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
                        {service.procedureCode && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <FileCode className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{service.procedureCode}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                        <button
                          onClick={() => setModalService(service)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {service.description && (
                      <p className="text-gray-500 text-xs mb-3 line-clamp-2">{service.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-bold text-lg">
                        KES {Number(service.price).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {service.durationMinutes && (
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="w-3 h-3" />
                            {service.durationMinutes}m
                          </div>
                        )}
                        {service.requiresLab && (
                          <div className="flex items-center gap-1 bg-orange-50 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                            <FlaskConical className="w-3 h-3" />
                            Lab
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalService !== undefined && (
        <ServiceModal service={modalService} onClose={() => setModalService(undefined)} />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Remove Service</h3>
            <p className="text-gray-500 text-sm mb-6">
              Remove <strong>{deleteTarget.name}</strong>? It will no longer appear in active services.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1 justify-center" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
