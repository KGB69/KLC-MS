import React from 'react';
import { ServiceType } from '../../types';
import { getServiceBadgeColor } from '../../utils/serviceHelpers';

interface ProspectItemHeaderProps {
    prospectName: string;
    email?: string;
    phone?: string;
    serviceInterestedIn: ServiceType;
    createdByUsername?: string;
    modifiedByUsername?: string;
    createdAt?: string;
    modifiedAt?: string;
}

const ProspectItemHeader: React.FC<ProspectItemHeaderProps> = ({
    prospectName,
    email,
    phone,
    serviceInterestedIn,
    createdByUsername,
    modifiedByUsername,
    createdAt,
    modifiedAt,
}) => {
    const serviceBadgeColor = getServiceBadgeColor(serviceInterestedIn);

    return (
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-lg font-bold text-brand-dark">{prospectName}</h3>
                <div className="mt-1 space-y-1">
                    {email && (
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                            </svg>
                            <a href={`mailto:${email}`} className="text-sm text-brand-primary hover:underline truncate">
                                {email}
                            </a>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.066a1.5 1.5 0 01-1.052 1.767l-1.264.538a1.5 1.5 0 00-.862 1.933l1.838 3.29a1.5 1.5 0 001.933-.862l.538-1.264a1.5 1.5 0 011.767-1.052l3.066.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5h-2.148a1.5 1.5 0 01-1.465-1.175l-.716-3.066a1.5 1.5 0 011.052-1.767l1.264-.538a1.5 1.5 0 00.862-1.933l-1.838-3.29a1.5 1.5 0 00-1.933.862l-.538 1.264a1.5 1.5 0 01-1.767-1.052l-3.066.716A1.5 1.5 0 012 4.648V3.5z" clipRule="evenodd" />
                            </svg>
                            <a href={`tel:${phone}`} className="text-sm text-brand-secondary hover:underline truncate">
                                {phone}
                            </a>
                        </div>
                    )}
                    {(createdByUsername || modifiedByUsername) && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                            {createdByUsername && (
                                <div className="text-xs text-slate-500">
                                    Created by <span className="font-semibold text-slate-700">{createdByUsername}</span>
                                    {createdAt && ` on ${new Date(createdAt).toLocaleDateString()}`}
                                </div>
                            )}
                            {modifiedByUsername && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                    Modified by <span className="font-semibold text-slate-700">{modifiedByUsername}</span>
                                    {modifiedAt && ` on ${new Date(modifiedAt).toLocaleDateString()}`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${serviceBadgeColor} flex-shrink-0`}>
                {serviceInterestedIn}
            </span>
        </div>
    );
};

export default ProspectItemHeader;
