import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, DollarSign, FileText } from 'lucide-react';
import { patientAPI, serviceAPI } from '../../api/endpoints';
import api from '../../api/axios';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

export default function BillingPage() {
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices', page],
    queryFn: () => api.get('/invoices', { params: { page, size: 20 } }).then(r => r.data.data),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-list'],
    queryFn: () => patientAPI.list({ size: 200 }).then(r => r.data.data.content),
  });

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => serviceAPI.list().then(r => r.data.data),
  });

  const { register, handleSubmit, control, watch, reset, setValue } = useForm({
    defaultValues: {
      items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0 }],
      discount: 0, tax: 0, insuranceCoverage: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedItems = watch('items');
  const watchDiscount = watch('discount') || 0;
  const watchTax = watch('tax') || 0;
  const watchInsurance = watch('insuranceCoverage') || 0;

  const subtotal = (watchedItems || []).reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;
    return sum + (qty * price - disc);
  }, 0);
  const total = subtotal - Number(watchDiscount) + Number(watchTax) - Number(watchInsurance);

  const createInvoiceMutation = useMutation({
    mutationFn: (data) => api.post('/invoices', {
      ...data,
      patientId: Number(data.patientId),
      subtotal,
      totalAmount: total > 0 ? total : 0,
      balance: total > 0 ? total : 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success('Invoice created!');
      setInvoiceModal(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error creating invoice'),
  });

  const paymentMutation = useMutation({
    mutationFn: (data) => api.post('/payments', {
      ...data,
      invoiceId: selectedInvoice.id,
      amount: Number(data.amount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success('Payment recorded!');
      setPaymentModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error recording payment'),
  });

  const { register: regPay, handleSubmit: handlePay, reset: resetPay } = useForm();

  const patientOptions = (patients || []).map(p => ({
    value: p.id, label: `${p.firstName} ${p.lastName} (${p.patientNumber})`,
  }));
  const serviceOptions = (services || []).map(s => ({
    value: s.id, label: `${s.name} — ${formatCurrency(s.price)}`,
  }));

  const invoices = invoicesData?.content || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Billing & Payments"
        subtitle="Manage invoices and record payments"
        actions={
          <Button onClick={() => setInvoiceModal(true)}>
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: invoicesData?.totalElements || 0, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending Payment', value: (invoices.filter(i => i.paymentStatus === 'PENDING').length), color: 'text-orange-600 bg-orange-50' },
          { label: 'Paid Today', value: (invoices.filter(i => i.paymentStatus === 'PAID').length), color: 'text-green-600 bg-green-50' },
          { label: 'Overdue', value: (invoices.filter(i => i.paymentStatus === 'OVERDUE').length), color: 'text-red-600 bg-red-50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card !p-4">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={cn('text-2xl font-bold mt-1 px-2 py-0.5 rounded-lg inline-block', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Invoices table */}
      <div className="card !p-0">
        {isLoading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Create your first invoice to get started."
            action={<Button onClick={() => setInvoiceModal(true)}><Plus className="w-4 h-4" /> New Invoice</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Invoice #</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Paid</th>
                  <th className="table-header">Balance</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell font-mono text-xs text-gray-500">{inv.invoiceNumber}</td>
                    <td className="table-cell">
                      <p className="font-medium text-gray-800">
                        {inv.patient?.firstName} {inv.patient?.lastName}
                      </p>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{formatDate(inv.invoiceDate)}</td>
                    <td className="table-cell font-semibold text-gray-900">{formatCurrency(inv.totalAmount)}</td>
                    <td className="table-cell text-green-600 font-medium">{formatCurrency(inv.amountPaid)}</td>
                    <td className="table-cell text-red-500 font-medium">{formatCurrency(inv.balance)}</td>
                    <td className="table-cell">
                      <Badge status={inv.paymentStatus}>
                        {inv.paymentStatus?.charAt(0) + inv.paymentStatus?.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      {inv.paymentStatus !== 'PAID' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => { setSelectedInvoice(inv); resetPay({ amount: inv.balance }); setPaymentModal(true); }}
                        >
                          <DollarSign className="w-3 h-3" /> Pay
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {invoicesData && invoicesData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {invoicesData.page + 1} of {invoicesData.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={invoicesData.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={invoicesData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={invoiceModal} onClose={() => { setInvoiceModal(false); reset(); }} title="Create Invoice" size="xl">
        <form onSubmit={handleSubmit(data => createInvoiceMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Patient *" options={patientOptions} placeholder="Select patient" {...register('patientId', { required: true })} />
            <Input label="Invoice Date" type="date" {...register('invoiceDate')} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Line Items</label>
              <Button
                type="button" size="sm" variant="secondary"
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0, discount: 0 })}
              >
                <Plus className="w-3 h-3" /> Add Item
              </Button>
            </div>

            <div className="space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                <span className="col-span-4">Description</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-3">Unit Price</span>
                <span className="col-span-2">Discount</span>
                <span className="col-span-1"></span>
              </div>
              {fields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                  <input className="col-span-4 input-field text-xs py-1.5" placeholder="Service/item description" {...register(`items.${idx}.description`)} />
                  <input type="number" min="1" className="col-span-2 input-field text-xs py-1.5" {...register(`items.${idx}.quantity`)} />
                  <input type="number" min="0" step="0.01" className="col-span-3 input-field text-xs py-1.5" {...register(`items.${idx}.unitPrice`)} />
                  <input type="number" min="0" step="0.01" className="col-span-2 input-field text-xs py-1.5" {...register(`items.${idx}.discount`)} />
                  <button type="button" onClick={() => remove(idx)} className="col-span-1 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Overall Discount (KES)" type="number" min="0" step="0.01" {...register('discount')} />
            <Input label="Tax (KES)" type="number" min="0" step="0.01" {...register('tax')} />
            <Input label="Insurance Coverage (KES)" type="number" min="0" step="0.01" {...register('insuranceCoverage')} />
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount</span><span>- {formatCurrency(watchDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span><span>+ {formatCurrency(watchTax)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Insurance</span><span>- {formatCurrency(watchInsurance)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-2">
              <span>Total</span><span>{formatCurrency(total > 0 ? total : 0)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea className="input-field mt-1 h-16 resize-none" {...register('notes')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setInvoiceModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createInvoiceMutation.isPending}>Create Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={paymentModal} onClose={() => setPaymentModal(false)} title="Record Payment" size="sm">
        {selectedInvoice && (
          <form onSubmit={handlePay(data => paymentMutation.mutate(data))} className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                Invoice <span className="font-mono font-semibold">{selectedInvoice.invoiceNumber}</span>
              </p>
              <p className="text-sm text-blue-600">Outstanding: <span className="font-bold">{formatCurrency(selectedInvoice.balance)}</span></p>
            </div>
            <Input label="Amount (KES)" type="number" min="0" step="0.01" {...regPay('amount', { required: true })} />
            <Select label="Payment Method" options={PAYMENT_METHODS} placeholder="Select method" {...regPay('paymentMethod', { required: true })} />
            <Input label="Transaction Reference" placeholder="Optional" {...regPay('transactionReference')} />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setPaymentModal(false)}>Cancel</Button>
              <Button type="submit" loading={paymentMutation.isPending}>Record Payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
