/** Shared display wording only; transaction IDs, API tables and routes stay unchanged. */
export const PROCUREMENT_DOCUMENT_LABEL = 'Procurement / Purchase Order';

/**
 * Purpose: identify document type 2 consistently in frontend labels and exports.
 * Algorithm: recognise numeric/string type 2, then return the shared combined name;
 * otherwise preserve the caller's existing display fallback. No record is modified.
 */
export function displayDocumentType(type, fallback = 'Document') {
  return Number(type) === 2 ? PROCUREMENT_DOCUMENT_LABEL : fallback;
}
