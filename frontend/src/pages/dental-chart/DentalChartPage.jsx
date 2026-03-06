import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { dentalChartAPI, patientAPI } from '../../api/endpoints';
import { cn } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const UPPER_TEETH = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_TEETH = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

const CONDITION_COLORS = {
  HEALTHY: 'bg-green-100 border-green-300 text-green-700',
  DECAYED: 'bg-red-100 border-red-400 text-red-700',
  FILLED: 'bg-blue-100 border-blue-300 text-blue-700',
  MISSING: 'bg-gray-200 border-gray-400 text-gray-500',
  CROWN: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  IMPLANT: 'bg-purple-100 border-purple-400 text-purple-700',
  ROOT_CANAL: 'bg-orange-100 border-orange-400 text-orange-700',
  BRIDGE: 'bg-teal-100 border-teal-400 text-teal-700',
  EXTRACTION_NEEDED: 'bg-red-200 border-red-500 text-red-800',
  FRACTURED: 'bg-pink-100 border-pink-400 text-pink-700',
  SENSITIVE: 'bg-indigo-100 border-indigo-300 text-indigo-700',
};

const CONDITIONS = Object.keys(CONDITION_COLORS);

export default function DentalChartPage() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothModal, setToothModal] = useState(false);
  const [toothForm, setToothForm] = useState({ condition: 'HEALTHY', notes: '', hasCrown: false, hasImplant: false, hasBridge: false, hasRootCanal: false, hasFilling: false, isMissing: false, fillingMaterial: '', surface: '' });
  const queryClient = useQueryClient();

  const { data: patients } = useQuery({
    queryKey: ['patients-search', searchQuery],
    queryFn: () => patientAPI.list({ search: searchQuery, size: 10 }).then(r => r.data.data.content),
    enabled: searchQuery.length > 1,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dental-chart', selectedPatient?.id],
    queryFn: () => dentalChartAPI.getPatientChart(selectedPatient.id).then(r => r.data.data),
    enabled: !!selectedPatient,
  });

  const updateMutation = useMutation({
    mutationFn: ({ toothNumber, data }) =>
      dentalChartAPI.updateTooth(selectedPatient.id, toothNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['dental-chart', selectedPatient?.id]);
      toast.success('Tooth updated!');
      setToothModal(false);
    },
    onError: () => toast.error('Failed to update tooth'),
  });

  const getToothData = (num) =>
    (chartData || []).find(t => t.toothNumber === String(num));

  const getToothColor = (num) => {
    const t = getToothData(num);
    if (!t) return 'bg-gray-50 border-gray-200 text-gray-400';
    return CONDITION_COLORS[t.condition] || CONDITION_COLORS.HEALTHY;
  };

  const openTooth = (num) => {
    const existing = getToothData(num);
    setSelectedTooth(num);
    setToothForm(existing ? {
      condition: existing.condition || 'HEALTHY',
      notes: existing.notes || '',
      hasCrown: existing.hasCrown || false,
      hasImplant: existing.hasImplant || false,
      hasBridge: existing.hasBridge || false,
      hasRootCanal: existing.hasRootCanal || false,
      hasFilling: existing.hasFilling || false,
      isMissing: existing.isMissing || false,
      fillingMaterial: existing.fillingMaterial || '',
      surface: existing.surface || '',
    } : { condition: 'HEALTHY', notes: '', hasCrown: false, hasImplant: false, hasBridge: false, hasRootCanal: false, hasFilling: false, isMissing: false, fillingMaterial: '', surface: '' });
    setToothModal(true);
  };

  const ToothButton = ({ number }) => (
    <button
      onClick={() => selectedPatient && openTooth(number)}
      disabled={!selectedPatient}
      title={`Tooth ${number}: ${getToothData(number)?.condition || 'HEALTHY'}`}
      className={cn(
        'w-10 h-12 rounded-lg border-2 text-xs font-bold transition-all hover:scale-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60',
        getToothColor(number)
      )}
    >
      {number}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dental Chart" subtitle="Interactive digital dental charting system" />

      {/* Patient search */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3">Select Patient</h3>
        <div className="relative">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient by name or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm outline-none flex-1"
            />
          </div>
          {patients && patients.length > 0 && searchQuery.length > 1 && !selectedPatient && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setSearchQuery(`${p.firstName} ${p.lastName}`); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-50 last:border-0"
                >
                  <span className="font-medium text-gray-800">{p.firstName} {p.lastName}</span>
                  <span className="text-gray-400 ml-2 font-mono text-xs">{p.patientNumber}</span>
                  <span className="text-gray-400 ml-2">{p.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedPatient && (
          <div className="mt-3 flex items-center justify-between bg-primary-50 border border-primary-100 rounded-xl px-4 py-2">
            <div>
              <span className="text-primary-800 font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</span>
              <span className="text-primary-500 text-sm ml-2">({selectedPatient.patientNumber})</span>
            </div>
            <button onClick={() => { setSelectedPatient(null); setSearchQuery(''); }}
              className="text-xs text-primary-500 hover:text-primary-700 font-medium">
              Change
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Condition Legend</h3>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => (
            <span key={c} className={cn('badge border', CONDITION_COLORS[c])}>
              {c.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Dental Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-6 text-center">
          {selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName} — Dental Chart` : 'Select a patient to view chart'}
        </h3>

        {chartLoading && <LoadingSpinner className="py-8" />}

        {!chartLoading && (
          <div className="space-y-8">
            {/* Upper jaw label */}
            <div>
              <p className="text-xs text-gray-400 font-medium text-center mb-2 uppercase tracking-widest">Upper Jaw (Maxilla)</p>
              <div className="flex justify-center gap-1 flex-wrap">
                {UPPER_TEETH.map(n => <ToothButton key={n} number={n} />)}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t-2 border-dashed border-gray-200" />
              <span className="mx-4 text-xs text-gray-300 font-medium">BITE LINE</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-200" />
            </div>

            {/* Lower jaw */}
            <div>
              <div className="flex justify-center gap-1 flex-wrap">
                {LOWER_TEETH.map(n => <ToothButton key={n} number={n} />)}
              </div>
              <p className="text-xs text-gray-400 font-medium text-center mt-2 uppercase tracking-widest">Lower Jaw (Mandible)</p>
            </div>
          </div>
        )}

        {!selectedPatient && (
          <div className="text-center py-12 text-gray-300">
            <div className="text-6xl mb-4">🦷</div>
            <p className="text-gray-400">Search and select a patient above to view their dental chart</p>
          </div>
        )}
      </div>

      {/* Tooth Edit Modal */}
      <Modal isOpen={toothModal} onClose={() => setToothModal(false)} title={`Tooth ${selectedTooth}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Condition</label>
            <select
              value={toothForm.condition}
              onChange={e => setToothForm(f => ({ ...f, condition: e.target.value }))}
              className="input-field mt-1"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Surface</label>
            <input
              className="input-field mt-1"
              placeholder="e.g. Mesial, Distal, Occlusal..."
              value={toothForm.surface}
              onChange={e => setToothForm(f => ({ ...f, surface: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['hasFilling', 'Has Filling'],
              ['hasCrown', 'Has Crown'],
              ['hasImplant', 'Has Implant'],
              ['hasBridge', 'Has Bridge'],
              ['hasRootCanal', 'Root Canal Done'],
              ['isMissing', 'Tooth Missing'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={toothForm[key]}
                  onChange={e => setToothForm(f => ({ ...f, [key]: e.target.checked }))}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>

          {toothForm.hasFilling && (
            <div>
              <label className="text-sm font-medium text-gray-700">Filling Material</label>
              <input
                className="input-field mt-1"
                placeholder="e.g. Composite, Amalgam, GIC..."
                value={toothForm.fillingMaterial}
                onChange={e => setToothForm(f => ({ ...f, fillingMaterial: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Clinical Notes</label>
            <textarea
              className="input-field mt-1 h-20 resize-none"
              placeholder="Notes about this tooth..."
              value={toothForm.notes}
              onChange={e => setToothForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setToothModal(false)}>Cancel</Button>
            <Button
              loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ toothNumber: String(selectedTooth), data: toothForm })}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
