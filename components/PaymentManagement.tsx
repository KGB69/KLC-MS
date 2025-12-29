import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Payment, PaymentFormData, Client, Prospect, Student, ServiceType, Currency } from '../types';
import { formatCurrency } from '../utils/currency';
import PaymentList from './PaymentList';
import PaymentForm from './PaymentForm';
import { IndexedDBProspectDataStore } from '../services/indexedDBProspectStore';
import TimeFilter from './shared/TimeFilter';
import { filterDataByTime, TimeFilterType, CustomDateRange } from '../utils/dateFilters';

interface PaymentManagementProps {
  dataStore: any;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ dataStore }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  const fetchPaymentsAndClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [paymentData, prospectData, studentData] = await Promise.all([
        dataStore.getAllPayments(),
        dataStore.getCompletedJobs(), // Fetch converted prospects
        dataStore.getStudents()
      ]);

      setPayments(paymentData);

      const prospectClients: Client[] = prospectData
        .filter(p => p.serviceInterestedIn !== ServiceType.LanguageTraining) // Students handle this
        .map((p: Prospect) => ({
          id: p.id,
          name: p.prospectName,
          type: 'Prospect',
          service: p.serviceInterestedIn,
          totalFee: p.translationTotalFee || p.interpretationTotalFee || 0,
        }));

      const studentClients: Client[] = studentData.map((s: Student) => ({
        id: s.id,
        name: s.name,
        type: 'Student',
        service: ServiceType.LanguageTraining,
        totalFee: s.fees,
      }));

      setClients([...prospectClients, ...studentClients].sort((a, b) => a.name.localeCompare(b.name)));

    } catch (err) {
      console.error("Failed to fetch financial data:", err);
      setError("Could not load payment or client data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dataStore]);

  useEffect(() => {
    fetchPaymentsAndClients();
  }, [fetchPaymentsAndClients, dataVersion]);

  // Filtered payments
  const filteredPayments = React.useMemo(() => {
    return filterDataByTime(payments, 'paymentDate', timeFilter, customDateRange);
  }, [payments, timeFilter, customDateRange]);

  const handleAddPayment = async (formData: PaymentFormData) => {
    try {
      await dataStore.addPayment(formData);
      setIsFormVisible(false);
      setDataVersion(v => v + 1); // Trigger re-fetch
    } catch (err) {
      console.error("Failed to add payment:", err);
      setError("Could not save the new payment.");
    }
  };

  const handleUpdatePayment = async (formData: PaymentFormData) => {
    if (!editingPayment) return;
    try {
      await dataStore.updatePayment(editingPayment.paymentId, formData);
      setEditingPayment(null);
      setDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to update payment:", err);
      setError("Could not update the payment record.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    try {
      await dataStore.deletePayment(deletingPayment.paymentId);
      setDeletingPayment(null);
      setDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to delete payment:", err);
      setError("Could not delete the payment record.");
    }
  };

  const showForm = () => {
    setEditingPayment(null);
    setIsFormVisible(true);
  };

  const hideForm = () => {
    setEditingPayment(null);
    setIsFormVisible(false);
  };

  const startEdit = (payment: Payment) => {
    setIsFormVisible(false);
    setEditingPayment(payment);
  };

  const cancelEdit = () => {
    setEditingPayment(null);
  };


  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 max-w-md">
          <TimeFilter
            currentFilter={timeFilter}
            onFilterChange={(filter, range) => {
              setTimeFilter(filter);
              if (range) setCustomDateRange(range);
            }}
            customRange={customDateRange}
          />
        </div>
        <button
          onClick={showForm}
          className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          New Payment
        </button>
      </div>

      {isFormVisible && (
        <div className="mb-8">
          <PaymentForm onSubmit={handleAddPayment} onCancel={hideForm} clients={clients} />
        </div>
      )}

      {editingPayment && (
        <div className="mb-8">
          <PaymentForm onSubmit={handleUpdatePayment} onCancel={cancelEdit} initialData={editingPayment} isEditing={true} clients={clients} />
        </div>
      )}

      {/* Currency Totals Summary */}
      {!isLoading && filteredPayments.length > 0 && (() => {
        const totalsByCurrency = filteredPayments.reduce((acc, payment) => {
          const currency = payment.currency || Currency.USD;
          if (!acc[currency]) {
            acc[currency] = 0;
          }
          acc[currency] += payment.amount;
          return acc;
        }, {} as Record<Currency, number>);

        return (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Total Payments by Currency (Filtered)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(totalsByCurrency).map(([currency, total]) => (
                <div key={currency} className="bg-white rounded-lg p-4 border border-green-100 shadow-sm">
                  <div className="text-xs text-slate-500 font-medium mb-1">{currency}</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(total as number, currency as Currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {error && (
        <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Payments...</h3>
          </div>
        ) : (
          <PaymentList payments={filteredPayments} clients={clients} onEdit={startEdit} onDelete={setDeletingPayment} />
        )}
      </div>

      {deletingPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">Delete Payment</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this payment from <strong className="font-semibold">{deletingPayment.payerName}</strong>? This action is permanent.
              </p>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button type="button" onClick={() => setDeletingPayment(null)} className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
