import React, { useState, useEffect } from 'react';
import { Prospect, FollowUpAction, FollowUpStatus, ProspectDataStore } from '../types';
import ProspectsTable from './prospect/ProspectsTable';

interface ProspectListProps {
  prospectStore: ProspectDataStore;
  prospects: Prospect[];
  onEdit: (prospect: Prospect) => void;
  onDelete: (prospect: Prospect) => void;
  onManageFollowUps: (prospect: Prospect) => void;
  onStartConvertToStudent: (prospect: Prospect) => void;
  onStartCompletionLogging: (prospect: Prospect) => void;
}

const ProspectList: React.FC<ProspectListProps> = ({
  prospectStore,
  prospects,
  onEdit,
  onDelete,
  onManageFollowUps,
  onStartConvertToStudent,
  onStartCompletionLogging,
}) => {
  const [taskIndicators, setTaskIndicators] = useState<Record<string, { count: number; hasOverdue: boolean; hasDueToday: boolean }>>({});

  useEffect(() => {
    const loadTaskIndicators = async () => {
      if (!prospectStore) return;
      try {
        const allTasks = await prospectStore.getAllFollowUps();
        const pendingTasks = allTasks.filter(t => t.status === FollowUpStatus.Pending);

        const indicators: Record<string, { count: number; hasOverdue: boolean; hasDueToday: boolean }> = {};

        pendingTasks.forEach(task => {
          if (!indicators[task.prospectId]) {
            indicators[task.prospectId] = { count: 0, hasOverdue: false, hasDueToday: false };
          }

          indicators[task.prospectId].count++;

          const due = new Date(task.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (due < today) indicators[task.prospectId].hasOverdue = true;
          if (due.getTime() === today.getTime()) indicators[task.prospectId].hasDueToday = true;
        });

        setTaskIndicators(indicators);
      } catch (err) {
        console.error("Failed to load task indicators", err);
      }
    };

    loadTaskIndicators();

    const handleFollowUpUpdate = () => {
      loadTaskIndicators();
    };

    document.addEventListener('followUpUpdated', handleFollowUpUpdate);
    return () => {
      document.removeEventListener('followUpUpdated', handleFollowUpUpdate);
    };
  }, [prospectStore, prospects]);

  // Filter out converted prospects - they should only appear in Client Management
  const activeProspects = prospects.filter(p => p.status !== 'Converted');

  return (
    <ProspectsTable
      prospects={activeProspects}
      taskIndicators={taskIndicators}
      onEdit={onEdit}
      onDelete={onDelete}
      onManageFollowUps={onManageFollowUps}
      onConvertToStudent={onStartConvertToStudent}
      onMarkCompleted={onStartCompletionLogging}
    />
  );
};

export default ProspectList;