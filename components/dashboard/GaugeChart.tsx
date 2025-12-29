import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { TimeFilterType, CustomDateRange } from '../../utils/dateFilters';
import DateRangePicker from '../shared/DateRangePicker';

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

interface GaugeChartProps {
    title: string;
    value: number;
    maxValue?: number;
    percentageChange: number;
    categories: CategoryData[];
    timeFilter: TimeFilterType;
    onTimeFilterChange: (filter: TimeFilterType, range?: CustomDateRange) => void;
    customRange?: CustomDateRange;
    currency?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
    title,
    value,
    maxValue = 100,
    percentageChange,
    categories,
    timeFilter,
    onTimeFilterChange,
    customRange,
    currency
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const isPositive = percentageChange >= 0;
    const progressColor = isPositive ? '#10b981' : '#ef4444'; // Solid green or red

    // Format display value
    const formatValue = (val: number) => {
        if (currency) {
            if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
            return val.toFixed(0);
        }
        return val.toString();
    };

    const displayValue = formatValue(value);

    // Prepare data for pie chart
    const pieData = categories.map(cat => ({
        name: cat.name,
        value: cat.value,
        itemStyle: { color: cat.color }
    }));

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        series: [{
            type: 'pie',
            radius: ['50%', '70%'], // Thinner donut chart
            center: ['50%', '50%'],
            padAngle: 3, // Spacing between segments
            itemStyle: {
                borderRadius: 8,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false // Hide labels, we'll show legend instead
            },
            emphasis: {
                scale: true,
                scaleSize: 10,
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            data: pieData
        }],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
    };

    // Compact time filter buttons
    const timeFilters: { label: string; value: TimeFilterType }[] = [
        { label: '24H', value: '24h' },
        { label: '7D', value: '7d' },
        { label: '1M', value: '1m' },
        { label: '3M', value: '3m' },
        { label: '6M', value: '6m' },
        { label: '1Y', value: '1y' },
        { label: 'All', value: 'all' }
    ];

    return (
        <div className="px-3 relative">
            {/* Compact Time Filter with Calendar */}
            <div className="flex items-center justify-end gap-1 text-xs mb-2">
                {timeFilters.map(({ label, value: filterValue }) => (
                    <button
                        key={filterValue}
                        onClick={() => onTimeFilterChange(filterValue)}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${timeFilter === filterValue
                            ? 'bg-brand-primary text-white'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        {label}
                    </button>
                ))}
                {/* Calendar Icon for Custom Date Range */}
                <button
                    onClick={() => setShowDatePicker(true)}
                    className={`p-1 rounded transition-colors ${timeFilter === 'custom'
                        ? 'bg-brand-primary text-white'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                    title="Custom date range"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            {/* Pie Chart */}
            <div className="relative mt-4">
                <ReactECharts
                    option={option}
                    style={{ height: '200px', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                />

                {/* Center Content */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-xl font-bold text-slate-800">{displayValue}</div>
                    {currency && (
                        <div className="text-[10px] text-slate-500 font-medium">{currency}</div>
                    )}
                    <div className="text-[11px] text-slate-600 mt-0.5">{title}</div>
                    <div className={`flex items-center justify-center gap-0.5 mt-0.5 text-[10px] font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <span>{isPositive ? '+' : ''}{percentageChange}%</span>
                        <svg className={`w-3 h-3 ${!isPositive && 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Compact Category Legend */}
            <div className="flex flex-wrap justify-center gap-2 mt-1 pb-2">
                {categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-xs text-slate-600">{category.name}</span>
                    </div>
                ))}
            </div>

            {/* Date Range Picker Modal - Only render when open */}
            {showDatePicker && (
                <DateRangePicker
                    isOpen={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onApply={(range) => {
                        onTimeFilterChange('custom', range);
                        setShowDatePicker(false);
                    }}
                    initialRange={customRange}
                />
            )}
        </div>
    );
};

export default GaugeChart;
