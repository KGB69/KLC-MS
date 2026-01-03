import React, { useState, useEffect, useCallback } from 'react';
import { Class, ClassDataStore } from '../types';
import ClassList from './ClassList';
import ClassSchedule from './schedule/ClassSchedule';

interface ClassManagementProps {
  dataStore: ClassDataStore;
  onEditClass: (cls: Class) => void;
  onDeleteClass: (cls: Class) => void;
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
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark mb-2">Class Management</h2>
            <p className="text-brand-secondary">
              Schedule lessons, manage enrollments, and track progress.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setView('schedule')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'schedule'
                    ? 'bg-white text-brand-primary shadow-sm'
                    : 'text-slate-600 hover:text-brand-dark'
                  }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'list'
                    ? 'bg-white text-brand-primary shadow-sm'
                    : 'text-slate-600 hover:text-brand-dark'
                  }`}
              >
                List View
              </button>
            </div>

            <button
              onClick={onShowAddForm}
              className="bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-all shadow-sm flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Class
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div>
        {isLoading ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Classes...</h3>
          </div>
        ) : view === 'schedule' ? (
          <ClassSchedule />
        ) : (
          <ClassList
            classes={classes}
            onEdit={onEditClass}
            onDelete={onDeleteClass}
          />
        )}
      </div>
    </div>
  );
};

export default ClassManagement;