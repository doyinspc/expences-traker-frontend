import React, { useRef, useState } from 'react';

/**
 * Purpose: restore a clear drag-and-drop target without weakening upload permissions.
 * Algorithm: use the same onFile callback for dropping or choosing one file; prevent the
 * browser from opening a dropped file; disable both paths while saving. The parent still
 * compresses images, validates formats and submits the exact item/stage to the server.
 */
export default function EvidenceDropzone({
  disabled = false,
  onFile,
  onError,
  stageLabel,
}) {
  const input = useRef(null),
    [dragging, setDragging] = useState(false);
  function select(files) {
    if (disabled) return;
    if (files?.length !== 1) {
      onError?.('Choose one image or PDF at a time for this item.');
      return;
    }
    onFile(files[0]);
  }
  return (
    <div
      aria-label="Attachment drag and drop"
      className={`rounded-xl border-2 border-dashed p-5 text-center ${dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-950/40'} ${disabled ? 'opacity-60' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (event.dataTransfer)
          event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        select(event.dataTransfer?.files);
      }}
    >
      <p className="text-sm font-semibold">
        {disabled
          ? 'Compressing / uploading…'
          : 'Drag and drop an image or PDF here'}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {stageLabel}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className="mt-3 min-h-11 rounded-lg bg-brand-600 px-4 text-xs font-semibold text-white disabled:cursor-wait"
      >
        Choose image or PDF
      </button>
      <input
        ref={input}
        type="file"
        aria-label="Choose item attachment"
        className="sr-only"
        disabled={disabled}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={(event) => {
          select(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
