import BudgetComparison from './BudgetComparison';
import React, { useEffect, useRef, useState } from 'react';

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
const title = (item) =>
  item.item_name || item.name || item.description || `Item #${item.id}`;
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
export function revisionPreview(item, change, price, type, proposedQuantity) {
  if (!item) return null;
  const rejected = Number(item.approval_status) === 2,
    before = rejected ? 0 : Number(item.total_price || 0);
  const oldQuantity = Number(
    Number(type) === 2 && item.procurement_quantity != null
      ? item.procurement_quantity
      : item.quantity,
  );
  let quantity = oldQuantity,
    after = Number(item.total_price || 0);
  if (change === 'reject') after = 0;
  if (['quantity', 'terms'].includes(change)) {
    if (!/^[1-9][0-9]{0,8}$/.test(String(proposedQuantity))) return null;
    quantity = Number(proposedQuantity);
  }
  if (['price', 'quantity', 'terms'].includes(change)) {
    const unit =
      change === 'quantity' ? String(item.unit_price ?? '') : String(price);
    if (!/^\d{1,13}(?:\.\d{1,2})?$/.test(unit)) return null;
    after = (Math.round(Number(unit) * 100) * Math.max(1, quantity)) / 100;
  }
  return {
    before,
    after,
    increases: after > before || quantity > oldQuantity,
    quantity,
    oldQuantity,
  };
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
export default function ItemRevisionPanel({
  workflow,
  onSave,
  isLoading = false,
  editRequest = null,
}) {
  const canEdit = workflow.permissions?.can_revise_items;
  const supportsQuantity = Boolean(workflow.item_edit_capabilities?.quantity);
  const firstUnpriced =
    canEdit && Number(workflow.document_type_id) === 2
      ? (workflow.document_items || []).find(
          (row) =>
            Number(row.approval_status) !== 2 &&
            Number(row.unit_price || 0) === 0,
        )
      : null;
  const effectiveQuantity = (row) =>
    String(
      Number(workflow.document_type_id) === 2 &&
        row?.procurement_quantity != null
        ? row.procurement_quantity
        : (row?.quantity ?? ''),
    );
  const allocationValues = (row) =>
    Object.fromEntries(
      (row?.request_allocations || []).map((allocation) => [
        allocation.request_item_id,
        String(allocation.quantity),
      ]),
    );
  const [quantity, setQuantity] = useState(() =>
    effectiveQuantity(firstUnpriced),
  );
  const [accountId, setAccountId] = useState(() =>
    String(firstUnpriced?.account_id || ''),
  );
  const [allocations, setAllocations] = useState(() =>
    allocationValues(firstUnpriced),
  );
  const [reviewOpen, setReviewOpen] = useState(Boolean(firstUnpriced)),
    [editorOpen, setEditorOpen] = useState(Boolean(firstUnpriced));
  const panel = useRef(null),
    lastRequest = useRef(null);
  useEffect(() => {
    if (!canEdit || !editRequest || lastRequest.current === editRequest) return;
    const line = (workflow.document_items || []).find(
      (row) => Number(row.id) === Number(editRequest.itemId),
    );
    if (!line || Number(line.approval_status) === 2) return;
    lastRequest.current = editRequest;
    setItemId(String(line.id));
    setChange(supportsQuantity ? 'terms' : 'price');
    setPrice(Number(line.unit_price) > 0 ? String(line.unit_price) : '');
    setQuantity(
      String(
        Number(workflow.document_type_id) === 2 &&
          line.procurement_quantity != null
          ? line.procurement_quantity
          : (line.quantity ?? ''),
      ),
    );
    setAccountId(String(line.account_id || ''));
    setAllocations(
      Object.fromEntries(
        (line.request_allocations || []).map((row) => [
          row.request_item_id,
          String(row.quantity),
        ]),
      ),
    );
    setReviewOpen(true);
    setEditorOpen(true);
    setError('');
    globalThis.requestAnimationFrame?.(() => {
      panel.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panel.current?.querySelector('[name="approval-quantity"]')?.focus();
    });
  }, [
    editRequest,
    canEdit,
    workflow.document_items,
    workflow.document_type_id,
    supportsQuantity,
  ]);
  const [itemId, setItemId] = useState(() =>
      firstUnpriced ? String(firstUnpriced.id) : '',
    ),
    [change, setChange] = useState(supportsQuantity ? 'terms' : 'price'),
    [price, setPrice] = useState(''),
    [reason, setReason] = useState(''),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  if (![2, 3, 9].includes(Number(workflow.document_type_id))) return null;
  const revisions = workflow.item_revisions;
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
  const action = rejected
    ? 'restore'
    : change === 'restore'
      ? supportsQuantity
        ? 'terms'
        : 'price'
      : change;
  const preview = revisionPreview(
      item,
      action,
      price,
      workflow.document_type_id,
      quantity,
    ),
    currency = workflow.document_data?.currency_code || '';
  const currentTotal = Number(
      workflow.document_data?.amount ??
        workflow.document_data?.total_amount ??
        0,
    ),
    newTotal = preview
      ? currentTotal - preview.before + preview.after
      : currentTotal;
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
      setError(
        'Choose an item, enter a valid price if needed, and explain the change.',
      );
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      await onSave({
        item_id: itemId,
        change: action,
        unit_price: price,
        reason: reason.trim(),
        ...(['quantity', 'terms'].includes(action) ? { quantity } : {}),
        ...(action === 'terms' && accountId
          ? { account_id: Number(accountId) }
          : {}),
        ...(action === 'terms' && item.request_allocations?.length
          ? {
              request_allocations: Object.entries(allocations).map(
                ([request_item_id, quantity]) => ({
                  request_item_id: Number(request_item_id),
                  quantity: Number(quantity),
                }),
              ),
            }
          : {}),
      });
      setReason('');
      setPrice('');
      setItemId('');
    } catch (failure) {
      setError(
        failure.response?.data?.message ||
          failure.message ||
          'The item change could not be saved.',
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };
  return (
    <section
      ref={panel}
      aria-label="Item adjustments and history"
      className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <details
        open={reviewOpen}
        onToggle={(event) => setReviewOpen(event.currentTarget.open)}
      >
        <summary className="flex min-h-10 cursor-pointer flex-wrap items-center justify-between gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <span>
            {Number(workflow.document_type_id) === 2
              ? 'Purchase Order · quantities, prices and budget'
              : 'Item review · quantities, prices and history'}
          </span>
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
            {!supportsQuantity && canEdit && (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                Unit prices can be updated here. Quantity and account edits
                become available after the matching backend update.
              </p>
            )}
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Item adjustments and history
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Changes keep the previous values, reason and approver. Rejected
              items stay visible and are excluded from the payable total.
              Recorded payments remain in the financial history.
            </p>
          </div>
          <BudgetComparison
            comparison={workflow.budget_comparison}
            currency={currency}
          />
          {revisions?.reapproval && (
            <p
              role="status"
              className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            >
              Reapproval required. Item quantities, amounts or classification
              changed. The request has returned to earlier approval steps;
              further payments are paused until the review is complete.
            </p>
          )}
          {Number(workflow.cash_movements?.refund_due) > 0 && (
            <p
              role="status"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              Money due for return: {currency}{' '}
              {money(workflow.cash_movements.refund_due)}. Record the actual
              return in Payments and money returned before approving or making
              further payments.
            </p>
          )}
          {canEdit && (
            <details
              open={editorOpen}
              onToggle={(event) => setEditorOpen(event.currentTarget.open)}
            >
              <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-brand-600 dark:text-brand-300">
                Edit quantity / price or reject an item
              </summary>
              <form onSubmit={submit} aria-busy={busy} className="space-y-3">
                <fieldset
                  disabled={busy}
                  className="space-y-3 disabled:opacity-60"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">
                      Item *
                      <select
                        required
                        className={control}
                        value={itemId}
                        onChange={(event) => {
                          setItemId(event.target.value);
                          const line = items.find(
                            (row) => String(row.id) === event.target.value,
                          );
                          setPrice(
                            Number(line?.unit_price) > 0
                              ? String(line.unit_price)
                              : '',
                          );
                          setQuantity(effectiveQuantity(line));
                          setAccountId(String(line?.account_id || ''));
                          setAllocations(allocationValues(line));
                          setError('');
                        }}
                      >
                        <option value="">Choose item</option>
                        {items.map((row) => (
                          <option key={row.id} value={row.id}>
                            {title(row)}
                            {Number(row.approval_status) === 2
                              ? ' · Rejected'
                              : ''}
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
                            {supportsQuantity && (
                              <option value="terms">
                                Edit quantity and unit price
                              </option>
                            )}
                            <option value="price">
                              Adjust unit price / service amount
                            </option>
                            {supportsQuantity && (
                              <option value="quantity">
                                Adjust quantity only
                              </option>
                            )}
                            <option value="reject">Reject this item</option>
                          </>
                        )}
                      </select>
                    </label>
                  </div>
                  {item && ['quantity', 'terms'].includes(action) && (
                    <label className="block text-sm">
                      Quantity * (
                      {item.unit_of_measure || item.unit || 'saved item unit'})
                      <input
                        name="approval-quantity"
                        required
                        type="number"
                        min="1"
                        max="999999999"
                        step="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        className={control}
                      />
                      <span className="mt-1 block text-xs text-gray-500">
                        Current quantity: {effectiveQuantity(item)}. Original
                        requisition quantities stay separate from purchased
                        quantities.
                      </span>
                    </label>
                  )}
                  {item && action === 'terms' && (
                    <label className="block text-sm">
                      Account classification *
                      <select
                        className={control}
                        required
                        value={accountId}
                        disabled={Boolean(workflow.finance?.disbursement)}
                        onChange={(event) => setAccountId(event.target.value)}
                      >
                        <option value="">Choose account classification</option>
                        {!(workflow.account_options || []).some(
                          (option) => String(option.id) === accountId,
                        ) &&
                          accountId && (
                            <option value={accountId}>
                              {item.account_name || `Account #${accountId}`}
                            </option>
                          )}
                        {(workflow.account_options || []).map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.code ? `${option.code} · ` : ''}
                            {option.name}
                          </option>
                        ))}
                      </select>
                      <span className="mt-1 block text-xs text-gray-500">
                        Classifies this cost for accounting and budget
                        reporting. A recorded payment locks the account.
                      </span>
                    </label>
                  )}
                  {item &&
                    action === 'terms' &&
                    item.request_allocations?.length > 0 && (
                      <fieldset className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                        <legend className="px-1 text-xs font-medium">
                          Quantities assigned to requisitions
                        </legend>
                        <p className="mb-2 text-xs text-gray-500">
                          If you reduce the order, choose which request
                          quantities remain. Released quantities become
                          available for another Purchase Order.
                        </p>
                        {item.request_allocations.map((source) => (
                          <label
                            key={source.request_item_id}
                            className="mt-2 flex items-center gap-3 text-xs"
                          >
                            <span className="flex-1">
                              REQ-{source.requisition_id} ·{' '}
                              {source.request_title}
                            </span>
                            <input
                              aria-label={`Quantity for REQ-${source.requisition_id}`}
                              type="number"
                              min="0"
                              max={source.available_quantity ?? source.quantity}
                              step="1"
                              value={allocations[source.request_item_id] ?? ''}
                              onChange={(event) =>
                                setAllocations((previous) => ({
                                  ...previous,
                                  [source.request_item_id]: event.target.value,
                                }))
                              }
                              className={`${control} max-w-24`}
                            />
                          </label>
                        ))}
                      </fieldset>
                    )}
                  {item && ['price', 'terms'].includes(action) && (
                    <label className="block text-sm">
                      Unit price / service amount *
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        className={control}
                        name="approval-unit-price"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                      />
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        Current unit price: {money(item.unit_price)}. Saved
                        quantity:{' '}
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
                        Document total: {currency} {money(currentTotal)} →{' '}
                        {money(newTotal)}
                      </p>
                      <p className="mt-2 text-xs leading-5">
                        {preview.increases
                          ? 'Any earlier approval steps must approve this revision again before further payment.'
                          : 'Earlier approvers and the submitter will be notified. The remaining workflow continues.'}
                      </p>
                    </div>
                  )}
                  <label className="block text-sm">
                    {Number(workflow.document_type_id) === 2
                      ? 'Reason / quotation reference *'
                      : 'Reason *'}
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
                  {preview &&
                    workflow.budget_comparison?.after_request != null && (
                      <p className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-950/30">
                        Budget balance after this change:{' '}
                        <strong>
                          {currency}{' '}
                          {money(
                            Number(workflow.budget_comparison.after_request) -
                              (newTotal - currentTotal),
                          )}
                        </strong>
                      </p>
                    )}
                  {error && (
                    <p
                      role="alert"
                      className="text-sm text-red-700 dark:text-red-300"
                    >
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
              Only the current approver can revise an open request. Completed
              approval items are locked.
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
                          quantity: 'Quantity adjusted',
                          terms: 'Quantity / price adjusted',
                          reject: 'Item rejected',
                          restore: 'Item restored',
                        }[event.change]
                      }
                    </p>
                    <p className="mt-1">
                      Item:{' '}
                      {money(
                        event.before.rejected ? 0 : event.before.total_price,
                      )}{' '}
                      →{' '}
                      {money(
                        event.after.rejected ? 0 : event.after.total_price,
                      )}{' '}
                      · Document: {money(event.old_total)} →{' '}
                      {money(event.new_total)}
                    </p>
                    <p className="mt-1">
                      Quantity:{' '}
                      {event.before.procurement_quantity ??
                        event.before.quantity ??
                        'Not recorded'}{' '}
                      →{' '}
                      {event.after.procurement_quantity ??
                        event.after.quantity ??
                        'Not recorded'}
                    </p>
                    {event.account_change && (
                      <p className="mt-1">
                        Account: {event.account_change.before.name} →{' '}
                        {event.account_change.after.name}
                      </p>
                    )}
                    <p className="mt-2 whitespace-pre-wrap break-words">
                      {event.reason}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {event.actor_name} · {event.role_name} · {event.at}
                      {event.reapproval_required
                        ? ' · Returned for reapproval'
                        : ''}
                    </p>
                  </li>
                ))}
              </ol>
            </details>
          )}
          {revisions?.approvals?.length > 0 && (
            <details>
              <summary className="min-h-10 cursor-pointer text-sm font-medium">
                Approval amounts and captured baselines (
                {revisions.approvals.length})
              </summary>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                {revisions.approvals.map((approval, index) => {
                  const step = (workflow.steps || []).find(
                    (row) => Number(row.id) === Number(approval.step_id),
                  );
                  return (
                    <li key={index}>
                      {step?.role_name || `Step ${approval.step_id}`} ·{' '}
                      {approval.actor_name || `User #${approval.by}`} ·{' '}
                      {approval.at} · {currency} {money(approval.total)} ·
                      Revision {approval.revision}
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
