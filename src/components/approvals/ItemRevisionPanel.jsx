import BudgetComparison from './BudgetComparison';
import React, { useRef, useState } from 'react';

/**
 * Purpose: format a review amount for display using the reader's locale.
 *
 * Algorithm: coerce an absent display value to zero, then request exactly two fractional
 * digits from toLocaleString(). This is presentation only; the server uses integer cents
 * for validation, workflow limits, payments and refunds.
 */
const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const control =
  'mt-1 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
/**
 * Purpose: give item controls a readable label without requiring another lookup.
 *
 * Algorithm: prefer the supplied item name, then stored name/description, and finally an
 * explicit Item #ID fallback. Return text; React performs the HTML escaping when displayed.
 */
const title = (item) => item.item_name || item.name || item.description || `Item #${item.id}`;
/**
 * Purpose: preview the effective item amount before a reasoned change is submitted.
 *
 * Algorithm:
 * 1. Return null without a selected item; treat a rejected item's current payable value as zero.
 * 2. For rejection preview zero; for restoration recover the saved original line amount.
 * 3. For a price edit, reject unsupported decimal syntax before calculating the display value.
 * 4. Use procurement_quantity when the procurement funds only a remainder; otherwise use
 *    saved quantity. Treat a quantity-free service as one amount without changing its units.
 * 5. Return before, after and whether this individual item increased, so the user sees the
 *    projected total and earlier-approval consequence before saving.
 *
 * The preview never mutates an item or authorises payment. The server rechecks exact cents,
 * document membership, permissions, workflow limits and expected version in its transaction.
 *
 * @param {object} item Selected saved item and decision state.
 * @param {'price'|'reject'|'restore'} change Requested type of adjustment.
 * @param {string} price Proposed unit price for a price adjustment.
 * @param {number|string} type Parent document type; 2 denotes procurement.
 * @returns {{before:number, after:number, increases:boolean}|null} Display preview or invalid input.
 */
export function revisionPreview(item, change, price, type) {
  if (!item) return null;
  const rejected = Number(item.approval_status) === 2,
    before = rejected ? 0 : Number(item.total_price || 0);
  let after = Number(item.total_price || 0);
  if (change === 'reject') after = 0;
  if (change === 'price') {
    if (!/^\d{1,13}(?:\.\d{1,2})?$/.test(price)) return null;
    const quantity = Number(
      Number(type) === 2 && item.procurement_quantity != null
        ? item.procurement_quantity
        : item.quantity,
    );
    after = (Math.round(Number(price) * 100) * Math.max(1, quantity)) / 100;
  }
  return { before, after, increases: after > before };
}
/**
 * Purpose: add compact, auditable item-review tools inside the existing approval layout.
 *
 * Render/action algorithm:
 * 1. Initialise only local form/saving state; do not alter the supplied workflow or its items.
 * 2. Render only for procurement/cash advance when the server supplies edit rights, history
 *    or applicable budget guidance. Completed/view-only requests never gain an edit form.
 * 3. Keep the outer review row collapsed by default, with concise visible badges for
 *    reapproval/payment pause or money due for return, preserving the compact page.
 * 4. Derive the selected item's allowed action. A rejected item must be restored before its
 *    price can be changed; calculate before/after values and the proposed document total.
 * 5. Present optional pre-payment budget guidance without inventing missing allocations or
 *    making budget setup a new approval restriction. Paid items no longer repeat this check.
 * 6. Submit only a reasoned proposed change through onSave. The owning page supplies the
 *    live expected_version and refreshes totals, history, permissions and current ownership.
 * 7. Keep individual revisions and approval snapshots available in expandable history.
 *    Label older recovered baselines instead of claiming a historical price was captured then.
 *
 * All access and financial restrictions are server-enforced. This component cannot close
 * approval, overwrite saved cash, edit quantities/accounts or silently send a bank payment.
 *
 * @param {object} props.workflow Authorised server detail, items, capabilities and revision history.
 * @param {Function} props.onSave Async mutation supplied by the approval detail coordinator.
 * @param {boolean} props.isLoading Whether an external save is already in progress.
 * @returns {React.ReactNode} One compact review section or null when not applicable.
 */
export default function ItemRevisionPanel({ workflow, onSave, isLoading = false }) {
  const [itemId, setItemId] = useState(''),
    [change, setChange] = useState('price'),
    [price, setPrice] = useState(''),
    [reason, setReason] = useState(''),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  if (![2, 3, 9].includes(Number(workflow.document_type_id))) return null;
  const revisions = workflow.item_revisions,
    canEdit = workflow.permissions?.can_revise_items;
  if (
    !canEdit &&
    !revisions?.history?.length &&
    !revisions?.approvals?.length &&
    !workflow.budget_comparison
  )
    return null;
  const items = workflow.document_items || [],
    item = items.find((row) => String(row.id) === itemId),
    rejected = Number(item?.approval_status) === 2;
  const action = rejected ? 'restore' : change === 'restore' ? 'price' : change;
  const preview = revisionPreview(item, action, price, workflow.document_type_id),
    currency = workflow.document_data?.currency_code || '';
  const currentTotal = Number(
      workflow.document_data?.amount ?? workflow.document_data?.total_amount ?? 0,
    ),
    newTotal = preview ? currentTotal - preview.before + preview.after : currentTotal;
  const busy = saving || isLoading;
  /**
   * Purpose: send one complete item adjustment while preventing repeated UI submissions.
   *
   * Algorithm:
   * 1. Prevent native form navigation and return while a save is already active.
   * 2. Require an item, valid preview and non-empty reason; leave the form open on failure.
   * 3. Set the synchronous ref guard and rendered saving state, then await onSave with only
   *    item ID, change type, proposed unit price and trimmed reason.
   * 4. Clear the local selection/reason only after success; otherwise show the server's error.
   * 5. Release both saving guards in finally, allowing a retry after a refused/stale action.
   *
   * The parent mutation adds the workflow/version. A browser preview is never trusted as
   * the saved document total or as permission to bypass earlier approval.
   */
  const submit = async (event) => {
    event.preventDefault();
    if (submitting.current || isLoading) return;
    setError('');
    if (!item || !preview || !reason.trim()) {
      setError('Choose an item, enter a valid price if needed, and explain the change.');
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      await onSave({ item_id: itemId, change: action, unit_price: price, reason: reason.trim() });
      setReason('');
      setPrice('');
      setItemId('');
    } catch (failure) {
      setError(
        failure.response?.data?.message || failure.message || 'The item change could not be saved.',
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return (
    <section
      aria-label="Item adjustments and history"
      className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <details>
        <summary className="flex min-h-10 cursor-pointer flex-wrap items-center justify-between gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <span>Item review · prices, decisions and history</span>
          {revisions?.reapproval && (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Reapproval needed · payments paused
            </span>
          )}
          {Number(workflow.cash_movements?.refund_due) > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-900 dark:bg-red-950 dark:text-red-200">
              Return due: {currency} {money(workflow.cash_movements.refund_due)}
            </span>
          )}
        </summary>
        <div className="mt-3 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Item adjustments and history
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Changes keep the previous values, reason and approver. Rejected items stay visible and
              are excluded from the payable total. Recorded payments remain in the financial
              history.
            </p>
          </div>
          <BudgetComparison comparison={workflow.budget_comparison} currency={currency}/>
          {revisions?.reapproval && (
            <p
              role="status"
              className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            >
              Reapproval required. An item amount increased. The request has returned to earlier
              approval steps; further payments are paused until the review is complete.
            </p>
          )}
          {Number(workflow.cash_movements?.refund_due) > 0 && (
            <p
              role="status"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              Money due for return: {currency} {money(workflow.cash_movements.refund_due)}. Record
              the actual return in Payments and money returned before approving or making further
              payments.
            </p>
          )}
          {canEdit && (
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-brand-600 dark:text-brand-300">
                Adjust price or reject an item
              </summary>
              <form onSubmit={submit} aria-busy={busy} className="space-y-3">
                <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      Item *
                      <select
                        required
                        className={control}
                        value={itemId}
                        onChange={(event) => {
                          setItemId(event.target.value);
                          setPrice('');
                          setError('');
                        }}
                      >
                        <option value="">Choose item</option>
                        {items.map((row) => (
                          <option key={row.id} value={row.id}>
                            {title(row)}
                            {Number(row.approval_status) === 2 ? ' · Rejected' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      Change *
                      <select
                        className={control}
                        value={action}
                        onChange={(event) => {
                          setChange(event.target.value);
                          setError('');
                        }}
                      >
                        {rejected ? (
                          <option value="restore">Restore rejected item</option>
                        ) : (
                          <>
                            <option value="price">Adjust unit price / service amount</option>
                            <option value="reject">Reject this item</option>
                          </>
                        )}
                      </select>
                    </label>
                  </div>
                  {item && action === 'price' && (
                    <label className="block text-sm">
                      New unit price / service amount *
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        className={control}
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                      />
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        Current unit price: {money(item.unit_price)}. Saved quantity:{' '}
                        {Number(workflow.document_type_id) === 2 &&
                        item.procurement_quantity != null
                          ? item.procurement_quantity
                          : item.quantity}
                        . Quantities and account links remain unchanged.
                      </span>
                    </label>
                  )}
                  {preview && (
                    <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
                      <p>
                        Item: {money(preview.before)} → {money(preview.after)}
                      </p>
                      <p className="mt-1 font-medium">
                        Document total: {currency} {money(currentTotal)} → {money(newTotal)}
                      </p>
                      <p className="mt-2 text-xs leading-5">
                        {preview.increases
                          ? 'Any earlier approval steps must approve this revision again before further payment.'
                          : 'Earlier approvers and the submitter will be notified. The remaining workflow continues.'}
                      </p>
                    </div>
                  )}
                  <label className="block text-sm">
                    Reason *
                    <textarea
                      required
                      maxLength={2000}
                      rows={3}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className={control}
                      placeholder="Explain the quotation change, rejection or restoration."
                    />
                  </label>
                  {error && (
                    <p role="alert" className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </p>
                  )}
                  <button
                    disabled={busy || !preview}
                    className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy ? 'Saving change…' : 'Save change and notify'}
                  </button>
                </fieldset>
              </form>
            </details>
          )}
          {!canEdit && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only the current approver can revise an open request. Completed approval items are
              locked.
            </p>
          )}
          {revisions?.history?.length > 0 && (
            <details>
              <summary className="min-h-10 cursor-pointer text-sm font-medium text-gray-900 dark:text-white">
                Item change history ({revisions.history.length})
              </summary>
              <ol className="mt-3 space-y-3">
                {revisions.history.map((event) => (
                  <li
                    key={event.revision}
                    className="rounded-lg border border-gray-100 p-3 text-sm dark:border-gray-800"
                  >
                    <p className="font-medium">
                      Revision {event.revision} · {event.item_name} ·{' '}
                      {
                        {
                          price: 'Price adjusted',
                          reject: 'Item rejected',
                          restore: 'Item restored',
                        }[event.change]
                      }
                    </p>
                    <p className="mt-1">
                      Item: {money(event.before.rejected ? 0 : event.before.total_price)} →{' '}
                      {money(event.after.rejected ? 0 : event.after.total_price)} · Document:{' '}
                      {money(event.old_total)} → {money(event.new_total)}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words">{event.reason}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {event.actor_name} · {event.role_name} · {event.at}
                      {event.reapproval_required ? ' · Returned for reapproval' : ''}
                    </p>
                  </li>
                ))}
              </ol>
            </details>
          )}
          {revisions?.approvals?.length > 0 && (
            <details>
              <summary className="min-h-10 cursor-pointer text-sm font-medium">
                Approval amounts and captured baselines ({revisions.approvals.length})
              </summary>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {revisions.approvals.map((approval, index) => {
                  const step = (workflow.steps || []).find(
                    (row) => Number(row.id) === Number(approval.step_id),
                  );
                  return (
                    <li key={index}>
                      {step?.role_name || `Step ${approval.step_id}`} ·{' '}
                      {approval.actor_name || `User #${approval.by}`} · {approval.at} · {currency}{' '}
                      {money(approval.total)} · Revision {approval.revision}
                      {approval.captured_from_existing_approval
                        ? ' · Baseline captured before the first tracked change'
                        : ''}
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
        </div>
      </details>
    </section>
  );
}
