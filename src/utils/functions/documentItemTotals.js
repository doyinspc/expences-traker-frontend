/**
 * Purpose: calculate document line totals using the saved approval decision and current price.
 *
 * Algorithm:
 * 1. Prefer total_price so approved price revisions use the latest saved line amount.
 * 2. Exclude rejected lines from both money totals while retaining them in the item count.
 * 3. Count an approved or resolved non-rejected line in the approved total.
 * 4. Ignore malformed money values so one bad row cannot corrupt the complete summary.
 *
 * The server remains authoritative for workflow decisions and financial postings.
 *
 * @param {Array<object>} rows Saved document line items.
 * @returns {{totalAmount:number,totalApproved:number,totalItems:number}} Display summary.
 */
export function documentItemTotals(rows) {
  let totalAmount = 0;
  let totalApproved = 0;
  let totalItems = 0;

  if (!Array.isArray(rows)) return { totalAmount, totalApproved, totalItems };

  rows.forEach((item) => {
    if (!item) return;
    const status = String(item.approval_status ?? item.status ?? '').toLowerCase();
    const rejected = Number(item.approval_status) === 2 || status === 'rejected';
    const amount = Number(item.total_price ?? item.total_amount ?? 0);
    if (!Number.isFinite(amount)) return;

    totalItems += 1;
    if (rejected) return;

    totalAmount += amount;
    if (
      Number(item.approved ?? item.is_approved) === 1 ||
      Number(item.approval_status) === 1 ||
      status === 'approved' ||
      Number(item.resolved) === 1
    ) {
      totalApproved += amount;
    }
  });

  return { totalAmount, totalApproved, totalItems };
}
