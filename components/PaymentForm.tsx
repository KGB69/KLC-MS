import React, { useState, useEffect, useMemo } from 'react';
import { PaymentFormData, PaymentMethod, ServiceType, Client, Payment, Currency, ProspectDataStore } from '../types';
import { formatCurrency, getDefaultCurrency, getCurrencySymbol, getAllCurrencies, getCurrencyName } from '../utils/currency';
import { formatDateForInput, getTodayDate } from '../utils/dateUtils';
import Modal from './shared/Modal';

interface PaymentFormProps {
  onSubmit: (payment: PaymentFormData) => void;
  onCancel: () => void;
  initialData?: Payment;
  isEditing?: boolean;
  clients: Client[];
  dataStore: ProspectDataStore;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false, clients, dataStore }) => {

  const initialFormState: PaymentFormData = {
    payerName: '',
    clientId: '',
    paymentDate: getTodayDate(),
    amount: 0,
    currency: Currency.UGX, // Always default to UGX
    service: ServiceType.LanguageTraining,
    paymentMethod: PaymentMethod.Cash,
    notes: '',
  };

  const [formData, setFormData] = useState<PaymentFormData>(initialFormState);
  const [outstandingBalance, setOutstandingBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        payerName: initialData.payerName,
        clientId: initialData.clientId,
        paymentDate: formatDateForInput(initialData.paymentDate),
        amount: initialData.amount,
        currency: initialData.currency,
        service: initialData.service,
        paymentMethod: initialData.paymentMethod,
        notes: initialData.notes || '',
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isEditing]);

  // Effect to calculate balance when client changes
  useEffect(() => {
    const calculateBalance = async () => {
      if (!formData.clientId) {
        setOutstandingBalance(0);
        return;
      }
      setIsLoadingBalance(true);
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (!selectedClient) {
        setOutstandingBalance(0);
        setIsLoadingBalance(false);
        return;
      }

      try {
        const clientPayments = await dataStore.getPaymentsForClient(formData.clientId);
        let totalPaid = clientPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        // If editing, subtract the current payment's amount from totalPaid
        if (isEditing && initialData && initialData.clientId === formData.clientId) {
          totalPaid -= (Number(initialData.amount) || 0);
        }

        const balance = (Number(selectedClient.totalFee) || 0) - totalPaid;
        setOutstandingBalance(balance);
      } catch (err) {
        console.error("Failed to fetch payments for balance calculation", err);
        setOutstandingBalance(0); // Default to 0 on error
      } finally {
        setIsLoadingBalance(false);
      }
    };
    calculateBalance();
  }, [formData.clientId, clients, dataStore, isEditing, initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name === 'clientId') {
      const selectedClient = clients.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        clientId: value,
        payerName: selectedClient ? selectedClient.name : '',
        service: selectedClient ? selectedClient.service : ServiceType.LanguageTraining,
        amount: 0 // Reset amount on client change
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.clientId || formData.amount <= 0) {
      alert("Please select a client and enter a valid payment amount.");
      return;
    }
    const amount = Number(formData.amount) || 0;
    const remainingBalance = outstandingBalance - amount;
    onSubmit({ ...formData, amount: amount, balance: remainingBalance, balanceCurrency: formData.currency });
  };

  const newBalance = outstandingBalance - (Number(formData.amount) || 0);

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={isEditing ? 'Edit Payment' : 'Record New Payment'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-slate-600 mb-1">Client</label>
            <select id="clientId" name="clientId" value={formData.clientId} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white" required>
              <option value="" disabled>Select a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name} ({client.type})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payerName" className="block text-sm font-medium text-slate-600 mb-1">Payer Name</label>
            <input
              type="text" id="payerName" name="payerName"
              value={formData.payerName}
              readOnly
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md shadow-sm cursor-not-allowed"
            />
          </div>
        </div>

        {formData.clientId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Outstanding Balance</p>
              {isLoadingBalance ? (
                <div className="animate-pulse bg-slate-200 h-7 w-24 mx-auto mt-1 rounded-md"></div>
              ) : (
                <p className="text-xl font-bold text-brand-secondary tracking-tight">{formatCurrency(outstandingBalance, formData.currency)}</p>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">New Balance After Payment</p>
              <p className={`text-xl font-bold tracking-tight ${newBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(newBalance, formData.currency)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-1">Amount Paid</label>
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
                disabled={!formData.clientId}
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
            <label htmlFor="paymentDate" className="block text-sm font-medium text-slate-600 mb-1">Date of Payment</label>
            <input
              type="date" id="paymentDate" name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
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
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-slate-600 mb-1">Service</label>
          <select id="service" name="service" value={formData.service} onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white">
            {Object.values(ServiceType).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-600 mb-1">Notes (Optional)</label>
          <textarea
            id="notes" name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={2}
            placeholder="e.g., Part-payment for translation services"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
          />
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
            {isEditing ? 'Save Changes' : 'Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentForm;
