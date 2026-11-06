const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const money = (value) => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Convert saved decimal strings to exact cents for reconciling a complete print batch. */
export function cashFlowAmountCents(value) {
  const text = String(value);
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(text)) throw new Error('The report contains an invalid amount.');
  const negative = text.startsWith('-');
  const [whole, fraction = ''] = text.replace(/^-/, '').split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return negative ? -cents : cents;
}

/**
 * Purpose: produce a self-contained printable cash-flow detail with no application chrome.
 * Algorithm: escape every saved text value; show scope, metric, currency, total and all
 * fetched rows; repeat table headings on printed pages. No opening balance is inferred.
 */
export function cashFlowPrintHtml({ company, location, period, month, metric, currency, amount, rows }) {
  const headers = ['Date', 'Type / status', 'Reference / document', 'Account / from', 'To', 'Amount'];
  const body = rows.map((row) => `<tr>${[
    row.date, `${row.kind} · ${row.workflow_state || ''}`, `${row.reference || ''} · ${row.title || ''}`,
    row.from_account || row.account || '', row.to_account || '', money(row.amount),
  ].map((value) => `<td>${escape(value)}</td>`).join('')}</tr>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escape(month)} cash-flow detail</title><style>
    @page{size:A4 landscape;margin:15mm}body{font:11px Arial,sans-serif;color:#111827}h1{font-size:21px;margin-bottom:6px}h2{font-size:16px}p{line-height:1.5}table{border-collapse:collapse;width:100%;margin-top:16px}th,td{border:1px solid #d1d5db;padding:8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#f3f4f6}thead{display:table-header-group}tr{break-inside:avoid}td:last-child{text-align:right;white-space:nowrap}.meta{color:#4b5563}.total{font-size:15px;font-weight:bold}
    </style></head><body><h1>${escape(company || 'Prokure')}</h1><h2>Monthly cash-flow detail</h2>
    <p class="meta">Location: ${escape(location)}<br>Accounting year: ${escape(period.start_date)} to ${escape(period.end_date)}<br>Month: ${escape(month)} · Category: ${escape(metric)} · Currency: ${escape(currency)}</p>
    <p class="total">Selected total: ${escape(currency)} ${escape(money(amount))}</p>
    <p>Cash In includes income and transfers received. Expenses include procurement and cash advances less returns. Transfers Out are shown separately. Net movement excludes opening cash and internal account transfers.</p>
    <table><thead><tr>${headers.map((label) => `<th>${escape(label)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
    <p class="meta">${rows.length} transaction event(s). Generated ${escape(new Date().toLocaleString())}.</p></body></html>`;
}

/** Print only the reviewed report through an isolated frame, then remove its document. */
export function printCashFlowDetail(data) {
  const frame = document.createElement('iframe');
  frame.title = 'Cash-flow print document';
  frame.style.cssText = 'position:fixed;left:-10000px;width:1px;height:1px;border:0';
  frame.onload = () => {
    frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
    frame.contentWindow.focus();
    frame.contentWindow.print();
  };
  frame.srcdoc = cashFlowPrintHtml(data);
  document.body.appendChild(frame);
}
