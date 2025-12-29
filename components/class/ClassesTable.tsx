import React from 'react';
import { Class, DayOfWeek } from '../../types';
import DataTable from '../shared/DataTable';
import TableActionMenu from '../shared/TableActionMenu';

interface ClassesTableProps {
    classes: Class[];
    onEdit: (classItem: Class) => void;
    onDelete: (classItem: Class) => void;
}

const ClassesTable: React.FC<ClassesTableProps> = ({
    classes,
    onEdit,
    onDelete,
}) => {
    const getDayName = (day: DayOfWeek): string => {
        const dayMap: Record<DayOfWeek, string> = {
            [DayOfWeek.Monday]: 'Mon',
            [DayOfWeek.Tuesday]: 'Tue',
            [DayOfWeek.Wednesday]: 'Wed',
            [DayOfWeek.Thursday]: 'Thu',
            [DayOfWeek.Friday]: 'Fri',
            [DayOfWeek.Saturday]: 'Sat',
            [DayOfWeek.Sunday]: 'Sun',
        };
        return dayMap[day] || day;
    };

    const columns = [
        {
            header: 'Class Name',
            accessor: 'name' as keyof Class,
            sortable: true,
            width: '25%',
        },
        {
            header: 'Language',
            accessor: 'language' as keyof Class,
            sortable: true,
            width: '15%',
        },
        {
            header: 'Level',
            accessor: 'level' as keyof Class,
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {value}
                </span>
            ),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Schedule',
            accessor: (row: Class) => row.schedule.map(s => getDayName(s.dayOfWeek)).join(', '),
            render: (_: any, row: Class) => (
                <div className="text-xs space-y-1">
                    {row.schedule.map((sched, idx) => (
                        <div key={idx} className="flex items-center space-x-1">
                            <span className="font-medium">{getDayName(sched.dayOfWeek)}:</span>
                            <span className="text-slate-600">{sched.startTime} - {sched.endTime}</span>
                        </div>
                    ))}
                </div>
            ),
            width: '20%',
        },
        {
            header: 'Students',
            accessor: (row: Class) => row.studentIds.length,
            render: (value: number) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {value} enrolled
                </span>
            ),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Created By',
            accessor: 'createdByUsername' as keyof Class,
            render: (_: any, row: Class) => (
                <div className="text-xs">
                    <div className="font-medium">{row.createdByUsername}</div>
                    {row.createdAt && (
                        <div className="text-slate-500">
                            {new Date(row.createdAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            ),
            width: '15%',
        },
    ];

    const renderExpandedRow = (classItem: Class) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            {/* Class Details */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Class Details</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div><span className="font-medium">Class ID:</span> <span className="font-mono">{classItem.classId}</span></div>
                    <div><span className="font-medium">Teacher ID:</span> <span className="font-mono">{classItem.teacherId}</span></div>
                    <div><span className="font-medium">Total Students:</span> {classItem.studentIds.length}</div>
                </div>
            </div>

            {/* Schedule Details */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Full Schedule</h4>
                <div className="space-y-2">
                    {classItem.schedule.map((sched, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                            <span className="font-medium text-xs">{getDayName(sched.dayOfWeek)}</span>
                            <span className="text-xs text-slate-600">{sched.startTime} - {sched.endTime}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Attribution */}
            <div className="md:col-span-2">
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div>
                        <span className="font-medium">Created:</span> {classItem.createdAt ? new Date(classItem.createdAt).toLocaleString() : 'N/A'} by {classItem.createdByUsername}
                    </div>
                    {classItem.modifiedAt && (
                        <div>
                            <span className="font-medium">Modified:</span> {new Date(classItem.modifiedAt).toLocaleString()} by {classItem.modifiedByUsername}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <DataTable
            data={classes}
            columns={columns}
            keyExtractor={(row) => row.classId}
            renderExpandedRow={renderExpandedRow}
            actions={(row) => (
                <TableActionMenu
                    actions={[
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
                            label: 'Delete',
                            onClick: () => onDelete(row),
                            danger: true,
                            icon: (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            ),
                        },
                    ]}
                />
            )}
            emptyMessage="No classes found."
        />
    );
};

export default ClassesTable;
