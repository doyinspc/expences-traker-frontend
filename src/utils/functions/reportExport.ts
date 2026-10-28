export function buildReportCsv(headers: unknown[], rows: unknown[][]): string {
  const cell = (value: unknown): string => {
    let text = value === null || value === undefined ? '' : String(value);
    // Spreadsheet programs must treat user-entered names as text, not formulas.
    if (typeof value === 'string' && /^[=+@\t\r]|^-(?!\d+(?:\.\d+)?$)/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  return '\uFEFF' + [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
}
