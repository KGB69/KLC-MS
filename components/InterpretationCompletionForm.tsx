import React, { useState, useMemo, useEffect } from 'react';
import { Prospect, InterpretationDurationUnit } from '../types';
import { formatCurrency } from '../utils/currency';
import Modal from './shared/Modal';

interface InterpretationCompletionFormProps {
  prospect: Prospect;
  onSave: (prospectId: string, completionData: Partial<Prospect>) => void;
  onCancel: () => void;
  initialData?: Prospect;
}

const InterpretationCompletionForm: React.FC<InterpretationCompletionFormProps> = ({ prospect, onSave, onCancel, initialData }) => {
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(1);
  const [unit, setUnit] = useState<InterpretationDurationUnit>(InterpretationDurationUnit.Hours);
  const [rate, setRate] = useState(0);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setCompletionDate(initialData.interpretationCompletionDate || new Date().toISOString().split('T')[0]);
      setSubject(initialData.subjectOfInterpretation || '');
      setDuration(initialData.interpretationDuration || 1);
      setUnit(initialData.interpretationDurationUnit || InterpretationDurationUnit.Hours);
      setRate(initialData.interpretationRate || 0);
    }
  }, [initialData]);

  const totalFee = useMemo(() => {
    return (duration || 0) * (rate || 0);
  }, [duration, rate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subject.trim() || duration <= 0) {
      alert('Please fill in a valid subject and duration.');
      return;
    }
    onSave(prospect.id, {
      interpretationCompletionDate: completionDate,
      subjectOfInterpretation: subject,
      interpretationDuration: duration,
      interpretationDurationUnit: unit,
      interpretationRate: rate,
      interpretationTotalFee: totalFee,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Interpretation Record' : 'Convert Prospect'}
    >
      <div className="mb-6">
        <p className="text-sm text-slate-500">For prospect: <strong className="font-semibold text-slate-900">{prospect.prospectName}</strong></p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="completionDate" className="block text-sm font-medium text-slate-600 mb-1">Completion Date</label>
            <input
              type="date"
              id="completionDate"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-600 mb-1">Subject of Interpretation</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Medical Appointment"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-600 mb-1">Duration</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                min={unit === InterpretationDurationUnit.Hours ? 0.5 : 1}
                step={unit === InterpretationDurationUnit.Hours ? 0.5 : 1}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as InterpretationDurationUnit)}
                className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white"
              >
                <option value={InterpretationDurationUnit.Hours}>Hours</option>
                <option value={InterpretationDurationUnit.Days}>Days</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-slate-600 mb-1">Rate per {unit.slice(0, -1)} (UGX)</label>
            <input
              type="number"
              id="rate"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="e.g., 50000"
              required
            />
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center">
            <p className="text-sm font-medium text-slate-600">Total Fee</p>
            <p className="text-2xl font-bold text-brand-dark tracking-tight">{formatCurrency(totalFee)}</p>
          </div>
        </div>

        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            {isEditing ? 'Save Changes' : 'Save & Complete'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InterpretationCompletionForm;