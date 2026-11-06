import React from 'react';
const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Keep source budgets separate when one Procurement combines several Purchase Orders. */
export default function BudgetComparison({ comparison, currency = '' }) {
  if (!comparison) return null;
  if (comparison.groups)
    return (
      <details className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <summary className="min-h-10 cursor-pointer text-sm font-medium">
          Budget check · source Purchase Orders
        </summary>
        <div className="mt-2 space-y-3">
          {comparison.groups.map((group, index) => (
            <BudgetComparison
              key={`${group.name || 'unassigned'}-${index}`}
              comparison={group}
              currency={currency}
            />
          ))}
        </div>
      </details>
    );
  return (
    <details className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <summary className="flex min-h-10 cursor-pointer flex-wrap items-center justify-between gap-2 text-sm font-medium">
        <span>
          Budget check{comparison.name ? ` · ${comparison.name}` : ''}
        </span>
        {comparison.after_request != null && (
          <span
            className={
              Number(comparison.after_request) < 0
                ? 'text-red-700 dark:text-red-300'
                : 'text-emerald-700 dark:text-emerald-300'
            }
          >
            {comparison.unbudgeted_items?.length
              ? 'Review unbudgeted items'
              : Number(comparison.after_request) < 0
                ? 'Over budget'
                : 'Within overall budget'}
          </span>
        )}
      </summary>
      {comparison.message ? (
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          {comparison.message}
        </p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              ['Approved budget', comparison.allocated],
              ['Actual net spending', comparison.spent],
              ['Budget balance now', comparison.balance],
              ['This request: unpaid', comparison.request_unpaid],
              ['Balance after remaining payment', comparison.after_request],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-gray-500 dark:text-gray-400">
                  {label}
                </dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {currency} {money(value)}
                </dd>
              </div>
            ))}
          </dl>
          {comparison.unbudgeted_items?.length > 0 && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              No approved allocation for these items or their categories:{' '}
              {comparison.unbudgeted_items.join(', ')}. This is guidance; it
              does not block your decision.
            </p>
          )}
          <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
            {comparison.start_date} to {comparison.end_date}. Actual spending
            includes recorded payments less returns. The projection adds only
            the unpaid amount. Other pending requests are not reserved here.
          </p>
        </>
      )}
    </details>
  );
}
