import React, { useState } from "react";
import EvidenceDropzone from "./EvidenceDropzone";
import { prepareEvidenceUpload } from "../../utils/functions/evidenceUpload";

/**
 * Purpose: retain drag-and-drop and preview/name rows while an older server uses doc_path.
 * Algorithm: show only the supplied readable file URL; compress selected images through
 * the same size policy; delegate saving to the authorised current-approver callback.
 * The full stage gallery replaces this fallback once purchasing evidence is prepared.
 */
export default function LegacyItemEvidence({
  item,
  fileUrl,
  onUpload,
  uploading = false,
  embedded = false,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const filename = String(item.doc_path || "")
    .replaceAll("\\", "/")
    .split("/")
    .pop();
  const image = /\.(jpe?g|png|webp)$/i.test(filename || "");
  if (!fileUrl && !onUpload) return null;
  const Container = embedded ? "section" : "details";
  return (
    <Container className="w-full text-gray-700 dark:text-gray-200">
      {!embedded && (
        <summary className="min-h-10 cursor-pointer font-medium text-brand-600 dark:text-brand-300">
          Invoice / image · view or upload
        </summary>
      )}
      <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        {onUpload && (
          <EvidenceDropzone
            disabled={busy || uploading}
            stageLabel="Upload an invoice, quotation or supporting image for this item"
            onError={setError}
            onFile={async (file) => {
              if (busy || uploading) return;
              setBusy(true);
              setError("");
              try {
                const prepared = await prepareEvidenceUpload(file);
                await onUpload(item, prepared.file);
              } catch (failure) {
                setError(failure.response?.data?.message || failure.message);
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
        {fileUrl && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                <th className="w-28 p-2">Image / preview</th>
                <th className="p-2">File name</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 align-top">
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {image ? (
                      <img
                        src={fileUrl}
                        alt={filename}
                        className="h-20 w-24 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="flex h-20 w-24 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        Document
                      </span>
                    )}
                  </a>
                </td>
                <td className="p-2 align-top">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-10 break-all font-medium text-brand-600 dark:text-brand-300"
                  >
                    {filename}
                  </a>
                  <p className="mt-1 text-gray-500">
                    Earlier attachment · stage not recorded
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </Container>
  );
}
