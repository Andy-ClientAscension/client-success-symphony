/**
 * Utility functions for exporting data
 */

/**
 * Convert client data to CSV format
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    return;
  }

  // Extract headers from the first item in the array
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(item => 
      headers.map(header => {
        const value = item[header];
        
        // Handle different data types for CSV formatting
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (typeof value === 'object') {
          if (value instanceof Date) {
            return value.toISOString();
          }
          // For objects, convert to JSON string and wrap in quotes
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a download link
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    // Other browsers
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
