import React, { useState, useEffect, useCallback } from 'react';
import { Student, Payment, ProspectDataStore, StudentDataStore, PaymentDataStore, ServiceType } from '../types';
import StudentList from './StudentList';
import TimeFilter from './shared/TimeFilter';
import { filterDataByTime, TimeFilterType, CustomDateRange } from '../utils/dateFilters';

interface StudentManagementProps {
  dataStore: ProspectDataStore & StudentDataStore & PaymentDataStore;
  onEditStudent: (student: Student) => void;
  onEnrollStudent: (student: Student) => void;
  dataVersion?: number;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ dataStore, onEditStudent, onEnrollStudent, dataVersion = 0 }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  const fetchStudentsAndPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studentData, completedJobs, paymentData] = await Promise.all([
        dataStore.getStudents(),
        dataStore.getCompletedJobs(),
        dataStore.getAllPayments()
      ]);

      const nonStudentClients = completedJobs.filter(
        job => job.serviceInterestedIn !== ServiceType.LanguageTraining
      );

      const clientsFromJobs: Student[] = nonStudentClients.map(job => ({
        id: job.id,
        studentId: `C-${job.id.substring(0, 6)}`,
        name: job.prospectName,
        email: job.email,
        phone: job.phone,
        registrationDate: job.createdAt.split('T')[0],
        dateOfBirth: '',
        nationality: '',
        occupation: '',
        address: '',
        motherTongue: '',
        howTheyHeardAboutUs: (job as any).howTheyHeardAboutUs || (job as any).howHeardAboutUs,
        howTheyHeardAboutUsOther: (job as any).howTheyHeardAboutUsOther || (job as any).howHeardAboutUsOther,
        fees: job.translationTotalFee || job.interpretationTotalFee || 0,
        serviceInterestedIn: job.serviceInterestedIn, // Preserve service type
        createdBy: job.createdBy,
        createdByUsername: job.createdByUsername,
        modifiedBy: job.modifiedBy,
        modifiedByUsername: job.modifiedByUsername,
        createdAt: job.createdAt,
        modifiedAt: job.modifiedAt,
      }));

      const allClients = [...studentData, ...clientsFromJobs].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setStudents(allClients);
      setPayments(paymentData);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      setError("Could not load student data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dataStore]);

  useEffect(() => {
    fetchStudentsAndPayments();
  }, [fetchStudentsAndPayments, dataVersion]);

  const filteredStudents = React.useMemo(() => {
    return filterDataByTime(students, 'createdAt', timeFilter);
  }, [students, timeFilter]);

  return (
    <div className="animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-2">Client Management</h2>
        <p className="text-brand-secondary mb-4">
          This section lists all prospects that have been successfully converted into clients.
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
        <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8">
        {isLoading ? (
          <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Students...</h3>
          </div>
        ) : (
          <StudentList students={filteredStudents} payments={payments} onEdit={onEditStudent} onEnroll={onEnrollStudent} />
        )}
      </div>
    </div>
  );
};

export default StudentManagement;