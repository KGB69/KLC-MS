import React from 'react';
import { Prospect } from '../types';
import ProspectsTable from './prospect/ProspectsTable';

interface CompletedJobListProps {
  completedJobs: Prospect[];
  onEdit: (prospect: Prospect) => void;
  onDelete: (prospect: Prospect) => void;
}

const CompletedJobList: React.FC<CompletedJobListProps> = ({ completedJobs, onEdit, onDelete }) => {
  // Completed jobs use the same table as prospects
  return (
    <ProspectsTable
      prospects={completedJobs}
      onEdit={onEdit}
      onDelete={onDelete}
      onManageFollowUps={() => { }}
      onConvertToStudent={() => { }}
      onMarkCompleted={() => { }}
    />
  );
};

export default CompletedJobList;