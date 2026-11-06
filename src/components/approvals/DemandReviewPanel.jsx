import React, { useState } from 'react';

/**
 * Purpose: review price-free requisition demand without presenting a price editor.
 * Algorithm: offer rejection or restoration for the selected line with a required reason;
 * submit through the existing version-bound amendment operation. The server checks the
 * current role and locks completed workflows. Restoration returns to earlier approvers
 * when necessary. History stays collapsed and records actor, time and reason.
 */
export default function DemandReviewPanel({ workflow, onSave, isLoading }) {
  const [itemId, setItemId] = useState(''),
    [reason, setReason] = useState(''),
    [error, setError] = useState('');
  const item = workflow.document_items?.find(
    (line) => String(line.id) === itemId,
  );
  const history = workflow.item_revisions?.history || [];
  if (!workflow.permissions?.can_revise_items && !history.length) return null;
  return (
    <details className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <summary className="min-h-10 cursor-pointer text-sm font-semibold">
        Review requested items · decisions and history
      </summary>
      {workflow.permissions?.can_revise_items && (
        <form
          className="mt-3 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!item || !reason.trim() || isLoading) return;
            try {
              await onSave({
                item_id: item.id,
                change:
                  Number(item.approval_status) === 2 ? 'restore' : 'reject',
                reason: reason.trim(),
              });
              setItemId('');
              setReason('');
              setError('');
            } catch (failure) {
              setError(failure.response?.data?.message || failure.message);
            }
          }}
        >
          <label className="block text-sm">
            Requested item
            <select
              required
              value={itemId}
              onChange={(event) => setItemId(event.target.value)}
              className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">Choose item</option>
              {workflow.document_items.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.item_name || line.item_id} · {line.quantity}{' '}
                  {Number(line.approval_status) === 2 ? '· Rejected' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Reason
            <textarea
              required
              maxLength={2000}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="mt-1 min-h-20 w-full rounded-lg border bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <p className="text-xs text-gray-500">
            Rejected demand remains in history and cannot be purchased or issued
            from stock. Restoring an item may require earlier approval again.
          </p>
          <button
            type="submit"
            disabled={!item || isLoading}
            className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {isLoading
              ? 'Saving…'
              : Number(item?.approval_status) === 2
                ? 'Restore item and notify'
                : 'Reject item and notify'}
          </button>
        </form>
      )}
      {history.length > 0 && (
        <ol className="mt-3 space-y-3 text-xs">
          {history.map((event) => (
            <li key={event.revision}>
              <strong>
                {event.change === 'reject' ? 'Item rejected' : 'Item restored'}
              </strong>{' '}
              · {event.actor_name} · {event.role_name} · {event.at}
              <p className="mt-1 whitespace-pre-wrap">{event.reason}</p>
            </li>
          ))}
        </ol>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
    </details>
  );
}
