const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('completed document lists use the workflow name returned by the API', () => {
  [
    'src/pages/Procurement/Requisitions.tsx',
    'src/pages/Procurement/PurchaseOrders.tsx',
    'src/pages/Procurement/Cashadvance.tsx',
    'src/pages/CashAdvances/AdvanceRequests.tsx',
    'src/pages/Procurement/CashTransfer.tsx',
  ].forEach((file) => {
    const source = read(file);
    assert.match(source, /name:'workflow_name'/, `${file} must display workflow_name`);
    assert.match(source, /workflow_name:\s*true/, `${file} must show the workflow column by default`);
  });
});

test('requisition lists do not show a budget column by default', () => {
  const source = read('src/pages/Procurement/Requisitions.tsx');
  assert.match(source, /budget_name:\s*false/);
});

test('only purchase orders and cash advances retain budget fields', () => {
  const page = read('src/pages/Product/Components/DisplayPage.tsx');
  assert.match(page, /const supportsBudget = DOCUMENT_TYPE === 2 \|\| DOCUMENT_TYPE === 3/);
  assert.match(page, /excludedFieldNames=\{supportsBudget \? \[\] : \['budget_id', 'budget_name'\]\}/);
});

test('purchase order API returns its workflow and linked budget names', () => {
  const source = fs.readFileSync(
    'C:\\xampp\\htdocs\\expense\\expense-api\\api\\Models\\purchaseorders.php',
    'utf8',
  );
  assert.match(source, /aw\.name as workflow_name/);
  assert.match(source, /GROUP_CONCAT\(DISTINCT b\.budget_name/);
});
