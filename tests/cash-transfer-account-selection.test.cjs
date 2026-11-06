const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(__dirname, "..", "src/pages/Product/CashTransferItems.tsx"),
  "utf8",
);
const createFormSource = fs.readFileSync(
  path.join(__dirname, "../src/pages/Product/CashTransferCreateForm.tsx"),
  "utf8",
);
const parentPageSource = fs.readFileSync(
  path.join(__dirname, "../src/pages/Product/CashTransfer.jsx"),
  "utf8",
);
const displayPageSource = fs.readFileSync(
  path.join(__dirname, "../src/pages/Product/Components/DisplayPage.tsx"),
  "utf8",
);

test("cash transfer source accounts are limited to the active location", () => {
  assert.match(source, /account\.location_id\) === String\(location_id\)/);
  assert.match(source, /currentLocationAccounts\.map/);
});

test("cash transfer destination labels include their location", () => {
  assert.match(source, /table: ["']locations["']/);
  assert.match(source, /account\.location_name \|\| account\.location\?\.name/);
  assert.match(source, /locationNames\.get\(String\(account\.location_id\)\)/);
  assert.match(source, /transferAccountLabel\(acc, accountLocationLabel\(acc\)\)/);
});

test("completed transfer register can be limited to a selected period", () => {
  assert.match(source, /start_date:\s*"",\s*end_date:\s*""/);
  assert.match(
    source,
    /mainParam: \{ location_id: location_id \|\| 0, \.\.\.registerDates \}/,
  );
});

test("one transfer form creates its own parent document and paired account entries", () => {
  assert.match(parentPageSource, /renderCreateForm=/);
  assert.match(displayPageSource, /renderCreateForm\(\{/);
  assert.match(createFormSource, /await onSave\(\{/);
  assert.match(createFormSource, /requisition_id: documentId/);
  assert.match(createFormSource, /category_id: 0/);
  assert.match(createFormSource, /category_id: 1/);
  assert.match(createFormSource, /Only accounts assigned to this location are listed/);
});

test("a newly saved transfer opens the existing approval details immediately", () => {
  assert.match(createFormSource, /openApprovalId: documentId/);
  assert.match(displayPageSource, /routeLocation\.state\?\.openApprovalId/);
  assert.match(displayPageSource, /setPage\(2\)/);
});

test("monthly reconciliation groups income and expenses by recognised event date", async () => {
  const { incomeExpenseMonthlyReconciliation } = await import(
    "../src/utils/functions/incomeExpenseReport.js"
  );
  const months = incomeExpenseMonthlyReconciliation([
    { document_type: 7, resolved: 1, resolved_date: "2026-01-04", income_amount: "100.00" },
    { document_type: 2, resolved: 1, resolved_date: "2026-01-18", expense_amount: "25.50" },
    { document_type: 3, resolved: 1, resolved_date: "2026-02-02", expense_amount: "10.00" },
    { document_type: 3, resolved: 1, resolved_date: "2026-02-25", expense_amount: "-2.00" },
  ]);

  assert.deepEqual(
    months.map(({ key, totals }) => ({ key, totals })),
    [
      { key: "2026-02", totals: { income: "0.00", expenses: "8.00", net: "-8.00" } },
      { key: "2026-01", totals: { income: "100.00", expenses: "25.50", net: "74.50" } },
    ],
  );
});

test("monthly reconciliation keeps missing dates visible outside month totals", async () => {
  const { incomeExpenseMonthlyReconciliation } = await import(
    "../src/utils/functions/incomeExpenseReport.js"
  );
  const months = incomeExpenseMonthlyReconciliation([
    { document_type: 7, resolved: 1, resolved_date: null, income_amount: "8.00" },
  ]);

  assert.equal(months[0].key, "undated");
  assert.equal(months[0].label, "Date not recorded");
  assert.equal(months[0].totals.net, "8.00");
});
