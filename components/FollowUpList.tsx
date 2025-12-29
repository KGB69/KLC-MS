import React from 'react';
import { FollowUpAction, FollowUpStatus } from '../types';
import FollowUpItem from './FollowUpItem';

interface FollowUpListProps {
  followUps: FollowUpAction[];
  onUpdateStatus: (id: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>) => void;
  onDelete: (id: string) => void;
}

const FollowUpList: React.FC<FollowUpListProps> = ({ followUps, onUpdateStatus, onDelete }) => {
  if (followUps.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <svg className="mx-auto h-10 w-10 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
        <h3 className="mt-2 text-md font-medium text-brand-dark">No Follow-ups Scheduled</h3>
        <p className="mt-1 text-sm text-slate-500">
          Use the form below to add a new task.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {followUps.map(followUp => (
        <FollowUpItem 
            key={followUp.id} 
            followUp={followUp} 
            onUpdateStatus={onUpdateStatus}
            onDelete={onDelete} 
        />
      ))}
    </ul>
  );
};

export default FollowUpList;