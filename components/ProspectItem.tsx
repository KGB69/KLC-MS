import React from 'react';
import { Prospect, ContactMethod } from '../types';
import { getContactMethodIcon, formatDate } from '../utils/serviceHelpers';
import ProspectItemHeader from './prospect/ProspectItemHeader';
import ProspectServiceDetails from './prospect/ProspectServiceDetails';
import ProspectItemActions from './prospect/ProspectItemActions';

interface ProspectItemProps {
    prospect: Prospect;
    onEdit: (prospect: Prospect) => void;
    onDelete: (prospect: Prospect) => void;
    onManageFollowUps: (prospect: Prospect) => void;
    onStartConvertToStudent: (prospect: Prospect) => void;
    onStartCompletionLogging: (prospect: Prospect) => void;
}

const ProspectItem: React.FC<ProspectItemProps> = ({
    prospect,
    onEdit,
    onDelete,
    onManageFollowUps,
    onStartConvertToStudent,
    onStartCompletionLogging
}) => {
    const { contactMethod, dateOfContact, notes } = prospect;

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex-grow">
                <ProspectItemHeader
                    prospectName={prospect.prospectName}
                    email={prospect.email}
                    phone={prospect.phone}
                    serviceInterestedIn={prospect.serviceInterestedIn}
                    createdByUsername={prospect.createdByUsername}
                    modifiedByUsername={prospect.modifiedByUsername}
                    createdAt={prospect.createdAt}
                    modifiedAt={prospect.modifiedAt}
                />

                <ProspectServiceDetails prospect={prospect} />

                <div className="flex items-center text-sm text-slate-500 mb-4 space-x-4">
                    <div className="flex items-center space-x-1">
                        {getContactMethodIcon(contactMethod)}
                        <span>{contactMethod}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
                        </svg>
                        <span>{formatDate(dateOfContact)}</span>
                    </div>
                </div>

                <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-md border border-slate-200 min-h-[60px]">
                    {notes}
                </p>
            </div>

            <ProspectItemActions
                prospect={prospect}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageFollowUps={onManageFollowUps}
                onStartConvertToStudent={onStartConvertToStudent}
                onStartCompletionLogging={onStartCompletionLogging}
            />
        </div>
    );
};

export default ProspectItem;