// Utility function to format dates for HTML date inputs
export function formatDateForInput(date: any): string {
    // Handle null/undefined/empty
    if (!date) return '';

    try {
        // If it's already a string in YYYY-MM-DD format, return it
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }

        // Convert to Date object
        let dateObj: Date;
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else if (typeof date === 'object' && date !== null) {
            // Handle plain objects - they might have a toString or need conversion
            dateObj = new Date(String(date));
        } else {
            return '';
        }

        // Check if valid date (must check if getTime exists and is not NaN)
        if (!dateObj || typeof dateObj.getTime !== 'function' || isNaN(dateObj.getTime())) {
            return '';
        }

        // Format as YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error, 'for value:', date);
        return '';
    }
}

// Utility function to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}
