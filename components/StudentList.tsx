import React from 'react';
import { Student, Payment } from '../types';
import StudentsTable from './student/StudentsTable';

interface StudentListProps {
  students: Student[];
  payments: Payment[];
  onEdit: (student: Student) => void;
  onEnroll: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, payments, onEdit, onEnroll }) => {
  return (
    <StudentsTable
      students={students}
      payments={payments}
      onEdit={onEdit}
      onEnroll={onEnroll}
    />
  );
};

export default StudentList;