const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm");
const root = path.resolve(__dirname, ".."),
  React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server"),
  { transformSync } = require("esbuild");
function load(relative, mocks = {}, globals = {}) {
  const file = path.join(root, relative),
    module = { exports: {} };
  const code = transformSync(fs.readFileSync(file, "utf8"), {
    loader: /tsx$/.test(file) ? "tsx" : /jsx$/.test(file) ? "jsx" : "js",
    format: "cjs",
    jsx: "automatic",
  }).code;
  vm.runInNewContext(code, {
    module,
    exports: module.exports,
    console,
    URL,
    FormData,
    ...globals,
    require: (id) => {
      if (id in mocks) return mocks[id];
      if (id.startsWith(".")) {
        let resolved = path.resolve(path.dirname(file), id);
        if (!path.extname(resolved))
          resolved = [".js", ".jsx", ".ts", ".tsx"]
            .map((ext) => resolved + ext)
            .find(fs.existsSync);
        return load(path.relative(root, resolved), mocks);
      }
      return require(require.resolve(id, { paths: [root] }));
    },
  });
  return module.exports;
}
const html = (Component, props = {}) =>
  renderToStaticMarkup(React.createElement(Component, props));
const document = {
  id: 7000,
  title: "Kano classroom supplies",
  requisition_type: 2,
  purchasing_version: 2,
  location_id: 41,
};

test("Procurement explains why completed Purchase Order quantities were excluded", () => {
  const Page = page("src/pages/Product/PurchasingItems.jsx", {
    parent: { ...document, id: 91, requisition_type: 9 },
    state: {
      excluded_orders: [
        {
          order_id: 90,
          title: "Branch equipment",
          reason: "The order currency differs from this Procurement.",
        },
      ],
    },
  });
  const result = html(Page, { type: 9 });
  assert.match(result, /Why some Purchase Order quantities are unavailable/);
  assert.match(result, /PO-90/);
  assert.match(result, /The order currency differs/);
  assert.match(result, /No eligible Purchase Order quantities/);
});

function page(file, { parent = document, state = {}, extra = {} } = {}) {
  return load(file, {
    "react-redux": {
      useSelector: (fn) => fn({ auth: { location_id: 41, role_id: 110 } }),
    },
    "react-router-dom": {
      useNavigate: () => () => {},
      useParams: () => ({ id: String(parent.id) }),
    },
    "@tanstack/react-query": {
      useQuery: () => ({
        data: { items: [], candidates: [], can_edit: true, ...state },
        isPending: false,
      }),
      useQueryClient: () => ({ invalidateQueries: async () => {} }),
    },
    "../../hooks/useParentDocumentContext": () => ({
      document: parent,
      isPending: false,
    }),
    "../../hooks/useTanstackQuery": () => ({
      data: [],
      loadUpdate: async () => {},
    }),
    "../../actions/common": {
      tokenHelpers: {
        getToken: () => "synthetic",
        getTenantDb: () => "synthetic",
      },
    },
    "../../utils/functions/purchasingApi": {
      purchasingRequest: async () => {},
    },
    "../../components/common/ParentDocumentContext": () =>
      React.createElement("p", null, parent.title),
    "../../components/procurement/ItemEvidencePanel": () =>
      React.createElement("details", null, "Images and documents by stage"),
    "./PurchaseOrderRequisitions": () =>
      React.createElement("p", null, "Existing purchasing screen"),
    "./RequisitionItems": () =>
      React.createElement(
        "p",
        null,
        "Existing cash advance / historical screen",
      ),
    ...extra,
  }).default;
}
test("New requisitions show requested, issued and outstanding quantities without price inputs", () => {
  const Page = page("src/pages/Product/RequisitionDemandItems.jsx", {
    parent: { ...document, requisition_type: 1 },
    state: {
      items: [
        {
          id: 401,
          item_name: "Keyboard",
          unit: "pieces",
          quantity: 5,
          issued_quantity: 3,
          remaining_quantity: 2,
          approved: 1,
        },
      ],
    },
  });
  const result = html(Page);
  assert.match(result, /Kano classroom supplies/);
  assert.match(result, /Issued from stock/);
  assert.match(result, /Outstanding/);
  assert.doesNotMatch(result, />Unit price<|>Total Price<|Naira|₦/);
});
test("Historical requests and cash advances retain their existing item screen", () => {
  for (const parent of [
    { ...document, requisition_type: 1, purchasing_version: 1 },
    { ...document, requisition_type: 3 },
  ])
    assert.match(
      html(page("src/pages/Product/RequisitionDemandItems.jsx", { parent })),
      /Existing cash advance/,
    );
});

test("An older requisition retains its existing layout after purchasing preparation", () => {
  const Page = page("src/pages/Product/RequisitionDemandItems.jsx", {
    parent: {
      ...document,
      requisition_type: 1,
      purchasing_version: 1,
      stage_evidence_enabled: 1,
    },
    state: {
      items: [
        {
          id: 401,
          item_name: "Keyboard",
          quantity: 5,
          issued_quantity: 0,
          remaining_quantity: 5,
          unit_price: "100.00",
          total_price: "500.00",
        },
      ],
    },
  });
  const result = html(Page);
  assert.match(result, /Existing cash advance \/ historical screen/);
  assert.doesNotMatch(result, /500\.00/);
});

function legacyForm(extraMocks = {}) {
  return load("src/pages/Product/RequistiontemForm.jsx", {
    "react-redux": {
      useSelector: (fn) => fn({ auth: { tenantDb: "synthetic" } }),
    },
    "../../actions/common": {
      API_PATH_SETTING: "local-fixture",
      axiosConfig: {},
    },
    "../../hooks/useTanstackQuery": () => ({
      data: [
        {
          id: 501,
          name: "Accessories",
          children: [
            { id: 502, name: "Keyboard", category_id: 501, text_1: "pieces" },
          ],
        },
      ],
      loadQuery: () => {},
      isLoading: false,
    }),
    "react-datepicker": () => React.createElement("input", { type: "date" }),
    "react-datepicker/dist/react-datepicker.css": {},
    ...extraMocks,
  }).default;
}
const earlierItem = {
  id: 401,
  category_id: 501,
  item_id: 502,
  quantity: 2,
  unit_price: 100,
  total_price: 200,
};
test("The fallback form hides price inputs on an existing request but retains them for cash advances", () => {
  const Form = legacyForm();
  const request = html(Form, {
    requisitionId: 301,
    parent_row: { requisition_type: 1 },
    initialData: earlierItem,
  });
  assert.doesNotMatch(
    request,
    /name="unit_price"|name="total_price"|auto-calculate/,
  );
  const cash = html(Form, {
    requisitionId: 301,
    parent_row: { requisition_type: 3 },
    initialData: earlierItem,
  });
  assert.match(cash, /name="unit_price"/);
  assert.match(cash, /name="total_price"/);
});
test("Editing historical request quantities does not submit or clear the stored old estimate", () => {
  let saved;
  const hookReact = {
    ...React,
    useState: (initial) => [
      typeof initial === "function" ? initial() : initial,
      () => {},
    ],
    useEffect: () => {},
    useMemo: (fn) => fn(),
    useCallback: (fn) => fn,
    useRef: (value) => ({ current: value }),
  };
  const Form = legacyForm({ react: hookReact });
  const form = Form({
    requisitionId: 301,
    parent_row: { requisition_type: 1 },
    initialData: earlierItem,
    isEdit: true,
    onSave: (values) => {
      saved = values;
    },
  });
  form.props.onSubmit({ preventDefault() {} });
  assert.ok(saved);
  assert.equal(saved.quantity, 2);
  assert.equal("unit_price" in saved, false);
  assert.equal("total_price" in saved, false);
  assert.equal(earlierItem.total_price, 200);
});
test("Purchase Order rows distinguish six request units from four extra store units", () => {
  const Page = page("src/pages/Product/PurchasingItems.jsx", {
    state: {
      items: [
        {
          id: 1,
          item_name: "Keyboard",
          unit: "pieces",
          quantity: 10,
          unit_price: "100.00",
          total_price: "1000.00",
          request_allocations: [{ id: 1 }, { id: 2 }],
          extra_stock_quantity: 4,
        },
      ],
    },
  });
  const result = html(Page);
  assert.match(result, /Extra for store: 4/);
  assert.match(result, /2 requisition item/);
  assert.match(result, /1,000.00/);
  assert.match(result, /Images and documents by stage/);
});
test("Older combined purchases remain on the original screen", () =>
  assert.match(
    html(
      page("src/pages/Product/PurchasingItems.jsx", {
        parent: { ...document, purchasing_version: 1 },
      }),
    ),
    /Existing purchasing screen/,
  ));
test("Procurement offers saved approved PO quantities and price, with no requisition relinking form", () => {
  const Page = page("src/pages/Product/PurchasingItems.jsx", {
    parent: { ...document, requisition_type: 9 },
    state: {
      candidates: [
        {
          id: 2,
          purchaseorder_id: 7001,
          source_title: "Classroom order",
          item_name: "Keyboard",
          available_quantity: 10,
          unit: "pieces",
          unit_price: "100.00",
        },
      ],
    },
  });
  const result = html(Page, { type: 9 });
  assert.match(result, /Quantity to procure/);
  assert.match(result, /PO-7001/);
  assert.match(result, /100.00/);
  assert.match(result, /Add selected quantities to Procurement/);
  assert.doesNotMatch(result, /Add item \/ consolidate requisitions/);
});
test("Once approval starts the purchasing item editor and draft removal controls disappear", () => {
  const Page = page("src/pages/Product/PurchasingItems.jsx", {
    state: { can_edit: false },
  });
  const result = html(Page);
  assert.match(result, /locked/);
  assert.doesNotMatch(result, /Add item \/ consolidate|Remove from draft/);
});
test("Selected price-free approval item offers quantity and rejection in a modal without prices", () => {
  const Panel = load("src/components/approvals/DemandReviewPanel.jsx").default;
  const result = html(Panel, {
    editRequest: { itemId: 1 },
    workflow: {
      permissions: { can_revise_items: true },
      document_items: [{ id: 1, item_name: "Keyboard", quantity: 5 }],
    },
  });
  assert.match(result, /Reason/);
  assert.match(result, /Reject this item/);
  assert.match(result, /Adjust requested quantity/);
  assert.doesNotMatch(result, /Unit price|unit_price/);
  assert.match(result, /<dialog/);
});
test("Completed demand review keeps decision history and hides mutation controls", () => {
  const Panel = load("src/components/approvals/DemandReviewPanel.jsx").default;
  const result = html(Panel, {
    workflow: {
      permissions: { can_revise_items: false },
      item_revisions: {
        history: [
          {
            revision: 1,
            change: "reject",
            actor_name: "Reviewer",
            reason: "Duplicate request",
            at: "2026-11-06",
          },
        ],
      },
    },
  });
  assert.match(result, /Duplicate request/);
  assert.doesNotMatch(result, /<form|<textarea|type="submit"/);
});
test("Combined Procurement budgets remain separate and unbudgeted items stay explicit", () => {
  const Budget = load("src/components/approvals/BudgetComparison.jsx").default;
  const result = html(Budget, {
    currency: "NGN",
    comparison: {
      groups: [
        {
          name: "IT budget",
          allocated: "1000",
          spent: "100",
          balance: "900",
          request_unpaid: "200",
          after_request: "700",
        },
        {
          name: "Facilities",
          allocated: "2000",
          spent: "0",
          balance: "2000",
          request_unpaid: "300",
          after_request: "1700",
        },
        { message: "No source budget assigned for repairs" },
      ],
    },
  });
  assert.match(result, /IT budget/);
  assert.match(result, /Facilities/);
  assert.match(result, /No source budget assigned for repairs/);
  assert.match(result, /700.00/);
  assert.match(result, /1,700.00/);
});
test("Stage evidence gallery keeps request images, invoices, receipts and supply proof in labelled groups", () => {
  const Panel = load("src/components/procurement/ItemEvidencePanel.jsx", {
    "react-redux": {
      useSelector: (fn) => fn({ auth: { location_id: 41, role_id: 110 } }),
    },
    "@tanstack/react-query": {
      useQuery: () => ({
        isPending: false,
        data: {
          attachments: [
            "request",
            "purchase_order",
            "procurement",
            "stock_receipt",
          ].map((stage, index) => ({
            id: index + 1,
            stage,
            original_name: `stage-${index}.png`,
            mime_type: "image/png",
            uploader_name: "Recorded staff",
            uploaded_at: "2026-11-06",
            has_preview: 0,
            stock_movement_id: stage === "stock_receipt" ? 123 : null,
          })),
          upload_stages: [],
        },
      }),
      useQueryClient: () => ({}),
    },
    "../../actions/common": {
      tokenHelpers: {
        getToken: () => "synthetic",
        getTenantDb: () => "synthetic",
      },
    },
  }).default;
  const result = html(Panel, {
    documentId: 8000,
    itemId: 12,
    initiallyOpen: true,
  });
  for (const phrase of [
    "what is needed",
    "quotation / invoice",
    "purchase / payment receipt",
    "goods supplied",
    "Receipt movement #123",
  ])
    assert.ok(result.includes(phrase), phrase);
  assert.doesNotMatch(
    result,
    /Replace receipt|Delete attachment|Add image or PDF/,
  );
});
test("New Procurement is included with legacy procurement and cash advance in net income reports", () => {
  const { incomeExpenseGroups } = load(
    "src/utils/functions/incomeExpenseReport.js",
  );
  const rows = [
    [2, 100],
    [9, 200],
    [3, 50],
    [7, 500],
  ].map(([type, value]) => ({
    document_type: type,
    resolved: 1,
    currency_id: 1,
    currency_code: "NGN",
    expense_amount: type === 7 ? "0.00" : `${value}.00`,
    income_amount: type === 7 ? `${value}.00` : "0.00",
  }));
  const result = incomeExpenseGroups(rows)[0];
  assert.equal(result.totals.procurement, "300.00");
  assert.equal(result.totals.expenses, "350.00");
  assert.equal(result.totals.net, "150.00");
});

function compression(sizes = {}) {
  const canvases = [];
  let closed = false,
    decodes = 0;
  class File extends Blob {
    constructor(parts, name, options) {
      super(parts, options);
      this.name = name;
    }
  }
  const helpers = load(
    "src/utils/functions/evidenceUpload.js",
    {},
    {
      Blob,
      File,
      createImageBitmap: async () => {
        decodes++;
        return {
          width: 4032,
          height: 3024,
          close: () => {
            closed = true;
          },
        };
      },
      document: {
        createElement: () => {
          const canvas = {
            width: 0,
            height: 0,
            getContext: () => ({ fillRect() {}, drawImage() {} }),
            toBlob(callback, type, quality) {
              const bytes = sizes.fail
                ? 1100000
                : canvas.width > 400
                  ? quality > 0.8
                    ? 800000
                    : 400000
                  : canvas.width > 180
                    ? 18000
                    : 8000;
              callback(new Blob([new Uint8Array(bytes)], { type }));
            },
          };
          canvases.push(canvas);
          return canvas;
        },
      },
    },
  );
  return { ...helpers, canvases, closed: () => closed, decodes: () => decodes };
}
test("Camera images are resized proportionally, compressed and retain a separate preview below 15 KB", async () => {
  const h = compression(),
    result = await h.prepareEvidenceUpload({
      name: "Camera.PNG",
      size: 6000000,
      type: "image/png",
    });
  assert.equal(h.canvases[0].width, 1600);
  assert.equal(h.canvases[0].height, 1200);
  assert.equal(result.file.name, "Camera.jpg");
  assert.ok(result.file.size <= 1048576);
  assert.ok(result.preview.size <= 15360);
  assert.equal(result.file.type, "image/jpeg");
  assert.ok(h.closed());
});
test("Uncompressible evidence is refused and its decoded bitmap is released", async () => {
  const h = compression({ fail: true });
  await assert.rejects(
    h.prepareEvidenceUpload({
      name: "large.jpg",
      size: 9000000,
      type: "image/jpeg",
    }),
    /still too large/,
  );
  assert.ok(h.closed());
});
test("Images over the source limit and unsupported executable types never reach image decoding", async () => {
  const h = compression();
  await assert.rejects(
    h.prepareEvidenceUpload({
      name: "too-large.png",
      size: 11000000,
      type: "image/png",
    }),
    /smaller than 10 MB/,
  );
  await assert.rejects(
    h.prepareEvidenceUpload({
      name: "unsafe.svg",
      size: 100,
      type: "image/svg+xml",
    }),
    /JPEG, PNG, WebP/,
  );
  assert.equal(h.decodes(), 0);
});
test("PDF evidence retains its original content and enforces the 5 MB cap", async () => {
  const h = compression(),
    file = { name: "invoice.pdf", size: 5000, type: "application/pdf" };
  const result = await h.prepareEvidenceUpload(file);
  assert.equal(result.file, file);
  assert.equal(result.preview, null);
  await assert.rejects(
    h.prepareEvidenceUpload({ ...file, size: 5242881 }),
    /5 MB/,
  );
  assert.equal(h.decodes(), 0);
});
