import React, { useRef, useState } from 'react';

const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const control =
  'mt-1 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
const title = (item) => item.item_name || item.name || item.description || `Item #${item.id}`;
/** Preview the effective payable amount; the server validates and commits exact cents. */
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
 * Compact, optional review tools inside the existing approval layout.
 * Server permissions control editing; a successful save refreshes the workflow version,
 * totals and owner. History remains available to viewers after editing is locked.
 */
export default function ItemRevisionPanel({ workflow, onSave, isLoading = false }) {
  const [itemId, setItemId] = useState(''),
    [change, setChange] = useState('price'),
    [price, setPrice] = useState(''),
    [reason, setReason] = useState(''),
    [error, setError] = useState(''),
    [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  if (![2, 3].includes(Number(workflow.document_type_id))) return null;
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
          {workflow.budget_comparison && (
            <details className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <summary className="flex min-h-10 cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                <span>
                  Budget check
                  {workflow.budget_comparison.name ? ` · ${workflow.budget_comparison.name}` : ''}
                </span>
                {workflow.budget_comparison.after_request != null && (
                  <span
                    className={
                      Number(workflow.budget_comparison.after_request) < 0
                        ? 'text-red-700 dark:text-red-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }
                  >
                    {workflow.budget_comparison.unbudgeted_items?.length
                      ? 'Review unbudgeted items'
                      : Number(workflow.budget_comparison.after_request) < 0
                        ? 'Over budget'
                        : 'Within overall budget'}
                  </span>
                )}
              </summary>
              {workflow.budget_comparison.message ? (
                <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                  {workflow.budget_comparison.message}
                </p>
              ) : (
                <>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    {[
                      ['Approved budget', workflow.budget_comparison.allocated],
                      ['Actual net spending', workflow.budget_comparison.spent],
                      ['Budget balance now', workflow.budget_comparison.balance],
                      ['This request: unpaid', workflow.budget_comparison.request_unpaid],
                      ['Balance after remaining payment', workflow.budget_comparison.after_request],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
                        <dd className="mt-1 font-medium tabular-nums">
                          {currency} {money(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {workflow.budget_comparison.unbudgeted_items?.length > 0 && (
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                      No approved allocation for these items or their categories:{' '}
                      {workflow.budget_comparison.unbudgeted_items.join(', ')}. This is guidance; it
                      does not block your decision.
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
                    {workflow.budget_comparison.start_date} to {workflow.budget_comparison.end_date}
                    . Actual spending already includes payments for this request, less recorded
                    returns. The projection adds only its unpaid amount. Other pending requests are
                    not reserved here.
                  </p>
                </>
              )}
            </details>
          )}
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
