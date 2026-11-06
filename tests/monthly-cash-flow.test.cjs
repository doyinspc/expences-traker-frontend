const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const code = require('esbuild').buildSync({
  entryPoints: [path.join(root, 'src/pages/Reports/CashFlowMonthly.jsx')], bundle: true,
  platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
  external: ['*actions/common'], write: false, logLevel: 'silent',
}).outputFiles[0].text;
const totals = { income: '4000.00', transfers_in: '1000.00', cash_in: '5000.00', procurement: '1250.50', cash_advances: '300.25', expenses: '1550.75', transfers_out: '500.00', cash_out: '2050.75', net: '2949.25' };
function render({ location = 41, selection = null, error = null } = {}) {
  const calls = [];
  const module = { exports: {} };
  const report = { company_name: 'Fixture', period: { start_date: '2026-04-01', end_date: '2027-03-31' }, years: [{ offset: 0, label: 'FY 2026/27' }], access: { income: true, transfers: true, procurement: true, cash_advances: true }, totals: [{ currency_id: 600, currency: 'NGN', totals }], months: [{ month: '2026-10', label: 'October 2026', currency_id: 600, currency: 'NGN', totals }] };
  vm.runInNewContext(code, { module, exports: module.exports, require(id) {
    if (id.endsWith('actions/common')) return { API_PATH_SETTING: '/api', axiosConfig: {}, tokenHelpers: { getTenantDb: () => 'fixture', getToken: () => 'opaque-session' } };
    if (id === 'react-redux') return { useSelector: (fn) => fn({ authReducer: { isAuthenticated: true, location_id: location, role_id: 10 } }) };
    if (id === 'react-router-dom') return { useSearchParams: () => [new URLSearchParams()] };
    if (id === 'react-router') return { Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children) };
    if (id === 'react') return { ...React, useState: (initial) => React.useState(initial === null ? selection : initial) };
    if (id === '@tanstack/react-query') return { useQuery: (config) => {
      calls.push(config);
      return { data: config.queryKey[0] === 'location-cash-flow' ? report : { detail: { total: 1, page_size: 100, amount: '1000.00', rows: [{ id: 'transfer:1', kind: 'transfers_in', date: '2026-10-10', reference: 'TRF-1', title: 'Branch funding', from_account: 'Access Bank — HQ', to_account: 'Access Bank — Kano', currency: 'NGN', amount: '1000.00', workflow_state: 'Completed' }] } }, isPending: false, error };
    } };
    return require(require.resolve(id, { paths: [root] }));
  } });
  return { html: renderToStaticMarkup(React.createElement(module.exports.default)), calls };
}
test('monthly report exposes month and every financial amount as a drill-down control', () => {
  const { html } = render();
  assert.match(html, /Monthly Cash Flow/);
  assert.match(html, /aria-label="October 2026 NGN Expenses"/);
  assert.match(html, /aria-label="October 2026 NGN Transfers Out"/);
  assert.match(html, /5,000.00/);
  assert.match(html, /opening or closing account balances/);
});
test('month selection shows transfer accounts, status and a separate print action', () => {
  const { html, calls } = render({ selection: { month: '2026-10', metric: 'transfers_in', currency_id: 600 } });
  assert.match(html, /Access Bank — HQ/);
  assert.match(html, /Access Bank — Kano/);
  assert.match(html, /Print month detail/);
  assert.equal(calls[1].enabled, true);
});
test('changing location changes summary and detail cache scope; errors are not zero totals', () => {
  assert.notDeepEqual(render().calls[0].queryKey, render({ location: 42 }).calls[0].queryKey);
  assert.notDeepEqual(render().calls[1].queryKey, render({ location: 42 }).calls[1].queryKey);
  assert.match(render({ error: new Error('Cash Flow report access is required.') }).html, /role="alert".*Cash Flow report access/);
});
test('print document escapes saved content, contains only report detail, and preserves the selected total', async () => {
  const { cashFlowPrintHtml, cashFlowAmountCents } = await import('../src/utils/functions/cashFlowPrint.js');
  const html = cashFlowPrintHtml({ company: '<script>bad()</script>', location: 'Kano', period: { start_date: '2026-04-01', end_date: '2027-03-31' }, month: '2026-10', metric: 'Transfers In', currency: 'NGN', amount: '1000.00', rows: [{ title: '<img src=x onerror=bad()>', amount: '1000.00', kind: 'transfers_in', from_account: 'Access Bank — HQ', to_account: 'Access Bank — Kano' }] });
  assert.doesNotMatch(html, /<script>|<img/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Selected total: NGN 1,000.00/);
  assert.match(html, /Access Bank — Kano/);
  assert.equal(cashFlowAmountCents('90071992547409.91') + cashFlowAmountCents('0.01'), 9007199254740992n);
  assert.equal(cashFlowAmountCents('-100.50'), -10050n);
});
