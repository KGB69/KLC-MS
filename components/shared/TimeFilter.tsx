import React, { useState } from 'react';
import { TimeFilterType, CustomDateRange } from '../../utils/dateFilters';
import DateRangePicker from './DateRangePicker';

interface TimeFilterProps {
    currentFilter: TimeFilterType;
    onFilterChange: (filter: TimeFilterType, customRange?: CustomDateRange) => void;
    customRange?: CustomDateRange;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ currentFilter, onFilterChange, customRange }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const filterOptions: { value: TimeFilterType; label: string }[] = [
        { value: '24h', label: '24H' },
        { value: '7d', label: '7D' },
        { value: '1m', label: '1M' },
        { value: '3m', label: '3M' },
        { value: '6m', label: '6M' },
        { value: '1y', label: '1Y' },
        { value: 'all', label: 'All' },
    ];

    const handleDateRangeApply = (startDate: string, endDate: string) => {
        onFilterChange('custom', { startDate, endDate });
    };

    const formatCustomRange = () => {
        if (!customRange) return '';
        const start = new Date(customRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const end = new Date(customRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${start} - ${end}`;
    };

    return (
        <>
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 min-w-max">
                    {filterOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onFilterChange(option.value)}
                            className={`
                            px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                            ${currentFilter === option.value
                                    ? 'bg-white text-brand-primary shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }
                        `}
                        >
                            {option.label}
                        </button>
                    ))}

                    {/* Calendar Icon Button */}
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className={`
                        px-3 py-1.5 rounded-md transition-all duration-200 flex items-center space-x-1
                        ${currentFilter === 'custom'
                                ? 'bg-white text-brand-primary shadow-sm'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }
                    `}
                        title="Custom date range"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {currentFilter === 'custom' && customRange && (
                            <span className="text-xs font-medium ml-1">{formatCustomRange()}</span>
                        )}
                    </button>
                </div>
            </div>

            {showDatePicker && (
                <DateRangePicker
                    onApply={handleDateRangeApply}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </>
    );
};

export default TimeFilter;
