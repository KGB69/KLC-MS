import React, { useState, useMemo, useEffect } from 'react';
import { Prospect } from '../types';
import { formatCurrency } from '../utils/currency';
import Modal from './shared/Modal';

interface TranslationCompletionFormProps {
  prospect: Prospect;
  onSave: (prospectId: string, completionData: Partial<Prospect>) => void;
  onCancel: () => void;
  initialData?: Prospect;
}

const TranslationCompletionForm: React.FC<TranslationCompletionFormProps> = ({ prospect, onSave, onCancel, initialData }) => {
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [ratePerPage, setRatePerPage] = useState(0);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setCompletionDate(initialData.translationCompletionDate || new Date().toISOString().split('T')[0]);
      setDocumentTitle(initialData.documentTitle || '');
      setNumberOfPages(initialData.numberOfPages || 1);
      setRatePerPage(initialData.translationRatePerPage || 0);
    }
  }, [initialData]);

  const totalFee = useMemo(() => {
    return (numberOfPages || 0) * (ratePerPage || 0);
  }, [numberOfPages, ratePerPage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!documentTitle.trim() || numberOfPages <= 0) {
      alert('Please fill in a valid document title and number of pages.');
      return;
    }
    onSave(prospect.id, {
      translationCompletionDate: completionDate,
      documentTitle,
      numberOfPages,
      translationRatePerPage: ratePerPage,
      translationTotalFee: totalFee,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Translation Record' : 'Convert Prospect'}
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
            <label htmlFor="documentTitle" className="block text-sm font-medium text-slate-600 mb-1">Document Title</label>
            <input
              type="text"
              id="documentTitle"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="e.g., Legal Contract XYZ"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="numberOfPages" className="block text-sm font-medium text-slate-600 mb-1">Number of Pages</label>
              <input
                type="number"
                id="numberOfPages"
                value={numberOfPages}
                onChange={(e) => setNumberOfPages(parseInt(e.target.value, 10) || 0)}
                min="1"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="ratePerPage" className="block text-sm font-medium text-slate-600 mb-1">Rate per Page (UGX)</label>
              <input
                type="number"
                id="ratePerPage"
                value={ratePerPage}
                onChange={(e) => setRatePerPage(parseFloat(e.target.value) || 0)}
                min="0"
                step="100"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="e.g., 5000"
                required
              />
            </div>
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

export default TranslationCompletionForm;