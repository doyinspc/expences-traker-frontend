import React, { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ParentDocumentContext from '../../components/common/ParentDocumentContext';
import useParentDocumentContext from '../../hooks/useParentDocumentContext';
import useReduxApiData from '../../hooks/useTanstackQuery';
import { tokenHelpers } from '../../actions/common';
import { purchasingRequest } from '../../utils/functions/purchasingApi';
import ItemEvidencePanel from '../../components/procurement/ItemEvidencePanel';
import LegacyPurchaseOrderItems from './PurchaseOrderRequisitions';

const EMPTY_ROWS = [];
const rows = (value) =>
  Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const money = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const control =
  'mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

/**
 * Purpose: edit the new Purchase Order/Procurement stages while retaining the legacy screen.
 * Algorithm: load the exact parent and live server allocations; let a PO consolidate
 * approved outstanding request quantities and explicitly show extra stock. Procurement
 * imports approved order quantities at saved prices/budgets. Mutations refresh source
 * availability; once workflow starts, quantity/membership controls disappear. Per-item
 * stage evidence remains available in collapsed rows without enlarging the main table.
 */
export default function PurchasingItems({ type = 2 }) {
  const { id } = useParams();
  const documentId = Number(id);
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const navigate = useNavigate();
  const client = useQueryClient();
  const parent = useParentDocumentContext();
  const [form, setForm] = useState(null);
  const editor = useRef(null);
  const [selected, setSelected] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scope = [
    tokenHelpers.getTenantDb(),
    tokenHelpers.getToken(),
    auth.location_id,
    auth.role_id,
    documentId,
  ];
  const modern =
    Number(parent.document?.purchasing_version || 1) === 2 || type === 9;
  const query = useQuery({
    queryKey: ['purchasing-state', ...scope],
    enabled: Boolean(documentId && parent.document && modern),
    queryFn: () => purchasingRequest('state', { document_id: documentId }),
  });
  const catalogue = useReduxApiData({
    table: 'commons',
    uniqueKey: 'purchasing-catalogue',
    queryType: 'gets',
    mainParam: { grp: 51, is_active: 1 },
    enabled: modern && type === 2,
  });
  const accounts = useReduxApiData({
    table: 'commons',
    uniqueKey: 'purchasing-accounts',
    queryType: 'gets',
    mainParam: { grp: 7, is_active: 1 },
    enabled: modern && type === 2,
  });
  const state = query.data;
  const candidates = state?.candidates || EMPTY_ROWS;
  const name = type === 9 ? 'Procurement' : 'Purchase Order';
  const path = type === 9 ? 'procurement' : 'purchaseorder';
  const catalogueRows = rows(catalogue.data);
  const sourceRows = useMemo(() => {
    const eligible = new Map(
      candidates
        .filter(
          (row) =>
            String(row.item_id) === String(form?.item_id) &&
            String(row.account_id) === String(form?.account_id),
        )
        .map((row) => [Number(row.id), row]),
    );
    for (const allocation of form?.sources || [])
      eligible.set(Number(allocation.request_item_id), {
        id: allocation.request_item_id,
        requisition_id: allocation.requisition_id,
        source_title: allocation.request_title,
        available_quantity: allocation.available_quantity,
      });
    return [...eligible.values()];
  }, [candidates, form]);
  const allocated = Object.values(form?.allocations || {}).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  async function refresh() {
    await Promise.all(
      [
        'purchasing-state',
        'requisitions',
        'requisitionitems',
        'approvalcenter',
      ].map((key) => client.invalidateQueries({ queryKey: [key] })),
    );
    setSelected({});
  }
  async function mutate(operation, values) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await purchasingRequest(
        operation,
        { document_id: documentId, ...values },
        true,
      );
      setForm(null);
      await refresh();
    } catch (failure) {
      setError(failure.response?.data?.message || failure.message);
      await query.refetch();
    } finally {
      setBusy(false);
    }
  }
  function edit(line) {
    setForm({
      sources: line?.request_allocations || [],
      line_id: line?.id || 0,
      item_id: String(line?.item_id || ''),
      account_id: String(line?.account_id || ''),
      quantity: line?.quantity || 1,
      unit_price: String(line?.unit_price ?? ''),
      allocations: Object.fromEntries(
        (line?.request_allocations || []).map((row) => [
          row.request_item_id,
          row.quantity,
        ]),
      ),
    });
    setError('');
    requestAnimationFrame(() => {
      editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      editor.current?.querySelector('select')?.focus();
    });
  }
  function allocate(source, value) {
    setForm((previous) => {
      const allocations = { ...previous.allocations, [source.id]: value };
      const needed = Object.values(allocations).reduce(
        (sum, item) => sum + Number(item || 0),
        0,
      );
      return {
        ...previous,
        allocations,
        quantity: Math.max(Number(previous.quantity), needed),
      };
    });
  }
  if (parent.isPending || (modern && query.isPending))
    return (
      <p role="status" className="min-h-48 p-6">
        Loading {name} items…
      </p>
    );
  if (parent.error) return <p role="alert">{parent.error.message}</p>;
  if (!modern && type === 2) return <LegacyPurchaseOrderItems />;
  return (
    <div className="space-y-5 text-gray-900 dark:text-white">
      <ParentDocumentContext context={parent} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{name} items</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {type === 2
              ? 'Combine outstanding requisitions here, enter prices, and add any extra stock quantity.'
              : 'Combine approved Purchase Orders from this location. Each source budget and agreed price is retained.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/procurement/${path}`)}
            className="min-h-11 rounded-lg border px-3 text-sm dark:border-gray-700"
          >
            Back to list
          </button>
          <button
            type="button"
            onClick={() =>
              navigate(`/procurement/${path}`, {
                state: { openApprovalId: documentId },
              })
            }
            className="min-h-11 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white"
          >
            Review / submit for approval
          </button>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="min-h-11 rounded-lg border px-3 text-sm dark:border-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>
      {query.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {query.error.message}
        </p>
      )}
      {state?.setup_required && (
        <p role="status">
          Prepare the additive purchasing update before using the separate
          stages.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}
      {state && !state.setup_required && (
        <>
          {state.can_edit && type === 2 && (
            <button
              type="button"
              onClick={() => edit(null)}
              className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white"
            >
              Add item / consolidate requisitions
            </button>
          )}
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {[
                    'Item / unit',
                    'Quantity',
                    'Unit price',
                    'Total',
                    'Source / extra stock',
                    'Actions',
                  ].map((label) => (
                    <th
                      key={label}
                      className="whitespace-nowrap p-3 text-xs font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.items.map((line) => (
                  <React.Fragment key={line.id}>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="p-3">
                        <p className="font-medium">{line.item_name}</p>
                        <p className="text-xs text-gray-500">
                          {line.unit || 'Service / amount'}
                        </p>
                        {Number(line.approval_status) === 2 && (
                          <span className="text-xs text-red-600">
                            Rejected / removed
                          </span>
                        )}
                      </td>
                      <td className="p-3 tabular-nums">{line.quantity}</td>
                      <td className="p-3 tabular-nums">
                        {money(line.unit_price)}
                      </td>
                      <td className="p-3 tabular-nums">
                        {Number(line.approval_status) === 2
                          ? 'Excluded'
                          : money(line.total_price)}
                      </td>
                      <td className="p-3 text-xs">
                        {type === 2 ? (
                          <>
                            <p>
                              {line.request_allocations.length} requisition
                              item(s)
                            </p>
                            <p className="mt-1 font-medium text-blue-700 dark:text-blue-300">
                              Extra for store: {line.extra_stock_quantity}{' '}
                              {line.unit}
                            </p>
                          </>
                        ) : (
                          <>
                            {line.order_allocations.map((allocation) => (
                              <p key={allocation.id}>
                                PO-{allocation.purchaseorder_id} ·{' '}
                                {allocation.order_title} · {allocation.quantity}{' '}
                                {line.unit}
                              </p>
                            ))}
                            <p className="mt-1 text-gray-500">
                              {line.budget_name || 'No budget assigned'}
                            </p>
                          </>
                        )}
                      </td>
                      <td className="p-3">
                        {state.can_edit &&
                          Number(line.approval_status) !== 2 && (
                            <div className="flex gap-2">
                              {type === 2 && (
                                <button
                                  type="button"
                                  onClick={() => edit(line)}
                                  className="min-h-11 text-brand-600 dark:text-brand-300"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  mutate('remove_line', { line_id: line.id })
                                }
                                className="min-h-11 text-red-600 dark:text-red-300"
                              >
                                Remove from draft
                              </button>
                            </div>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="px-3 pb-3">
                        <ItemEvidencePanel
                          documentId={documentId}
                          itemId={line.id}
                          itemName={line.item_name}
                          onChanged={refresh}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {!state.items.length && (
              <p className="p-5 text-sm text-gray-500">
                No items added to this {name} yet.
              </p>
            )}
          </div>
          {!state.can_edit && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Approval has started or completed. Quantities and membership are
              locked; authorised item decisions remain on the approval page.
            </p>
          )}
          {state.can_edit && type === 9 && (
            <section className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h2 className="font-semibold">
                Add approved Purchase Order items
              </h2>
              <p className="text-xs text-gray-500">
                Only approved outstanding quantities in this Procurement's
                location and currency are listed.
              </p>
              {!candidates.length ? (
                <p className="text-sm">
                  No eligible Purchase Order quantities are available.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr>
                          {[
                            'Purchase Order',
                            'Item',
                            'Available',
                            'Quantity to procure',
                            'Unit price',
                          ].map((label) => (
                            <th key={label} className="p-2">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {candidates.map((row) => (
                          <tr
                            key={row.id}
                            className="border-t dark:border-gray-700"
                          >
                            <td className="p-2">
                              PO-{row.purchaseorder_id}
                              <p className="text-xs text-gray-500">
                                {row.source_title}
                              </p>
                            </td>
                            <td className="p-2">{row.item_name}</td>
                            <td className="p-2">
                              {row.available_quantity} {row.unit}
                            </td>
                            <td className="p-2">
                              <input
                                aria-label={`Quantity from PO-${row.purchaseorder_id} ${row.item_name}`}
                                type="number"
                                min="0"
                                max={row.available_quantity}
                                step="1"
                                value={selected[row.id] ?? ''}
                                onChange={(event) =>
                                  setSelected((previous) => ({
                                    ...previous,
                                    [row.id]: event.target.value,
                                  }))
                                }
                                className={control}
                              />
                            </td>
                            <td className="p-2">{money(row.unit_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    disabled={
                      busy ||
                      !Object.values(selected).some(
                        (value) => Number(value) > 0,
                      )
                    }
                    onClick={() =>
                      mutate('import_orders', {
                        items: Object.entries(selected)
                          .filter(([, quantity]) => Number(quantity) > 0)
                          .map(([order_item_id, quantity]) => ({
                            order_item_id: Number(order_item_id),
                            quantity: Number(quantity),
                          })),
                      })
                    }
                    className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {busy
                      ? 'Adding…'
                      : 'Add selected quantities to Procurement'}
                  </button>
                </>
              )}
            </section>
          )}
        </>
      )}
      {form && (
        <section
          ref={editor}
          aria-label="Purchase Order item editor"
          className="rounded-xl border border-brand-200 bg-white p-4 dark:border-brand-900 dark:bg-gray-900"
        >
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void mutate('save_order_line', {
                ...form,
                item_id: Number(form.item_id),
                account_id: Number(form.account_id),
                quantity: Number(form.quantity),
                allocations: Object.entries(form.allocations)
                  .filter(([, quantity]) => Number(quantity) > 0)
                  .map(([request_item_id, quantity]) => ({
                    request_item_id: Number(request_item_id),
                    quantity: Number(quantity),
                  })),
              });
            }}
          >
            <fieldset disabled={busy} className="space-y-4">
              <h2 className="font-semibold">
                {form.line_id ? 'Edit ordered item' : 'Add ordered item'}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  Item *
                  <select
                    required
                    value={form.item_id}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        item_id: event.target.value,
                        allocations: {},
                        sources: [],
                      }))
                    }
                    className={control}
                  >
                    <option value="">Choose catalogue item</option>
                    {catalogueRows.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.text_1 || 'Service'}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Account classification *
                  <select
                    required
                    value={form.account_id}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        account_id: event.target.value,
                        allocations: {},
                        sources: [],
                      }))
                    }
                    className={control}
                  >
                    <option value="">Choose account</option>
                    {rows(accounts.data).map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Total quantity to order *
                  <input
                    required
                    type="number"
                    min={Math.max(1, allocated)}
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                    className={control}
                  />
                </label>
                <label className="text-sm">
                  Unit price *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unit_price}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        unit_price: event.target.value,
                      }))
                    }
                    className={control}
                  />
                </label>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950 dark:text-blue-100">
                For requisitions: {allocated} · Extra for store:{' '}
                {Math.max(0, Number(form.quantity) - allocated)} · Line amount:{' '}
                {money(Number(form.quantity) * Number(form.unit_price))}
              </div>
              <section>
                <h3 className="text-sm font-medium">
                  Outstanding requisitions for this item and account
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the quantity allocated to each request. Leave blank for
                  extra stock only.
                </p>
                {sourceRows.map((source) => (
                  <label
                    key={source.id}
                    className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3 text-xs dark:border-gray-700"
                  >
                    <span className="flex-1">
                      REQ-{source.requisition_id} · {source.source_title}
                      <span className="mt-1 block">
                        Available: {source.available_quantity} {source.unit}
                      </span>
                    </span>
                    <input
                      aria-label={`Quantity for REQ-${source.requisition_id}`}
                      type="number"
                      min="0"
                      max={source.available_quantity}
                      step="1"
                      value={form.allocations[source.id] || ''}
                      onChange={(event) => allocate(source, event.target.value)}
                      className="min-h-11 w-24 rounded-lg border bg-white px-2 dark:border-gray-700 dark:bg-gray-950"
                    />
                  </label>
                ))}
                {!sourceRows.length && (
                  <p className="mt-2 text-xs text-gray-500">
                    No outstanding requests for the selected item and account.
                    This quantity can be purchased for stock or a standalone
                    service.
                  </p>
                )}
              </section>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white"
                >
                  {busy ? 'Saving…' : 'Save item and allocations'}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="min-h-11 px-3 text-sm"
                >
                  Cancel
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      )}
    </div>
  );
}
