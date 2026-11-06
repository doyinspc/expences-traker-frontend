import EvidenceDropzone from './EvidenceDropzone';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  API_PATH_SETTING,
  axiosConfig,
  axiosConfig1,
  tokenHelpers,
} from '../../actions/common';
import {
  evidenceStageNames,
  prepareEvidenceUpload,
} from '../../utils/functions/evidenceUpload';

async function readEvidence(
  operation,
  documentId,
  itemId,
  extra = {},
  binary = false,
) {
  const response = await axios.get(API_PATH_SETTING, {
    ...(binary ? { ...axiosConfig, responseType: 'blob' } : axiosConfig),
    params: {
      table: 'itemevidence',
      cat: operation,
      tenant_db: tokenHelpers.getTenantDb(),
      data: JSON.stringify({
        document_id: documentId,
        item_id: itemId,
        ...extra,
      }),
    },
  });
  if (
    !binary &&
    (response.data?.status === 'error' || response.data?.success === false)
  )
    throw new Error(
      response.data.message || 'Item evidence could not be loaded.',
    );
  return binary ? response.data : response.data.data;
}

/** Native modal keeps keyboard focus inside the preview and restores focus on closing. */
function EvidenceDialog({ view, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={onClose}
      aria-label={`Evidence: ${view.name}`}
      className="fixed inset-0 z-[100000] m-0 h-dvh max-h-none w-screen max-w-none bg-gray-950 p-4 text-white backdrop:bg-black/80"
    >
      <div className="flex h-full flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="break-all">{view.name}</span>
          <div className="flex gap-4">
            <a
              href={view.url}
              download={view.name}
              className="min-h-11 content-center underline"
            >
              Download
            </a>
            <button
              autoFocus
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg border border-white/40 px-4"
            >
              Close image / document
            </button>
          </div>
        </div>
        {view.mime.startsWith('image/') ? (
          <img
            src={view.url}
            alt={view.name}
            className="min-h-0 flex-1 object-contain"
          />
        ) : (
          <iframe
            src={view.url}
            title={view.name}
            className="min-h-0 flex-1 rounded-lg bg-white"
          />
        )}
      </div>
    </dialog>
  );
}

function EvidencePreview({ attachment, documentId, itemId, scope }) {
  const [url, setUrl] = useState('');
  const preview = useQuery({
    queryKey: [
      'item-evidence-preview',
      ...scope,
      documentId,
      itemId,
      attachment.id,
    ],
    enabled: Boolean(
      Number(attachment.has_preview) ||
      attachment.mime_type?.startsWith('image/') ||
      /\.(jpe?g|png|webp)$/i.test(attachment.original_name || ''),
    ),
    queryFn: () =>
      readEvidence(
        'file',
        documentId,
        itemId,
        { attachment_id: attachment.id, preview: 1 },
        true,
      ),
    staleTime: 300000,
  });
  useEffect(() => {
    if (!preview.data) return;
    const source = URL.createObjectURL(preview.data);
    setUrl(source);
    return () => URL.revokeObjectURL(source);
  }, [preview.data]);
  return url ? (
    <img
      src={url}
      alt="Attachment preview"
      className="h-20 w-24 rounded-lg bg-gray-100 object-contain dark:bg-gray-800"
    />
  ) : (
    <span className="flex h-20 w-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500 dark:bg-gray-800">
      {attachment.mime_type === 'application/pdf' ? 'PDF' : 'Image / file'}
    </span>
  );
}

/**
 * Purpose: keep the approval table compact while exposing clearly separated stage evidence.
 * Algorithm: load only when expanded; group server-authorised lineage by stage; fetch files
 * as authenticated blobs and revoke local URLs when closed. Upload controls come from the
 * server's live stage permissions. Every new upload appends evidence and refreshes workflow
 * versions; no replace/delete action can alter earlier images. Stock mode stages delivery
 * images and returns their IDs to the receipt form for atomic confirmation with quantities.
 */
export default function ItemEvidencePanel({
  documentId,
  itemId,
  itemName = '',
  expectedVersion,
  onChanged,
  stockMode = false,
  onUploaded,
  initiallyOpen = false,
}) {
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const client = useQueryClient();
  const [open, setOpen] = useState(initiallyOpen);
  const [stage, setStage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState(null);
  const uploading = useRef(false);
  const scope = [
    tokenHelpers.getTenantDb(),
    tokenHelpers.getToken(),
    auth.location_id,
    auth.role_id,
  ];
  const query = useQuery({
    queryKey: ['item-evidence', ...scope, documentId, itemId],
    enabled: Boolean(open && documentId && itemId),
    queryFn: () => readEvidence('list', documentId, itemId),
  });
  const stages = stockMode
    ? query.data?.stock_upload_allowed
      ? ['stock_receipt']
      : []
    : query.data?.upload_stages || [];
  const chosenStage = stages.includes(stage) ? stage : stages[0] || '';
  const attachments = query.data?.attachments || [];
  const groups = Object.keys(evidenceStageNames)
    .map((key) => [key, attachments.filter((row) => row.stage === key)])
    .filter(([, rows]) => rows.length);
  useEffect(
    () => () => {
      if (view?.url) URL.revokeObjectURL(view.url);
    },
    [view],
  );

  async function show(attachment) {
    setError('');
    try {
      const blob = await readEvidence(
        'file',
        documentId,
        itemId,
        { attachment_id: attachment.id },
        true,
      );
      setView({
        url: URL.createObjectURL(blob),
        mime: blob.type,
        name: attachment.original_name,
      });
    } catch {
      setError(
        'This evidence could not be opened. Refresh the item and try again.',
      );
    }
  }

  async function upload(file) {
    if (!chosenStage || busy || uploading.current) return;
    uploading.current = true;
    setBusy(true);
    setError('');
    try {
      const prepared = await prepareEvidenceUpload(file);
      const body = new FormData();
      for (const [key, value] of Object.entries({
        table: 'itemevidence',
        cat: 'upload',
        tenant_db: tokenHelpers.getTenantDb(),
        document_id: documentId,
        item_id: itemId,
        stage: chosenStage,
      }))
        body.append(key, String(value));
      if (expectedVersion) body.append('expected_version', expectedVersion);
      body.append('file', prepared.file);
      if (prepared.preview) body.append('preview', prepared.preview);
      const response = await axios.post(API_PATH_SETTING, body, axiosConfig1);
      if (response.data?.status === 'error' || response.data?.success === false)
        throw new Error(response.data.message || 'The evidence was not saved.');
      onUploaded?.(response.data.data.attachment_id);
      await Promise.all(
        [
          'item-evidence',
          'approvalcenter',
          'controlcenter',
          'requisitionitems',
          'purchasing-state',
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
      await onChanged?.();
    } catch (failure) {
      setError(
        failure.response?.data?.message ||
          failure.message ||
          'The evidence was not saved.',
      );
    } finally {
      uploading.current = false;
      setBusy(false);
    }
  }

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="w-full text-sm text-gray-700 dark:text-gray-200"
    >
      <summary className="min-h-10 cursor-pointer content-center text-xs font-medium text-brand-600 dark:text-brand-300">
        Images and documents by stage{itemName ? ` · ${itemName}` : ''}
      </summary>
      <div className="space-y-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        {query.isPending ? (
          <p role="status" className="min-h-24 py-4 text-xs">
            Loading item evidence…
          </p>
        ) : query.error ? (
          <p role="alert" className="text-xs text-red-600 dark:text-red-300">
            {query.error.message}
          </p>
        ) : (
          <>
            {stages.length > 0 && (
              <fieldset disabled={busy} className="space-y-3">
                <label className="block text-xs font-medium">
                  Upload purpose
                  <select
                    value={chosenStage}
                    onChange={(event) => setStage(event.target.value)}
                    className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900"
                  >
                    {stages.map((key) => (
                      <option key={key} value={key}>
                        {evidenceStageNames[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <EvidenceDropzone
                  disabled={busy}
                  onFile={(file) => void upload(file)}
                  onError={setError}
                  stageLabel={evidenceStageNames[chosenStage]}
                />
                <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Images are compressed before upload. Full image up to 1 MB;
                  preview up to 15 KB; PDF up to 5 MB. Each file stays with this
                  item and its selected stage.
                </p>
                {stockMode && (
                  <p className="text-xs">
                    Supply images remain pending until you confirm this stock
                    receipt.
                  </p>
                )}
              </fieldset>
            )}
            {!groups.length && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No evidence uploaded for this item yet.
              </p>
            )}
            {groups.map(([key, files]) => (
              <section key={key} aria-label={evidenceStageNames[key]}>
                <h4 className="mb-2 text-xs font-semibold">
                  {evidenceStageNames[key]}
                </h4>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-950">
                      <tr>
                        <th scope="col" className="w-28 p-2">
                          Image / preview
                        </th>
                        <th scope="col" className="p-2">
                          File name and details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((attachment) => (
                        <tr
                          key={attachment.id}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="p-2 align-top">
                            <button
                              type="button"
                              onClick={() => show(attachment)}
                              aria-label={`View ${attachment.original_name}`}
                            >
                              <EvidencePreview
                                attachment={attachment}
                                documentId={documentId}
                                itemId={itemId}
                                scope={scope}
                              />
                            </button>
                          </td>
                          <td className="p-2 align-top">
                            <button
                              type="button"
                              onClick={() => show(attachment)}
                              className="min-h-10 break-all text-left font-medium text-brand-600 dark:text-brand-300"
                            >
                              {attachment.original_name}
                            </button>
                            <p>
                              {attachment.uploader_name || 'User not recorded'}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {attachment.uploaded_at ||
                                'Upload date not recorded'}
                            </p>
                            {attachment.file_size && (
                              <p>
                                {Math.ceil(Number(attachment.file_size) / 1024)}{' '}
                                KB
                              </p>
                            )}
                            {key === 'stock_receipt' && (
                              <p className="mt-1">
                                {attachment.stock_movement_id
                                  ? `Receipt movement #${attachment.stock_movement_id}`
                                  : 'Pending stock receipt confirmation'}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
            {query.data?.setup_required && (
              <p className="text-xs">
                Stage uploads become available after the purchasing update is
                prepared. Earlier attachments remain readable.
              </p>
            )}
            {!stages.length && !query.data?.setup_required && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Files are available to view. Upload controls are shown only when
                your current role can add evidence at this stage.
              </p>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
      {view && <EvidenceDialog view={view} onClose={() => setView(null)} />}
    </details>
  );
}
