import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import useReduxApiData from '../../hooks/useTanstackQuery.js';
import { procurementCandidates } from '../../utils/functions/procurementCandidates.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId: number;
  onItemsAdded: () => void;
}

interface Candidate {
  id: number | string;
  requisition_id: number | string;
  requisition_title?: string;
  item_id: number | string;
  item_name?: string;
  category_name?: string;
  quantity: number | string;
  remaining_quantity: number;
  stock_issued_quantity?: number | string;
  unit_of_measure?: string;
  unit_price?: number | string;
  total_price?: number | string;
  requisition_currency_code?: string;
}

function money(value: number | string | undefined, code = 'NGN') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: code,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}

/**
 * Purpose: add outstanding approved requisition lines to the current procurement.
 * Algorithm:
 * 1. Ask the API for candidates using the saved procurement ID. The API derives its
 *    location and returns only closed, approved demand with an unallocated remainder.
 * 2. Build the requisition dropdown from those rows, so requests with no eligible
 *    items disappear. Display requested minus stock-issued quantity in the saved unit.
 * 3. Await attachment of the existing item; never create a duplicate demand row. The
 *    server locks/rechecks eligibility, saves the remaining procurement quantity and
 *    keeps the original requested quantity. The query cache then refreshes both lists.
 * 4. Remove a successfully attached row immediately from this picker. Surface stale
 *    permission/location/quantity errors and allow refresh; never assume a write worked.
 * This modal is shared by the existing procurement pages without changing their layout.
 */
export default function AddRequisitionItemsModal(props: Props) {
  // Mount the query-owning form only when opened. The shared query hook captures
  // its initial enabled state; mounting it closed would leave this GET disabled.
  // A different order also receives fresh selection/query state through its key.
  if (!props.isOpen) return null;
  return <OpenRequisitionItemsModal key={props.purchaseOrderId} {...props} />;
}

function OpenRequisitionItemsModal({
  isOpen,
  onClose,
  purchaseOrderId,
  onItemsAdded,
}: Props) {
  const [selected, setSelected] = useState('');
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const { data, isFetching, error, refetch } = useReduxApiData({
    table: 'requisitionitems',
    queryType: 'gets',
    uniqueKey: `procurement-candidates-${purchaseOrderId}`,
    mainParam: { procurement_candidates_for: purchaseOrderId },
    narration: 'get outstanding requisition items at the procurement location',
    enabled: isOpen && purchaseOrderId > 0,
  });
  // Keep read-only picker filters out of the write payload.
  const { loadUpdate, isLoadingUpdate } = useReduxApiData({
    table: 'requisitionitems',
    queryType: 'gets',
    uniqueKey: 'attach-procurement-item',
    mainParam: {},
    autoLoad: false,
  });

  useEffect(() => {
    if (isOpen) {
      setSelected('');
      setAddedIds([]);
    }
  }, [isOpen, purchaseOrderId]);

  const items: Candidate[] = useMemo(
    () =>
      procurementCandidates(
        Array.isArray(data) ? data : (data?.data ?? []),
        purchaseOrderId,
      ).filter((row: Candidate) => !addedIds.includes(Number(row.id))),
    [data, purchaseOrderId, addedIds],
  );
  const requests = useMemo(
    () =>
      [
        ...new Map(
          items.map((row) => [
            String(row.requisition_id),
            {
              id: String(row.requisition_id),
              title:
                row.requisition_title || `Requisition ${row.requisition_id}`,
            },
          ]),
        ).values(),
      ] as { id: string; title: string }[],
    [items],
  );
  const selection = requests.some((request) => request.id === selected)
    ? selected
    : '';
  const visible = items.filter(
    (row) => String(row.requisition_id) === selection,
  );

  async function addItem(itemId: number) {
    try {
      await loadUpdate({
        id: itemId,
        purchaseorder_id: purchaseOrderId,
        act: 0,
      });
      setAddedIds((ids) => [...ids, itemId]);
      onItemsAdded();
    } catch {
      // The shared API hook shows the server's reason. Reload stale availability.
      refetch();
    }
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="procurement-picker-title"
        className="mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3
            id="procurement-picker-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Add requisition items
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item picker"
            className="p-2 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Only approved, closed requisitions at this Procurement / Purchase
          Order’s location are shown. Quantities already supplied from stock or
          assigned to another order are excluded.
        </p>
        <div className="mb-4 flex items-end gap-3">
          <label className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            Requisition
            <select
              value={selection}
              onChange={(event) => setSelected(event.target.value)}
              disabled={isLoadingUpdate}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="">Select a requisition ({requests.length})</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  REQ-{request.id} — {request.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={refetch}
            disabled={isFetching || isLoadingUpdate}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
        <div className="min-h-40 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
          {isFetching ? (
            <div
              role="status"
              className="flex min-h-40 items-center justify-center gap-2 text-gray-500"
            >
              <Loader2 className="animate-spin" size={20} />
              Loading outstanding items…
            </div>
          ) : error ? (
            <p
              role="alert"
              className="p-6 text-sm text-red-600 dark:text-red-400"
            >
              {error.response?.data?.message ||
                error.message ||
                'Unable to load requisitions. Please refresh.'}
            </p>
          ) : !visible.length ? (
            <p className="p-6 text-sm text-gray-500">
              {!requests.length
                ? 'No outstanding requisition items are available at this procurement location.'
                : 'Select a requisition to see its outstanding items.'}
            </p>
          ) : (
            <table className="w-full text-sm text-gray-900 dark:text-gray-100">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2 text-right">Still needed</th>
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2 text-right">Unit price</th>
                  <th className="px-3 py-2 text-right">Estimated total</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100 dark:border-gray-700"
                  >
                    <td className="px-3 py-2">
                      {item.item_name || `Item ${item.item_id}`}
                    </td>
                    <td className="px-3 py-2">{item.category_name || '—'}</td>
                    <td
                      className="px-3 py-2 text-right"
                      title={`Requested: ${item.quantity}; supplied from stock: ${item.stock_issued_quantity ?? 0}`}
                    >
                      {item.remaining_quantity}
                    </td>
                    <td className="px-3 py-2">{item.unit_of_measure || '—'}</td>
                    <td className="px-3 py-2 text-right">
                      {money(item.unit_price, item.requisition_currency_code)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {money(
                        (Number(item.total_price) * item.remaining_quantity) /
                          Number(item.quantity),
                        item.requisition_currency_code,
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => addItem(Number(item.id))}
                        disabled={isLoadingUpdate}
                        className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 disabled:opacity-50 dark:bg-green-900/20 dark:text-green-300"
                      >
                        <Plus size={14} />
                        Add item
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>{items.length} outstanding items</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
