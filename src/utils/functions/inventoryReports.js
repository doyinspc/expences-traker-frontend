/** Report statuses stay numeric in storage; these labels are presentation only. */
export const transferLabels = Object.freeze({
  10: "Dispatched",
  20: "Partially received",
  30: "Received",
});
export const stockLabels = Object.freeze({
  in: "In stock",
  low: "Low stock",
  out: "Out of stock",
  over: "Overstocked",
  unverified: "Unverified",
});

/** ABC ranks known positive asset values within each currency, using 80%/95% bands. */
export function inventoryABC(valuation, method = "WAC") {
  const result = new Map();
  const currencies = new Map();
  for (const row of valuation || []) {
    const value = row.methods?.[method]?.value_minor;
    if (value == null || Number(value) <= 0 || !row.currency_id) continue;
    const key = String(row.currency_id);
    if (!currencies.has(key)) currencies.set(key, []);
    currencies.get(key).push({ ...row, value: Number(value) });
  }
  for (const rows of currencies.values()) {
    rows.sort(
      (a, b) => b.value - a.value || Number(a.item_id) - Number(b.item_id),
    );
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    let cumulative = 0;
    for (const row of rows) {
      const tier =
        cumulative < total * 0.8 ? "A" : cumulative < total * 0.95 ? "B" : "C";
      result.set(`${row.item_id}:${row.currency_id}`, tier);
      cumulative += row.value;
    }
  }
  return result;
}

export function expiryLabel(lot, today) {
  if (!lot.expiry_date) return "Expiry missing";
  if (lot.expiry_date < today) return "Expired";
  const days = Math.round(
    (Date.parse(lot.expiry_date) - Date.parse(today)) / 86400000,
  );
  return days <= 30 ? "Expires within 30 days" : "Current";
}

/** Build exports from displayed filters, including all pages. Escape spreadsheet formulas. */
export async function exportInventory(format, columns, rows, title, context) {
  const safe = (value) =>
    typeof value === "string" && /^[=+\-@\t\r]/.test(value)
      ? "'" + value
      : (value ?? "");
  const values = rows.map((row) =>
    columns.map((column) => safe(column.value(row))),
  );
  const headers = columns.map((column) => column.label);
  const filename =
    "Prokure-" +
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
    "-" +
    context.to_date;
  if (format === "csv") {
    const cell = (value) => '"' + String(value).replaceAll('"', '""') + '"';
    const csv =
      "\uFEFF" +
      [headers, ...values].map((row) => row.map(cell).join(",")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  } else if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([headers, ...values]),
      "Stock",
    );
    XLSX.writeFile(workbook, filename + ".xlsx");
  } else {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.setFontSize(16);
    pdf.text(context.company?.name || "Prokure", 14, 16);
    pdf.setFontSize(11);
    pdf.text(title + " · " + context.location.name, 14, 24);
    pdf.setFontSize(9);
    pdf.text(
      context.from_date + " to " + context.to_date + " · All filtered rows",
      14,
      31,
    );
    autoTable(pdf, {
      head: [headers],
      body: values,
      startY: 36,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] },
      didDrawPage: () => {
        pdf.setFontSize(8);
        pdf.text("Prokure · Page " + pdf.internal.getNumberOfPages(), 14, 202);
      },
    });
    pdf.save(filename + ".pdf");
  }
}

/** Display names for the existing ledger movement codes, shared by tables and exports. */
export const movementLabels = Object.freeze({
  OPENING: "Opening stock",
  RECEIPT: "Procurement receipt",
  ISSUE: "Requisition issue",
  SALE: "Goods sold through Income",
  XFER_OUT: "Transfer dispatched",
  XFER_IN: "Transfer received",
  RETURN_IN: "Customer return",
  RETURN_OUT: "Supplier return",
  DAMAGE: "Damage write-off",
  EXPIRED: "Expired stock disposal",
  LOSS: "Loss / shrinkage",
  ADJUST_IN: "Count increase",
  ADJUST_OUT: "Count decrease",
});
