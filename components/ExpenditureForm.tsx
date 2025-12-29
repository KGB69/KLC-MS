import React, { useState, useEffect } from 'react';
import { ExpenditureFormData, ExpenditureCategory, PaymentMethod, Expenditure, Currency } from '../types';
import { getDefaultCurrency, getCurrencySymbol, getAllCurrencies, getCurrencyName } from '../utils/currency';
import Modal from './shared/Modal';

interface ExpenditureFormProps {
  onSubmit: (expenditure: ExpenditureFormData) => void;
  onCancel: () => void;
  initialData?: Expenditure;
  isEditing?: boolean;
}

const ExpenditureForm: React.FC<ExpenditureFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false }) => {
  const initialFormState: ExpenditureFormData = {
    payeeName: '',
    expenditureDate: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: Currency.UGX, // Always default to UGX
    description: '',
    category: ExpenditureCategory.Other,
    paymentMethod: PaymentMethod.Cash,
  };

  const [formData, setFormData] = useState<ExpenditureFormData>(initialFormState);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        payeeName: initialData.payeeName,
        expenditureDate: initialData.expenditureDate,
        amount: initialData.amount,
        currency: initialData.currency,
        description: initialData.description,
        category: initialData.category,
        paymentMethod: initialData.paymentMethod,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.payeeName.trim() || formData.amount <= 0 || !formData.description.trim()) {
      alert("Please fill in all required fields with valid values.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Expenditure' : 'Record New Expenditure'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="payeeName" className="block text-sm font-medium text-slate-600 mb-1">Payee Name</label>
            <input
              type="text" id="payeeName" name="payeeName"
              value={formData.payeeName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="e.g., UMEME (Electricity)"
              required
            />
          </div>
          <div>
            <label htmlFor="expenditureDate" className="block text-sm font-medium text-slate-600 mb-1">Date of Expenditure</label>
            <input
              type="date" id="expenditureDate" name="expenditureDate"
              value={formData.expenditureDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500 font-medium">
                {getCurrencySymbol(formData.currency)}
              </span>
              <input
                type="number" id="amount" name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full pl-16 pr-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-600 mb-1">Currency</label>
            <input
              type="text"
              value="UGX - Ugandan Shilling"
              readOnly
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm cursor-not-allowed text-slate-700"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white">
              {Object.values(ExpenditureCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-600 mb-1">Payment Method</label>
            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white">
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">Description</label>
          <textarea
            id="description" name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Payment for May 2024 electricity bill"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-600 mb-1">Payment Method</label>
          <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white">
            {Object.values(PaymentMethod).map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
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
            className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
          >
            {isEditing ? 'Save Changes' : 'Record Expenditure'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenditureForm;
