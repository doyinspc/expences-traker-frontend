const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm");
const root = process.env.PROKURE_ROOT || path.resolve(__dirname, ".."),
  React = require(path.join(root, "node_modules/react")),
  { renderToStaticMarkup } = require(
    path.join(root, "node_modules/react-dom/server"),
  );
function component(relative) {
  const code = require(path.join(root, "node_modules/esbuild")).buildSync({
    entryPoints: [path.join(root, relative)],
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    write: false,
    logLevel: "silent",
  }).outputFiles[0].text;
  const config = { exports: {} };
  vm.runInNewContext(code, {
    module: config,
    exports: config.exports,
    require: (id) => require(require.resolve(id, { paths: [root] })),
  });
  return config.exports;
}
const { default: Panel, revisionPreview } = component(
  "src/components/approvals/ItemRevisionPanel.jsx",
);
const event = {
  revision: 1,
  item_id: 401,
  item_name: "Keyboard",
  change: "price",
  before: { unit_price: "100.00", total_price: "500.00", rejected: false },
  after: { unit_price: "120.00", total_price: "600.00", rejected: false },
  old_total: "500.00",
  new_total: "600.00",
  reason: "Revised supplier quotation",
  actor_name: "Finance director",
  role_name: "Finance",
  at: "2026-11-04 12:30:00",
  reapproval_required: true,
};
const sample = {
  document_type_id: 2,
  document_data: { amount: "600.00", currency_code: "NGN" },
  permissions: { can_revise_items: true },
  document_items: [
    {
      id: 401,
      item_name: "Keyboard",
      quantity: 5,
      procurement_quantity: 2,
      unit_price: "100.00",
      total_price: "200.00",
    },
  ],
  item_revisions: {
    history: [event],
    approvals: [
      {
        step_id: 11,
        by: 21,
        actor_name: "Department manager",
        at: "2026-11-04",
        total: "500.00",
        revision: 0,
      },
    ],
    reapproval: { through_serial: 1 },
  },
  steps: [{ id: 11, role_name: "Department" }],
  cash_movements: { refund_due: "50.00" },
  budget_comparison: {
    name: "IT budget",
    allocated: "1000.00",
    spent: "500.00",
    balance: "500.00",
    request_unpaid: "100.00",
    after_request: "400.00",
  },
};
const render = (workflow) =>
  renderToStaticMarkup(
    React.createElement(Panel, {
      workflow,
      editRequest: workflow.permissions?.can_revise_items
        ? { itemId: workflow.document_items?.[0]?.id }
        : null,
      onSave: async () => {},
    }),
  );
test("Approver sees a reasoned adjustment form with original values and budget check", () => {
  const html = render(sample);
  for (const word of [
    "Save change and notify",
    "Reason",
    "Adjust unit price",
    "Reject this item",
    "Reapproval required",
    "Further payments",
    "Budget check",
    "Actual net spending",
    "Money due for return",
    "Revised supplier quotation",
    "Department manager",
  ])
    assert.ok(html.toLowerCase().includes(word.toLowerCase()), word);
});
test("Completed and view-only approvals show history without edit controls", () => {
  const html = render({ ...sample, permissions: { can_revise_items: false } });
  assert.ok(html.includes("Item change history"));
  assert.ok(html.includes("Completed approval items are locked"));
  assert.doesNotMatch(html, /<form/);
});
test("Noncash documents do not acquire price revision controls", () =>
  assert.equal(render({ ...sample, document_type_id: 1 }), ""));
test("Price preview respects the procurement remainder and leaves requested quantity intact", () => {
  const item = sample.document_items[0];
  assert.equal(revisionPreview(item, "price", "120.11", 2).after, 240.22);
  assert.equal(item.quantity, 5);
  assert.equal(revisionPreview(item, "price", "120.11", 3).after, 600.55);
});
test("Reject and restore previews remove and recover the effective payable amount", () => {
  const item = sample.document_items[0];
  assert.equal(revisionPreview(item, "reject", "", 2).after, 0);
  const result = revisionPreview(
    { ...item, approval_status: 2 },
    "restore",
    "",
    2,
  );
  assert.equal(result.before, 0);
  assert.equal(result.after, 200);
  assert.equal(result.increases, true);
});
test("Malformed prices cannot produce a save preview", () => {
  for (const price of ["1.001", "1e3", "-1", "", "<script>"])
    assert.equal(
      revisionPreview(sample.document_items[0], "price", price, 2),
      null,
    );
});
test("Rejection and restoration are clearly distinguished in history", () => {
  const html = render({
    ...sample,
    item_revisions: {
      history: [
        {
          ...event,
          change: "reject",
          after: { ...event.after, rejected: true },
        },
        { ...event, revision: 2, change: "restore" },
      ],
    },
  });
  assert.ok(html.includes("Item rejected"));
  assert.ok(html.includes("Item restored"));
});
test("Reasons and user names render as text rather than executable markup", () => {
  const html = render({
    ...sample,
    item_revisions: {
      history: [
        {
          ...event,
          reason: "<img src=x onerror=alert(1)>",
          actor_name: "<script>alert(1)</script>",
        },
      ],
    },
  });
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.doesNotMatch(html, /<script>|<img src=x/);
});
test("Each item history has an expandable clock and excludes other items", () => {
  const source = fs.readFileSync(
    path.join(root, "src/pages/Procurement/ApprovalCenterDetails.jsx"),
    "utf8",
  );
  const start = source.indexOf("export function ItemPriceHistory"),
    end = source.indexOf("function RequestedItems", start);
  const isolated = source
    .slice(start, end)
    .replace("export function", "function");
  const transform = require(
    path.join(root, "node_modules/esbuild"),
  ).transformSync(isolated + "\nmodule.exports=ItemPriceHistory;", {
    loader: "jsx",
    format: "cjs",
  }).code;
  const config = { exports: {} };
  vm.runInNewContext(transform, {
    module: config,
    exports: config.exports,
    React,
    History: () => React.createElement("svg", { "aria-label": "clock icon" }),
    amount: (value) => String(value),
    itemTitle: (item) => item.item_name,
  });
  const html = renderToStaticMarkup(
    React.createElement(config.exports, {
      item: { id: 401, item_name: "Keyboard" },
      revisions: {
        history: [
          event,
          { ...event, revision: 2, item_id: 999, reason: "Must not appear" },
        ],
      },
    }),
  );
  for (const word of [
    "<details",
    "<summary",
    "clock icon",
    "Unit price:",
    "Finance director",
    "Revised supplier quotation",
  ])
    assert.ok(html.includes(word), word);
  assert.ok(!html.includes("Must not appear"));
});

test("Unbudgeted items stay visible as guidance and do not remove approval item controls", () => {
  const html = render({
    ...sample,
    budget_comparison: {
      ...sample.budget_comparison,
      unbudgeted_items: ["Keyboard"],
    },
  });
  assert.ok(html.includes("No approved allocation"));
  assert.ok(html.includes("Review unbudgeted items"));
  assert.ok(html.includes("Save change and notify"));
  assert.ok(!html.includes("Within overall budget"));
});
test("No linked budget leaves a clear message without comparison numbers", () => {
  const html = render({
    ...sample,
    budget_comparison: { message: "No budget is linked to this request." },
  });
  assert.ok(html.includes("No budget is linked"));
  assert.ok(!html.includes("Budget balance now"));
});
