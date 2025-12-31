import React from 'react';
import { Student, Payment, Currency } from '../../types';
import { formatCurrency } from '../../utils/currency';
import DataTable from '../shared/DataTable';
import TableActionMenu from '../shared/TableActionMenu';

interface StudentsTableProps {
    students: Student[];
    payments: Payment[];
    onEdit: (student: Student) => void;
    onEnroll: (student: Student) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({
    students,
    payments,
    onEdit,
    onEnroll,
}) => {
    const columns = [
        {
            header: 'Client/Student ID',
            accessor: 'studentId' as keyof Student,
            sortable: true,
            width: '12%',
            render: (value: string) => (
                <span className="font-mono text-xs font-semibold text-brand-primary">{value}</span>
            ),
        },
        {
            header: 'Name',
            accessor: 'name' as keyof Student,
            sortable: true,
            width: '20%',
        },
        {
            header: 'Contact',
            accessor: (row: Student) => row.email || row.phone,
            render: (_: any, row: Student) => (
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
            header: 'Registration Date',
            accessor: 'registrationDate' as keyof Student,
            render: (value: string) => new Date(value).toLocaleDateString(),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Service',
            accessor: 'serviceInterestedIn' as keyof Student,
            render: (value: string) => value ? (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'Language Training' ? 'bg-blue-100 text-blue-800' :
                    value === 'Document Translation' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                    }`}>
                    {value}
                </span>
            ) : <span className="text-slate-400 text-xs">Language Training</span>,
            sortable: true,
            width: '15%',
        },
        {
            header: 'Payment Status',
            accessor: 'fees' as keyof Student,
            render: (_: any, row: Student) => {
                // Calculate total paid for this student
                const studentPayments = payments.filter(p => p.clientId === row.id);
                const totalPaid = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                const totalFees = Number(row.fees) || 0;
                const balance = totalFees - totalPaid;
                const percentPaid = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

                // Get the currency from the first payment or default to USD
                const currency = studentPayments.length > 0 ? studentPayments[0].currency : Currency.USD;

                return (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${balance <= 0 ? 'text-green-600' :
                                percentPaid >= 50 ? 'text-orange-600' :
                                    'text-red-600'
                                }`}>
                                {formatCurrency(totalPaid, currency)}
                            </span>
                            <span className="text-xs text-slate-500">/ {formatCurrency(totalFees, currency)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${balance <= 0 ? 'bg-green-600' :
                                    percentPaid >= 50 ? 'bg-orange-500' :
                                        'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(percentPaid, 100)}%` }}
                            />
                        </div>
                        {balance > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                                Balance: {formatCurrency(balance, currency)}
                            </div>
                        )}
                    </div>
                );
            },
            sortable: true,
            width: '18%',
        },
        {
            header: 'Created By',
            accessor: 'createdByUsername' as keyof Student,
            render: (_: any, row: Student) => (
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

    const renderExpandedRow = (student: Student) => {
        const isActualStudent = student.studentId.startsWith('STU-');

        return (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg ${isActualStudent ? 'bg-slate-50' : 'bg-blue-50 border-l-4 border-blue-500'
                }`}>
                {isActualStudent ? (
                    // Student Information
                    <>
                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Personal Information</h4>
                            <div className="space-y-1 text-xs text-slate-600">
                                <div><span className="font-medium">Date of Birth:</span> {student.dateOfBirth}</div>
                                <div><span className="font-medium">Nationality:</span> {student.nationality}</div>
                                <div><span className="font-medium">Occupation:</span> {student.occupation}</div>
                                <div><span className="font-medium">Mother Tongue:</span> {student.motherTongue}</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Contact & Address</h4>
                            <div className="space-y-1 text-xs text-slate-600">
                                <div><span className="font-medium">Address:</span> {student.address}</div>
                                {student.email && <div><span className="font-medium">Email:</span> {student.email}</div>}
                                {student.phone && <div><span className="font-medium">Phone:</span> {student.phone}</div>}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Additional Information</h4>
                            <div className="space-y-1 text-xs text-slate-600">
                                <div><span className="font-medium">How They Heard:</span> {student.howTheyHeardAboutUs}</div>
                                {student.howTheyHeardAboutUsOther && (
                                    <div><span className="font-medium">Details:</span> {student.howTheyHeardAboutUsOther}</div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // Client Information
                    <>
                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Client Information</h4>
                            <div className="space-y-1 text-xs text-slate-600">
                                <div><span className="font-medium">Client ID:</span> <span className="font-mono text-blue-700">{student.studentId}</span></div>
                                <div><span className="font-medium">Name:</span> {student.name}</div>
                                {student.email && <div><span className="font-medium">Email:</span> {student.email}</div>}
                                {student.phone && <div><span className="font-medium">Phone:</span> {student.phone}</div>}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Service Details</h4>
                            <div className="space-y-1 text-xs text-slate-600">
                                <div><span className="font-medium">Service Type:</span> {student.serviceInterestedIn || 'N/A'}</div>
                                <div><span className="font-medium">Total Fee:</span> {formatCurrency(student.fees, Currency.UGX)}</div>
                                <div><span className="font-medium">Registration Date:</span> {new Date(student.registrationDate).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">Additional Information</h4>
                            <div className="space-y-1 text-xs text-slate-600">
                                <div><span className="font-medium">How They Heard:</span> {student.howTheyHeardAboutUs || 'N/A'}</div>
                                {student.howTheyHeardAboutUsOther && (
                                    <div><span className="font-medium">Details:</span> {student.howTheyHeardAboutUsOther}</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Record Info - shown for both */}
                <div className="md:col-span-2 lg:col-span-3">
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                        <div><span className="font-medium">Created:</span> {new Date(student.createdAt).toLocaleString()} by {student.createdByUsername}</div>
                        {student.modifiedAt && (
                            <div><span className="font-medium">Modified:</span> {new Date(student.modifiedAt).toLocaleString()} by {student.modifiedByUsername}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DataTable
            data={students}
            columns={columns}
            keyExtractor={(row) => row.id}
            renderExpandedRow={renderExpandedRow}
            actions={(row) => {
                // Check if this is a student (STU-XXX) or converted prospect client (C-XXX)
                const isStudent = row.studentId.startsWith('STU-');

                // Only students can be edited (converted prospects are read-only)
                const actionList = [];

                if (isStudent) {
                    actionList.push({
                        label: 'Edit',
                        onClick: () => onEdit(row),
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        ),
                    });
                    actionList.push({
                        label: 'Enroll in Class',
                        onClick: () => onEnroll(row),
                        icon: (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        ),
                    });
                }

                return actionList.length > 0 ? <TableActionMenu actions={actionList} /> : null;
            }}
            emptyMessage="No students found."
            defaultSortColumn="Registration Date"
            defaultSortDirection="desc"
        />
    );
};

export default StudentsTable;
