const test = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../src/utils/functions/procurementCandidates.js');
const line = {
  id: 1,
  requisition_id: 10,
  procurement_candidate_for: 20,
  approved: 1,
  approval_status: 1,
  resolved: 0,
  purchaseorder_id: null,
  quantity: '5',
  stock_issued_quantity: '3',
};

test('procurement picker displays only the remaining two of five requested units', async () => {
  const { procurementCandidates } = await load();
  const [row] = procurementCandidates([line], 20);
  assert.equal(row.remaining_quantity, 2);
  assert.equal(row.quantity, '5');
});

test('procurement picker excludes unscoped, assigned, rejected, unapproved and fulfilled demand', async () => {
  const { procurementCandidates } = await load();
  const invalid = [
    null,
    { ...line, procurement_candidate_for: undefined },
    { ...line, procurement_candidate_for: 21 },
    { ...line, purchaseorder_id: 30 },
    { ...line, approval_status: 2 },
    { ...line, approved: 0 },
    { ...line, resolved: 1 },
    { ...line, stock_issued_quantity: 5 },
    { ...line, stock_issued_quantity: -1 },
    { ...line, quantity: 'invalid' },
    { ...line, quantity: 2.5 },
  ];
  assert.deepEqual(procurementCandidates(invalid, 20), []);
});

test('procurement picker keeps unissued demand in its original saved quantity and unit', async () => {
  const { procurementCandidates } = await load();
  assert.equal(
    procurementCandidates(
      [{ ...line, stock_issued_quantity: null, unit_of_measure: 'packs' }],
      20,
    )[0].remaining_quantity,
    5,
  );
  assert.deepEqual(procurementCandidates(null, 20), []);
});
