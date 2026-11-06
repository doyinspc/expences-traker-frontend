const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const React = require('react'),
  { renderToStaticMarkup } = require('react-dom/server'),
  { buildSync, transformSync } = require('esbuild'),
  root = path.resolve(__dirname, '..');
function bundled(file, mocks = {}) {
  const text = buildSync({
    entryPoints: [path.join(root, file)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    write: false,
    logLevel: 'silent',
  }).outputFiles[0].text;
  const module = { exports: {} };
  vm.runInNewContext(text, {
    module,
    exports: module.exports,
    require: (id) =>
      id in mocks ? mocks[id] : require(require.resolve(id, { paths: [root] })),
    console,
  });
  return module.exports;
}
const { default: Panel, revisionPreview } = bundled(
  'src/components/approvals/ItemRevisionPanel.jsx',
);
const item = {
  id: 401,
  item_name: 'Keyboard',
  quantity: 5,
  unit_price: '100.00',
  total_price: '500.00',
  account_id: 7,
};
const workflow = {
  document_type_id: 2,
  permissions: { can_revise_items: true },
  item_edit_capabilities: { quantity: true },
  document_data: { currency_code: 'NGN', amount: '500.00' },
  document_items: [item],
  account_options: [{ id: 7, name: 'Stationery account' }],
};
const html = (Component, props) =>
  renderToStaticMarkup(React.createElement(Component, props));
test('Combined quantity and unit price previews use the revised ordered quantity', () => {
  assert.equal(revisionPreview(item, 'terms', '120.11', 2, '7').after, 840.77);
  assert.equal(item.quantity, 5);
  assert.equal(revisionPreview(item, 'quantity', '', 2, '7').after, 700);
});
test('Invalid quantities cannot produce a save preview', () => {
  for (const value of ['0', '-1', '1.5', '1e3', '1000000000', ''])
    assert.equal(revisionPreview(item, 'terms', '100.00', 2, value), null);
});
test('An unpriced PO opens its editor with quantity, price and account classification visible', () => {
  const result = html(Panel, {
    workflow: {
      ...workflow,
      document_items: [
        { ...item, unit_price: '0.00', total_price: '0.00', account_id: null },
      ],
    },
  });
  assert.ok((result.match(/<details open/g) || []).length >= 2);
  assert.match(result, /name="approval-quantity"/);
  assert.match(result, /name="approval-unit-price"/);
  assert.match(result, /Choose account classification/);
  assert.match(result, /Reason \/ quotation reference/);
});
test('A linked PO explains and exposes request allocation quantities before a reduction', () => {
  const result = html(Panel, {
    workflow: {
      ...workflow,
      document_items: [
        {
          ...item,
          unit_price: '0.00',
          request_allocations: [
            {
              request_item_id: 41,
              requisition_id: 301,
              request_title: 'IT department',
              quantity: 3,
              available_quantity: 3,
            },
          ],
        },
      ],
    },
  });
  assert.match(result, /Quantities assigned to requisitions/); // Editor fields appear once an item is selected.
});
test('Completed or view-only approvals do not gain an editor', () => {
  assert.equal(
    html(Panel, {
      workflow: { ...workflow, permissions: { can_revise_items: false } },
    }),
    '',
  );
});
test('An older server retains a usable unit-price action without unsupported quantity writes', () => {
  const result = html(Panel, {
    workflow: { ...workflow, item_edit_capabilities: undefined },
  });
  assert.match(result, /Adjust unit price/);
  assert.doesNotMatch(result, /<option value="terms"|<option value="quantity"/);
});
function extract(name, next, scope = {}) {
  const source = fs.readFileSync(
    path.join(root, 'src/pages/Procurement/ApprovalCenterDetails.jsx'),
    'utf8',
  );
  const start = source.indexOf(`function ${name}(`),
    end = source.indexOf(next, start);
  assert.ok(start >= 0 && end > start);
  const text = transformSync(
    source.slice(start, end) + `\nmodule.exports=${name};`,
    { loader: 'jsx', format: 'cjs', jsx: 'automatic' },
  ).code;
  const module = { exports: {} };
  vm.runInNewContext(text, {
    module,
    exports: module.exports,
    require,
    React,
    ...scope,
  });
  return module.exports;
}
const ItemLinks = extract('ItemLinks', '/**', {
  PROCUREMENT_DOCUMENT_LABEL: 'Purchase Order',
  Link: () => null,
  LegacyItemEvidence: () => null,
  ItemEvidencePanel: () => null,
  ItemPriceHistory: () => null,
  receiptUrl: () => '/safe',
  itemTitle: (row) => row.item_name,
});
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
test('The per-item edit button selects that exact item and is absent without its authorised callback', () => {
  let chosen;
  const tree = ItemLinks({
    item,
    onEditItem: (row) => {
      chosen = row.id;
    },
  });
  const button = nodes(tree).find((node) => node.type === 'button');
  assert.ok(button);
  button.props.onClick();
  assert.equal(chosen, 401);
  assert.equal(
    nodes(ItemLinks({ item })).some((node) => node.type === 'button'),
    false,
  );
});
const RequestedItems = extract('RequestedItems', '/**', {
  card: 'card',
  FileText: () => null,
  documentFlow: () => ({ items: 'PO items' }),
  itemTitle: (row) => row.item_name,
  ItemLinks: () => null,
  account: (row) => row.account_name || 'Not assigned',
  amount: (value) => Number(value || 0).toFixed(2),
  flags: () => [],
});
test('Purchase Order review shows account, quantity, unit price and line total without a Credit column', () => {
  const result = html(RequestedItems, {
    items: [
      { ...item, account_name: 'Stationery account', procurement_quantity: 2 },
    ],
    documentType: 2,
  });
  assert.match(result, /Account classification/);
  assert.match(result, /Unit price/);
  assert.match(result, /Line total/);
  assert.doesNotMatch(result, />Credit</);
});
test('Price-free requisition review keeps quantity while hiding prices and credit', () => {
  const result = html(RequestedItems, {
    items: [item],
    documentType: 1,
    priceFree: true,
  });
  assert.match(result, /Quantity/);
  assert.doesNotMatch(result, /Unit price|Cost \/ Debit|>Credit</);
});
const hookReact = {
  ...React,
  useState: (value) => [
    typeof value === 'function' ? value() : value,
    () => {},
  ],
  useRef: (value) => ({ current: value }),
};
const Drop = bundled('src/components/procurement/EvidenceDropzone.jsx', {
  react: hookReact,
}).default;
test('Dropping one file uses the same upload callback as the chooser', () => {
  const file = { name: 'invoice.pdf' };
  let chosen,
    prevented = false;
  const tree = Drop({
    onFile: (value) => {
      chosen = value;
    },
  });
  tree.props.onDrop({
    preventDefault() {
      prevented = true;
    },
    dataTransfer: { files: [file] },
  });
  assert.ok(prevented);
  assert.equal(chosen, file);
  const input = nodes(tree).find((node) => node.type === 'input');
  input.props.onChange({ target: { files: [file], value: 'invoice.pdf' } });
  assert.equal(chosen, file);
});
test('Disabled and multiple-file drops cannot start an upload', () => {
  let uploaded = 0,
    message = '';
  Drop({ disabled: true, onFile: () => uploaded++ }).props.onDrop({
    preventDefault() {},
    dataTransfer: { files: [{}] },
  });
  Drop({
    onFile: () => uploaded++,
    onError: (value) => {
      message = value;
    },
  }).props.onDrop({ preventDefault() {}, dataTransfer: { files: [{}, {}] } });
  assert.equal(uploaded, 0);
  assert.match(message, /one image or PDF/);
});
test('Clicking a row opens the exact item editor and submits its quantity, price, account and reason', async () => {
  let cursor = 0,
    effects = [],
    states = [],
    refs = [],
    refCursor = 0,
    saved;
  const hooked = {
    ...React,
    useState: (initial) => {
      const id = cursor++;
      if (!(id in states))
        states[id] = typeof initial === 'function' ? initial() : initial;
      return [
        states[id],
        (value) => {
          states[id] = typeof value === 'function' ? value(states[id]) : value;
        },
      ];
    },
    useRef: (initial) => {
      const id = refCursor++;
      return refs[id] ?? (refs[id] = { current: initial });
    },
    useEffect: (fn) => effects.push(fn),
  };
  const Interactive = bundled(
    'src/components/approvals/ItemRevisionPanel.jsx',
    { react: hooked },
  ).default;
  const props = {
    workflow: {
      ...workflow,
      budget_comparison: { name: 'IT budget', after_request: '500.00' },
    },
    editRequest: { itemId: 401 },
    onSave: async (values) => {
      saved = values;
    },
  };
  function render() {
    cursor = 0;
    refCursor = 0;
    effects = [];
    return Interactive(props);
  }
  let tree = render();
  for (const effect of effects) effect();
  tree = render();
  const field = (name) =>
    nodes(tree).find(
      (node) => node.type === 'input' && node.props.name === name,
    );
  assert.equal(field('approval-quantity').props.value, '5');
  field('approval-quantity').props.onChange({ target: { value: '7' } });
  tree = render();
  field('approval-unit-price').props.onChange({ target: { value: '120.00' } });
  tree = render();
  nodes(tree)
    .find((node) => node.type === 'textarea')
    .props.onChange({ target: { value: 'Supplier quotation Q-10' } });
  tree = render();
  await nodes(tree)
    .find((node) => node.type === 'form')
    .props.onSubmit({ preventDefault() {} });
  assert.equal(saved.item_id, '401');
  assert.equal(saved.change, 'terms');
  assert.equal(saved.quantity, '7');
  assert.equal(saved.unit_price, '120.00');
  assert.equal(saved.account_id, 7);
  assert.equal(saved.reason, 'Supplier quotation Q-10');
});
