import React from 'react';
import { Prospect, FollowUpAction, FollowUpFormData } from '../types';
import FollowUpList from './FollowUpList';
import FollowUpForm from './FollowUpForm';
import Modal from './shared/Modal';

interface FollowUpManagerModalProps {
  prospect: Prospect;
  followUps: FollowUpAction[];
  isLoading: boolean;
  onClose: () => void;
  onAddFollowUp: (formData: FollowUpFormData) => void;
  onUpdateStatus: (id: string, updates: Partial<Pick<FollowUpAction, 'status' | 'outcome'>>) => void;
  onDelete: (id: string) => void;
}

const FollowUpManagerModal: React.FC<FollowUpManagerModalProps> = ({
  prospect,
  followUps,
  isLoading,
  onClose,
  onAddFollowUp,
  onUpdateStatus,
  onDelete,
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Follow-ups for ${prospect.prospectName}`}
    >
      <div className="space-y-6">
        <div className="max-h-[40vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
              <h3 className="mt-3 text-md font-medium text-brand-dark">Loading Tasks...</h3>
            </div>
          ) : (
            <FollowUpList followUps={followUps} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
          )}
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h4 className="font-semibold text-brand-secondary mb-4">Add New Task</h4>
          <FollowUpForm onSubmit={onAddFollowUp} />
        </div>
      </div>
    </Modal>
  );
};

export default FollowUpManagerModal;