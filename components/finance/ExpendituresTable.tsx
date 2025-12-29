import React from 'react';
import { Expenditure, Currency } from '../../types';
import { formatCurrency } from '../../utils/currency';
import DataTable from '../shared/DataTable';
import TableActionMenu from '../shared/TableActionMenu';

interface ExpendituresTableProps {
    expenditures: Expenditure[];
    onEdit?: (expenditure: Expenditure) => void;
    onDelete?: (expenditure: Expenditure) => void;
}

const ExpendituresTable: React.FC<ExpendituresTableProps> = ({ expenditures, onEdit, onDelete }) => {
    const columns = [
        {
            header: 'Date',
            accessor: 'expenditureDate' as keyof Expenditure,
            render: (value: string) => new Date(value).toLocaleDateString(),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Payee',
            accessor: 'payeeName' as keyof Expenditure,
            sortable: true,
            width: '20%',
        },
        {
            header: 'Category',
            accessor: 'category' as keyof Expenditure,
            render: (value: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                    {value}
                </span>
            ),
            sortable: true,
            width: '15%',
        },
        {
            header: 'Description',
            accessor: 'description' as keyof Expenditure,
            width: '25%',
        },
        {
            header: 'Amount',
            accessor: 'amount' as keyof Expenditure,
            render: (_: any, row: Expenditure) => (
                <span className="font-semibold text-red-600">
                    {formatCurrency(row.amount, row.currency)}
                </span>
            ),
            sortable: true,
            width: '12%',
        },
        {
            header: 'Recorded By',
            accessor: 'createdByUsername' as keyof Expenditure,
            render: (_: any, row: Expenditure) => (
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

    const actions = (expenditure: Expenditure) => {
        const menuActions = [
            ...(onEdit ? [{
                label: 'Edit',
                onClick: () => onEdit(expenditure),
                className: 'text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100'
            }] : []),
            ...(onDelete ? [{
                label: 'Delete',
                onClick: () => onDelete(expenditure),
                className: 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100',
                danger: true
            }] : [])
        ];

        return menuActions.length > 0 ? <TableActionMenu actions={menuActions} /> : null;
    };

    const renderExpandedRow = (expenditure: Expenditure) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            {/* Expenditure Details */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Expenditure Details</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div><span className="font-medium">Expenditure ID:</span> <span className="font-mono">{expenditure.expenditureId}</span></div>
                    <div><span className="font-medium">Payment Method:</span> {expenditure.paymentMethod}</div>
                    <div><span className="font-medium">Category:</span> {expenditure.category}</div>
                </div>
            </div>

            {/* Full Description */}
            <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Full Description</h4>
                <p className="text-xs text-slate-600">{expenditure.description}</p>
            </div>

            {/* Attribution */}
            <div className="md:col-span-2">
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Record Info</h4>
                <div className="space-y-1 text-xs text-slate-600">
                    <div><span className="font-medium">Recorded:</span> {new Date(expenditure.createdAt).toLocaleString()} by {expenditure.createdByUsername}</div>
                </div>
            </div>
        </div>
    );

    return (
        <DataTable
            data={expenditures}
            columns={columns}
            keyExtractor={(row) => row.expenditureId}
            renderExpandedRow={renderExpandedRow}
            actions={actions}
            emptyMessage="No expenditures recorded."
            defaultSortColumn="Date"
            defaultSortDirection="desc"
        />
    );
};

export default ExpendituresTable;
