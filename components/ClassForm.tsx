import React, { useState, useEffect, useMemo } from 'react';
import { ClassFormData, ClassLevel, DayOfWeek, ClassSchedule, Student } from '../types';
import Modal from './shared/Modal';
import StudentEnrollmentModal from './enrollment/StudentEnrollmentModal';
import { IndexedDBProspectDataStore } from '../services/indexedDBProspectStore';

interface ClassFormProps {
  onSubmit: (classData: ClassFormData) => void;
  onCancel: () => void;
  // initialData?: Class; // For future editing
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit, onCancel }) => {
  const initialFormState: ClassFormData = {
    name: '',
    language: '',
    level: ClassLevel.A1_1,
    teacherId: '',
    schedule: [],
    studentIds: [], // Not editable in this form
  };

  const [formData, setFormData] = useState<ClassFormData>(initialFormState);
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [newSession, setNewSession] = useState<ClassSchedule>({
    dayOfWeek: DayOfWeek.Monday,
    startTime: '09:00',
    endTime: '10:30',
  });

  // Student enrollment state
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const prospectStore = useMemo(() => new IndexedDBProspectDataStore(), []);

  // Fetch available students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const students = await prospectStore.getStudents();
        setAvailableStudents(students);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      }
    };
    fetchStudents();
  }, [prospectStore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSession(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSession = () => {
    // Basic validation
    if (!newSession.startTime || !newSession.endTime || newSession.startTime >= newSession.endTime) {
      alert("Please ensure the start time is before the end time.");
      return;
    }
    setSchedule(prev => [...prev, newSession]);
  };

  const handleRemoveSession = (index: number) => {
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.language.trim() || !formData.teacherId.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    if (schedule.length === 0) {
      alert("Please add at least one session to the schedule.");
      return;
    }

    onSubmit({ ...formData, schedule, studentIds: selectedStudentIds });
  };

  const handleEnrollmentConfirm = (studentIds: string[]) => {
    setSelectedStudentIds(studentIds);
  };

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Create New Class"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Class Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., French Intermediate"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-slate-600 mb-1">Language</label>
            <input
              type="text" id="language" name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="e.g., French"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-600 mb-1">Level</label>
            <select id="level" name="level" value={formData.level} onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white">
              {Object.values(ClassLevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-slate-600 mb-1">Teacher ID</label>
            <input
              type="text" id="teacherId" name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              placeholder="e.g., T-101"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
        </div>

        {/* Schedule Builder */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
          <h3 className="text-md font-semibold text-brand-secondary">Class Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="dayOfWeek" className="block text-xs font-medium text-slate-600 mb-1">Day</label>
              <select id="dayOfWeek" name="dayOfWeek" value={newSession.dayOfWeek} onChange={handleSessionChange}
                className="w-full px-2 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white">
                {Object.values(DayOfWeek).map(day => (<option key={day} value={day}>{day}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startTime" className="block text-xs font-medium text-slate-600 mb-1">Start</label>
                <input type="time" id="startTime" name="startTime" value={newSession.startTime} onChange={handleSessionChange}
                  className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" required />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-xs font-medium text-slate-600 mb-1">End</label>
                <input type="time" id="endTime" name="endTime" value={newSession.endTime} onChange={handleSessionChange}
                  className="w-full px-2 py-1.5 text-sm bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary" required />
              </div>
            </div>
            <div>
              <button type="button" onClick={handleAddSession}
                className="w-full flex items-center justify-center bg-white text-brand-primary border-brand-primary border font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                Add Session
              </button>
            </div>
          </div>
          {schedule.length > 0 && (
            <ul className="space-y-2 pt-2 border-t border-slate-200">
              {schedule.map((session, index) => (
                <li key={index} className="flex justify-between items-center bg-white p-2 rounded-md text-sm">
                  <span><strong>{session.dayOfWeek}</strong>, from {session.startTime} to {session.endTime}</span>
                  <button type="button" onClick={() => handleRemoveSession(index)} aria-label="Remove session" className="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Student Enrollment Section */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-brand-secondary">Student Enrollment</h3>
            <button
              type="button"
              onClick={() => setShowEnrollmentModal(true)}
              className="flex items-center bg-white text-brand-primary border-brand-primary border font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add Students
            </button>
          </div>

          {selectedStudentIds.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No students enrolled yet. Click "Add Students" to enroll students in this class.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium">{selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} enrolled:</p>
              <ul className="space-y-1">
                {selectedStudentIds.map(studentId => {
                  const student = availableStudents.find(s => s.id === studentId);
                  return student ? (
                    <li key={studentId} className="flex justify-between items-center bg-white p-2 rounded-md text-sm">
                      <span><strong>{student.name}</strong> ({student.studentId})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(studentId)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove student"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200">
          <button type="button" onClick={onCancel}
            className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
            Cancel
          </button>
          <button type="submit"
            className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200">
            Create Class
          </button>
        </div>
      </form>

      {/* Student Enrollment Modal */}
      <StudentEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
        onConfirm={handleEnrollmentConfirm}
        availableStudents={availableStudents}
        enrolledStudentIds={selectedStudentIds}
      />
    </Modal>
  );
};

export default ClassForm;