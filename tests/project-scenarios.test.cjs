const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.PROKURE_ROOT || path.resolve(__dirname, '..');
const { transformSync } = require(path.join(root, 'node_modules/esbuild'));
const React = require(path.join(root, 'node_modules/react'));
const { renderToStaticMarkup } = require(path.join(root, 'node_modules/react-dom/server'));
function load(relative, mocks = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = transformSync(source, { loader: /tsx$/.test(relative) ? 'tsx' : /jsx$/.test(relative) ? 'jsx' : 'ts', format: 'cjs' }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: id => id in mocks ? mocks[id] : id.startsWith('.') ? load(path.relative(root, path.resolve(path.dirname(path.join(root, relative)), id + (path.extname(id) ? '' : '.js'))), mocks) : require(require.resolve(id, { paths: [root] })), console });
  return module.exports;
}
const { validateFieldValue } = load('src/utils/functions/formGuidance.ts');
test('Required text rejects whitespace; optional fields remain optional', () => {
  assert.match(validateFieldValue({ label: 'Title', type: 'text', required: true }, '   '), /required/);
  assert.equal(validateFieldValue({ label: 'Notes', type: 'text' }, ''), null);
});
test('Form catches malformed optional emails and non-finite amounts', () => {
  assert.match(validateFieldValue({ label: 'Email', type: 'email' }, 'wrong@'), /valid email/);
  assert.equal(validateFieldValue({ label: 'Email', type: 'email' }, 'person@example.test'), null);
  assert.match(validateFieldValue({ label: 'Amount', type: 'number' }, Infinity), /valid number/);
});
test('Zero amounts and false toggles are valid supplied values', () => {
  assert.equal(validateFieldValue({ label: 'Amount', type: 'number', required: true }, 0), null);
  assert.equal(validateFieldValue({ label: 'Active', type: 'toggle', required: true }, false), null);
});
test('Invalid JSON gives a useful error and disabled fields do not block submission', () => {
  assert.match(validateFieldValue({ label: 'Details', type: 'json' }, '{broken'), /valid JSON/);
  assert.equal(validateFieldValue({ label: 'Generated code', type: 'text', required: true, disabled: true }, ''), null);
});
const { getPendingApprovalNotifications } = load('src/utils/functions/notificationItems.ts');
const approval = (overrides = {}) => ({ id: 7, is_active: 1, is_completed: 0, current_step_id: 20, document_data: { title: 'Office supplies' }, steps: [{ id: 20, role_id: 4, assigned_to_user_id: 1, is_active: 0 }], ...overrides });
test('Notification follows the actual active-step marker and selected role', () => {
  const rows = [approval(), approval({ id: 8, steps: [{ id: 20, role_id: 5, assigned_to_user_id: 1, is_active: 0 }] })];
  assert.equal(getPendingApprovalNotifications(rows, '4').length, 1);
  assert.equal(getPendingApprovalNotifications(rows, '4')[0].path, '/procurement/approvals/7');
});
test('Completed, rejected, cancelled, historical and broken workflows do not become actionable alerts', () => {
  const rows = [approval({ is_completed: 1 }), approval({ is_active: 0, rejected_at: '2026-10-27 10:00:00' }), approval({ cancelled_at: '2026-10-27 10:00:00' }), approval({ current_step_id: 999 }), approval({ steps: [{ id: 20, role_id: 4, assigned_to_user_id: 0, is_active: 1 }] })];
  assert.equal(getPendingApprovalNotifications(rows, 4).length, 0);
});
test('Legacy zero dates and string identifiers remain supported', () => {
  assert.equal(getPendingApprovalNotifications([approval({ cancelled_at: '0000-00-00 00:00:00', rejected_at: '0000-00-00 00:00:00' })], '4').length, 1);
  assert.equal(getPendingApprovalNotifications(undefined, 4).length, 0);
});
const renderCell = (renderer, context) => typeof renderer === 'function' ? renderer(context) : renderer;
const TableBody = load('src/components/table/TableBody.jsx', { '@tanstack/react-table': { flexRender: renderCell } }).default;
function fakeTable(rows, search = '') { return { getRowModel: () => ({ rows }), getState: () => ({ globalFilter: search }), getVisibleLeafColumns: () => [{}, {}], setGlobalFilter() {} }; }
test('An empty table and empty search give distinct, helpful messages', () => {
  const empty = renderToStaticMarkup(React.createElement('table', null, React.createElement(TableBody, { table: fakeTable([]) })));
  const searched = renderToStaticMarkup(React.createElement('table', null, React.createElement(TableBody, { table: fakeTable([], 'missing') })));
  assert.match(empty, /No records yet/);
  assert.match(searched, /No matching records/);
  assert.match(searched, /Clear search/);
});
test('Selected rows retain real cells and expose selection state', () => {
  const cell = { id: 'title', column: { columnDef: { cell: () => 'Supplies' } }, getContext: () => ({}) };
  const row = { id: '7', getIsSelected: () => true, getVisibleCells: () => [cell] };
  const html = renderToStaticMarkup(React.createElement('table', null, React.createElement(TableBody, { table: fakeTable([row]) })));
  assert.match(html, /Supplies/); assert.match(html, /aria-selected="true"/);
});
const TableHeader = load('src/components/table/TableHeader.jsx', { '@tanstack/react-table': { flexRender: renderCell } }).default;
test('Sortable headings expose an accessible button and current direction', () => {
  const column = { columnDef: { header: 'Amount' }, getCanSort: () => true, getIsSorted: () => 'asc', getToggleSortingHandler: () => () => {} };
  const table = { getHeaderGroups: () => [{ id: 'group', headers: [{ id: 'amount', column, getSize: () => 150, getContext: () => ({}) }] }] };
  const html = renderToStaticMarkup(React.createElement('table', null, React.createElement(TableHeader, { table })));
  assert.match(html, /aria-sort="ascending"/); assert.match(html, /<button/); assert.match(html, /Sort descending/);
});
const { buildReportCsv } = load('src/utils/functions/reportExport.ts');
test('Report export preserves commas, quotes, newlines and non-English text', () => {
  const csv = buildReportCsv(['Item', 'Amount'], [['Office, supplies "A"\nLagos', 1250.5], ['Résumé', 0]]);
  assert.match(csv, /"Office, supplies ""A""\nLagos","1250.5"/);
  assert.match(csv, /"Résumé","0"/);
  assert.equal(csv.charCodeAt(0), 0xFEFF);
});
test('Report export treats formulas as text while preserving negative numeric amounts', () => {
  const csv = buildReportCsv(['Item', 'Amount'], [['=HYPERLINK("bad")', -125.5], ['@SUM(A1)', '-12.50']]);
  assert.match(csv, /'=HYPERLINK/); assert.match(csv, /'@SUM/);
  assert.match(csv, /"-125.5"/); assert.match(csv, /"-12.50"/);
});

test('Returned request stays actionable for its reactivated approval role', () => {
  assert.equal(getPendingApprovalNotifications([approval({ rejected_at: '2026-10-27 10:00:00' })], 4).length, 1);
});
