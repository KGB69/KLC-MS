
export type TimeFilterType = 'all' | '24h' | '7d' | '1m' | '3m' | '6m' | '1y' | 'custom';

export interface CustomDateRange {
    startDate: string;
    endDate: string;
}

export const filterDataByTime = <T,>(
    data: T[],
    dateField: keyof T,
    filterType: TimeFilterType,
    customRange?: CustomDateRange
): T[] => {
    if (filterType === 'all') return data;

    const now = new Date();
    let cutoffDate = new Date();

    if (filterType === 'custom' && customRange) {
        const start = new Date(customRange.startDate);
        const end = new Date(customRange.endDate);
        end.setHours(23, 59, 59, 999); // Include the entire end date

        return data.filter(item => {
            const value = item[dateField];
            if (!value) return false;

            const itemDate = new Date(value as any);
            if (isNaN(itemDate.getTime())) return false;

            return itemDate >= start && itemDate <= end;
        });
    }

    switch (filterType) {
        case '24h': {
            // Last 24 hours
            cutoffDate.setHours(cutoffDate.getHours() - 24);
            break;
        }
        case '7d': {
            // Last 7 days
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            break;
        }
        case '1m': {
            // Last 1 month
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
        }
        case '3m': {
            // Last 3 months
            cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            break;
        }
        case '6m': {
            // Last 6 months
            cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            break;
        }
        case '1y': {
            // Last 1 year
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        }
        default:
            return data;
    }

    return data.filter(item => {
        const value = item[dateField];
        if (!value) return false;

        const itemDate = new Date(value as any);
        if (isNaN(itemDate.getTime())) return false;

        return itemDate >= cutoffDate;
    });
};
