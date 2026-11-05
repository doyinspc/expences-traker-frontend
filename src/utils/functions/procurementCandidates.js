/**
 * Purpose: present the server's outstanding demand without reintroducing resolved rows.
 * Algorithm: accept only rows explicitly scoped by the new API to this procurement;
 * reject allocations, rejected/unapproved/fulfilled lines and invalid quantities; then
 * subtract recorded issues from requested quantity. Keep the original quantity intact.
 * This is a display safeguard; the server repeats the authoritative check when adding.
 */
export function procurementCandidates(rows, procurementId) {
  if (!Array.isArray(rows) || Number(procurementId) < 1) return [];
  return rows.flatMap((row) => {
    if (
      !row ||
      Number(row.procurement_candidate_for) !== Number(procurementId) ||
      Number(row.approved) !== 1 ||
      Number(row.approval_status) === 2 ||
      Number(row.resolved) === 1 ||
      Number(row.purchaseorder_id) > 0
    )
      return [];
    const requested = Number(row.quantity);
    const issued = Number(row.stock_issued_quantity ?? 0);
    const remaining = requested - issued;
    if (
      !Number.isSafeInteger(requested) ||
      !Number.isSafeInteger(issued) ||
      issued < 0 ||
      remaining <= 0
    )
      return [];
    return [{ ...row, remaining_quantity: remaining }];
  });
}
