import React from 'react';
import { Prospect, ServiceType } from '../../types';

interface ProspectServiceDetailsProps {
    prospect: Prospect;
}

const ProspectServiceDetails: React.FC<ProspectServiceDetailsProps> = ({ prospect }) => {
    const {
        serviceInterestedIn,
        trainingLanguages,
        translationSourceLanguage,
        translationTargetLanguage,
        interpretationSourceLanguage,
        interpretationTargetLanguage
    } = prospect;

    const renderDetails = () => {
        switch (serviceInterestedIn) {
            case ServiceType.LanguageTraining:
                return trainingLanguages && trainingLanguages.length > 0 && (
                    <div className="text-sm">
                        <span className="font-semibold text-slate-600">Languages: </span>
                        <span className="text-slate-800">{trainingLanguages.join(', ')}</span>
                    </div>
                );
            case ServiceType.DocTranslation:
                return translationSourceLanguage && translationTargetLanguage && (
                    <div className="text-sm flex items-center space-x-2">
                        <span className="font-semibold text-slate-600">Request: </span>
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{translationSourceLanguage}</span>
                        <svg className="w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{translationTargetLanguage}</span>
                    </div>
                );
            case ServiceType.Interpretation:
                return interpretationSourceLanguage && interpretationTargetLanguage && (
                    <div className="text-sm flex items-center space-x-2">
                        <span className="font-semibold text-slate-600">Request: </span>
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{interpretationSourceLanguage}</span>
                        <svg className="w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                        <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{interpretationTargetLanguage}</span>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="my-4 p-3 bg-slate-50 rounded-md border border-slate-200">
            {renderDetails()}
        </div>
    );
};

export default ProspectServiceDetails;
