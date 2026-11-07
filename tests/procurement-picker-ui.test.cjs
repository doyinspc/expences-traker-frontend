const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const code = require('esbuild').buildSync({
  entryPoints: [
    path.join(root, 'src/components/procurement/AddRequisitionItemsModal.tsx'),
  ],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  jsx: 'automatic',
  external: ['*useTanstackQuery.js'],
  write: false,
  logLevel: 'silent',
}).outputFiles[0].text;

function render(rows, selected = '', extra = {}, pickerProps = {}) {
  const calls = [];
  const moduleConfig = { exports: {} };
  vm.runInNewContext(code, {
    module: moduleConfig,
    exports: moduleConfig.exports,
    require: (id) => {
      if (id.includes('useTanstackQuery'))
        return (props) => {
          calls.push(props);
          return {
            data: { data: rows },
            isFetching: false,
            refetch() {},
            loadUpdate: async () => {},
            ...extra,
          };
        };
      if (id === 'react')
        return {
          ...React,
          useState: (initial) =>
            React.useState(typeof initial === 'string' ? selected : initial),
        };
      return require(require.resolve(id, { paths: [root] }));
    },
  });
  const html = renderToStaticMarkup(
    React.createElement(moduleConfig.exports.default, {
      isOpen: true,
      purchaseOrderId: 302,
      onClose() {},
      onItemsAdded() {},
      ...pickerProps,
    }),
  );
  return { html, calls };
}

const row = {
  id: 401,
  requisition_id: 301,
  requisition_title: 'IT equipment',
  item_id: 502,
  item_name: 'Keyboard',
  procurement_candidate_for: 302,
  approved: 1,
  approval_status: 1,
  resolved: 0,
  quantity: 5,
  stock_issued_quantity: 3,
  unit_of_measure: 'pieces',
  unit_price: 100,
  total_price: 500,
  requisition_currency_code: 'NGN',
};

test('actual procurement picker asks by saved procurement ID and lists only parents with eligible demand', () => {
  const { html, calls } = render([
    row,
    {
      ...row,
      id: 402,
      requisition_id: 303,
      requisition_title: 'Already supplied',
      stock_issued_quantity: 5,
    },
  ]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].mainParam)), {
    procurement_candidates_for: 302,
  });
  assert.deepEqual(JSON.parse(JSON.stringify(calls[1].mainParam)), {});
  assert.match(html, /IT equipment/);
  assert.doesNotMatch(html, /Already supplied/);
});

test('approved outstanding rows have an add action and show only the remaining stock shortfall', () => {
  const { html } = render([row], '301');
  assert.match(html, /Keyboard/);
  assert.match(html, /Requested: 5; supplied from stock: 3/);
  assert.match(html, />2<\/td>/);
  assert.match(html, /Add item/);
  assert.match(html, /pieces/);
  assert.match(html, /200\.00/);
});

test('empty and failed candidate lists give a clear message instead of offering other locations', () => {
  assert.match(render([]).html, /No outstanding requisition items/);
  assert.match(
    render([], '', {
      error: { message: 'This procurement belongs to another location.' },
    }).html,
    /role="alert"/,
  );
});

test('The current Purchase Order uses the original requisition dropdown and shows quantities before order pricing', () => {
  const { html, calls } = render([], '301', {}, {
    orderSelection: { items: [{ ...row, remaining_quantity: 2 }], isFetching: false, refetch() {}, onSelect() {} },
  });
  assert.match(html, /IT equipment/);
  assert.match(html, /Keyboard/);
  assert.match(html, /Still needed/);
  assert.doesNotMatch(html, /Estimated total|Unit price/);
  assert.equal(calls[0].enabled, false);
});
