
import React from 'react';
import { Prospect, ServiceType } from '../types';
import { formatCurrency } from '../utils/currency';

interface CompletedJobItemProps {
  job: Prospect;
  onEdit: (job: Prospect) => void;
  onDelete: (job: Prospect) => void;
}

const getServiceBadgeColor = (service: ServiceType): string => {
  switch (service) {
    case ServiceType.LanguageTraining:
      return 'bg-blue-100 text-blue-800';
    case ServiceType.DocTranslation:
      return 'bg-green-100 text-green-800';
    case ServiceType.Interpretation:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

// FIX: Updated `value` prop to accept `React.ReactNode` to allow JSX elements like `<span>`.
const DetailRow: React.FC<{ label: string; value?: React.ReactNode | null; }> = ({ label, value }) => {
    if (!value && typeof value !== 'number') return null;
    return (
        <div className="flex justify-between items-baseline text-sm py-1.5 border-b border-slate-100">
            <span className="font-medium text-slate-600">{label}:</span>
            <span className="text-slate-800 text-right">{value}</span>
        </div>
    );
};


const CompletedJobItem: React.FC<CompletedJobItemProps> = ({ job, onEdit, onDelete }) => {
  const { 
    prospectName, serviceInterestedIn, dateOfContact,
    translationCompletionDate, documentTitle, numberOfPages, 
    translationRatePerPage, translationTotalFee, interpretationCompletionDate, subjectOfInterpretation,
    interpretationDuration, interpretationDurationUnit, interpretationRate, interpretationTotalFee
  } = job;
  
  const serviceBadgeColor = getServiceBadgeColor(serviceInterestedIn);

  const renderCompletionDetails = () => {
    switch (serviceInterestedIn) {
      case ServiceType.DocTranslation:
        return (
          <div className="space-y-1">
            <DetailRow label="Completed On" value={translationCompletionDate ? new Date(translationCompletionDate + 'T00:00:00').toLocaleDateString() : 'N/A'} />
            <DetailRow label="Document Title" value={documentTitle} />
            <DetailRow label="Pages" value={numberOfPages} />
            <DetailRow label="Rate per Page" value={formatCurrency(translationRatePerPage)} />
            <div className="pt-2 mt-2 border-t-2 border-slate-200">
                <DetailRow label="Total Fee" value={<span className="font-bold text-base">{formatCurrency(translationTotalFee)}</span>} />
            </div>
          </div>
        );
      case ServiceType.Interpretation:
        return (
          <div className="space-y-1">
            <DetailRow label="Completed On" value={interpretationCompletionDate ? new Date(interpretationCompletionDate + 'T00:00:00').toLocaleDateString() : 'N/A'} />
            <DetailRow label="Subject" value={subjectOfInterpretation} />
            <DetailRow label="Duration" value={`${interpretationDuration} ${interpretationDurationUnit}`} />
            <DetailRow label="Rate" value={`${formatCurrency(interpretationRate)} per ${interpretationDurationUnit?.slice(0, -1)}`} />
             <div className="pt-2 mt-2 border-t-2 border-slate-200">
                <DetailRow label="Total Fee" value={<span className="font-bold text-base">{formatCurrency(interpretationTotalFee)}</span>} />
            </div>
          </div>
        );
        case ServiceType.LanguageTraining:
            return (
                 <div className="space-y-1">
                    <DetailRow label="Converted On" value={new Date(dateOfContact + 'T00:00:00').toLocaleDateString()} />
                    <div className="text-center py-4">
                        <svg className="mx-auto h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 011.056 0l4-1.819a1 1 0 000-1.817l-4-1.818a.999.999 0 01-1.056 0L3 7.22v4.223c0 .383.22.734.564.898l6.5 3c.338.156.732.156 1.07 0l6.5-3A1 1 0 0018 11.443V7.22l-1.894-1.136a.999.999 0 01-1.056 0l-4 1.819a1 1 0 000 1.817l4 1.818a.999.999 0 011.056 0l2.646-1.588A1 1 0 0018 8.412V5.92a1 1 0 00-.606-.917l-7-3z" />
                            <path d="M3 12.555v1.444c0 .383.22.734.564.898l6.5 3c.338.156.732.156 1.07 0l6.5-3a1 1 0 00.564-.898v-1.444l-6.5 3-6.5-3z" />
                        </svg>
                        <p className="text-sm text-slate-600 mt-2">Converted to a student.</p>
                        <p className="text-xs text-slate-500">View details in the 'Students' tab.</p>
                    </div>
                 </div>
            );
      default:
        return <p className="text-sm text-slate-500">No completion details available.</p>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col transition-all duration-300">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-brand-dark">{prospectName}</h3>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${serviceBadgeColor} flex-shrink-0`}>
                {serviceInterestedIn}
            </span>
        </div>
        
        <div className="my-4 p-4 bg-slate-50 rounded-md border border-slate-200">
            {renderCompletionDetails()}
        </div>
      </div>
       <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end items-center">
            <div className="flex space-x-4">
                {job.serviceInterestedIn !== ServiceType.LanguageTraining && (
                    <button
                        onClick={() => onEdit(job)}
                        className="flex items-center space-x-2 text-sm font-semibold text-brand-secondary hover:text-brand-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 rounded-md p-1"
                        aria-label={`Edit job ${job.prospectName}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                        <span>Edit</span>
                    </button>
                )}
                <button
                    onClick={() => onDelete(job)}
                    className="flex items-center space-x-2 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1"
                    aria-label={`Delete job ${job.prospectName}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 4.811 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span>Delete</span>
                </button>
            </div>
      </div>
    </div>
  );
};

export default CompletedJobItem;
