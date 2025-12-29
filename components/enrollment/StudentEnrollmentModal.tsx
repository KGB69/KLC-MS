import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../../types';

interface StudentEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedStudentIds: string[]) => void;
    availableStudents: Student[];
    enrolledStudentIds: string[];
}

const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    availableStudents,
    enrolledStudentIds
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(enrolledStudentIds);

    // Reset selection when modal opens with new enrolled students
    useEffect(() => {
        if (isOpen) {
            setSelectedStudentIds(enrolledStudentIds);
        }
    }, [isOpen, enrolledStudentIds]);

    // Filter students based on search term
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) return availableStudents;

        const term = searchTerm.toLowerCase();
        return availableStudents.filter(student =>
            student.name.toLowerCase().includes(term) ||
            student.studentId.toLowerCase().includes(term) ||
            student.email?.toLowerCase().includes(term)
        );
    }, [availableStudents, searchTerm]);

    // Toggle student selection
    const toggleStudent = (studentId: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Select all filtered students
    const selectAll = () => {
        const allFilteredIds = filteredStudents.map(s => s.id);
        setSelectedStudentIds(prev => {
            const newIds = [...prev];
            allFilteredIds.forEach(id => {
                if (!newIds.includes(id)) {
                    newIds.push(id);
                }
            });
            return newIds;
        });
    };

    // Deselect all
    const deselectAll = () => {
        setSelectedStudentIds([]);
    };

    const handleConfirm = () => {
        onConfirm(selectedStudentIds);
        onClose();
    };

    const handleCancel = () => {
        setSelectedStudentIds(enrolledStudentIds); // Reset to original
        onClose();
    };

    if (!isOpen) return null;

    const selectedCount = selectedStudentIds.length;
    const newlySelected = selectedStudentIds.filter(id => !enrolledStudentIds.includes(id)).length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-slate-800">Enroll Students</h2>
                        <button
                            onClick={handleCancel}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, student ID, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Selection Actions */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="text-sm text-slate-600">
                            <span className="font-semibold">{selectedCount}</span> selected
                            {newlySelected > 0 && (
                                <span className="text-green-600 ml-2">
                                    (+{newlySelected} new)
                                </span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="text-sm text-brand-primary hover:text-brand-dark font-medium"
                            >
                                Select All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                                onClick={deselectAll}
                                className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                            >
                                Deselect All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredStudents.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-slate-500">
                                {searchTerm ? 'No students found matching your search' : 'No students available'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredStudents.map(student => {
                                const isSelected = selectedStudentIds.includes(student.id);
                                const wasEnrolled = enrolledStudentIds.includes(student.id);

                                return (
                                    <label
                                        key={student.id}
                                        className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                                                ? 'border-brand-primary bg-brand-primary bg-opacity-5'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleStudent(student.id)}
                                            className="w-5 h-5 text-brand-primary rounded focus:ring-2 focus:ring-brand-primary"
                                        />
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800">{student.name}</span>
                                                <span className="text-sm text-slate-500">({student.studentId})</span>
                                                {wasEnrolled && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                        Already Enrolled
                                                    </span>
                                                )}
                                            </div>
                                            {student.email && (
                                                <div className="text-sm text-slate-500 mt-1">{student.email}</div>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors font-medium"
                        >
                            Confirm Enrollment ({selectedCount})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentEnrollmentModal;
