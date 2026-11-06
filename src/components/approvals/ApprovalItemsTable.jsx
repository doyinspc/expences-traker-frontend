import { approvalItemLabel } from "../../utils/functions/approvalItemLabel";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  X,
} from "lucide-react";

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const name = approvalItemLabel;
const quantity = (item, type) =>
  Number(type) === 2
    ? (item.procurement_quantity ?? item.quantity ?? "—")
    : (item.quantity ?? "—");
const status = (item) =>
  Number(item.approval_status) === 2
    ? "Rejected"
    : Number(item.approved ?? item.is_approved) === 1
      ? "Approved"
      : "Pending";
const iconButton =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-300";

/**
 * Purpose: let an approver scan a long document without loading every item's files.
 *
 * Algorithm:
 * 1. Filter saved items by readable name, category, account and optional review state.
 * 2. Display one page of compact rows, preserving the original item data and totals.
 * 3. Keep edit and disclosure icons together at the row's end. Clicking a row expands
 *    its details below all columns; clicking edit stops disclosure and selects that item.
 * 4. Mount details for only the selected visible row, so attachment requests/previews
 *    never run for the other 99 items. Changing a filter or page closes the disclosure.
 * 5. Keep search, page controls and disclosures keyboard accessible. On small screens,
 *    unit price and status move into expanded details rather than widening the viewport.
 *
 * This is a view over authorised data. The parent supplies the permitted edit callback
 * and full details renderer; this table never edits amounts or changes approval rights.
 */
export default function ApprovalItemsTable({
  items,
  documentType,
  heading = "Items",
  priceFree = false,
  onEditItem,
  renderDetails,
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [expandedId, setExpandedId] = useState(null);
  const filtered = items.filter((item) => {
    const match = [name(item), item.category_name, item.account_name]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return (
      match &&
      (filter === "all" ||
        (filter === "rejected"
          ? status(item) === "Rejected"
          : status(item) !== "Rejected" && Number(item.unit_price || 0) === 0))
    );
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages - 1);
  const start = currentPage * pageSize;
  const visible = filtered.slice(start, start + pageSize);
  const columns = priceFree ? 4 : 6;
  const changeView = (setter) => (value) => {
    setter(value);
    setPage(0);
    setExpandedId(null);
  };

  return (
    <section
      aria-label={heading}
      className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {heading}{" "}
            <span className="ml-1 font-normal text-gray-500">
              ({items.length})
            </span>
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Click a row for images and history
            {onEditItem ? " · Use the pencil to edit" : ""}.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <label className="relative block min-w-0 flex-1 sm:w-52">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-3 text-gray-400"
            />
            <span className="sr-only">Search items</span>
            <input
              type="search"
              value={search}
              onChange={(e) => changeView(setSearch)(e.target.value)}
              placeholder="Search items…"
              className="h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-transparent pl-8 pr-8 text-xs dark:border-gray-700 dark:text-white"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear item search"
                onClick={() => changeView(setSearch)("")}
                className="absolute right-1 top-0.5 flex size-8 items-center justify-center text-gray-500"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <label>
            <span className="sr-only">Filter items</span>
            <select
              value={filter}
              onChange={(e) => changeView(setFilter)(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="all">All items</option>
              {!priceFree && <option value="unpriced">Needs pricing</option>}
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
      </header>
      <div className="@container overflow-x-auto">
        <table className="w-full table-fixed text-left text-xs text-gray-700 dark:text-gray-300">
          <caption className="sr-only">
            {heading}. Expand a row to view its full details, attachments and
            audit history.
          </caption>
          <thead className="bg-gray-50 text-[11px] text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                Item / Description
              </th>
              <th
                scope="col"
                className="w-14 px-1 py-2 text-right font-medium sm:w-20"
              >
                Qty
              </th>
              {!priceFree && (
                <>
                  <th
                    scope="col"
                    className="hidden w-28 px-2 py-2 text-right font-medium @min-[600px]:table-cell"
                  >
                    Unit price
                  </th>
                  <th
                    scope="col"
                    className="w-24 px-2 py-2 text-right font-medium sm:w-32"
                  >
                    Line total
                  </th>
                </>
              )}
              <th
                scope="col"
                className="hidden w-24 px-2 py-2 font-medium @min-[740px]:table-cell"
              >
                Status
              </th>
              <th scope="col" className="w-20 py-2 pr-2 text-right font-medium">
                <span className="sr-only">Edit and expand</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {visible.map((item) => {
              const expanded = String(expandedId) === String(item.id);
              const detailId = `approval-item-detail-${item.id}`;
              const state = status(item);
              const toggle = () => setExpandedId(expanded ? null : item.id);
              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={toggle}
                    className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${expanded ? "bg-brand-50/50 dark:bg-brand-950/20" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <span
                        className="block truncate font-medium text-gray-900 dark:text-gray-100"
                        title={name(item)}
                      >
                        {name(item)}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {item.category_name ||
                          item.unit_of_measure ||
                          item.unit ||
                          "Item"}
                        {state === "Rejected" ? " · Rejected" : ""}
                      </span>
                    </td>
                    <td className="px-1 py-2 text-right tabular-nums">
                      {quantity(item, documentType)}
                    </td>
                    {!priceFree && (
                      <>
                        <td className="hidden px-2 py-2 text-right tabular-nums @min-[600px]:table-cell">
                          {money(item.unit_price)}
                        </td>
                        <td
                          className={`px-2 py-2 text-right font-medium tabular-nums ${state === "Rejected" ? "text-gray-400 line-through" : ""}`}
                        >
                          {money(item.total_price ?? item.amount)}
                        </td>
                      </>
                    )}
                    <td className="hidden px-2 py-2 @min-[740px]:table-cell">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${state === "Rejected" ? "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300" : state === "Approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"}`}
                      >
                        {state}
                      </span>
                    </td>
                    <td className="py-1 pr-2">
                      <div className="flex justify-end gap-0.5">
                        {onEditItem && (
                          <button
                            type="button"
                            title={
                              priceFree
                                ? `Edit quantity: ${name(item)}`
                                : `Edit quantity / price: ${name(item)}`
                            }
                            aria-label={
                              priceFree
                                ? `Edit quantity: ${name(item)}`
                                : `Edit quantity / price: ${name(item)}`
                            }
                            aria-haspopup="dialog"
                            onClick={(event) => {
                              event.stopPropagation();
                              onEditItem(item);
                            }}
                            className={iconButton}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          title={
                            expanded
                              ? "Hide item details"
                              : "Show images and item details"
                          }
                          aria-label={`${expanded ? "Hide" : "Show"} details: ${name(item)}`}
                          aria-expanded={expanded}
                          aria-controls={expanded ? detailId : undefined}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggle();
                          }}
                          className={iconButton}
                        >
                          <ChevronDown
                            size={16}
                            aria-hidden="true"
                            className={expanded ? "rotate-180" : ""}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td
                        colSpan={columns}
                        className="bg-gray-50/60 p-3 sm:p-4 dark:bg-gray-950/40"
                      >
                        <div
                          id={detailId}
                          aria-label={`Details: ${name(item)}`}
                        >
                          <h3 className="mb-3 break-words text-sm font-semibold text-gray-900 dark:text-white">
                            {name(item)}
                          </h3>
                          <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-3">
                            {[
                              [
                                Number(documentType) === 2
                                  ? "Account classification"
                                  : "Chart of account",
                                item.account_name ||
                                  (item.account_id
                                    ? `Account ${item.account_id}`
                                    : "Not assigned"),
                              ],
                              ["Category", item.category_name || "—"],
                              [
                                "Quantity",
                                `${quantity(item, documentType)} ${item.unit_of_measure || item.unit || ""}`,
                              ],
                              ...(!priceFree
                                ? [
                                    ["Unit price", money(item.unit_price)],
                                    [
                                      "Line total",
                                      money(item.total_price ?? item.amount),
                                    ],
                                    ...(Number(documentType) === 2
                                      ? []
                                      : [["Credit", money(item.credit_price)]]),
                                  ]
                                : []),
                              ["Approval", state],
                              [
                                "Fulfilled / Resolved",
                                Number(item.resolved) === 1 ? "Yes" : "No",
                              ],
                            ].map(([label, value]) => (
                              <div key={label} className="min-w-0">
                                <dt className="text-gray-500 dark:text-gray-400">
                                  {label}
                                </dt>
                                <dd className="mt-1 break-words font-medium">
                                  {value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                          {renderDetails?.(item)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {!visible.length && (
        <p className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {items.length
            ? "No items match your search."
            : "No line items recorded for this document."}
        </p>
      )}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <span>
          {filtered.length
            ? `${start + 1}–${Math.min(start + pageSize, filtered.length)}`
            : "0"}{" "}
          of {filtered.length} items
        </span>
        <div className="flex items-center gap-2">
          <label>
            Rows{" "}
            <select
              aria-label="Items per page"
              value={pageSize}
              onChange={(e) => changeView(setPageSize)(Number(e.target.value))}
              className="ml-1 rounded border border-gray-200 bg-transparent px-1 py-1 dark:border-gray-700"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
          <button
            type="button"
            aria-label="Previous item page"
            disabled={currentPage === 0}
            onClick={() => {
              setPage(currentPage - 1);
              setExpandedId(null);
            }}
            className={`${iconButton} disabled:opacity-30`}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {currentPage + 1} / {pages}
          </span>
          <button
            type="button"
            aria-label="Next item page"
            disabled={currentPage >= pages - 1}
            onClick={() => {
              setPage(currentPage + 1);
              setExpandedId(null);
            }}
            className={`${iconButton} disabled:opacity-30`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </section>
  );
}
