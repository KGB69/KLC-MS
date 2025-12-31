import React from 'react';
import { Payment, ServiceType, Currency } from '../../types';
import { formatCurrency } from '../../utils/currency';
import DataTable from '../shared/DataTable';
import TableActionMenu from '../shared/TableActionMenu';
import { getServiceBadgeColor } from '../../utils/serviceHelpers';

interface PaymentsTableProps {
    payments: Payment[];
    onEdit?: (payment: Payment) => void;
    onDelete?: (payment: Payment) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, onEdit, onDelete }) => {
    const columns = [
        {
            header: 'Date',
            accessor: 'paymentDate' as keyof Payment,
            render: (value: string) => new Date(value).toLocaleDateString(),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Payer',
            accessor: 'payerName' as keyof Payment,
            sortable: true,
            width: '20%',
        },
        {
            header: 'Service',
            accessor: 'service' as keyof Payment,
            render: (value: string) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceBadgeColor(value as ServiceType)}`}>
                    {value}
                </span>
            ),
            sortable: true,
            width: '15%',
        },
        {
            header: 'Amount',
            accessor: 'amount' as keyof Payment,
            render: (_: any, row: Payment) => (
                <span className="font-semibold text-green-600">
                    {formatCurrency(row.amount, row.currency)}
                </span>
            ),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Method',
            accessor: 'paymentMethod' as keyof Payment,
            width: '12%',
        },
        {
            header: 'Recorded By',
            accessor: 'createdByUsername' as keyof Payment,
            render: (_: any, row: Payment) => (
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

    const actions = (payment: Payment) => {
        const menuActions = [
            ...(onEdit ? [{
                label: 'Edit',
                onClick: () => onEdit(payment),
                className: 'text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100'
            }] : []),
            ...(onDelete ? [{
                label: 'Delete',
                onClick: () => onDelete(payment),
                className: 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100',
                danger: true
            }] : [])
        ];

        return menuActions.length > 0 ? <TableActionMenu actions={menuActions} /> : null;
    };

    const renderExpandedRow = (payment: Payment) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            {/* Payment Details */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Payment Details</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div><span className="font-medium">Payment ID:</span> <span className="font-mono">{payment.paymentId}</span></div>
                    <div><span className="font-medium">Client ID:</span> <span className="font-mono">{payment.clientId}</span></div>
                    <div><span className="font-medium">Payment Method:</span> {payment.paymentMethod}</div>
                </div>
            </div>

            {/* Notes */}
            {payment.notes && (
                <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Notes</h4>
                    <p className="text-xs text-slate-600">{payment.notes}</p>
                </div>
            )}

            {/* Attribution */}
            <div className="md:col-span-2">
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div><span className="font-medium">Recorded:</span> {new Date(payment.createdAt).toLocaleString()} by {payment.createdByUsername}</div>
                </div>
            </div>
        </div>
    );

    return (
        <DataTable
            data={payments}
            columns={columns}
            keyExtractor={(row) => row.paymentId}
            renderExpandedRow={renderExpandedRow}
            actions={actions}
            emptyMessage="No payments recorded."
            defaultSortColumn="Date"
            defaultSortDirection="desc"
        />
    );
};

export default PaymentsTable;
