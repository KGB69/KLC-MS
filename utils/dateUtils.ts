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

// Utility function to get today's date in YYYY-MM-DD format (timezone-safe)
export function getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Utility function to format a date for display (e.g., "Jan 15, 2024")
export function formatDateForDisplay(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
        // Parse YYYY-MM-DD format
        const [year, month, day] = dateString.split('-').map(Number);

        // Create date using local timezone (no UTC conversion)
        const date = new Date(year, month - 1, day);

        // Check if valid
        if (isNaN(date.getTime())) return dateString;

        // Format as localized string
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date for display:', error);
        return dateString;
    }
}
