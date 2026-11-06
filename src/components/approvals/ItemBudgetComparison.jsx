import React from "react";

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Find this document line's budget mapping; never confuse its ID with the catalogue item ID. */
export function findItemBudget(comparison, lineId) {
  if (!comparison) return null;
  if (comparison.groups) {
    for (const group of comparison.groups) {
      const match = findItemBudget(group, lineId);
      if (match) return match;
    }
    return null;
  }
  const line = comparison.items?.find(
    (row) => String(row.line_id) === String(lineId),
  );
  return line ? { ...line, budget_name: comparison.name } : null;
}

/**
 * Purpose: restore the original item/category budget comparison at the point of review.
 * Algorithm: use the backend's authorised mapping of category_id + catalogue item_id,
 * located by document line ID. Keep item and category allocations separate. Show approved
 * allocation, actual net spending, balance and the projection including this document's
 * other unpaid items. While editing, adjust that projection by this line's proposed delta.
 * Missing allocations remain guidance; paid/rejected lines do not repeat budget checks.
 * Combined Procurement groups retain their source budgets and are never pooled together.
 */
export default function ItemBudgetComparison({
  comparison,
  item,
  proposedAmount,
  currency = "",
}) {
  if (
    !comparison ||
    Number(item?.resolved) === 1 ||
    Number(item?.approval_status) === 2
  )
    return null;
  const mapped = findItemBudget(comparison, item.id);
  if (!mapped)
    return (
      <p className="my-3 text-xs text-gray-500 dark:text-gray-400">
        {comparison.message ||
          "Per-item budget details are unavailable from the connected backend."}
      </p>
    );
  const delta =
    proposedAmount == null
      ? 0
      : Number(proposedAmount) - Number(mapped.current_amount);
  const scopes = [
    ["Item budget", mapped.item],
    ["Category budget", mapped.category],
  ].filter(([, scope]) => scope);
  return (
    <section
      aria-label="Item and category budget"
      className="my-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-xs dark:border-blue-900 dark:bg-blue-950/20"
    >
      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
        Budget · {mapped.budget_name}
      </h4>
      {!scopes.length ? (
        <p className="mt-2 text-amber-800 dark:text-amber-200">
          No approved allocation for this item or its category. You can still
          review it.
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {scopes.map(([label, scope]) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <p className="font-medium">{label}</p>
              <dl className="mt-2 space-y-1.5">
                {[
                  ["Approved allocation", scope.allocated],
                  ["Actual net spending", scope.spent],
                  ["Balance now", scope.balance],
                  ["After this request", Number(scope.after_request) - delta],
                ].map(([title, value]) => (
                  <div
                    key={title}
                    className="flex flex-wrap justify-between gap-x-3"
                  >
                    <dt className="text-gray-500 dark:text-gray-400">
                      {title}
                    </dt>
                    <dd
                      className={`font-medium tabular-nums ${title === "After this request" && Number(value) < 0 ? "text-red-700 dark:text-red-300" : ""}`}
                    >
                      {currency} {money(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Matched using the saved item and category. Other unpaid lines in this
        request are included; other pending requests are not reserved.
      </p>
    </section>
  );
}
