import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Download, RefreshCw, Pencil, ArrowDownToLine } from "lucide-react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import StockReportCharts from "./StockReportCharts";
import Loader from "../../components/ui/Loader";
import useInventory, { inventoryRequest } from "../../hooks/useInventory";
import InventoryActionDialog from "../../components/inventory/InventoryActionDialog";
import {
  exportInventory,
  expiryLabel,
  inventoryABC,
  stockLabels,
  transferLabels,
  movementLabels,
} from "../../utils/functions/inventoryReports";

const control =
  "min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100";
const tabs = [
  ["balances", "Balances"],
  ["movements", "Movements"],
  ["replenishment", "Restock required"],
  ["transfers", "Transfers"],
  ["expiry", "Expiry"],
  ["valuation", "Valuation"],
  ["audit", "Audit history"],
];
const number = (value) =>
  value == null ? "Unverified" : Number(value).toLocaleString();
const amount = (value) =>
  value == null
    ? "Cost missing"
    : (Number(value) / 100).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
const column = (key, label, format) => ({
  key,
  label,
  value: (row) => (format ? format(row[key], row) : (row[key] ?? "—")),
});
const iconButton =
  "grid size-10 place-items-center rounded-lg border border-gray-300 text-blue-700 disabled:opacity-40 dark:border-gray-600 dark:text-blue-300";

/**
 * Compact inventory report workspace. Operational receipts/issues stay in Documents.
 * Tabs share dates and catalogue filters. Tables paginate after filtering and export
 * every matching page. Snapshots/valuation use the end date; movement/audit lists use
 * the full range. Modal actions always refresh the authoritative server state.
 */
export default function StockReport() {
  const [params, setParams] = useSearchParams();
  const tab = tabs.some(([key]) => key === params.get("view"))
    ? params.get("view")
    : "balances";
  const [dates, setDates] = useState({});
  const [vendor, setVendor] = useState("");
  const supplierScope = !["audit", "transfers", "replenishment"].includes(tab)
    ? vendor
    : "";
  const query = useInventory({
    ...dates,
    ...(supplierScope ? { vendor_id: supplierScope } : {}),
  });
  const data = query.data;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [abc, setABC] = useState("");
  const [method, setMethod] = useState("WAC");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const catalogue = new Map(
    (data?.catalogue || []).map((item) => [String(item.id), item]),
  );
  const currencies = new Map(
    (data?.currencies || []).map((currency) => [
      String(currency.id),
      currency.name,
    ]),
  );
  const tiers = useMemo(
    () => inventoryABC(data?.valuation, method),
    [data?.valuation, method],
  );
  const categories = new Map(
    (data?.catalogue || []).map((item) => [
      String(item.parent_id),
      item.category_name,
    ]),
  );
  const vendors = new Map(
    (data?.vendors || []).map((vendor) => [String(vendor.id), vendor.name]),
  );
  const change = (setter) => (event) => {
    setter(event.target.value);
    setPage(0);
  };
  const open = (action, row) => setDialog({ action, row });
  const matches = (row) => {
    const item = catalogue.get(String(row.item_id || row.id));
    const id = String(row.item_id || item?.id || "");
    if (category && String(item?.parent_id) !== category) return false;
    if (
      status &&
      data.balances.find((balance) => String(balance.id) === id)?.status !==
        status
    )
      return false;
    if (
      abc &&
      !data.valuation.some(
        (value) =>
          String(value.item_id) === id &&
          tiers.get(`${value.item_id}:${value.currency_id}`) === abc,
      )
    )
      return false;
    return (
      !search.trim() ||
      [
        item?.name,
        item?.category_name,
        row.reference,
        row.operation,
        row.reason,
        row.item_name,
        row.batch_reference,
        row.from_location,
        row.to_location,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  };
  const valued = (data?.valuation || []).map((row) => ({
    ...row,
    ...row.methods[method],
    name:
      catalogue.get(String(row.item_id))?.name || "Catalogue item unavailable",
    currency: currencies.get(String(row.currency_id)) || "Currency missing",
    abc: tiers.get(`${row.item_id}:${row.currency_id}`) || "Unclassified",
  }));
  const sources = {
    balances: data?.balances || [],
    movements: data?.movements || [],
    replenishment: (data?.balances || []).filter(
      (row) => Number(row.shortfall) > 0,
    ),
    transfers: data?.transfers || [],
    expiry: (data?.lots || []).filter((lot) => Number(lot.is_perishable) === 1),
    valuation: valued,
    audit: data?.audit || [],
  };
  const auditFilters = tab === "audit";
  const filtered = sources[tab].filter(
    auditFilters
      ? (row) =>
          !search ||
          [row.operation, row.reason, row.reason_code, row.user_id]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
      : matches,
  );
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / 25) - 1),
  );
  const visible = filtered.slice(currentPage * 25, (currentPage + 1) * 25);
  const fields = {
    balances: [
      column("name", "Item"),
      column("category_name", "Category"),
      column("unit", "Unit"),
      column("opening_quantity", "Opening", number),
      column("inflows", "In", number),
      column("outflows", "Out", number),
      column("closing_quantity", "Closing", (value) =>
        data?.opening_confirmed ? number(value) : "Unconfirmed",
      ),
      column("available_quantity", "Available", number),
      column("status", "Status", (value) => stockLabels[value]),
    ],
    movements: [
      column("movement_date", "Date"),
      column("item_name", "Item"),
      column(
        "movement_type",
        "Movement",
        (value) => movementLabels[value] || value,
      ),
      column("quantity", "Quantity", number),
      column("unit", "Unit"),
      column("reference", "Reference"),
      column(
        "created_by",
        "Staff",
        (value, row) =>
          [row.first_name, row.last_name].filter(Boolean).join(" ") || value,
      ),
    ],
    replenishment: [
      column("name", "Item"),
      column("category_name", "Category"),
      column("unit", "Unit"),
      column("available_quantity", "Available", number),
      column("minimum_quantity", "Minimum", number),
      column("safety_quantity", "Safety", number),
      column("shortfall", "Shortfall", number),
    ],
    transfers: [
      column("reference", "Reference"),
      column("item_name", "Item"),
      column("from_location", "From"),
      column("to_location", "To"),
      column("quantity", "Sent", number),
      column("received_quantity", "Received", number),
      column("unit", "Unit"),
      column("status_id", "Status", (value) => transferLabels[value]),
      column("id", "Value / in transit", (value) =>
        (data?.transfer_values || [])
          .filter((item) => String(item.transfer_id) === String(value))
          .map(
            (item) =>
              `${item.currency} ${amount(item.dispatched_value_minor)} / ${amount(item.transit_value_minor)}`,
          )
          .join(" · "),
      ),
    ],
    expiry: [
      column("item_name", "Item"),
      column("batch_reference", "Batch"),
      column("expiry_date", "Expiry"),
      column("balance_at_date", "Quantity", number),
      column("unit", "Unit"),
      column("id", "Status", (_, row) => expiryLabel(row, data.to_date)),
      column("vendor_name", "Supplier"),
    ],
    valuation: [
      column("name", "Item"),
      column("unit", "Unit"),
      column("currency", "Currency"),
      column("quantity", "Closing quantity", number),
      column("value_minor", method + " asset value", amount),
      column("abc", "ABC tier"),
    ],
    audit: [
      column("created_at", "Timestamp"),
      column("operation", "Action"),
      column("reason_code", "Reason code"),
      column("reason", "Reason / reference"),
      column("user_id", "Staff ID"),
      column("ip_address", "IP address"),
    ],
  }[tab];
  const title = tabs.find(([key]) => key === tab)[1];
  async function exportRows(format) {
    setExporting(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await exportInventory(format, fields, filtered, title, data);
    } catch (failure) {
      setError(failure.message || "Export failed.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      <PageBreadcrumb pageTitle="Stock & Inventory" />
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold">Stock & Inventory</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
              {data?.location?.name || "Selected location"} · Change location
              using the app header.
            </p>
          </div>
          <button
            className={control}
            aria-label="Refresh inventory"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
          >
            <RefreshCw size={16} />
          </button>
        </header>
        <nav
          aria-label="Inventory report pages"
          className="flex gap-1 overflow-x-auto pb-1"
        >
          {tabs.map(([key, label]) => (
            <button
              key={key}
              aria-pressed={tab === key}
              onClick={() => {
                setParams({ view: key });
                setPage(0);
                setError("");
              }}
              className={
                control +
                " shrink-0 " +
                (tab === key
                  ? "border-blue-500 bg-blue-50 font-semibold dark:bg-blue-950"
                  : "")
              }
            >
              {label}
            </button>
          ))}
        </nav>
        {query.isPending ? (
          <Loader scope="panel" text="Loading inventory…" />
        ) : query.error ? (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {query.error.response?.data?.message || query.error.message}
          </p>
        ) : data && !data.ready ? (
          <div className="space-y-3 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <p>
              Inventory tracking needs its backend update and an authorised
              setup before reports can load.
            </p>
            {data.can_prepare && (
              <button
                className={control}
                disabled={exporting}
                onClick={async () => {
                  if (
                    !window.confirm(
                      "Confirm you have a current database backup. Prepare inventory batches, limits and transfer tracking?",
                    )
                  )
                    return;
                  setExporting(true);
                  setError("");
                  try {
                    await inventoryRequest(
                      "prepare",
                      { confirmation: "PREPARE_INVENTORY" },
                      true,
                    );
                    await query.refetch();
                  } catch (failure) {
                    setError(
                      failure.response?.data?.message || failure.message,
                    );
                  } finally {
                    setExporting(false);
                  }
                }}
              >
                Prepare Inventory tracking
              </button>
            )}
          </div>
        ) : (
          data?.ready && (
            <>
              <div className="flex flex-wrap items-end gap-2">
                <label className="grid gap-1 text-xs">
                  From
                  <input
                    className={control}
                    type="date"
                    value={dates.from_date || data.from_date}
                    max={dates.to_date || data.to_date}
                    onChange={(event) => {
                      setDates((previous) => ({
                        ...previous,
                        from_date: event.target.value,
                      }));
                      setPage(0);
                    }}
                  />
                </label>
                <label className="grid gap-1 text-xs">
                  To
                  <input
                    className={control}
                    type="date"
                    value={dates.to_date || data.to_date}
                    max={data.today}
                    onChange={(event) => {
                      setDates((previous) => ({
                        ...previous,
                        to_date: event.target.value,
                      }));
                      setPage(0);
                    }}
                  />
                </label>
                <input
                  aria-label="Search inventory"
                  className={control}
                  placeholder="Find item, reference or batch"
                  value={search}
                  onChange={change(setSearch)}
                />
                {!auditFilters && (
                  <>
                    <select
                      aria-label="Category"
                      className={control}
                      value={category}
                      onChange={change(setCategory)}
                    >
                      <option value="">All categories</option>
                      {[...categories].map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {!["replenishment", "transfers"].includes(tab) && (
                      <select
                        aria-label="Supplier"
                        className={control}
                        value={vendor}
                        onChange={change(setVendor)}
                      >
                        <option value="">All suppliers</option>
                        {[...vendors].map(([id, label]) => (
                          <option key={id} value={id}>
                            {label || "Supplier #" + id}
                          </option>
                        ))}
                      </select>
                    )}
                    <select
                      aria-label="Stock status"
                      className={control}
                      value={status}
                      onChange={change(setStatus)}
                    >
                      <option value="">All stock statuses</option>
                      {Object.entries(stockLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="ABC classification"
                      className={control}
                      value={abc}
                      onChange={change(setABC)}
                    >
                      <option value="">All ABC tiers</option>
                      {["A", "B", "C"].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </>
                )}
                {tab === "valuation" && (
                  <select
                    aria-label="Valuation method"
                    className={control}
                    value={method}
                    onChange={change(setMethod)}
                  >
                    {["WAC", "FIFO", "LIFO"].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">
                    {title}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      ({filtered.length})
                    </span>
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                    {tab === "movements" || tab === "audit"
                      ? "Records in the selected date range."
                      : "Stock position at " + data.to_date + "."}
                    {tab === "replenishment" &&
                      " Below the greater of minimum and safety quantities."}
                    {tab === "valuation" &&
                      " ABC uses known asset values within each currency. Missing costs stay unvalued. In-transit value is listed under Transfers."}
                    {tab === "expiry" &&
                      " Expired or unidentified batches are held from normal issue."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {data.can_write && tab === "transfers" && (
                    <button
                      className={control}
                      onClick={() => open("dispatch")}
                    >
                      Dispatch Goods
                    </button>
                  )}
                  {data.can_manage && tab === "movements" && (
                    <button className={control} onClick={() => open("adjust")}>
                      Stock adjustment
                    </button>
                  )}
                  <button className={control} onClick={() => open("schedule")}>
                    Email summaries
                  </button>
                  {["csv", "xlsx", "pdf"].map((format) => (
                    <button
                      key={format}
                      disabled={exporting || !filtered.length}
                      className={control + " disabled:opacity-40"}
                      onClick={() => exportRows(format)}
                    >
                      <Download size={13} className="mr-1 inline" />
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {!data.opening_confirmed && (
                <p
                  role="status"
                  className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                >
                  Opening stock is unconfirmed for this report date. Confirm it
                  under Requests & Documents → Stock.
                </p>
              )}
              {tab === "valuation" && (
                <div className="flex flex-wrap gap-3 text-xs">
                  {[...currencies].map(([id, label]) => {
                    const rows = filtered.filter(
                      (row) => String(row.currency_id) === id,
                    );
                    if (!rows.length) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800"
                      >
                        {label} ·{" "}
                        {rows.some((row) => row.value_minor == null)
                          ? "Total incomplete — cost review required"
                          : amount(
                              rows.reduce(
                                (sum, row) => sum + Number(row.value_minor),
                                0,
                              ),
                            )}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs dark:bg-gray-800">
                    <tr>
                      {fields.map((field) => (
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-2"
                          key={field.key}
                        >
                          {field.label}
                        </th>
                      ))}
                      <th scope="col" className="px-2 py-2">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {visible.map((row, index) => (
                      <tr
                        key={
                          row.id || row.item_id + ":" + row.currency_id || index
                        }
                      >
                        {fields.map((field) => (
                          <td
                            key={field.key}
                            className={
                              "px-2 py-2 " +
                              (field.key === "status" &&
                              ["low", "out"].includes(row.status)
                                ? "font-medium text-red-700 dark:text-red-300"
                                : "")
                            }
                          >
                            {field.value(row)}
                          </td>
                        ))}
                        <td className="px-2 py-2">
                          {(tab === "balances" || tab === "replenishment") &&
                            data.can_manage && (
                              <button
                                className={iconButton}
                                title="Set this location’s stock limits"
                                aria-label={"Set limits for " + row.name}
                                onClick={() => open("policy", row)}
                              >
                                <Pencil size={15} />
                              </button>
                            )}
                          {tab === "transfers" &&
                            Number(row.to_location_id) ===
                              Number(data.location.id) &&
                            Number(row.received_quantity) <
                              Number(row.quantity) &&
                            data.can_write && (
                              <button
                                className={iconButton}
                                title="Receive transfer"
                                aria-label={"Receive " + row.reference}
                                onClick={() => open("receive_transfer", row)}
                              >
                                <ArrowDownToLine size={15} />
                              </button>
                            )}
                          {tab === "expiry" && data.can_manage && (
                            <div className="flex gap-1">
                              <button
                                className={iconButton}
                                aria-label={
                                  "Correct batch for " + row.item_name
                                }
                                onClick={() => open("batch", row)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className={control}
                                onClick={() => open("adjust", row)}
                              >
                                Write off
                              </button>
                            </div>
                          )}
                          {tab === "valuation" &&
                            row.needs_cost_review &&
                            data.can_manage &&
                            (data.lots || [])
                              .filter(
                                (lot) =>
                                  String(lot.item_id) === String(row.item_id) &&
                                  lot.unit_cost_minor == null,
                              )
                              .map((lot) => (
                                <button
                                  key={lot.id}
                                  className={control}
                                  onClick={() => open("cost", lot)}
                                >
                                  Cost batch #{lot.id}
                                </button>
                              ))}
                          {tab === "audit" && (
                            <details>
                              <summary className="cursor-pointer text-xs text-blue-600 dark:text-blue-300">
                                Record
                              </summary>
                              <pre className="max-w-md whitespace-pre-wrap break-words text-xs">
                                {JSON.stringify(
                                  {
                                    ...JSON.parse(row.details),
                                    result: JSON.parse(row.result_json),
                                  },
                                  null,
                                  2,
                                )}
                              </pre>
                            </details>
                          )}
                          {tab === "balances" && (
                            <button
                              className="mt-1 block text-xs text-blue-600 dark:text-blue-300"
                              onClick={() => {
                                setSearch(row.name);
                                setParams({ view: "movements" });
                                setPage(0);
                              }}
                            >
                              Movements
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tab === "balances" && data.opening_confirmed && (
                <details className="rounded-lg border p-3 dark:border-gray-700">
                  <summary className="cursor-pointer text-sm font-medium">
                    Stock charts
                  </summary>
                  <div className="mt-3">
                    <StockReportCharts
                      allFlows
                      rows={filtered.map((row) => ({
                        ...row,
                        item_id: row.id,
                        item_name: row.name,
                        received_quantity: row.inflows,
                        issued_quantity: row.outflows,
                      }))}
                    />
                  </div>
                </details>
              )}
              {!filtered.length && (
                <p className="py-5 text-sm text-gray-500">
                  No matching records for this location and filters.
                </p>
              )}
              {filtered.length > 25 && (
                <nav
                  aria-label="Inventory table pages"
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>
                    {currentPage * 25 + 1}–
                    {Math.min(filtered.length, (currentPage + 1) * 25)} of{" "}
                    {filtered.length}
                  </span>
                  <div className="flex gap-1">
                    <button
                      className={control}
                      disabled={!currentPage}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className={control}
                      disabled={(currentPage + 1) * 25 >= filtered.length}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                </nav>
              )}
              {dialog && (
                <InventoryActionDialog
                  key={dialog.action + ":" + dialog.row?.id}
                  action={dialog.action}
                  row={dialog.row}
                  report={data}
                  onClose={() => setDialog(null)}
                  onSaved={query.refetch}
                />
              )}
            </>
          )
        )}
        {exporting && (
          <p role="status" className="text-sm">
            {data?.ready
              ? "Preparing export…"
              : "Preparing inventory tracking…"}
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
      </section>
    </>
  );
}
