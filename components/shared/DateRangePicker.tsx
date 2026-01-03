import React, { useState, useRef, useEffect } from 'react';

import { CustomDateRange } from '../../utils/dateFilters';

interface DateRangePickerProps {
    isOpen: boolean;
    onApply: (range: CustomDateRange) => void;
    onClose: () => void;
    initialRange?: CustomDateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onApply, onClose, initialRange }) => {
    const [startDate, setStartDate] = useState(initialRange?.startDate || '');
    const [endDate, setEndDate] = useState(initialRange?.endDate || '');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleApply = () => {
        if (startDate && endDate) {
            onApply({ startDate, endDate });
            onClose();
        }
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Custom Date Range</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={endDate || undefined}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || undefined}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        />
                    </div>

                    {startDate && endDate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">Selected Range:</span>{' '}
                                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Clear
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={!startDate || !endDate}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${startDate && endDate
                            ? 'bg-brand-primary hover:bg-sky-700'
                            : 'bg-slate-300 cursor-not-allowed'
                            }`}
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateRangePicker;
