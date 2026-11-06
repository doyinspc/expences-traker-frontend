import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Purpose: edit one selected line without moving the reviewer away from its table row.
 * Algorithm: mount a native modal dialog, retain the originating focus and page scroll,
 * focus the first editable field, and trap keyboard navigation through native modality.
 * Escape and Close dismiss only while idle; a running save cannot be dismissed halfway.
 * The fixed header identifies the item while the form body scrolls on small screens.
 * Unmount closes the dialog, restores the previous body style and returns focus to the
 * original edit button when it still exists. No financial writes happen in this shell.
 */
export default function ApprovalItemDialog({
  title,
  itemName,
  busy = false,
  onClose,
  children,
}) {
  const dialog = useRef(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    (
      element.querySelector(
        '[name="approval-quantity"]:not([disabled]), [name="approval-unit-price"]:not([disabled])',
      ) ||
      element.querySelector(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      )
    )?.focus();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-item`}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%_-_1.5rem)] max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
    >
      <div className="flex max-h-[92dvh] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-sm font-semibold">
              {title}
            </h2>
            <p
              id={`${id}-item`}
              className="mt-1 break-words text-sm text-gray-500 dark:text-gray-400"
            >
              {itemName}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label="Close item editor"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {children}
        </div>
      </div>
    </dialog>
  );
}
