import React from 'react';
import { Student } from '../types';

interface StudentItemProps {
    student: Student;
    onEdit: (student: Student) => void;
    onEnroll: (student: Student) => void;
}

const StudentItem: React.FC<StudentItemProps> = ({ student, onEdit, onEnroll }) => {
    return (
        <div className="card">
            <div className="card-header">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="card-title">{student.name}</h3>
                        <p className="text-sm text-secondary">ID: {student.studentId}</p>
                    </div>
                    <span className="badge badge-success">Student</span>
                </div>
            </div>

            <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Language</p>
                        <p className="text-sm text-dark">{student.languageOfStudy}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Registration</p>
                        <p className="text-sm text-dark">{new Date(student.registrationDate).toLocaleDateString()}</p>
                    </div>
                    {student.email && (
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Email</p>
                            <p className="text-sm text-dark">{student.email}</p>
                        </div>
                    )}
                    {student.phone && (
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Phone</p>
                            <p className="text-sm text-dark">{student.phone}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Nationality</p>
                        <p className="text-sm text-dark">{student.nationality}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Occupation</p>
                        <p className="text-sm text-dark">{student.occupation}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Mother Tongue</p>
                        <p className="text-sm text-dark">{student.motherTongue}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Fees</p>
                        <p className="text-sm text-dark font-semibold">${student.fees.toFixed(2)}</p>
                    </div>
                </div>

                {student.address && (
                    <div className="mt-4">
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm text-dark">{student.address}</p>
                    </div>
                )}

                <div className="mt-4">
                    <p className="text-xs text-gray-500 font-medium">How They Heard About Us</p>
                    <p className="text-sm text-dark">
                        {student.howTheyHeardAboutUs}
                        {student.howTheyHeardAboutUsOther && ` (${student.howTheyHeardAboutUsOther})`}
                    </p>
                </div>
            </div>

            <div className="card-footer">
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => onEnroll(student)}
                        className="btn btn-primary btn-sm"
                    >
                        Enroll in Class
                    </button>
                    <button
                        onClick={() => onEdit(student)}
                        className="btn btn-secondary btn-sm"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentItem;
