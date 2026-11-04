const fs = require('node:fs'),
  vm = require('node:vm'),
  path = require('node:path'),
  { test } = require('node:test'),
  assert = require('node:assert/strict');
const root = process.env.PROKURE_ROOT || path.resolve(__dirname, '..'),
  React = require(path.join(root, 'node_modules/react')),
  { renderToStaticMarkup } = require(path.join(root, 'node_modules/react-dom/server'));
const source = fs.readFileSync(
    path.join(root, 'src/pages/Product/Components/ItemsTable.tsx'),
    'utf8',
  ),
  icons = source
    .match(/import\s*\{([\s\S]*?)\}\s*from 'lucide-react'/)[1]
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
const code = require(path.join(root, 'node_modules/esbuild')).transformSync(
  source.replace(/import[\s\S]*?from\s*['"][^'"]+['"];?/g, ''),
  { loader: 'tsx', format: 'cjs' },
).code;
function render(items, extra = {}) {
  let calls = 0;
  const config = { exports: {} },
    context = {
      module: config,
      exports: config.exports,
      React,
      useState: (initial) => [calls++ === 0 ? items[0]?.id : initial, () => {}],
      SERVER_URL: 'https://example.invalid/',
      isArrayWithValue: (rows) => Array.isArray(rows) && rows.length > 0,
    };
  for (const icon of icons) context[icon] = () => React.createElement('svg');
  vm.runInNewContext(code, context);
  return renderToStaticMarkup(
    React.createElement(config.exports.default, {
      items,
      documentTypeId: '2',
      showBudgetInfo: true,
      budgetCategories: [{ category_id: 501, budgeted_amount: 1000, amount_spent: 100 }],
      budgetCategoryItems: [],
      formatCurrency: (n, c) => `${c} ${n}`,
      currency: 'NGN',
      ...extra,
    }),
  );
}
const item = {
  id: 401,
  item_id: 502,
  item_name: 'Keyboard',
  category_id: 501,
  category_name: 'IT',
  quantity: 5,
  unit_price: 100,
  total_price: 500,
  resolved: 0,
  approval_status: '0',
};
test('Original expanded item row retains budget info before cash is recognised', () => {
  const html = render([item]);
  assert.ok(html.includes('Budget Information'));
  assert.ok(html.includes('Show Budget') || html.includes('Hide Budget'));
});
test('Paid items retain their original view without repeated budget comparison', () => {
  const html = render([{ ...item, resolved: 1 }]);
  assert.ok(html.includes('Keyboard'));
  assert.ok(!html.includes('Budget Information'));
  assert.ok(!html.includes('Budget Performance'));
  assert.ok(!html.includes('Hide Budget'));
});
test('Rejected items show their decision and no budget comparison', () => {
  const html = render([{ ...item, approval_status: '2' }]);
  assert.ok(html.includes('Rejected'));
  assert.ok(!html.includes('Budget Information'));
});
test('Expanded original item rows show the clock history and reason', () => {
  const html = render([
    {
      ...item,
      item_revision_history: [
        {
          instance_id: 10,
          revision: 1,
          change: 'price',
          at: '2026-11-04',
          actor_name: 'Finance director',
          role_name: 'Finance',
          before: { unit_price: 90, total_price: 450 },
          after: { unit_price: 100, total_price: 500 },
          reason: 'Updated quote',
        },
      ],
    },
  ]);
  for (const phrase of [
    'Price / item history',
    'Unit price: NGN 90',
    'NGN 100',
    'Updated quote',
    'Finance director',
  ])
    assert.ok(html.includes(phrase), phrase);
});
