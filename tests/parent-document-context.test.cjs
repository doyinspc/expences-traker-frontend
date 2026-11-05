const test = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../src/utils/functions/parentDocumentContext.js');

test('all transaction item routes identify their own parent resource and document type', async () => {
  const { parentDocumentRoute } = await load();
  for (const [kind, type] of [
    ['requisition', 1],
    ['purchaseorder', 2],
    ['cashadvance', 3],
    ['income', 7],
    ['cashtransfer', 6],
    ['stock', 8],
  ]) {
    const route = parentDocumentRoute(`/procurement/${kind}/511`);
    assert.equal(route.id, 511);
    assert.equal(route.type, type);
    assert.equal(route.table, 'requisitions');
  }
  assert.equal(parentDocumentRoute('/procurement/budgets/12').table, 'budgets');
  assert.equal(parentDocumentRoute('/bookings/booking/12').table, 'clients');
});

test('settings child routes and invalid/direct links are handled without a remembered row', async () => {
  const { parentDocumentRoute } = await load();
  for (const route of [
    '/setting/workflow/20',
    '/setting/expense/20',
    '/setting/income/20',
    '/setting/room/20',
    '/setting/service/20',
    '/setting/page/7/20',
  ]) {
    assert.equal(parentDocumentRoute(route).id, 20);
    assert.equal(parentDocumentRoute(route).table, 'commons');
  }
  assert.equal(parentDocumentRoute('/procurement/requisition/not-an-id').id, 0);
  assert.equal(parentDocumentRoute('/procurement/requisition/0').id, 0);
  assert.equal(
    parentDocumentRoute('/procurement/requisition/9007199254740992').id,
    0,
  );
  assert.equal(parentDocumentRoute('/procurement/approvals/511'), null);
});

test('parent selection rejects another ID or type even when an older server returns a list', async () => {
  const { parentDocumentRoute, selectParentDocument } = await load();
  const route = parentDocumentRoute('/procurement/purchaseorder/511');
  const rows = [
    { id: 510, title: 'Wrong order', requisition_type: 2 },
    { id: 511, title: 'Correct order', requisition_type: 2 },
  ];
  for (const payload of [
    rows,
    { data: rows },
    { status: 'success', data: { data: rows } },
    { items: rows },
  ])
    assert.equal(selectParentDocument(payload, route).title, 'Correct order');
  assert.equal(
    selectParentDocument([{ id: 511, requisition_type: 1 }], route),
    null,
  );
  assert.equal(selectParentDocument(rows, { ...route, id: 999 }), null);
  assert.throws(
    () =>
      selectParentDocument(
        { success: false, message: 'Permission denied' },
        route,
      ),
    /Permission denied/,
  );
});

test('summary preserves real titles, reference and dates without inventing missing names', async () => {
  const { parentDocumentRoute, parentDocumentSummary } = await load();
  const route = parentDocumentRoute('/procurement/purchaseorder/511');
  const summary = parentDocumentSummary(route, {
    title: 'School equipment',
    pr_id: 'PO-2026-15',
    location_name: 'Lagos',
    department_name: 'IT',
    created_at: '2026-11-05 14:00:00',
  });
  assert.equal(summary.title, 'School equipment');
  assert.equal(summary.reference, 'PO-2026-15');
  assert.deepEqual(summary.details, [
    ['Location', 'Lagos'],
    ['Department', 'IT'],
    ['Created', '2026-11-05'],
  ]);
  assert.equal(parentDocumentSummary(route, {}).reference, 'PO-511');
  assert.deepEqual(parentDocumentSummary(route, {}).details, []);
});
