import React, { useState } from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => any);
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
    renderExpandedRow?: (row: T) => React.ReactNode;
    actions?: (row: T) => React.ReactNode;
    isLoading?: boolean;
    emptyMessage?: string;
    keyExtractor: (row: T) => string;
    defaultSortColumn?: string;
    defaultSortDirection?: 'asc' | 'desc';
}

function DataTable<T>({
    data,
    columns,
    onRowClick,
    renderExpandedRow,
    actions,
    isLoading = false,
    emptyMessage = 'No data available',
    keyExtractor,
    defaultSortColumn,
    defaultSortDirection = 'asc',
}: DataTableProps<T>) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

    const toggleRow = (rowKey: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowKey)) {
            newExpanded.delete(rowKey);
        } else {
            newExpanded.add(rowKey);
        }
        setExpandedRows(newExpanded);
    };

    const handleSort = (columnHeader: string, accessor: any) => {
        if (sortColumn === columnHeader) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnHeader);
            setSortDirection('asc');
        }
    };

    const getCellValue = (row: T, accessor: keyof T | ((row: T) => any)) => {
        if (typeof accessor === 'function') {
            return accessor(row);
        }
        return row[accessor];
    };

    const sortedData = React.useMemo(() => {
        if (!sortColumn) return data;

        const column = columns.find(col => col.header === sortColumn);
        if (!column) return data;

        return [...data].sort((a, b) => {
            const aValue = getCellValue(a, column.accessor);
            const bValue = getCellValue(b, column.accessor);

            if (aValue === bValue) return 0;

            const comparison = aValue > bValue ? 1 : -1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortColumn, sortDirection, columns]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                    <span className="ml-3 text-slate-600">Loading...</span>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <p className="text-center text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            {renderExpandedRow && (
                                <th className="w-10 px-4 py-3"></th>
                            )}
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-4 py-3 text-left text-sm font-semibold text-slate-700 ${column.sortable ? 'cursor-pointer hover:bg-slate-200 transition-colors' : ''
                                        }`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(column.header, column.accessor)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <span>{column.header}</span>
                                        {column.sortable && sortColumn === column.header && (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {sortDirection === 'asc' ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                )}
                                            </svg>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && (
                                <th className="w-16 px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {sortedData.map((row, rowIndex) => {
                            const rowKey = keyExtractor(row);
                            const isExpanded = expandedRows.has(rowKey);

                            return (
                                <React.Fragment key={rowKey}>
                                    <tr
                                        className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                            } hover:bg-slate-100 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                            }`}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {renderExpandedRow && (
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleRow(rowKey);
                                                    }}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <svg
                                                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
                                        {columns.map((column, colIndex) => {
                                            const value = getCellValue(row, column.accessor);
                                            return (
                                                <td key={colIndex} className="px-4 py-3 text-sm text-slate-700">
                                                    {column.render ? column.render(value, row) : value}
                                                </td>
                                            );
                                        })}
                                        {actions && (
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                {actions(row)}
                                            </td>
                                        )}
                                    </tr>
                                    {renderExpandedRow && isExpanded && (
                                        <tr className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td colSpan={columns.length + (actions ? 2 : 1)} className="px-4 py-4 border-t border-slate-200">
                                                {renderExpandedRow(row)}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;
