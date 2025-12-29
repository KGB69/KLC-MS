import React from 'react';
import { ProspectStatus } from '../../types';

interface StatusBadgeProps {
    status: ProspectStatus | string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case ProspectStatus.Inquired:
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case ProspectStatus.Converted:
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                status
            )}`}
        >
            {status}
        </span>
    );
};

export default StatusBadge;
