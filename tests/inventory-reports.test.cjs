const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "..");
const reports = import(
  pathToFileURL(path.join(root, "src/utils/functions/inventoryReports.js")).href
);

function renderPage(data, view = "balances") {
  const module = { exports: {} };
  const source = require("esbuild").transformSync(
    fs.readFileSync(
      path.join(root, "src/pages/Reports/StockReport.jsx"),
      "utf8",
    ),
    { loader: "jsx", format: "cjs", jsx: "automatic" },
  ).code;
  const mocks = {
    "react-router": {
      useSearchParams: () => [new URLSearchParams({ view }), () => {}],
    },
    "../../hooks/useInventory": () => ({
      data,
      auth: {},
      refetch: async () => {},
    }),
    "../../components/common/PageBreadCrumb": () => null,
    "../../components/ui/Loader": () => null,
    "../../components/inventory/InventoryActionDialog": () => null,
    "./StockReportCharts": () => null,
    "../../utils/functions/inventoryReports": labels,
  };
  vm.runInNewContext(source, {
    module,
    exports: module.exports,
    console,
    URLSearchParams,
    require: (id) => (id in mocks ? mocks[id] : require(id)),
  });
  return renderToStaticMarkup(React.createElement(module.exports.default));
}
let labels;
test.before(async () => {
  labels = await reports;
});
const fixture = () => ({
  ready: true,
  opening_confirmed: true,
  today: "2026-11-16",
  from_date: "2026-01-01",
  to_date: "2026-11-16",
  location: { id: 41, name: "HQ Lagos" },
  company: { name: "Synthetic company" },
  catalogue: [],
  lots: [],
  movements: [],
  limits: [],
  balances: [],
  transfers: [],
  transfer_values: [],
  valuation: [],
  audit: [],
  currencies: [],
  can_manage: true,
  can_write: true,
});

test("ABC classifies recorded asset values independently within each currency", () => {
  const value = (item_id, currency_id, amount) => ({
    item_id,
    currency_id,
    methods: { WAC: { value_minor: amount } },
  });
  const result = labels.inventoryABC([
    value(1, 10, 80),
    value(2, 10, 15),
    value(3, 10, 5),
    value(4, 20, 100000),
    value(5, 10, null),
  ]);
  assert.equal(result.get("1:10"), "A");
  assert.equal(result.get("2:10"), "B");
  assert.equal(result.get("3:10"), "C");
  assert.equal(result.get("4:20"), "A");
  assert.equal(result.has("5:10"), false);
});
test("Expiry labels distinguish expired, near-expiry and unidentified batches", () => {
  assert.equal(
    labels.expiryLabel({ expiry_date: "2026-11-15" }, "2026-11-16"),
    "Expired",
  );
  assert.equal(
    labels.expiryLabel({ expiry_date: "2026-12-10" }, "2026-11-16"),
    "Expires within 30 days",
  );
  assert.equal(
    labels.expiryLabel({ expiry_date: "2027-01-01" }, "2026-11-16"),
    "Current",
  );
  assert.equal(labels.expiryLabel({}, "2026-11-16"), "Expiry missing");
});
test("All seven report pages remain available and a 500-item balance list renders only 25 rows", () => {
  const data = fixture();
  data.catalogue = Array.from({ length: 500 }, (_, id) => ({
    id,
    name: "Goods " + id,
    unit: "pieces",
    parent_id: 1,
    category_name: "IT",
  }));
  data.balances = data.catalogue.map((item) => ({
    ...item,
    opening_quantity: 1,
    inflows: 2,
    outflows: 1,
    closing_quantity: 2,
    available_quantity: 2,
    status: "in",
  }));
  const html = renderPage(data);
  for (const name of [
    "Balances",
    "Movements",
    "Restock required",
    "Transfers",
    "Expiry",
    "Valuation",
    "Audit history",
  ])
    assert.ok(html.includes(name), name);
  assert.match(html, /Goods 24/);
  assert.doesNotMatch(html, /Goods 25<\/td>/);
  assert.match(html, /1–25 of 500/);
});
test("Restock lists only deficient items and displays their saved unit and shortage", () => {
  const data = fixture();
  data.balances = [
    {
      id: 1,
      name: "Keyboards",
      unit: "pieces",
      available_quantity: 3,
      minimum_quantity: 5,
      safety_quantity: 1,
      shortfall: 2,
    },
    {
      id: 2,
      name: "Paper",
      unit: "reams",
      available_quantity: 10,
      minimum_quantity: 5,
      shortfall: 0,
    },
  ];
  const html = renderPage(data, "replenishment");
  assert.match(html, /Keyboards/);
  assert.match(html, /pieces/);
  assert.doesNotMatch(html, /Paper/);
});
test("Transfer receipts are offered only for an outstanding transfer to the selected destination", () => {
  const data = fixture();
  data.transfers = [
    {
      id: 1,
      reference: "Incoming goods",
      item_name: "Keyboards",
      to_location_id: 41,
      from_location_id: 42,
      quantity: 5,
      received_quantity: 2,
      status_id: 20,
    },
    {
      id: 2,
      reference: "Outgoing goods",
      item_name: "Paper",
      to_location_id: 42,
      from_location_id: 41,
      quantity: 5,
      received_quantity: 0,
      status_id: 10,
    },
  ];
  const html = renderPage(data, "transfers");
  assert.match(html, /aria-label="Receive Incoming goods"/);
  assert.doesNotMatch(html, /aria-label="Receive Outgoing goods"/);
  assert.match(html, /Partially received/);
});
test("Unknown opening is clearly unconfirmed and does not become available zero stock", () => {
  const data = fixture();
  data.opening_confirmed = false;
  data.balances = [
    {
      id: 1,
      name: "Keyboard",
      closing_quantity: 0,
      available_quantity: null,
      status: "unverified",
    },
  ];
  const html = renderPage(data);
  assert.match(html, /Opening stock is unconfirmed/);
  assert.match(html, /Unverified/);
});
test("Stock asset values remain separated by currency and expose missing costs", () => {
  const data = fixture();
  data.currencies = [{ id: 6, name: "Naira" }];
  data.catalogue = [{ id: 1, name: "Keyboard" }];
  data.valuation = [
    {
      item_id: 1,
      currency_id: 6,
      unit: "pieces",
      methods: {
        WAC: { quantity: 2, value_minor: null, needs_cost_review: true },
      },
    },
  ];
  const html = renderPage(data, "valuation");
  assert.match(html, /Cost missing/);
  assert.match(html, /Total incomplete/);
  assert.match(html, /Naira/);
});
