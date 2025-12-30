
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Prospect, SearchCriteria, ProspectFormData, ServiceType, ContactMethod, FollowUpAction, FollowUpStatus, FollowUpFormData, ProspectStatus, Student, StudentFormData, StudentDetailsFormData, ClassFormData, Class, ClassLevel, DayOfWeek } from './types';
import ProspectForm from './components/ProspectForm';
import ProspectList from './components/ProspectList';
import FilterControls from './components/FilterControls';
import { IndexedDBProspectDataStore } from './services/indexedDBProspectStore';
import { ApiProspectDataStore } from './services/apiProspectStore';
import FollowUpManagerModal from './components/FollowUpManagerModal';
import StudentManagement from './components/StudentManagement';
import StudentRegistrationForm from './components/StudentRegistrationForm';
import StudentEditForm from './components/StudentEditForm';
import ClassManagement from './components/ClassManagement';
import ClassForm from './components/ClassForm';
import EnrollmentModal from './components/EnrollmentModal';
import ClassEditForm from './components/ClassEditForm';
import TranslationCompletionForm from './components/TranslationCompletionForm';
import InterpretationCompletionForm from './components/InterpretationCompletionForm';
import CompletedJobsManagement from './components/CompletedJobsManagement';
import TasksView from './components/tasks/TasksView';
import FinanceManagement from './components/FinanceManagement';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import SettingsPage from './components/settings/SettingsPage';
import Sidebar from './components/layout/Sidebar';
import Modal from './components/shared/Modal';
import TopBar from './components/layout/TopBar';
import DashboardView from './components/dashboard/DashboardView';

type ActiveView = 'dashboard' | 'prospects' | 'clients' | 'classes' | 'conversions' | 'finance' | 'settings' | 'communications';

// Sample data to seed the database on the first run.
const initialProspects: ProspectFormData[] = [
  {
    prospectName: 'Alice Johnson',
    email: 'alice.j@example.com',
    phone: '555-0101',
    contactMethod: ContactMethod.Phone,
    dateOfContact: '2024-05-15',
    notes: 'Needs translation of a 50-page legal document from Spanish to English.',
    serviceInterestedIn: ServiceType.DocTranslation,
    translationSourceLanguage: 'Spanish',
    translationTargetLanguage: 'English',
  },
  {
    prospectName: 'Bob Williams',
    email: 'bob.w@example.com',
    contactMethod: ContactMethod.InPerson,
    dateOfContact: '2024-05-20',
    notes: 'Met at the conference. Needs German language training for his team of 5 developers.',
    serviceInterestedIn: ServiceType.LanguageTraining,
    trainingLanguages: ['German'],
  },
  {
    prospectName: 'Charlie Brown',
    email: 'charlie.b@example.com',
    phone: '555-0103',
    contactMethod: ContactMethod.Facebook,
    dateOfContact: '2024-05-22',
    notes: 'Reached out via FB message. Needs a French interpreter for a 3-day event in July.',
    serviceInterestedIn: ServiceType.Interpretation,
    interpretationSourceLanguage: 'English',
    interpretationTargetLanguage: 'French',
  },
];

const initialClasses: ClassFormData[] = [
  {
    name: 'English Beginners - Mon/Wed Morning',
    language: 'English',
    level: ClassLevel.A1_1,
    teacherId: 'T-101',
    schedule: [
      { dayOfWeek: DayOfWeek.Monday, startTime: '10:00', endTime: '11:30' },
      { dayOfWeek: DayOfWeek.Wednesday, startTime: '10:00', endTime: '11:30' },
    ],
    studentIds: [],
  }
];


const App: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();

  // Initialize the data store (switching to API store for Render deployment)
  const prospectStore = useMemo(() => new ApiProspectDataStore(), []);

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [displayedProspects, setDisplayedProspects] = useState<Prospect[]>([]);
  const [filters, setFilters] = useState<SearchCriteria>({
    contactMethod: 'all',
    serviceInterestedIn: 'all',
    searchTerm: '',
    timeFilter: 'all',
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [deletingProspect, setDeletingProspect] = useState<Prospect | null>(null);
  const [managingFollowUpsFor, setManagingFollowUpsFor] = useState<Prospect | null>(null);
  const [prospectToConvert, setProspectToConvert] = useState<Prospect | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentDataVersion, setStudentDataVersion] = useState(0);
  const [currentFollowUps, setCurrentFollowUps] = useState<FollowUpAction[]>([]);
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loggingCompletionFor, setLoggingCompletionFor] = useState<Prospect | null>(null);
  const [completedDataVersion, setCompletedDataVersion] = useState(0);

  const [isClassFormVisible, setIsClassFormVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [classDataVersion, setClassDataVersion] = useState(0);
  const [enrollingStudent, setEnrollingStudent] = useState<Student | null>(null);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);


  const fetchProspects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await prospectStore.searchProspects({
        searchTerm: filters.searchTerm,
        contactMethod: filters.contactMethod,
        serviceInterestedIn: filters.serviceInterestedIn,
        timeFilter: filters.timeFilter
      });
      setDisplayedProspects(results);
    } catch (err) {
      console.error(err);
      setDisplayedProspects([]);
      setError('Could not load prospect data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prospectStore, filters]);

  const seedInitialData = useCallback(async () => {
    try {
      const existingProspects = await prospectStore.searchProspects({
        searchTerm: '', // For seeding, we want to check all prospects, not filtered ones
        contactMethod: 'all',
        serviceInterestedIn: 'all',
        timeFilter: 'all'
      });
      const completedJobs = await prospectStore.getCompletedJobs();
      if (existingProspects.length === 0 && completedJobs.length === 0) {
        console.log("No prospects found, seeding initial data...");
        for (const prospect of initialProspects) {
          await prospectStore.addProspect(prospect);
        }
      }

      const existingClasses = await prospectStore.getClasses();
      if (existingClasses.length === 0) {
        console.log("No classes found, seeding initial class data...");
        for (const classData of initialClasses) {
          await prospectStore.addClass(classData);
        }
      }

    } catch (err) {
      console.error("Failed to seed data:", err);
      setError("Could not initialize the application database.");
    }
  }, [prospectStore]);

  useEffect(() => {
    const initializeApp = async () => {
      await seedInitialData();
      if (activeView === 'prospects') {
        fetchProspects();
      }
    };
    initializeApp();
  }, [seedInitialData]);

  useEffect(() => {
    if (activeView === 'prospects') {
      fetchProspects();
    }
  }, [fetchProspects, activeView]);


  useEffect(() => {
    const handleProspectCreated = (event: CustomEvent<Prospect>) => {
      console.log('Event "prospectCreated" caught! New prospect:', event.detail);
    };
    const handleStudentCreated = (event: CustomEvent<Student>) => {
      console.log('Event "studentCreated" caught! New student:', event.detail);
    };

    document.addEventListener('prospectCreated', handleProspectCreated as EventListener);
    document.addEventListener('studentCreated', handleStudentCreated as EventListener);
    return () => {
      document.removeEventListener('prospectCreated', handleProspectCreated as EventListener);
      document.removeEventListener('studentCreated', handleStudentCreated as EventListener);
    };
  }, []);

  const addProspect = useCallback(async (newProspectData: ProspectFormData) => {
    try {
      await prospectStore.addProspect(newProspectData);
      await fetchProspects();
      setIsFormVisible(false);
    } catch (err) {
      console.error(err);
      setError('Failed to add prospect.');
    }
  }, [prospectStore, fetchProspects]);

  const handleUpdateProspect = useCallback(async (updatedData: ProspectFormData) => {
    if (!editingProspect) return;
    try {
      await prospectStore.updateProspect(editingProspect.id, updatedData);
      await fetchProspects();
      setStudentDataVersion(v => v + 1); // Trigger refresh of Client Management list
      setEditingProspect(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update prospect.');
    }
  }, [editingProspect, prospectStore, fetchProspects]);

  const handleStartConversion = useCallback((prospect: Prospect) => {
    setProspectToConvert(prospect);
  }, []);

  const handleCompleteConversion = useCallback(async (details: StudentDetailsFormData) => {
    if (!prospectToConvert) return;

    // The studentId will now be generated by the store using our new custom logic.
    const studentData: Omit<StudentFormData, 'studentId'> = {
      name: prospectToConvert.prospectName,
      email: prospectToConvert.email,
      phone: prospectToConvert.phone,
      ...details,
    };

    try {
      // We cast to any because addStudent signature in store now takes Omit<StudentFormData, 'studentId'>
      const newStudent = await (prospectStore as any).addStudent(studentData);

      // Mark prospect as converted and store the conversion date in its dateOfContact field for completion jobs history
      await prospectStore.updateProspect(prospectToConvert.id, {
        status: ProspectStatus.Converted,
        dateOfContact: details.registrationDate // This ensures conversion date shows up in "Completed Jobs"
      });

      const event = new CustomEvent('studentCreated', { detail: newStudent, bubbles: true, composed: true });
      document.dispatchEvent(event);

      await fetchProspects();
      setProspectToConvert(null);
      setStudentDataVersion(v => v + 1);
      setCompletedDataVersion(v => v + 1);

    } catch (err) {
      console.error(err);
      setError('Failed to convert prospect to student.');
    }
  }, [prospectStore, fetchProspects, prospectToConvert]);

  const handleStartCompletionLogging = useCallback((prospect: Prospect) => {
    setLoggingCompletionFor(prospect);
  }, []);

  const handleSaveCompletion = useCallback(async (prospectId: string, completionData: Partial<Prospect>) => {
    try {
      const updates = {
        ...completionData,
        status: ProspectStatus.Converted,
      };
      await prospectStore.updateProspect(prospectId, updates);
      await fetchProspects();
      setLoggingCompletionFor(null);
      setCompletedDataVersion(v => v + 1);
    } catch (err) {
      console.error(err);
      setError('Failed to save completion details.');
    }
  }, [prospectStore, fetchProspects]);

  const handleStartEdit = useCallback((prospect: Prospect) => setEditingProspect(prospect), []);
  const handleStartDelete = useCallback((prospect: Prospect) => setDeletingProspect(prospect), []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProspect) return;
    try {
      await prospectStore.deleteProspect(deletingProspect.id);
      await fetchProspects();
      setDeletingProspect(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete prospect.');
    }
  }, [deletingProspect, prospectStore, fetchProspects]);

  const handleFilterChange = useCallback((newFilters: Partial<SearchCriteria>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const handleStartEditStudent = useCallback(async (student: Student) => {
    // Check if this is a real student (S-XXX) or a converted prospect (C-XXX)
    const isRealStudent = student.studentId.startsWith('S-');

    if (isRealStudent) {
      // Edit as student
      setEditingStudent(student);
    } else {
      // This is a converted prospect - fetch the original prospect data and edit as prospect
      try {
        const prospect = await prospectStore.getProspectById(student.id);
        if (prospect) {
          setEditingProspect(prospect);
        } else {
          setError("Could not find prospect data for this client.");
        }
      } catch (err) {
        console.error("Failed to fetch prospect for editing:", err);
        setError("Could not load client data for editing.");
      }
    }
  }, [prospectStore]);

  const handleUpdateStudent = useCallback(async (updatedData: StudentFormData) => {
    if (!editingStudent) return;
    try {
      await prospectStore.updateStudent(editingStudent.id, updatedData);
      setEditingStudent(null);
      setStudentDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to update student:", err);
      setError("Could not update student record.");
    }
  }, [editingStudent, prospectStore]);

  const handleAddClass = useCallback(async (classData: ClassFormData) => {
    try {
      await prospectStore.addClass(classData);
      setIsClassFormVisible(false);
      setClassDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to add class:", err);
      setError("Could not create the new class.");
    }
  }, [prospectStore]);

  const handleStartEditClass = useCallback((classItem: Class) => {
    setEditingClass(classItem);
  }, []);

  const handleUpdateClass = useCallback(async (classData: ClassFormData) => {
    if (!editingClass) return;
    try {
      await prospectStore.updateClass(editingClass.classId, classData);
      setEditingClass(null);
      setClassDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to update class:", err);
      setError("Could not update the class.");
    }
  }, [editingClass, prospectStore]);

  const handleStartDeleteClass = useCallback((classItem: Class) => {
    setDeletingClass(classItem);
  }, []);

  const handleConfirmDeleteClass = useCallback(async () => {
    if (!deletingClass) return;
    try {
      await prospectStore.deleteClass(deletingClass.classId);
      setDeletingClass(null);
      setClassDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to delete class:", err);
      setError("Could not delete the class.");
    }
  }, [deletingClass, prospectStore]);

  const handleStartEnrollment = useCallback(async (student: Student) => {
    try {
      const classes = await prospectStore.getClasses();
      setAllClasses(classes);
      setEnrollingStudent(student);
    } catch (err) {
      console.error("Failed to fetch classes for enrollment:", err);
      setError("Could not load class data for enrollment.");
    }
  }, [prospectStore]);

  const handleUpdateEnrollment = useCallback(async (studentId: string, classIds: string[]) => {
    if (!enrollingStudent) return;
    try {
      await prospectStore.updateStudentEnrollments(studentId, classIds);
      setEnrollingStudent(null);
      setClassDataVersion(v => v + 1);
    } catch (err) {
      console.error("Failed to update enrollment:", err);
      setError("Could not save enrollment changes.");
    }
  }, [enrollingStudent, prospectStore]);


  const fetchFollowUps = useCallback(async (prospectId: string) => {
    setIsLoadingFollowUps(true);
    try {
      const followUps = await prospectStore.getFollowUpsForProspect(prospectId);
      setCurrentFollowUps(followUps);
    } catch (err) {
      console.error(err);
      setError("Could not load follow-up actions.");
    } finally {
      setIsLoadingFollowUps(false);
    }
  }, [prospectStore]);

  const handleManageFollowUps = useCallback((prospect: Prospect) => {
    setManagingFollowUpsFor(prospect);
    fetchFollowUps(prospect.id);
  }, [fetchFollowUps]);

  const handleAddFollowUp = useCallback(async (followUpData: FollowUpFormData) => {
    if (!managingFollowUpsFor) return;
    try {
      await prospectStore.addFollowUp({ ...followUpData, prospectId: managingFollowUpsFor.id });
      await fetchFollowUps(managingFollowUpsFor.id);
    } catch (err) {
      console.error(err);
      setError("Failed to add follow-up.");
    }
  }, [managingFollowUpsFor, prospectStore, fetchFollowUps]);

  const handleUpdateFollowUp = useCallback(async (followUpId: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>) => {
    if (!managingFollowUpsFor) return;
    try {
      await prospectStore.updateFollowUp(followUpId, updates);
      await fetchFollowUps(managingFollowUpsFor.id);
    } catch (err) {
      console.error(err);
      setError("Failed to update follow-up.");
    }
  }, [managingFollowUpsFor, prospectStore, fetchFollowUps]);

  const handleDeleteFollowUp = useCallback(async (followUpId: string) => {
    if (!managingFollowUpsFor) return;
    try {
      await prospectStore.deleteFollowUp(followUpId);
      await fetchFollowUps(managingFollowUpsFor.id);
    } catch (err) {
      console.error(err);
      setError("Failed to delete follow-up.");
    }
  }, [managingFollowUpsFor, prospectStore, fetchFollowUps]);

  const NavButton: React.FC<{ view: ActiveView; label: string; }> = ({ view, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeView === view
        ? 'bg-sky-100 text-brand-primary'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }`}
    >
      {label}
    </button>
  );

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading...</h3>
        </div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:block transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            setIsSidebarOpen(false); // Close sidebar on mobile after navigation
          }}
          username={user.username}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <TopBar
          username={user.username}
          onLogout={logout}
          activeView={activeView}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          {activeView === 'dashboard' && (
            <DashboardView prospectStore={prospectStore} onNavigate={setActiveView} />
          )}

          {activeView === 'prospects' && (
            <div className="animate-fade-in">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setIsFormVisible(true)}
                  className="flex items-center justify-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Prospect
                </button>
              </div>

              <Modal
                isOpen={isFormVisible}
                onClose={() => setIsFormVisible(false)}
                title="Add New Prospect"
              >
                <ProspectForm onSubmit={addProspect} onCancel={() => setIsFormVisible(false)} />
              </Modal>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 transition-all duration-300">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full transition-colors duration-200 ${showFilters ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                      <svg className={`w-5 h-5 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold text-brand-secondary">Filter Prospects</span>
                  </div>
                  {!showFilters && filters.searchTerm && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      Applied: "{filters.searchTerm}"
                    </span>
                  )}
                </button>

                <div className={`transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[500px] opacity-100 p-6 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                  <div className="border-t border-slate-100 pt-6">
                    <FilterControls filters={filters} onFilterChange={handleFilterChange} />
                  </div>
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
                    <h3 className="mt-4 text-lg font-medium text-brand-dark">Loading Prospects...</h3>
                  </div>
                ) : (
                  <ProspectList prospectStore={prospectStore} prospects={displayedProspects} onEdit={handleStartEdit} onDelete={handleStartDelete} onManageFollowUps={handleManageFollowUps} onStartConvertToStudent={handleStartConversion} onStartCompletionLogging={handleStartCompletionLogging} />
                )}
              </div>
            </div>
          )}

          {activeView === 'clients' && (
            <StudentManagement
              dataStore={prospectStore}
              onEditStudent={handleStartEditStudent}
              onEnrollStudent={handleStartEnrollment}
              dataVersion={studentDataVersion}
            />
          )}

          {activeView === 'classes' && (
            <ClassManagement
              dataStore={prospectStore}
              onShowAddForm={() => setIsClassFormVisible(true)}
              onEditClass={handleStartEditClass}
              onDeleteClass={handleStartDeleteClass}
              dataVersion={classDataVersion}
            />
          )}

          {activeView === 'conversions' && (
            <CompletedJobsManagement dataStore={prospectStore} dataVersion={completedDataVersion} />
          )}

          {activeView === 'communications' && (
            <TasksView prospectStore={prospectStore} />
          )}

          {activeView === 'dashboard' && (
            <DashboardView prospectStore={prospectStore} onNavigate={setActiveView} />
          )}

          {activeView === 'finance' && (
            <FinanceManagement dataStore={prospectStore} />
          )}


          <Modal
            isOpen={!!editingProspect}
            onClose={() => setEditingProspect(null)}
            title="Edit Prospect"
          >
            {editingProspect && (
              <ProspectForm
                initialData={editingProspect}
                onSubmit={handleUpdateProspect}
                onCancel={() => setEditingProspect(null)}
                submitButtonText="Save Changes"
                isEditing={true}
              />
            )}
          </Modal>

          <Modal
            isOpen={!!deletingProspect}
            onClose={() => setDeletingProspect(null)}
            title="Delete Prospect"
          >
            {deletingProspect && (
              <div className="text-center p-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <strong className="font-semibold text-gray-900">{deletingProspect.prospectName}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setDeletingProspect(null)}
                    className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {managingFollowUpsFor && (
            <FollowUpManagerModal
              prospect={managingFollowUpsFor}
              followUps={currentFollowUps}
              isLoading={isLoadingFollowUps}
              onClose={() => setManagingFollowUpsFor(null)}
              onAddFollowUp={handleAddFollowUp}
              onUpdateStatus={handleUpdateFollowUp}
              onDelete={handleDeleteFollowUp}
            />
          )}

          {prospectToConvert && (
            <StudentRegistrationForm
              prospect={prospectToConvert}
              onSubmit={handleCompleteConversion}
              onCancel={() => setProspectToConvert(null)}
            />
          )}

          {editingStudent && (
            <StudentEditForm
              student={editingStudent}
              onSubmit={handleUpdateStudent}
              onCancel={() => setEditingStudent(null)}
            />
          )}

          {isClassFormVisible && (
            <ClassForm
              onSubmit={handleAddClass}
              onCancel={() => setIsClassFormVisible(false)}
            />
          )}

          {editingClass && (
            <ClassEditForm
              initialData={editingClass}
              onSubmit={handleUpdateClass}
              onCancel={() => setEditingClass(null)}
            />
          )}

          {deletingClass && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50" aria-modal="true" role="dialog">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium leading-6 text-gray-900 mt-4">Delete Class</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the class <strong className="font-semibold">{deletingClass.name}</strong>? This will not remove enrolled students, but will unenroll them from this class. This action cannot be undone.
                  </p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button type="button" onClick={() => setDeletingClass(null)} className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">Cancel</button>
                  <button type="button" onClick={handleConfirmDeleteClass} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Delete</button>
                </div>
              </div>
            </div>
          )}

          {enrollingStudent && (
            <EnrollmentModal
              student={enrollingStudent}
              allClasses={allClasses}
              onSave={handleUpdateEnrollment}
              onCancel={() => setEnrollingStudent(null)}
            />
          )}

          {loggingCompletionFor && loggingCompletionFor.serviceInterestedIn === ServiceType.DocTranslation && (
            <TranslationCompletionForm
              prospect={loggingCompletionFor}
              onSave={handleSaveCompletion}
              onCancel={() => setLoggingCompletionFor(null)}
            />
          )}
          {loggingCompletionFor && loggingCompletionFor.serviceInterestedIn === ServiceType.Interpretation && (
            <InterpretationCompletionForm
              prospect={loggingCompletionFor}
              onSave={handleSaveCompletion}
              onCancel={() => setLoggingCompletionFor(null)}
            />
          )}

          {activeView === 'settings' && (
            <SettingsPage prospectStore={prospectStore} />
          )}
        </main>
      </div>
    </div >
  );
};

export default App;
