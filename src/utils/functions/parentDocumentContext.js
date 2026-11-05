import { PROCUREMENT_DOCUMENT_LABEL } from './documentLabels.js';

const documents = {
  requisition: ['Requisition', 'REQ', 1],
  purchaseorder: [PROCUREMENT_DOCUMENT_LABEL, 'PO', 2],
  cashadvance: ['Cash advance', 'CA', 3],
  income: ['Income', 'INC', 7],
  cashtransfer: ['Cash transfer', 'TRF', 6],
  stock: ['Stock document', 'STK', 8],
  budgets: ['Budget', 'BUD', null],
};
const settings = {
  workflow: 'Workflow',
  expense: 'Expense category',
  income: 'Income category',
  room: 'Building',
  service: 'Service group',
  page: 'Setting',
};

/**
 * Purpose: identify the parent from the current child-page URL, never a remembered row.
 * Algorithm: match the supported transaction/settings route, validate its positive ID,
 * then supply its existing API resource, document type and readable reference prefix.
 * Unsupported routes return null; malformed IDs stay invalid and cannot start a read.
 */
export function parentDocumentRoute(pathname) {
  const path = pathname.replace(/\/+$/, '');
  const booking = path.match(/^\/bookings\/booking\/([^/]+)$/);
  if (booking)
    return {
      ...identity(booking[1]),
      kind: 'booking',
      table: 'clients',
      label: 'Booking client',
      prefix: 'CLIENT',
      type: null,
    };
  let match = path.match(/^\/procurement\/([^/]+)\/([^/]+)$/);
  if (match && documents[match[1]]) {
    const [label, prefix, type] = documents[match[1]];
    return {
      ...identity(match[2]),
      kind: match[1],
      table: match[1] === 'budgets' ? 'budgets' : 'requisitions',
      label,
      prefix,
      type,
    };
  }
  match =
    path.match(
      /^\/setting\/(workflow|expense|income|room|service)\/([^/]+)$/,
    ) || path.match(/^\/setting\/(page)\/[^/]+\/([^/]+)$/);
  if (match)
    return {
      ...identity(match[2]),
      kind: match[1],
      table: 'commons',
      label: settings[match[1]],
      prefix: 'ID',
      type: null,
    };
  return null;
}

function identity(raw) {
  const id = /^[1-9]\d*$/.test(raw) ? Number(raw) : 0;
  return { id: Number.isSafeInteger(id) ? id : 0 };
}

/**
 * Purpose: select only the exact current parent from existing API response envelopes.
 * Algorithm: unwrap success/data/items envelopes, find the URL ID, then verify the
 * transaction type when applicable. Never fall back to the first row or cached title.
 * Some older servers ignore the id filter on list endpoints; exact matching here
 * preserves compatibility without showing another document's details on those servers.
 */
export function selectParentDocument(payload, route) {
  if (!route?.id) return null;
  if (payload?.status === 'error' || payload?.success === false)
    throw new Error(payload.message || 'Document details could not be loaded.');
  let rows = payload;
  for (
    let depth = 0;
    depth < 3 &&
    rows &&
    !Array.isArray(rows) &&
    typeof rows === 'object' &&
    !('id' in rows);
    depth++
  )
    rows = rows.data ?? rows.items;
  if (!Array.isArray(rows))
    rows = rows && typeof rows === 'object' ? [rows] : [];
  return (
    rows.find(
      (row) =>
        row &&
        Number(row.id) === route.id &&
        (route.table !== 'requisitions' ||
          Number(row.requisition_type) === route.type),
    ) || null
  );
}

/** Build a compact, factual summary; omit missing values rather than show raw IDs. */
export function parentDocumentSummary(route, row) {
  const reference =
    row.document_number ||
    row.po_number ||
    row.requisition_number ||
    row.pr_id ||
    row.code ||
    `${route.prefix}-${route.id}`;
  const title =
    row.title ||
    row.budget_name ||
    row.name ||
    row.full_name ||
    [row.first_name, row.last_name].filter(Boolean).join(' ') ||
    `${route.label} #${route.id}`;
  const details = [
    ['Location', row.location_name],
    ['Department', row.department_name],
    ['Requested by', row.requester_name || row.created_by_name],
    ['Vendor', row.vendor_name],
    ['Company', row.company_name],
    [
      'Created',
      row.created_at && !String(row.created_at).startsWith('0000')
        ? String(row.created_at).slice(0, 10)
        : null,
    ],
    [
      'Period',
      row.start_date && row.end_date
        ? `${String(row.start_date).slice(0, 10)} – ${String(row.end_date).slice(0, 10)}`
        : null,
    ],
  ].filter(([, value]) => value != null && String(value).trim() !== '');
  return { reference, title, details };
}
