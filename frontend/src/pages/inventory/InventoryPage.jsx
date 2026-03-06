import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import { inventoryAPI } from '../../api/endpoints';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = [
  { value: 'DENTAL_MATERIALS', label: 'Dental Materials' },
  { value: 'MEDICINES', label: 'Medicines' },
  { value: 'CONSUMABLES', label: 'Consumables' },
  { value: 'EQUIPMENT_PARTS', label: 'Equipment Parts' },
  { value: 'PROTECTIVE', label: 'Protective Gear' },
  { value: 'OTHER', label: 'Other' },
];

export default function InventoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', page],
    queryFn: () => inventoryAPI.list({ page, size: 20 }).then(r => r.data.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory-low'],
    queryFn: () => inventoryAPI.lowStock().then(r => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm();

  const saveMutation = useMutation({
    mutationFn: (data) => selected ? inventoryAPI.update(selected.id, data) : inventoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success(selected ? 'Item updated!' : 'Item added!');
      setModalOpen(false);
      reset();
      setSelected(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error saving item'),
  });

  const openEdit = (item) => {
    setSelected(item);
    reset({ name: item.name, sku: item.sku || '', category: item.category || '', unit: item.unit || '', currentStock: item.currentStock, minimumStock: item.minimumStock, reorderLevel: item.reorderLevel, unitCost: item.unitCost, sellingPrice: item.sellingPrice, expiryDate: item.expiryDate || '', batchNumber: item.batchNumber || '', location: item.location || '' });
    setModalOpen(true);
  };

  const items = inventoryData?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory Management"
        subtitle={`${inventoryData?.totalElements || 0} items`}
        actions={<Button onClick={() => { setSelected(null); reset({}); setModalOpen(true); }}><Plus className="w-4 h-4" /> Add Item</Button>}
      />

      {/* Low stock alert */}
      {(lowStock || []).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="font-semibold text-orange-700">{lowStock.length} items below reorder level</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.slice(0, 5).map(item => (
              <span key={item.id} className="badge bg-orange-100 text-orange-700 border border-orange-200">
                {item.name} ({item.currentStock} {item.unit || 'units'})
              </span>
            ))}
            {lowStock.length > 5 && <span className="badge bg-orange-100 text-orange-600">+{lowStock.length - 5} more</span>}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card !p-0">
        {isLoading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState title="No inventory items" description="Add your first item to start tracking stock." action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Item</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Item</th>
                  <th className="table-header">SKU</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header">Reorder Level</th>
                  <th className="table-header">Unit Cost</th>
                  <th className="table-header">Expiry</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => {
                  const isLow = item.currentStock <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.unit || 'pcs'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-mono text-xs text-gray-400">{item.sku || '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{item.category?.replace(/_/g, ' ') || '—'}</td>
                      <td className="table-cell">
                        <span className={cn('font-bold text-sm', isLow ? 'text-red-600' : 'text-gray-800')}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-gray-500">{item.reorderLevel}</td>
                      <td className="table-cell text-sm text-gray-700">{item.unitCost ? formatCurrency(item.unitCost) : '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{formatDate(item.expiryDate)}</td>
                      <td className="table-cell">
                        <span className={cn('badge', isLow ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {inventoryData && inventoryData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {inventoryData.page + 1} of {inventoryData.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={inventoryData.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={inventoryData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); reset(); }}
        title={selected ? 'Edit Item' : 'Add Inventory Item'} size="lg">
        <form onSubmit={handleSubmit(data => saveMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Item Name *" {...register('name', { required: true })} />
            <Input label="SKU / Code" {...register('sku')} />
            <Select label="Category" options={CATEGORIES} placeholder="Select category" {...register('category')} />
            <Input label="Unit" placeholder="pcs, ml, kg, boxes..." {...register('unit')} />
            <Input label="Current Stock" type="number" min="0" {...register('currentStock')} />
            <Input label="Minimum Stock" type="number" min="0" {...register('minimumStock')} />
            <Input label="Reorder Level" type="number" min="0" {...register('reorderLevel')} />
            <Input label="Unit Cost (KES)" type="number" min="0" step="0.01" {...register('unitCost')} />
            <Input label="Selling Price (KES)" type="number" min="0" step="0.01" {...register('sellingPrice')} />
            <Input label="Expiry Date" type="date" {...register('expiryDate')} />
            <Input label="Batch Number" {...register('batchNumber')} />
            <Input label="Storage Location" placeholder="e.g. Shelf A3" {...register('location')} />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded" {...register('isMedicine')} />
              Is Medicine
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" className="rounded" {...register('isConsumable')} />
              Is Consumable
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>{selected ? 'Update Item' : 'Add Item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
