const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm");
const React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server"),
  { buildSync, transformSync } = require("esbuild"),
  root = path.resolve(__dirname, "..");
function bundled(file, mocks = {}) {
  const text = buildSync({
    entryPoints: [path.join(root, file)],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    write: false,
    logLevel: "silent",
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
  "src/components/approvals/ItemRevisionPanel.jsx",
);
const item = {
  id: 401,
  item_name: "Keyboard",
  quantity: 5,
  unit_price: "100.00",
  total_price: "500.00",
  account_id: 7,
};
const workflow = {
  document_type_id: 2,
  permissions: { can_revise_items: true },
  item_edit_capabilities: { quantity: true },
  document_data: { currency_code: "NGN", amount: "500.00" },
  document_items: [item],
  account_options: [{ id: 7, name: "Stationery account" }],
};
const html = (Component, props) =>
  renderToStaticMarkup(React.createElement(Component, props));
test("Combined quantity and unit price previews use the revised ordered quantity", () => {
  assert.equal(revisionPreview(item, "terms", "120.11", 2, "7").after, 840.77);
  assert.equal(item.quantity, 5);
  assert.equal(revisionPreview(item, "quantity", "", 2, "7").after, 700);
});
test("Invalid quantities cannot produce a save preview", () => {
  for (const value of ["0", "-1", "1.5", "1e3", "1000000000", ""])
    assert.equal(revisionPreview(item, "terms", "100.00", 2, value), null);
});
test("Selecting an unpriced PO row opens a modal with quantity, price and account classification", () => {
  const result = html(Panel, {
    editRequest: { itemId: 401 },
    workflow: {
      ...workflow,
      document_items: [
        { ...item, unit_price: "0.00", total_price: "0.00", account_id: null },
      ],
    },
  });
  assert.match(result, /<dialog/);
  assert.match(result, /aria-modal="true"/);
  assert.match(result, /name="approval-quantity"/);
  assert.match(result, /name="approval-unit-price"/);
  assert.match(result, /Choose account classification/);
  assert.match(result, /Reason \/ quotation reference/);
});
test("A linked PO explains and exposes request allocation quantities before a reduction", () => {
  const result = html(Panel, {
    editRequest: { itemId: 401 },
    workflow: {
      ...workflow,
      document_items: [
        {
          ...item,
          unit_price: "0.00",
          request_allocations: [
            {
              request_item_id: 41,
              requisition_id: 301,
              request_title: "IT department",
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
test("Completed or view-only approvals do not gain an editor", () => {
  assert.equal(
    html(Panel, {
      workflow: { ...workflow, permissions: { can_revise_items: false } },
    }),
    "",
  );
});
test("An older server retains a usable unit-price action without unsupported quantity writes", () => {
  const result = html(Panel, {
    editRequest: { itemId: 401 },
    workflow: { ...workflow, item_edit_capabilities: undefined },
  });
  assert.match(result, /Adjust unit price/);
  assert.doesNotMatch(result, /<option value="terms"|<option value="quantity"/);
});
function extract(name, next, scope = {}) {
  const source = fs.readFileSync(
    path.join(root, "src/pages/Procurement/ApprovalCenterDetails.jsx"),
    "utf8",
  );
  const start = source.indexOf(`function ${name}(`),
    end = source.indexOf(next, start);
  assert.ok(start >= 0 && end > start);
  const text = transformSync(
    source.slice(start, end) + `\nmodule.exports=${name};`,
    { loader: "jsx", format: "cjs", jsx: "automatic" },
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
const ItemLinks = extract("ItemLinks", "/**", {
  PROCUREMENT_DOCUMENT_LABEL: "Purchase Order",
  Link: () => null,
  LegacyItemEvidence: () => null,
  ItemEvidencePanel: () => null,
  ItemPriceHistory: () => null,
  receiptUrl: () => "/safe",
  itemTitle: (row) => row.item_name,
});
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...nodes(tree.props?.children)];
}
test("Expanded links never repeat the edit control or embed files in the summary row", () => {
  assert.equal(
    nodes(ItemLinks({ item })).some((node) => node.type === "button"),
    false,
  );
});
const { default: Table } = bundled(
  "src/components/approvals/ApprovalItemsTable.jsx",
);
const RequestedItems = extract("RequestedItems", "/**", {
  ApprovalItemsTable: Table,
  card: "card",
  FileText: () => null,
  documentFlow: () => ({ items: "PO items" }),
  itemTitle: (row) => row.item_name,
  ItemLinks: () => null,
  account: (row) => row.account_name || "Not assigned",
  amount: (value) => Number(value || 0).toFixed(2),
  flags: () => [],
});
test("Purchase Order review shows account, quantity, unit price and line total without a Credit column", () => {
  const result = html(RequestedItems, {
    items: [
      { ...item, account_name: "Stationery account", procurement_quantity: 2 },
    ],
    documentType: 2,
  });
  assert.match(result, /Edit and expand/);
  assert.match(result, /Unit price/);
  assert.match(result, /Line total/);
  assert.doesNotMatch(result, />Credit</);
});
test("Price-free requisition review keeps quantity while hiding prices and credit", () => {
  const result = html(RequestedItems, {
    items: [item],
    documentType: 1,
    priceFree: true,
  });
  assert.match(result, /Qty/);
  assert.doesNotMatch(result, /Unit price|Cost \/ Debit|>Credit</);
});
const hookReact = {
  ...React,
  useState: (value) => [
    typeof value === "function" ? value() : value,
    () => {},
  ],
  useRef: (value) => ({ current: value }),
};
const Drop = bundled("src/components/procurement/EvidenceDropzone.jsx", {
  react: hookReact,
}).default;
test("Dropping one file uses the same upload callback as the chooser", () => {
  const file = { name: "invoice.pdf" };
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
  const input = nodes(tree).find((node) => node.type === "input");
  input.props.onChange({ target: { files: [file], value: "invoice.pdf" } });
  assert.equal(chosen, file);
});
test("Disabled and multiple-file drops cannot start an upload", () => {
  let uploaded = 0,
    message = "";
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
test("Clicking a row opens the exact item editor and submits its quantity, price, account and reason", async () => {
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
        states[id] = typeof initial === "function" ? initial() : initial;
      return [
        states[id],
        (value) => {
          states[id] = typeof value === "function" ? value(states[id]) : value;
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
    "src/components/approvals/ItemRevisionPanel.jsx",
    { react: hooked },
  ).default;
  const props = {
    workflow: {
      ...workflow,
      budget_comparison: { name: "IT budget", after_request: "500.00" },
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
      (node) => node.type === "input" && node.props.name === name,
    );
  assert.equal(field("approval-quantity").props.value, "5");
  field("approval-quantity").props.onChange({ target: { value: "7" } });
  tree = render();
  field("approval-unit-price").props.onChange({ target: { value: "120.00" } });
  tree = render();
  nodes(tree)
    .find((node) => node.type === "textarea")
    .props.onChange({ target: { value: "Supplier quotation Q-10" } });
  tree = render();
  await nodes(tree)
    .find((node) => node.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.equal(saved.item_id, "401");
  assert.equal(saved.change, "terms");
  assert.equal(saved.quantity, "7");
  assert.equal(saved.unit_price, "120.00");
  assert.equal(saved.account_id, 7);
  assert.equal(saved.reason, "Supplier quotation Q-10");
});

function interactiveTable(props) {
  let states = [],
    cursor = 0;
  const hooked = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states))
        states[index] = typeof initial === "function" ? initial() : initial;
      return [
        states[index],
        (value) => {
          states[index] =
            typeof value === "function" ? value(states[index]) : value;
        },
      ];
    },
  };
  const Component = bundled("src/components/approvals/ApprovalItemsTable.jsx", {
    react: hooked,
  }).default;
  return () => {
    cursor = 0;
    return Component(props);
  };
}

test("A hundred items initially render only 25 compact rows and no attachment details", () => {
  let mounted = 0;
  const render = interactiveTable({
    items: Array.from({ length: 100 }, (_, index) => ({
      ...item,
      id: index + 1,
    })),
    renderDetails: () => {
      mounted++;
      return "Files";
    },
  });
  const tree = render();
  assert.equal(
    nodes(tree).filter(
      (node) => node.type === "button" && node.props["aria-expanded"] === false,
    ).length,
    25,
  );
  assert.equal(mounted, 0);
  assert.equal(nodes(tree).filter((node) => node.type === "th").length, 6);
});

test("Row disclosure spans the full table, mounts only that item and collapses on paging", () => {
  let seen = [];
  const render = interactiveTable({
    items: Array.from({ length: 100 }, (_, index) => ({
      ...item,
      id: index + 1,
    })),
    renderDetails: (row) => {
      seen.push(row.id);
      return "Invoice";
    },
  });
  let tree = render();
  nodes(tree)
    .find((node) => node.type === "tr" && node.props.onClick)
    .props.onClick();
  tree = render();
  assert.deepEqual(seen, [1]);
  assert.equal(
    nodes(tree).find((node) => node.type === "td" && node.props.colSpan).props
      .colSpan,
    6,
  );
  assert.ok(
    nodes(tree).some(
      (node) => node.props?.["aria-label"] === "Details: Keyboard",
    ),
  );
  nodes(tree)
    .find((node) => node.props?.["aria-label"] === "Next item page")
    .props.onClick();
  seen = [];
  tree = render();
  assert.deepEqual(seen, []);
  assert.ok(
    nodes(tree).some(
      (node) =>
        node.type === "span" && String(node.props.children).includes("26–50"),
    ),
  );
});

test("The pencil opens the selected item without expanding its row and is omitted for viewers", () => {
  let chosen,
    stopped = false;
  const render = interactiveTable({
    items: [item],
    onEditItem: (row) => {
      chosen = row.id;
    },
  });
  let tree = render();
  nodes(tree)
    .find(
      (node) =>
        node.type === "button" && node.props["aria-haspopup"] === "dialog",
    )
    .props.onClick({
      stopPropagation() {
        stopped = true;
      },
    });
  assert.equal(chosen, 401);
  assert.ok(stopped);
  tree = render();
  assert.ok(
    !nodes(tree).some((node) => node.type === "td" && node.props.colSpan),
  );
  assert.ok(
    !nodes(interactiveTable({ items: [item] })()).some(
      (node) => node.props?.["aria-haspopup"] === "dialog",
    ),
  );
});

test("Search and needs-pricing filter find items across all pages without including rejected costs", () => {
  const items = Array.from({ length: 100 }, (_, index) => ({
    ...item,
    id: index + 1,
    item_name: `Keyboard ${index + 1}`,
    unit_price: index === 90 || index === 91 ? "0.00" : "100.00",
    approval_status: index === 91 ? 2 : 0,
  }));
  const render = interactiveTable({ items });
  let tree = render();
  nodes(tree)
    .find((node) => node.type === "input")
    .props.onChange({ target: { value: "Keyboard 91" } });
  tree = render();
  assert.equal(
    nodes(tree).filter((node) => node.props?.["aria-expanded"] === false)
      .length,
    1,
  );
  nodes(tree)
    .find((node) => node.props?.["aria-label"] === "Clear item search")
    .props.onClick();
  tree = render();
  nodes(tree)
    .find((node) => node.type === "select" && node.props.value === "all")
    .props.onChange({ target: { value: "unpriced" } });
  tree = render();
  assert.equal(
    nodes(tree).filter((node) => node.props?.["aria-expanded"] === false)
      .length,
    1,
  );
  assert.ok(
    nodes(tree).some(
      (node) => node.type === "span" && node.props.children === "Keyboard 91",
    ),
  );
});

test("Unpriced documents do not force open an editor before a row is selected", () => {
  const result = html(Panel, {
    workflow: {
      ...workflow,
      document_items: [{ ...item, unit_price: "0.00" }],
    },
  });
  assert.doesNotMatch(result, /<dialog|<form|<details open/);
});

test("Rejected lines remain editable only as a reasoned restoration", () => {
  const result = html(Panel, {
    workflow: {
      ...workflow,
      document_items: [{ ...item, approval_status: 2 }],
    },
    editRequest: { itemId: 401 },
  });
  assert.match(result, /Restore rejected item/);
  assert.doesNotMatch(result, /name="approval-unit-price"/);
});

test("Catalogue descriptions are shown without turning database row IDs into names", () => {
  const { approvalItemLabel } = bundled(
    "src/utils/functions/approvalItemLabel.js",
  );
  assert.equal(
    approvalItemLabel({
      id: 41,
      item_id: 100,
      item_name: "Hardware equipment",
    }),
    "Hardware equipment",
  );
  assert.equal(
    approvalItemLabel({
      id: 41,
      item_name: "Item #41",
      description: "Replacement keyboard",
    }),
    "Replacement keyboard",
  );
  assert.equal(
    approvalItemLabel({ id: 41, item_id: 100 }),
    "Description unavailable",
  );
});

test("An older backend shows the saved quantity and explains why it cannot be edited", () => {
  const result = html(Panel, {
    workflow: { ...workflow, item_edit_capabilities: undefined },
    editRequest: { itemId: 401 },
  });
  assert.match(
    result,
    /<input(?=[^>]*name="approval-quantity")(?=[^>]*disabled)[^>]*>/,
  );
  assert.match(
    result,
    /Quantity editing is not enabled by the connected backend/,
  );
});

const { default: ItemBudget, findItemBudget } = bundled(
  "src/components/approvals/ItemBudgetComparison.jsx",
);
const mappedBudget = {
  name: "Equipment budget",
  items: [
    {
      line_id: 401,
      item_id: 502,
      current_amount: "500.00",
      item: {
        allocated: "2000.00",
        spent: "300.00",
        balance: "1700.00",
        after_request: "1100.00",
      },
      category: {
        allocated: "3000.00",
        spent: "500.00",
        balance: "2500.00",
        after_request: "1900.00",
      },
    },
  ],
};
test("The editor compares the mapped item and category separately and projects a price change", () => {
  const result = html(ItemBudget, {
    comparison: mappedBudget,
    item,
    proposedAmount: 700,
    currency: "NGN",
  });
  assert.match(result, /Item budget/);
  assert.match(result, /Category budget/);
  assert.match(result, /900.00/);
  assert.match(result, /1,700.00/);
  assert.equal(findItemBudget({ groups: [mappedBudget] }, 401).item_id, 502);
  assert.equal(findItemBudget(mappedBudget, 502), null);
});
test("Missing allocations remain guidance and paid lines do not repeat a budget comparison", () => {
  const missing = {
    ...mappedBudget,
    items: [
      { line_id: 401, current_amount: "500", item: null, category: null },
    ],
  };
  assert.match(
    html(ItemBudget, { comparison: missing, item }),
    /No approved allocation/,
  );
  assert.equal(
    html(ItemBudget, {
      comparison: mappedBudget,
      item: { ...item, resolved: 1 },
    }),
    "",
  );
  assert.equal(
    html(ItemBudget, {
      comparison: mappedBudget,
      item: { ...item, approval_status: 2 },
    }),
    "",
  );
});

function interactiveEditor(props) {
  let cursor = 0,
    refCursor = 0,
    states = [],
    refs = [],
    effects = [];
  const hooked = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states))
        states[index] = typeof initial === "function" ? initial() : initial;
      return [
        states[index],
        (value) => {
          states[index] =
            typeof value === "function" ? value(states[index]) : value;
        },
      ];
    },
    useRef(initial) {
      const index = refCursor++;
      return refs[index] ?? (refs[index] = { current: initial });
    },
    useEffect(fn) {
      effects.push(fn);
    },
  };
  const Editor = bundled("src/components/approvals/ItemRevisionPanel.jsx", {
    react: hooked,
  }).default;
  return () => {
    cursor = 0;
    refCursor = 0;
    effects = [];
    let tree = Editor(props);
    for (const effect of effects) effect();
    cursor = 0;
    refCursor = 0;
    effects = [];
    tree = Editor(props);
    return tree;
  };
}
test("Uploading inside the dialog preserves entered terms/reason and advances only its own saved version", async () => {
  let saved, upload;
  const props = {
    workflow: { ...workflow, action_version: "v1" },
    editRequest: { itemId: 401, expectedVersion: "v1" },
    renderEvidence: (line, callbacks) => {
      upload = callbacks;
      return React.createElement(
        "div",
        { "aria-label": "Invoice uploader" },
        line.item_name,
      );
    },
    onSave: async (values) => {
      saved = values;
    },
  };
  const render = interactiveEditor(props);
  let tree = render();
  nodes(tree)
    .find((n) => n.props?.name === "approval-quantity")
    .props.onChange({ target: { value: "7" } });
  tree = render();
  nodes(tree)
    .find((n) => n.props?.name === "approval-unit-price")
    .props.onChange({ target: { value: "120.00" } });
  tree = render();
  nodes(tree)
    .find((n) => n.type === "textarea")
    .props.onChange({ target: { value: "Quotation and invoice attached" } });
  tree = render();
  upload.onBusyChange(true);
  tree = render();
  await nodes(tree)
    .find((n) => n.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.equal(saved, undefined);
  upload.onVersionChange("v2");
  upload.onBusyChange(false);
  props.workflow = { ...props.workflow, action_version: "v2" };
  tree = render();
  assert.equal(
    nodes(tree).find((n) => n.props?.name === "approval-quantity").props.value,
    "7",
  );
  assert.equal(
    nodes(tree).find((n) => n.type === "textarea").props.value,
    "Quotation and invoice attached",
  );
  await nodes(tree)
    .find((n) => n.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.equal(saved.expected_version, "v2");
  assert.equal(saved.quantity, "7");
  assert.equal(saved.unit_price, "120.00");
});
test("An unrelated refresh cannot silently authorise overwriting a different revision", async () => {
  let saved;
  const props = {
    workflow: { ...workflow, action_version: "v1" },
    editRequest: { itemId: 401, expectedVersion: "v1" },
    onSave: async (values) => {
      saved = values;
    },
  };
  const render = interactiveEditor(props);
  let tree = render();
  nodes(tree)
    .find((n) => n.type === "textarea")
    .props.onChange({ target: { value: "Review quotation" } });
  props.workflow = { ...props.workflow, action_version: "someone-else-v2" };
  tree = render();
  await nodes(tree)
    .find((n) => n.type === "form")
    .props.onSubmit({ preventDefault() {} });
  assert.equal(saved.expected_version, "v1");
});

test("An over-limit Purchase Order price requires a suitable workflow in the same editor", async () => {
  let saved;
  const render = interactiveEditor({
    workflow: {
      ...workflow,
      purchase_order_routing: {
        max_amount: "600.00",
        can_replace: true,
        workflows: [
          { id: 210, name: "Lower-value orders", max_amount: "650.00" },
          { id: 220, name: "Higher-value orders", max_amount: "1000.00" },
          { id: 230, name: "Unlimited orders", max_amount: "0.00" },
        ],
      },
    },
    editRequest: { itemId: 401 },
    onSave: async values => { saved = values; },
  });
  let tree = render();
  nodes(tree).find(node => node.props?.name === "approval-unit-price")
    .props.onChange({ target: { value: "150.00" } });
  tree = render();
  nodes(tree).find(node => node.type === "textarea")
    .props.onChange({ target: { value: "Updated supplier quotation" } });
  tree = render();
  const select = nodes(tree).find(node => node.props?.name === "replacement-workflow");
  assert.equal(select.props.required, true);
  assert.deepEqual(Array.from(nodes(select).filter(node => node.type === "option").map(node => node.props.value)), ["", 220, 230]);
  await nodes(tree).find(node => node.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(saved, undefined);
  select.props.onChange({ target: { value: "220" } });
  tree = render();
  await nodes(tree).find(node => node.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(saved.unit_price, "150.00");
  assert.equal(saved.replacement_workflow_id, 220);
});
