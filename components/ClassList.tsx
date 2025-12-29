import React from 'react';
import { Class } from '../types';
import ClassesTable from './class/ClassesTable';

interface ClassListProps {
  classes: Class[];
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
}

const ClassList: React.FC<ClassListProps> = ({ classes, onEdit, onDelete }) => {
  return (
    <ClassesTable
      classes={classes}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default ClassList;