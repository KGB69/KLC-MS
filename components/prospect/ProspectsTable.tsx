import React from 'react';
import { Prospect, ServiceType } from '../../types';
import DataTable from '../shared/DataTable';
import TableActionMenu from '../shared/TableActionMenu';
import StatusBadge from '../shared/StatusBadge';
import { getServiceBadgeColor, getContactMethodIcon } from '../../utils/serviceHelpers';

interface TaskIndicators {
    count: number;
    hasOverdue: boolean;
    hasDueToday: boolean;
}

interface ProspectsTableProps {
    prospects: Prospect[];
    taskIndicators?: Record<string, TaskIndicators>;
    onEdit: (prospect: Prospect) => void;
    onDelete: (prospect: Prospect) => void;
    onManageFollowUps: (prospect: Prospect) => void;
    onConvertToStudent: (prospect: Prospect) => void;
    onMarkCompleted: (prospect: Prospect) => void;
}

const ProspectsTable: React.FC<ProspectsTableProps> = ({
    prospects,
    taskIndicators,
    onEdit,
    onDelete,
    onManageFollowUps,
    onConvertToStudent,
    onMarkCompleted,
}) => {
    const columns = [
        {
            header: 'Name',
            accessor: 'prospectName' as keyof Prospect,
            render: (value: string, row: Prospect) => {
                const indicators = taskIndicators?.[row.id];
                return (
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-slate-900">{value}</span>
                        {indicators && indicators.count > 0 && (
                            <div className="flex space-x-1" title={`${indicators.count} pending tasks`}>
                                {indicators.hasOverdue ? (
                                    <span className="flex h-2 w-2 rounded-full bg-red-500" title="Overdue Task"></span>
                                ) : indicators.hasDueToday ? (
                                    <span className="flex h-2 w-2 rounded-full bg-orange-500" title="Task Due Today"></span>
                                ) : (
                                    <span className="flex h-2 w-2 rounded-full bg-brand-primary" title="Pending Task"></span>
                                )}
                            </div>
                        )}
                    </div>
                );
            },
            sortable: true,
            width: '20%',
        },
        {
            header: 'Contact',
            accessor: (row: Prospect) => row.email || row.phone,
            render: (_: any, row: Prospect) => (
                <div className="text-xs space-y-1">
                    {row.email && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{row.email}</span>
                        </div>
                    )}
                    {row.phone && (
                        <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{row.phone}</span>
                        </div>
                    )}
                </div>
            ),
            width: '20%',
        },
        {
            header: 'Service',
            accessor: 'serviceInterestedIn' as keyof Prospect,
            render: (value: string) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceBadgeColor(value as ServiceType)}`}>
                    {value}
                </span>
            ),
            sortable: true,
            width: '15%',
        },
        {
            header: 'Status',
            accessor: 'status' as keyof Prospect,
            render: (value: string) => <StatusBadge status={value} />,
            sortable: true,
            width: '12%',
        },
        {
            header: 'Created By',
            accessor: 'createdByUsername' as keyof Prospect,
            render: (_: any, row: Prospect) => (
                <div className="text-xs">
                    <div className="font-medium">{row.createdByUsername}</div>
                    {row.createdAt && (
                        <div className="text-slate-500">
                            {new Date(row.createdAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            ),
            sortable: true,
            width: '15%',
        },
    ];

    const renderExpandedRow = (prospect: Prospect) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            {/* Service-specific details */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Service Details</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    {prospect.serviceInterestedIn === ServiceType.LanguageTraining && prospect.trainingLanguages && (
                        <>
                            <div><span className="font-medium">Languages:</span> {prospect.trainingLanguages.join(', ')}</div>
                        </>
                    )}
                    {prospect.serviceInterestedIn === ServiceType.DocTranslation && (
                        <>
                            {prospect.translationSourceLanguage && (
                                <div><span className="font-medium">From:</span> {prospect.translationSourceLanguage}</div>
                            )}
                            {prospect.translationTargetLanguage && (
                                <div><span className="font-medium">To:</span> {prospect.translationTargetLanguage}</div>
                            )}
                            {prospect.documentTitle && (
                                <div><span className="font-medium">Document:</span> {prospect.documentTitle}</div>
                            )}
                        </>
                    )}
                    {prospect.serviceInterestedIn === ServiceType.Interpretation && (
                        <>
                            {prospect.subjectOfInterpretation && (
                                <div><span className="font-medium">Subject:</span> {prospect.subjectOfInterpretation}</div>
                            )}
                            {prospect.interpretationEventDate && (
                                <div><span className="font-medium">Event Date:</span> {prospect.interpretationEventDate}</div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Notes */}
            {prospect.notes && (
                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Notes</h4>
                    <p className="text-xs text-slate-600">{prospect.notes}</p>
                </div>
            )}

            {/* Follow-up info */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Contact Method</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                    {getContactMethodIcon(prospect.contactMethod)}
                    <span>{prospect.contactMethod}</span>
                </div>
            </div>

            {/* Attribution */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div>
                        <span className="font-medium">Created:</span> {prospect.createdAt ? new Date(prospect.createdAt).toLocaleString() : 'N/A'} by {prospect.createdByUsername}
                    </div>
                    {prospect.modifiedAt && (
                        <div>
                            <span className="font-medium">Modified:</span> {new Date(prospect.modifiedAt).toLocaleString()} by {prospect.modifiedByUsername}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <DataTable
            data={prospects}
            columns={columns}
            keyExtractor={(row) => row.id}
            renderExpandedRow={renderExpandedRow}
            actions={(row) => {
                const actions: { label: string; onClick: () => void; icon: React.ReactNode; danger?: boolean }[] = [
                    {
                        label: 'Edit',
                        onClick: () => onEdit(row),
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        ),
                    },
                    {
                        label: 'Manage Follow-ups',
                        onClick: () => onManageFollowUps(row),
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ),
                    },
                ];

                if (row.serviceInterestedIn === ServiceType.LanguageTraining) {
                    actions.push({
                        label: 'Convert to Student',
                        onClick: () => onConvertToStudent(row),
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        ),
                    });
                } else if (
                    row.serviceInterestedIn === ServiceType.Interpretation ||
                    row.serviceInterestedIn === ServiceType.DocTranslation
                ) {
                    actions.push({
                        label: 'Convert Prospect',
                        onClick: () => onMarkCompleted(row),
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ),
                    });
                }

                actions.push({
                    label: 'Delete',
                    onClick: () => onDelete(row),
                    danger: true,
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    ),
                });

                return <TableActionMenu actions={actions} />;
            }}
            emptyMessage="No prospects found. Click 'New Prospect' to add one."
            defaultSortColumn="Created By"
            defaultSortDirection="desc"
        />
    );
};

export default ProspectsTable;
