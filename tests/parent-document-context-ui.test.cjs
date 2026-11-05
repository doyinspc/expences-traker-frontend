const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const fs = require('node:fs');
const esbuild = require('esbuild');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
function compile(entry, external = []) {
  return esbuild.buildSync({
    entryPoints: [path.join(root, entry)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    jsx: 'automatic',
    external,
    write: false,
    logLevel: 'silent',
  }).outputFiles[0].text;
}
const moduleConfig = { exports: {} };
vm.runInNewContext(compile('src/components/common/ParentDocumentContext.jsx'), {
  module: moduleConfig,
  exports: moduleConfig.exports,
  require,
});
const Header = moduleConfig.exports.default;
const context = {
  route: {
    id: 511,
    label: 'Procurement / Purchase Order',
    prefix: 'PO',
    table: 'requisitions',
    type: 2,
  },
  canRead: true,
  document: {
    id: 511,
    title: 'Keyboard <script>alert(1)</script> purchase',
    location_name: 'Lagos',
    requester_name: 'Finance officer',
    total_amount_record: '200.00',
    currency_code: 'NGN',
  },
  refetch() {},
};
const render = (value) =>
  renderToStaticMarkup(React.createElement(Header, { context: value }));

test('compact parent header keeps the current title, reference and location visible above the items', () => {
  const html = render(context);
  for (const text of [
    'Current document',
    'Procurement / Purchase Order',
    'PO-511',
    'Lagos',
    'Finance officer',
  ])
    assert.ok(html.includes(text), text);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /break-words/);
});

test('loading and failed parent reads never display another remembered document', () => {
  assert.match(
    render({ ...context, document: null, isPending: true }),
    /Loading document details/,
  );
  assert.match(
    render({
      ...context,
      document: null,
      error: new Error('Location access denied'),
    }),
    /Location access denied/,
  );
  assert.match(
    render({ ...context, document: null, error: new Error('Denied') }),
    /Retry document details/,
  );
});

test('parent hook reads the URL ID and isolates its cache by location, role and document', async () => {
  let pathname = '/procurement/purchaseorder/511';
  let location = 41;
  let options;
  let payload = [{ id: 511, requisition_type: 2, title: 'Current order' }];
  const requests = [];
  const hookModule = { exports: {} };
  vm.runInNewContext(
    compile('src/hooks/useParentDocumentContext.js', ['*actions/common']),
    {
      module: hookModule,
      exports: hookModule.exports,
      require(id) {
        if (id === 'react-router-dom')
          return { useLocation: () => ({ pathname }) };
        if (id === 'react-redux')
          return {
            useSelector: (fn) =>
              fn({ authReducer: { location_id: location, role_id: 110 } }),
          };
        if (id === '@tanstack/react-query')
          return {
            useQuery: (value) => {
              options = value;
              return { data: null };
            },
          };
        if (id === 'axios')
          return {
            get: async (_url, config) => {
              requests.push(JSON.parse(config.params.data));
              return { data: payload };
            },
          };
        if (id.endsWith('actions/common'))
          return {
            API_PATH_SETTING: '/test-api',
            axiosConfig: {},
            tokenHelpers: {
              getTenantDb: () => 'synthetic',
              getToken: () => 'synthetic-login',
            },
          };
        return require(id);
      },
    },
  );
  const hook = hookModule.exports.default;
  hook();
  const firstKey = JSON.stringify(options.queryKey);
  assert.equal(options.enabled, true);
  assert.equal((await options.queryFn()).title, 'Current order');
  assert.deepEqual(JSON.parse(JSON.stringify(requests[0])), {
    id: 511,
    requisition_type: 2,
  });
  pathname = '/procurement/purchaseorder/512';
  hook();
  assert.notEqual(JSON.stringify(options.queryKey), firstKey);
  await assert.rejects(options.queryFn(), /not found/);
  location = 42;
  const previousKey = JSON.stringify(options.queryKey);
  hook();
  assert.notEqual(JSON.stringify(options.queryKey), previousKey);
  payload = [];
  pathname = '/procurement/requisition/bad';
  hook();
  assert.equal(options.enabled, false);
  pathname = '/procurement/requisition/511';
  location = 0;
  hook();
  assert.equal(options.enabled, false);
  location = 41;
  hook();
  assert.equal(
    options.enabled,
    true,
    'Choosing the location must enable the pending parent read',
  );
});

test('a directly opened budget page stays on its URL and shows parent context while items load', () => {
  const budgetModule = { exports: {} };
  const code = compile('src/pages/Budgets/BudgetItems.jsx', [
    '*useParentDocumentContext.js',
    '*useTanstackQuery',
  ]);
  vm.runInNewContext(code, {
    module: budgetModule,
    exports: budgetModule.exports,
    require(id) {
      if (id.includes('useParentDocumentContext'))
        return () => ({
          ...context,
          route: { ...context.route, id: 12, label: 'Budget', prefix: 'BUD' },
          document: {
            id: 12,
            budget_name: 'School budget',
            location_name: 'Abuja',
          },
        });
      if (id.includes('useTanstackQuery'))
        return () => ({ data: [], isLoading: true });
      if (id === 'react-redux')
        return {
          useSelector: (fn) => fn({ authReducer: { user: { id: 21 } } }),
        };
      if (id === 'react-router')
        return {
          useNavigate: () => () => {
            throw new Error(
              'Loading a direct link must not navigate backwards',
            );
          },
        };
      return require(id);
    },
  });
  const html = renderToStaticMarkup(
    React.createElement(budgetModule.exports.default),
  );
  assert.match(html, /School budget/);
  assert.match(html, /Abuja/);
  assert.match(html, /Loading report data/);
});

test('all routed transaction and settings child pages include the document context', () => {
  const files = [
    'Product/RequisitionItems.tsx',
    'Product/PurchaseOrderRequisitions.tsx',
    'Product/IncomeItems.tsx',
    'Product/CashTransferItems.tsx',
    'Product/StockItems.tsx',
    'Budgets/BudgetItems.jsx',
    'Settings/IndexChild.tsx',
    'Settings/ApprovalWorkflowSteps.tsx',
    'Settings/ExpenseItems.tsx',
    'Settings/IncomeItems.tsx',
    'Settings/RoomItems.tsx',
    'Settings/ServiceItems.tsx',
    'Bookings/BookingsPage.tsx',
  ];
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, 'src/pages', file), 'utf8');
    assert.match(
      source,
      /<ParentDocumentContext context=\{parentContext\}/,
      file,
    );
    assert.doesNotMatch(source, /getTitleRow\(1\)/, file);
  }
});
