import { format as dateFnsFormat } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateFnsFormat(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format article published date, handling various formats
 */
export function formatPublishedDate(publishedAt: string): string {
  try {
    // Handle microseconds in timestamp
    const cleanedDate = publishedAt.replace(/\.\d{6}Z$/, 'Z');
    return formatDate(new Date(cleanedDate), 'MMMM d, yyyy');
  } catch (error) {
    return 'Date unavailable';
  }
}
