import React, { useState, useEffect, useCallback } from 'react';
import { Class, ClassDataStore } from '../types';
import ClassList from './ClassList';

interface ClassManagementProps {
  dataStore: ClassDataStore;
  onEditClass: (cls: Class) => void;
  onDeleteClass: (classId: string) => void;
  onShowAddForm: () => void;
  dataVersion?: number;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ dataStore, onEditClass, onDeleteClass, onShowAddForm, dataVersion = 0 }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const classData = await dataStore.getClasses();
      setClasses(classData);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setError("Could not load class data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dataStore]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses, dataVersion]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Class Management</h2>
            <p className="text-brand-secondary">
              Manage language classes, teachers, and schedules.
            </p>
          </div>
          <button
            onClick={onShowAddForm}
            className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700"
          >
            New Class
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Classes...</h3>
          </div>
        ) : (
          <ClassList classes={classes} onEdit={onEditClass} onDelete={onDeleteClass} />
        )}
      </div>
    </div>
  );
};

export default ClassManagement;