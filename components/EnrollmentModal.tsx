import React, { useState, useEffect } from 'react';
import { Student, Class } from '../types';
import Modal from './shared/Modal';

interface EnrollmentModalProps {
  student: Student;
  allClasses: Class[];
  onSave: (studentId: string, classIds: string[]) => void;
  onCancel: () => void;
}

const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ student, allClasses, onSave, onCancel }) => {

  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  useEffect(() => {
    // Find which classes the student is already enrolled in
    const currentlyEnrolled = allClasses
      .filter(c => c.studentIds.includes(student.id))
      .map(c => c.classId);
    setSelectedClassIds(currentlyEnrolled);
  }, [student, allClasses]);

  const handleCheckboxChange = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSave = () => {
    onSave(student.id, selectedClassIds);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Enroll Student"
    >
      <div className="mb-6">
        <p className="text-sm text-slate-500">For student: <strong className="font-semibold">{student.name}</strong></p>
      </div>

      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
        {allClasses.length > 0 ? (
          allClasses.map(c => (
            <div key={c.classId} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id={`class-check-${c.classId}`}
                checked={selectedClassIds.includes(c.classId)}
                onChange={() => handleCheckboxChange(c.classId)}
                className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor={`class-check-${c.classId}`} className="ml-3 block text-sm font-medium text-slate-700">
                {c.name} <span className="text-xs text-slate-500">({c.language} - {c.level})</span>
              </label>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-8">No classes available to enroll in.</p>
        )}
      </div>

      <div className="flex justify-end items-center space-x-4 pt-6 mt-6 border-t border-slate-200">
        <button type="button" onClick={onCancel}
          className="font-semibold text-slate-600 hover:text-slate-800 transition-colors px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
          Cancel
        </button>
        <button type="button" onClick={handleSave}
          className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200">
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default EnrollmentModal;
