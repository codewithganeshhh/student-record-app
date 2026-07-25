/**
 * Exports JSON array data to a downloadable .csv file that opens natively in Microsoft Excel.
 * @param {Array<Object>} data Array of objects to export
 * @param {Array<{label: string, key: string}>} columns Column definitions
 * @param {string} filename Name of the downloaded file (without extension)
 */
export function exportToExcel(data, columns, filename = 'Export_Data') {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // Generate Header Row
  const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');

  // Generate Data Rows
  const rows = data.map(item => {
    return columns.map(col => {
      let val = item[col.key];

      // Format Date values
      if (val && (col.key.includes('date') || col.key.includes('Date'))) {
        try {
          val = new Date(val).toLocaleDateString();
        } catch (e) {
          // keep original
        }
      }

      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n'); // Add UTF-8 BOM for Excel compatibility

  // Create Download Link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
