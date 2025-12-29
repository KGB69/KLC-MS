import React, { useState, useEffect, useCallback } from 'react';
import { Expenditure, ExpenditureFormData, ExpenditureDataStore } from '../types';
import ExpenditureList from './ExpenditureList';
import ExpenditureForm from './ExpenditureForm';
import TimeFilter from './shared/TimeFilter';
import { filterDataByTime, TimeFilterType, CustomDateRange } from '../utils/dateFilters';

interface ExpenditureManagementProps {
  dataStore: ExpenditureDataStore;
}

const ExpenditureManagement: React.FC<ExpenditureManagementProps> = ({ dataStore }) => {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null);
  const [deletingExpenditure, setDeletingExpenditure] = useState<Expenditure | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  const fetchExpenditures = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const expenditureData = await dataStore.getAllExpenditures();
      setExpenditures(expenditureData);
    } catch (err) {
      console.error("Failed to fetch expenditures:", err);
      setError("Could not load expenditure data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dataStore]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures, dataVersion]);

  const filteredExpenditures = React.useMemo(() => {
    return filterDataByTime(expenditures, 'expenditureDate', timeFilter);
  }, [expenditures, timeFilter]);

  const handleAddExpenditure = async (formData: ExpenditureFormData) => {
    try {
      await dataStore.addExpenditure(formData);
      setIsFormVisible(false);
      setDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to add expenditure:", err);
      setError("Could not save the new expenditure.");
    }
  };

  const handleUpdateExpenditure = async (formData: ExpenditureFormData) => {
    if (!editingExpenditure) return;
    try {
      await dataStore.updateExpenditure(editingExpenditure.expenditureId, formData);
      setEditingExpenditure(null);
      setDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to update expenditure:", err);
      setError("Could not update the expenditure record.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpenditure) return;
    try {
      await dataStore.deleteExpenditure(deletingExpenditure.expenditureId);
      setDeletingExpenditure(null);
      setDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to delete expenditure:", err);
      setError("Could not delete the expenditure record.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Expenditure Management</h2>
            <p className="text-brand-secondary">Record and track all school-related expenses.</p>
          </div>
          <button
            onClick={() => setIsFormVisible(true)}
            className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700"
          >
            New Expenditure
          </button>
        </div>
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
      </div>

      {isFormVisible && (
        <div className="mb-8">
          <ExpenditureForm onSubmit={handleAddExpenditure} onCancel={() => setIsFormVisible(false)} />
        </div>
      )}

      {editingExpenditure && (
        <div className="mb-8">
          <ExpenditureForm onSubmit={handleUpdateExpenditure} onCancel={() => setEditingExpenditure(null)} initialData={editingExpenditure} isEditing={true} />
        </div>
      )}

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
            <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Expenditures...</h3>
          </div>
        ) : (
          <ExpenditureList expenditures={filteredExpenditures} onEdit={setEditingExpenditure} onDelete={setDeletingExpenditure} />
        )}
      </div>

      {deletingExpenditure && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">Delete Expenditure</h3>
            <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this expenditure for <strong>{deletingExpenditure.payeeName}</strong>?</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button onClick={() => setDeletingExpenditure(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleConfirmDelete} className="bg-red-600 text-white px-6 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenditureManagement;
