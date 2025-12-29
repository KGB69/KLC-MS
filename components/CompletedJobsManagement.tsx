import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Prospect, ServiceType, ProspectDataStore } from '../types';
import CompletedJobList from './CompletedJobList';
import TranslationCompletionForm from './TranslationCompletionForm';
import InterpretationCompletionForm from './InterpretationCompletionForm';
import Modal from './shared/Modal';
import TimeFilter from './shared/TimeFilter';
import { filterDataByTime, TimeFilterType, CustomDateRange } from '../utils/dateFilters';

interface CompletedJobsManagementProps {
  dataStore: ProspectDataStore;
  dataVersion?: number;
}

const CompletedJobsManagement: React.FC<CompletedJobsManagementProps> = ({ dataStore, dataVersion = 0 }) => {
  const [completedJobs, setCompletedJobs] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Prospect | null>(null);
  const [deletingJob, setDeletingJob] = useState<Prospect | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  const fetchCompletedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const jobs = await dataStore.getCompletedJobs();
      setCompletedJobs(jobs);
    } catch (err) {
      console.error("Failed to fetch completed jobs:", err);
      setError("Could not load completed jobs data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dataStore]);

  useEffect(() => {
    fetchCompletedJobs();
  }, [fetchCompletedJobs, dataVersion]);

  const handleSaveJob = async (prospectId: string, completionData: Partial<Prospect>) => {
    try {
      await dataStore.updateProspect(prospectId, completionData);
      setEditingJob(null);
      await fetchCompletedJobs();
    } catch (err) {
      console.error('Failed to save job details:', err);
      setError('Failed to save job details.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingJob) return;
    try {
      await dataStore.deleteProspect(deletingJob.id);
      setDeletingJob(null);
      await fetchCompletedJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
      setError('Failed to delete job.');
    }
  };

  const filteredJobs = useMemo(() => {
    const jobsWithDates = completedJobs.map(job => ({
      ...job,
      filterDate: job.serviceInterestedIn === ServiceType.LanguageTraining
        ? job.createdAt
        : job.serviceInterestedIn === ServiceType.DocTranslation
          ? job.translationCompletionDate || job.createdAt
          : job.interpretationCompletionDate || job.createdAt
    }));

    return filterDataByTime(jobsWithDates, 'filterDate', timeFilter, customDateRange);
  }, [completedJobs, timeFilter, customDateRange]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-2">Conversions</h2>
        <p className="text-brand-secondary mb-4">
          Record of all completed translation/interpretation jobs and student conversions.
        </p>
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

      {error && (
        <div className="mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading...</h3>
          </div>
        ) : (
          <CompletedJobList completedJobs={filteredJobs} onEdit={setEditingJob} onDelete={setDeletingJob} />
        )}
      </div>

      {editingJob && editingJob.serviceInterestedIn === ServiceType.DocTranslation && (
        <TranslationCompletionForm
          prospect={editingJob}
          initialData={editingJob}
          onSave={handleSaveJob}
          onCancel={() => setEditingJob(null)}
        />
      )}
      {editingJob && editingJob.serviceInterestedIn === ServiceType.Interpretation && (
        <InterpretationCompletionForm
          prospect={editingJob}
          initialData={editingJob}
          onSave={handleSaveJob}
          onCancel={() => setEditingJob(null)}
        />
      )}

      {deletingJob && (
        <Modal isOpen={true} onClose={() => setDeletingJob(null)} title="Delete Job Record">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete the record for <strong>{deletingJob.prospectName}</strong>?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => setDeletingJob(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleConfirmDelete} className="bg-red-600 text-white px-6 py-2 rounded-lg">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CompletedJobsManagement;