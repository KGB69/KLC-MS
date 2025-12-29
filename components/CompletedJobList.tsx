import React from 'react';
import { Prospect } from '../types';
import ProspectsTable from './prospect/ProspectsTable';

interface CompletedJobListProps {
  completedJobs: Prospect[];
}

const CompletedJobList: React.FC<CompletedJobListProps> = ({ completedJobs }) => {
  // Completed jobs use the same table as prospects, but with no actions
  return (
    <ProspectsTable
      prospects={completedJobs}
      onEdit={() => { }}
      onDelete={() => { }}
      onManageFollowUps={() => { }}
      onConvertToStudent={() => { }}
      onMarkCompleted={() => { }}
    />
  );
};

export default CompletedJobList;