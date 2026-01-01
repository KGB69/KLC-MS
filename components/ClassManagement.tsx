import React, { useState, useEffect, useCallback } from 'react';
import { Class, ClassDataStore } from '../types';
import ClassList from './ClassList';
import ClassSchedule from './schedule/ClassSchedule';

interface ClassManagementProps {
  dataStore: ClassDataStore;
  onEditClass: (cls: Class) => void;
  onDeleteClass: (classId: string) => void;
  onShowAddForm: () => void;
  dataVersion?: number;
}

type ClassView = 'list' | 'schedule';

const ClassManagement: React.FC<ClassManagementProps> = ({ dataStore, onEditClass, onDeleteClass, onShowAddForm, dataVersion = 0 }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ClassView>('schedule');

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
    <div className="animate-fade-in h-full flex flex-col">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-dark mb-1 sm:mb-2">Class Management</h2>
            <p className="text-sm sm:text-base text-brand-secondary">
              Manage language classes, teachers, and schedules.
            </p>
          </div>

          <div className="flex gap-2">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setView('schedule')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${view === 'schedule'
                    ? 'bg-white text-brand-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${view === 'list'
                    ? 'bg-white text-brand-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                List
              </button>
            </div>

            <button
              onClick={onShowAddForm}
              className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:bg-sky-700 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">New Class</span>
              <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {view === 'schedule' ? (
          <ClassSchedule />
        ) : isLoading ? (
          <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
              <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Classes...</h3>
            </div>
          </div>
        ) : (
          <ClassList classes={classes} onEdit={onEditClass} onDelete={onDeleteClass} />
        )}
      </div>
    </div>
  );
};

export default ClassManagement;