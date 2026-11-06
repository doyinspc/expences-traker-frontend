import { approvalItemLabel } from "../../utils/functions/approvalItemLabel";
import ApprovalItemDialog from "./ApprovalItemDialog";
import React, { useEffect, useRef, useState } from "react";

/**
 * Purpose: review quantities and decisions without introducing prices on requisitions.
 * Algorithm: use the current approver's version-bound operation for quantity, rejection
 * or restoration; require a reason; show immutable quantity history. The backend protects
 * issued/allocated units, checks the current role and reopens earlier approvals when demand
 * increases. Historic stored estimates remain untouched and are not rendered here.
 */
export default function DemandReviewPanel({
  workflow,
  onSave,
  isLoading,
  editRequest = null,
  onClose = () => {},
  renderEvidence,
}) {
  const selected = workflow.document_items?.find(
    (row) => Number(row.id) === Number(editRequest?.itemId),
  );
  const [itemId, setItemId] = useState(selected ? String(selected.id) : ""),
    [reason, setReason] = useState(""),
    [error, setError] = useState(""),
    [quantity, setQuantity] = useState(
      selected ? String(selected.quantity) : "",
    ),
    [change, setChange] = useState("quantity"),
    [open, setOpen] = useState(false),
    [editorOpen, setEditorOpen] = useState(Boolean(selected));
  const [evidenceBusy, setEvidenceBusy] = useState(false);
  const [expectedVersion, setExpectedVersion] = useState(
    editRequest?.expectedVersion ?? workflow.action_version,
  );
  const lastRequest = useRef(null);
  const canEdit = workflow.permissions?.can_revise_items;
  useEffect(() => {
    if (!editRequest) {
      setEditorOpen(false);
      return;
    }
    if (!canEdit || lastRequest.current === editRequest) return;
    const line = workflow.document_items?.find(
      (row) => Number(row.id) === Number(editRequest.itemId),
    );
    if (!line) return;
    lastRequest.current = editRequest;
    setExpectedVersion(editRequest.expectedVersion ?? workflow.action_version);
    setItemId(String(line.id));
    setQuantity(String(line.quantity));
    setChange("quantity");
    setEditorOpen(true);
    setReason("");
    setError("");
  }, [editRequest, canEdit, workflow.document_items, workflow.action_version]);
  const item = workflow.document_items?.find(
      (line) => String(line.id) === itemId,
    ),
    history = workflow.item_revisions?.history || [];
  const action = Number(item?.approval_status) === 2 ? "restore" : change;
  if (!canEdit && !history.length) return null;
  return (
    <>
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
      >
        <summary className="min-h-10 cursor-pointer text-sm font-semibold">
          Review requested items · quantities, decisions and history
        </summary>
        {history.length > 0 && (
          <ol className="mt-3 space-y-3 text-xs">
            {history.map((event) => (
              <li key={event.revision}>
                <strong>
                  {event.change === "quantity"
                    ? "Quantity adjusted"
                    : event.change === "reject"
                      ? "Item rejected"
                      : "Item restored"}
                </strong>{" "}
                · {event.actor_name} · {event.role_name} · {event.at}
                {event.change === "quantity" && (
                  <p className="mt-1">
                    Quantity: {event.before.quantity} → {event.after.quantity}
                  </p>
                )}
                <p className="mt-1 whitespace-pre-wrap">{event.reason}</p>
              </li>
            ))}
          </ol>
        )}
      </details>
      {canEdit && editorOpen && item && (
        <ApprovalItemDialog
          title="Edit requested item"
          itemName={approvalItemLabel(item)}
          busy={isLoading || evidenceBusy}
          onClose={() => {
            setEditorOpen(false);
            onClose();
          }}
        >
          <form
            className="mt-3 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!item || !reason.trim() || isLoading || evidenceBusy) return;
              try {
                await onSave({
                  item_id: item.id,
                  expected_version: expectedVersion,
                  change: action,
                  reason: reason.trim(),
                  ...(action === "quantity" ? { quantity } : {}),
                });
                setEditorOpen(false);
                onClose();
                setItemId("");
                setReason("");
                setError("");
              } catch (failure) {
                setError(failure.response?.data?.message || failure.message);
              }
            }}
          >
            <label className="block text-sm">
              Change
              <select
                value={action}
                onChange={(event) => setChange(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
              >
                {Number(item?.approval_status) === 2 ? (
                  <option value="restore">Restore rejected item</option>
                ) : (
                  <>
                    <option value="quantity">Adjust requested quantity</option>
                    <option value="reject">Reject this item</option>
                  </>
                )}
              </select>
            </label>
            {item && action === "quantity" && (
              <label className="block text-sm">
                Quantity * (
                {item.unit_of_measure || item.unit || "saved item unit"})
                <input
                  required
                  type="number"
                  min="1"
                  max="999999999"
                  step="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
            )}
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
            {renderEvidence && (
              <section aria-label="Requested item images" className="space-y-2">
                <h3 className="text-sm font-semibold">Supporting image</h3>
                {renderEvidence(item, {
                  expectedVersion,
                  onBusyChange: setEvidenceBusy,
                  onVersionChange: setExpectedVersion,
                })}
                <p className="text-xs text-gray-500">
                  Files save when uploaded. Save quantity separately below.
                </p>
              </section>
            )}
            <p className="text-xs text-gray-500">
              Increased demand returns to earlier approvers where needed.
              Rejected demand cannot be purchased or issued. Prices are set on
              the Purchase Order.
            </p>
            <button
              type="submit"
              disabled={!item || isLoading || evidenceBusy}
              className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading
                ? "Saving…"
                : action === "restore"
                  ? "Restore item and notify"
                  : action === "reject"
                    ? "Reject item and notify"
                    : "Save quantity and notify"}
            </button>
          </form>{" "}
          {error && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600 dark:text-red-300"
            >
              {error}
            </p>
          )}
        </ApprovalItemDialog>
      )}
    </>
  );
}
