// Utility function to format dates for HTML date inputs
export function formatDateForInput(date: string | Date | undefined | null): string {
    if (!date) return '';

    try {
        // If it's already a string in YYYY-MM-DD format, return it
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }

        // Convert to Date object if it's a string
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Check if valid date
        if (!dateObj || isNaN(dateObj.getTime())) {
            return '';
        }

        // Format as YYYY-MM-DD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}

// Utility function to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}
