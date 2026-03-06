import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Trash2, Search, Eye, Printer } from 'lucide-react';
import api from '../../api/axios';
import { patientAPI, staffAPI } from '../../api/endpoints';
import { formatDate, getInitials } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const FREQUENCIES = [
  { value: 'Once daily', label: 'Once daily (OD)' },
  { value: 'Twice daily', label: 'Twice daily (BD)' },
  { value: 'Three times daily', label: 'Three times daily (TDS)' },
  { value: 'Four times daily', label: 'Four times daily (QID)' },
  { value: 'Every 6 hours', label: 'Every 6 hours' },
  { value: 'Every 8 hours', label: 'Every 8 hours' },
  { value: 'As needed', label: 'As needed (PRN)' },
  { value: 'At night', label: 'At night (Nocte)' },
];

const COMMON_MEDICINES = [
  'Amoxicillin 500mg', 'Metronidazole 400mg', 'Ibuprofen 400mg',
  'Paracetamol 500mg', 'Diclofenac 50mg', 'Chlorhexidine Mouthwash',
  'Clindamycin 300mg', 'Co-Amoxiclav 625mg', 'Tramadol 50mg',
  'Dexamethasone 0.5mg', 'Fluconazole 150mg', 'Nystatin Suspension',
];

export default function PrescriptionsPage() {
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: rxData, isLoading } = useQuery({
    queryKey: ['prescriptions', page],
    queryFn: () => api.get('/prescriptions', { params: { page, size: 20 } }).then(r => r.data.data),
  });

  const { data: patients } = useQuery({
    queryKey: ['patients-rx', patientSearch],
    queryFn: () => patientAPI.list({ search: patientSearch, size: 10 }).then(r => r.data.data.content),
    enabled: patientSearch.length > 1,
  });

  const { data: dentists } = useQuery({
    queryKey: ['dentists'],
    queryFn: () => staffAPI.dentists().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { items: [{ medicineName: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/prescriptions', {
      ...data,
      patientId: selectedPatient?.id,
      dentistId: Number(data.dentistId),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
      toast.success('Prescription created!');
      setModal(false);
      reset();
      setSelectedPatient(null);
      setPatientSearch('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error creating prescription'),
  });

  const dentistOptions = (dentists || []).map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }));
  const prescriptions = rxData?.content || [];

  const handlePrint = (rx) => {
    const printContent = `
      <html><head><title>Prescription</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .rx-symbol { font-size: 36px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; display: flex; justify-content: space-between; }
        .sig-line { border-bottom: 1px solid #333; width: 200px; margin-top: 30px; }
      </style></head><body>
      <div class="header">
        <p class="rx-symbol">℞</p>
        <h2>PRESCRIPTION</h2>
        <p>Date: ${formatDate(rx.prescriptionDate)} | Ref: ${rx.prescriptionNumber || rx.id}</p>
      </div>
      <p><strong>Patient:</strong> ${rx.patient?.firstName} ${rx.patient?.lastName} (${rx.patient?.patientNumber})</p>
      <p><strong>Prescribing Dentist:</strong> Dr. ${rx.dentist?.firstName} ${rx.dentist?.lastName}</p>
      ${rx.diagnosis ? `<p><strong>Diagnosis:</strong> ${rx.diagnosis}</p>` : ''}
      <table>
        <thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Qty</th><th>Instructions</th></tr></thead>
        <tbody>
          ${(rx.items || []).map((item, i) => `<tr><td>${i + 1}</td><td>${item.medicineName}</td><td>${item.dosage || '—'}</td><td>${item.frequency || '—'}</td><td>${item.duration || '—'}</td><td>${item.quantity || '—'}</td><td>${item.instructions || '—'}</td></tr>`).join('')}
        </tbody>
      </table>
      ${rx.notes ? `<p style="margin-top:15px"><strong>Notes:</strong> ${rx.notes}</p>` : ''}
      <div class="footer">
        <div><p>Patient Signature</p><div class="sig-line"></div></div>
        <div><p>Dentist Signature & Stamp</p><div class="sig-line"></div></div>
      </div>
      </body></html>
    `;
    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Prescriptions"
        subtitle={`${rxData?.totalElements || 0} prescriptions issued`}
        actions={
          <Button onClick={() => { setSelectedPatient(null); setPatientSearch(''); reset(); setModal(true); }}>
            <Plus className="w-4 h-4" /> New Prescription
          </Button>
        }
      />

      <div className="card !p-0">
        {isLoading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : prescriptions.length === 0 ? (
          <EmptyState
            title="No prescriptions"
            description="Issue your first prescription for a patient."
            action={<Button onClick={() => setModal(true)}><Plus className="w-4 h-4" /> New Prescription</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header">Ref #</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Dentist</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Medicines</th>
                  <th className="table-header">Diagnosis</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {prescriptions.map(rx => (
                  <tr key={rx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-cell font-mono text-xs text-gray-400">{rx.prescriptionNumber || `RX-${rx.id}`}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                          {getInitials(`${rx.patient?.firstName} ${rx.patient?.lastName}`)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{rx.patient?.firstName} {rx.patient?.lastName}</p>
                          <p className="text-xs text-gray-400">{rx.patient?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-gray-600">Dr. {rx.dentist?.firstName} {rx.dentist?.lastName}</td>
                    <td className="table-cell text-xs text-gray-500">{formatDate(rx.prescriptionDate)}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(rx.items || []).slice(0, 2).map((item, i) => (
                          <span key={i} className="badge bg-blue-50 text-blue-600 text-xs">{item.medicineName}</span>
                        ))}
                        {(rx.items || []).length > 2 && (
                          <span className="badge bg-gray-100 text-gray-500 text-xs">+{rx.items.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-xs text-gray-500 max-w-36 truncate">{rx.diagnosis || '—'}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedRx(rx); setViewModal(true); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handlePrint(rx)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {rxData && rxData.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {rxData.page + 1} of {rxData.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={rxData.first} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={rxData.last} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); reset(); setSelectedPatient(null); }} title="New Prescription" size="xl">
        <form onSubmit={handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
          {/* Patient search */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Patient *</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 mt-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient by name or phone..."
                value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setSelectedPatient(null); setShowDropdown(true); }}
                className="text-sm outline-none flex-1"
              />
              {selectedPatient && (
                <button type="button" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
              )}
            </div>
            {showDropdown && patients && patients.length > 0 && !selectedPatient && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-30 max-h-48 overflow-y-auto">
                {patients.map(p => (
                  <button key={p.id} type="button"
                    onClick={() => { setSelectedPatient(p); setPatientSearch(''); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0">
                    <span className="font-medium">{p.firstName} {p.lastName}</span>
                    <span className="text-gray-400 ml-2 text-xs font-mono">{p.patientNumber}</span>
                    {p.allergies && <span className="ml-2 text-xs text-red-500">⚠ Allergies: {p.allergies}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPatient?.allergies && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <strong>⚠ Known Allergies:</strong> {selectedPatient.allergies}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select label="Prescribing Dentist *" options={dentistOptions} placeholder="Select dentist" {...register('dentistId', { required: true })} />
            <Input label="Prescription Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} {...register('prescriptionDate')} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Diagnosis</label>
            <textarea className="input-field mt-1 h-16 resize-none" placeholder="Clinical diagnosis..." {...register('diagnosis')} />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Medicines *</label>
              <Button type="button" size="sm" variant="secondary"
                onClick={() => append({ medicineName: '', dosage: '', frequency: '', duration: '', quantity: '', instructions: '' })}>
                <Plus className="w-3 h-3" /> Add Medicine
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div key={field.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Medicine #{idx + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-xs text-gray-600">Medicine Name *</label>
                      <input
                        list={`meds-${idx}`}
                        className="input-field mt-0.5 text-sm"
                        placeholder="e.g. Amoxicillin 500mg"
                        {...register(`items.${idx}.medicineName`, { required: true })}
                      />
                      <datalist id={`meds-${idx}`}>
                        {COMMON_MEDICINES.map(m => <option key={m} value={m} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Dosage</label>
                      <input className="input-field mt-0.5 text-sm" placeholder="e.g. 1 tablet" {...register(`items.${idx}.dosage`)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Frequency</label>
                      <select className="input-field mt-0.5 text-sm" {...register(`items.${idx}.frequency`)}>
                        <option value="">Select frequency</option>
                        {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Duration</label>
                      <input className="input-field mt-0.5 text-sm" placeholder="e.g. 7 days" {...register(`items.${idx}.duration`)} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Quantity</label>
                      <input className="input-field mt-0.5 text-sm" placeholder="e.g. 21 tablets" {...register(`items.${idx}.quantity`)} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-600">Special Instructions</label>
                      <input className="input-field mt-0.5 text-sm" placeholder="e.g. Take with food" {...register(`items.${idx}.instructions`)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea className="input-field mt-1 h-16 resize-none" placeholder="Follow-up instructions, dietary advice..." {...register('notes')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => { setModal(false); reset(); setSelectedPatient(null); }}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending} disabled={!selectedPatient}>Issue Prescription</Button>
          </div>
        </form>
      </Modal>

      {/* View Prescription Modal */}
      <Modal isOpen={viewModal} onClose={() => { setViewModal(false); setSelectedRx(null); }} title="Prescription Details" size="lg">
        {selectedRx && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedRx.patient?.firstName} {selectedRx.patient?.lastName}</h3>
                <p className="text-gray-500 text-sm font-mono">{selectedRx.patient?.patientNumber}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p className="font-mono">{selectedRx.prescriptionNumber || `RX-${selectedRx.id}`}</p>
                <p>{formatDate(selectedRx.prescriptionDate)}</p>
                <p>Dr. {selectedRx.dentist?.firstName} {selectedRx.dentist?.lastName}</p>
              </div>
            </div>

            {selectedRx.diagnosis && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-600">Diagnosis</p>
                <p className="text-sm text-blue-800 mt-0.5">{selectedRx.diagnosis}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-2xl font-serif">℞</span> Medications
              </h4>
              <div className="space-y-3">
                {(selectedRx.items || []).map((item, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <p className="font-semibold text-gray-900">{i + 1}. {item.medicineName}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                      {item.dosage && <p><span className="text-gray-400">Dose:</span> {item.dosage}</p>}
                      {item.frequency && <p><span className="text-gray-400">Frequency:</span> {item.frequency}</p>}
                      {item.duration && <p><span className="text-gray-400">Duration:</span> {item.duration}</p>}
                      {item.quantity && <p><span className="text-gray-400">Quantity:</span> {item.quantity}</p>}
                    </div>
                    {item.instructions && <p className="text-xs text-gray-400 mt-1 italic">* {item.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>

            {selectedRx.notes && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500">Notes</p>
                <p className="text-sm text-gray-700 mt-0.5">{selectedRx.notes}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => handlePrint(selectedRx)}>
                <Printer className="w-4 h-4" /> Print Prescription
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
