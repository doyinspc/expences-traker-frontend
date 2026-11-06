const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const code = require('esbuild').buildSync({
  entryPoints: [path.join(root, 'src/pages/Product/CashTransfer.jsx')],
  bundle: true, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
  external: ['*actions/common', '*useCompanyPeriod', '*AccountingPeriodPicker', '*Components/DisplayPage', '*CashTransferCreateForm'],
  write: false, logLevel: 'silent',
}).outputFiles[0].text;

function render({ tab = 'incoming', location = 42, company = { fiscal_year_start: '2020-04-01' }, error = null, loading = false } = {}) {
  let query, pageProps;
  const requests = [];
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require(id) {
      if (id.endsWith('actions/common')) return { API_PATH_SETTING: '/api', axiosConfig: {}, tokenHelpers: { getTenantDb: () => 'fixture', getToken: () => 'session' } };
      if (id.endsWith('useCompanyPeriod')) return () => ({ data: company });
      if (id.endsWith('AccountingPeriodPicker')) return () => React.createElement('span', null, 'Accounting year');
      if (id.endsWith('Components/DisplayPage')) return (props) => {
        pageProps = props;
        return React.createElement('main', null, React.createElement('p', null, 'Main transfer list'), props.renderListFooter());
      };
      if (id.endsWith('CashTransferCreateForm')) return () => null;
      if (id === 'react-redux') return { useSelector: (fn) => fn({ authReducer: { isAuthenticated: true, location_id: location, role_id: 10 } }) };
      if (id === '@tanstack/react-query') return { useQuery: (config) => {
        query = config;
        return { data: [
          { direction: 'incoming', document_id: 1, transfer_reference: 'IN-REF', from_account_name: 'Access Bank', from_account_alias: 'HQ Operations', from_location_name: 'HQ', to_account_name: 'Access Bank', to_account_alias: 'Kano Operations', to_location_name: 'Kano', amount: '1250.50' },
          { direction: 'outgoing', document_id: 2, transfer_reference: 'OUT-REF', from_account_name: 'Branch account', from_location_name: 'Kano', to_account_name: 'HQ account', to_location_name: 'HQ', amount: '40' },
        ], error, isLoading: loading, refetch() {} };
      } };
      if (id === 'axios') return { get: async (url, config) => { requests.push(config.params); return { data: [] }; } };
      if (id === 'react') return { ...React, useState: (initial) => React.useState(initial === 'incoming' ? tab : initial) };
      return require(require.resolve(id, { paths: [root] }));
    },
  });
  const html = renderToStaticMarkup(React.createElement(module.exports.default));
  return { html, query, requests, pageProps };
}

test('Cash Transfer menu keeps the main list and exposes the register without opening a parent row', () => {
  const view = render();
  assert.match(view.html, /Main transfer list.*Cash In \/ Cash Out/);
  assert.equal(view.pageProps.document_type, 6);
  assert.equal(typeof view.pageProps.renderCreateForm, 'function');
  assert.match(view.html, /Access Bank — HQ Operations — HQ/);
  assert.match(view.html, /Access Bank — Kano Operations — Kano/);
  assert.match(view.html, /IN-REF/);
  assert.doesNotMatch(view.html, /OUT-REF/);
});

test('Cash Out shows outgoing records and both branch names', () => {
  const { html } = render({ tab: 'outgoing' });
  assert.match(html, /OUT-REF/);
  assert.doesNotMatch(html, /IN-REF/);
  assert.match(html, /HQ account — HQ/);
});

test('register requests the configured accounting year and isolates location in the cache key', async () => {
  const view = render();
  await view.query.queryFn();
  const params = JSON.parse(view.requests[0].data);
  assert.equal(params.location_id, 42);
  assert.match(params.start_date, /^\d{4}-04-01$/);
  assert.match(params.end_date, /^\d{4}-03-31$/);
  assert.equal(view.requests[0].cat, 'getCashTransferRegister');
  assert.notDeepEqual(view.query.queryKey, render({ location: 41 }).query.queryKey);
});

test('missing company year or location cannot silently load all transfer history', () => {
  const missingYear = render({ company: null });
  assert.equal(missingYear.query.enabled, false);
  assert.match(missingYear.html, /Set the accounting year/);
  assert.doesNotMatch(missingYear.html, /IN-REF/);
  assert.equal(render({ location: 0 }).query.enabled, false);
});

test('request errors and loading are not presented as an empty transfer register', () => {
  assert.match(render({ error: new Error('Permission denied') }).html, /role="alert".*Permission denied/);
  assert.match(render({ loading: true }).html, /Loading completed transfers/);
});

test('account labels preserve aliases and distinguish identical banks at different locations', async () => {
  const { transferAccountLabel } = await import('../src/utils/functions/transferAccountLabel.js');
  assert.equal(transferAccountLabel({ name: 'Access Bank', abbrv: 'Operations', location_name: 'Kano' }), 'Access Bank — Operations — Kano');
  assert.equal(transferAccountLabel({ name: 'Access Bank', abbrv: 'Access Bank' }, 'HQ'), 'Access Bank — HQ');
});
