import React, { useState } from 'react';
import { FollowUpAction, FollowUpStatus } from '../types';

interface FollowUpItemProps {
  followUp: FollowUpAction;
  onUpdateStatus: (id: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>) => void;
  onDelete: (id: string) => void;
}

const getStatusBadgeColor = (status: FollowUpStatus): string => {
  switch (status) {
    case FollowUpStatus.Pending:
      return 'bg-amber-100 text-amber-800';
    case FollowUpStatus.Completed:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};


const FollowUpItem: React.FC<FollowUpItemProps> = ({ followUp, onUpdateStatus, onDelete }) => {
  const { id, dueDate, assignedTo, notes, status, outcome } = followUp;
  const isPending = status === FollowUpStatus.Pending;

  const [isCompleting, setIsCompleting] = useState(false);
  const [outcomeText, setOutcomeText] = useState('');

  const handleStartComplete = () => {
    setIsCompleting(true);
  };

  const handleCancelComplete = () => {
    setIsCompleting(false);
    setOutcomeText('');
  };

  const handleSaveOutcome = () => {
    if (!outcomeText.trim()) {
      alert("Please provide an outcome for this follow-up.");
      return;
    }
    onUpdateStatus(id, { status: FollowUpStatus.Completed, outcome: outcomeText });
    setIsCompleting(false);
    setOutcomeText('');
  };

  return (
    <li className="p-4 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <p className="text-sm font-semibold text-brand-dark">
                Due: {new Date(dueDate + 'T00:00:00').toLocaleDateString()}
            </p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(status)} mt-2 sm:mt-0`}>
                {status}
            </span>
        </div>
        <p className="text-sm text-slate-500 mb-2">Assigned to: <span className="font-medium text-slate-700">{assignedTo}</span></p>
        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-md border border-slate-200">
          {notes}
        </p>

        {status === FollowUpStatus.Completed && outcome && (
            <div className="mt-3 pt-3 border-t border-slate-200">
                 <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider">Outcome</h5>
                 <p className="text-slate-600 text-sm mt-1">{outcome}</p>
            </div>
        )}

        {isCompleting && (
            <div className="mt-3 pt-3 border-t border-slate-200">
                 <label htmlFor={`outcome-${id}`} className="block text-sm font-medium text-slate-600 mb-1">Record Outcome</label>
                 <textarea
                    id={`outcome-${id}`}
                    value={outcomeText}
                    onChange={(e) => setOutcomeText(e.target.value)}
                    rows={3}
                    placeholder="e.g., Prospect agreed to a demo next Tuesday."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary text-sm"
                    required
                 />
                 <div className="flex justify-end space-x-2 mt-2">
                     <button onClick={handleCancelComplete} className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-100">Cancel</button>
                     <button onClick={handleSaveOutcome} className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors px-3 py-1 rounded-md border border-green-600">Save Outcome</button>
                 </div>
            </div>
        )}
      </div>

      {!isCompleting && (
        <div className="flex items-center justify-end sm:justify-start flex-shrink-0 space-x-2 pt-2 sm:pt-0">
            {isPending && (
                <button
                onClick={handleStartComplete}
                className="flex items-center space-x-1.5 text-xs font-semibold text-green-600 hover:text-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md p-1"
                aria-label={`Mark follow-up for ${assignedTo} as complete`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                <span>Complete</span>
            </button>
            )}
            <button
                onClick={() => onDelete(id)}
                className="flex items-center space-x-1.5 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1"
                aria-label={`Delete follow-up for ${assignedTo}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
        </div>
      )}
    </li>
  );
};

export default FollowUpItem;