import React from 'react';
import { Prospect, ServiceType } from '../../types';

interface ProspectItemActionsProps {
    prospect: Prospect;
    onEdit: (prospect: Prospect) => void;
    onDelete: (prospect: Prospect) => void;
    onManageFollowUps: (prospect: Prospect) => void;
    onStartConvertToStudent: (prospect: Prospect) => void;
    onStartCompletionLogging: (prospect: Prospect) => void;
}

const ProspectItemActions: React.FC<ProspectItemActionsProps> = ({
    prospect,
    onEdit,
    onDelete,
    onManageFollowUps,
    onStartConvertToStudent,
    onStartCompletionLogging,
}) => {
    const { prospectName, serviceInterestedIn } = prospect;

    return (
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => onManageFollowUps(prospect)}
                    className="flex items-center space-x-2 text-sm font-semibold text-brand-primary hover:text-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-md p-1"
                    aria-label={`Manage follow-ups for ${prospectName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Follow-ups</span>
                </button>

                {serviceInterestedIn === ServiceType.LanguageTraining && (
                    <button
                        onClick={() => onStartConvertToStudent(prospect)}
                        className="flex items-center space-x-2 text-sm font-semibold text-green-600 hover:text-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md p-1"
                        aria-label={`Convert ${prospectName} to a student`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 011.056 0l4-1.819a1 1 0 000-1.817l-4-1.818a.999.999 0 01-1.056 0L3 7.22v4.223c0 .383.22.734.564.898l6.5 3c.338.156.732.156 1.07 0l6.5-3A1 1 0 0018 11.443V7.22l-1.894-1.136a.999.999 0 01-1.056 0l-4 1.819a1 1 0 000 1.817l4 1.818a.999.999 0 011.056 0l2.646-1.588A1 1 0 0018 8.412V5.92a1 1 0 00-.606-.917l-7-3z" />
                            <path d="M3 12.555v1.444c0 .383.22.734.564.898l6.5 3c.338.156.732.156 1.07 0l6.5-3a1 1 0 00.564-.898v-1.444l-6.5 3-6.5-3z" />
                        </svg>
                        <span>Convert</span>
                    </button>
                )}
                {serviceInterestedIn === ServiceType.DocTranslation && (
                    <button
                        onClick={() => onStartCompletionLogging(prospect)}
                        className="flex items-center space-x-2 text-sm font-semibold text-green-600 hover:text-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md p-1"
                        aria-label={`Mark translation as completed for ${prospectName}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Mark Translation Completed</span>
                    </button>
                )}
                {serviceInterestedIn === ServiceType.Interpretation && (
                    <button
                        onClick={() => onStartCompletionLogging(prospect)}
                        className="flex items-center space-x-2 text-sm font-semibold text-green-600 hover:text-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 rounded-md p-1"
                        aria-label={`Mark interpretation as completed for ${prospectName}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Mark Interpretation Completed</span>
                    </button>
                )}
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={() => onEdit(prospect)}
                    className="flex items-center space-x-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-md p-1"
                    aria-label={`Edit prospect ${prospectName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                    <span>Edit</span>
                </button>
                <button
                    onClick={() => onDelete(prospect)}
                    className="flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1"
                    aria-label={`Delete prospect ${prospectName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
};

export default ProspectItemActions;
