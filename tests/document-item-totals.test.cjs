const test = require('node:test');
const assert = require('node:assert/strict');

const load = () => import('../src/utils/functions/documentItemTotals.js');

test('approved total sums numeric approvals using the latest saved line amount', async () => {
  const { documentItemTotals } = await load();
  assert.deepEqual(
    documentItemTotals([
      { approval_status: 1, approved: 1, unit_price: 150, total_price: '450.00', quantity: 3 },
      { approval_status: 0, approved: 0, total_price: '200.00' },
    ]),
    { totalAmount: 650, totalApproved: 450, totalItems: 2 },
  );
});

test('rejected lines are excluded from both money totals while remaining visible in item count', async () => {
  const { documentItemTotals } = await load();
  assert.deepEqual(
    documentItemTotals([
      { approval_status: 1, approved: 1, total_price: '300.00' },
      { approval_status: 2, approved: 1, total_price: '900.00' },
      { approval_status: 'rejected', total_amount: 200 },
    ]),
    { totalAmount: 300, totalApproved: 300, totalItems: 3 },
  );
});

test('resolved approved lines count, malformed rows do not poison totals, and empty input is safe', async () => {
  const { documentItemTotals } = await load();
  assert.deepEqual(
    documentItemTotals([
      { resolved: '1', total_amount: 75 },
      { approval_status: 'approved', total_price: 25 },
      { approval_status: 1, total_price: 'not money' },
    ]),
    { totalAmount: 100, totalApproved: 100, totalItems: 2 },
  );
  assert.deepEqual(documentItemTotals(null), { totalAmount: 0, totalApproved: 0, totalItems: 0 });
});
