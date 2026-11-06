import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ParentDocumentContext from '../../components/common/ParentDocumentContext';
import ItemEvidencePanel from '../../components/procurement/ItemEvidencePanel';
import useParentDocumentContext from '../../hooks/useParentDocumentContext';
import useReduxApiData from '../../hooks/useTanstackQuery';
import { tokenHelpers } from '../../actions/common';
import { purchasingRequest } from '../../utils/functions/purchasingApi';
import LegacyRequisitionItems from './RequisitionItems';

const rows = (value) =>
  Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const control =
  'mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900';

/**
 * Purpose: capture departmental demand in quantities, without asking staff for prices.
 * Algorithm: resolve the exact parent from the route; preserve historical requisitions
 * and cash advances on their established screen. For new requisitions load server-owned
 * lifecycle/fulfilment state, save only catalogue, account, quantity and specifications,
 * and keep stage evidence attached to each saved line. A saved unit comes from Settings;
 * neither the browser nor the request form can redefine it. Approval locks editing and
 * stock issues alone reduce outstanding demand. Pricing starts at Purchase Order stage.
 */
export default function RequisitionDemandItems() {
  const { id } = useParams();
  const documentId = Number(id);
  const parent = useParentDocumentContext();
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const navigate = useNavigate();
  const client = useQueryClient();
  const editor = useRef(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const modern =
    Number(parent.document?.requisition_type) === 1 &&
    Number(parent.document?.purchasing_version) === 2;
  const scope = [
    tokenHelpers.getTenantDb(),
    tokenHelpers.getToken(),
    auth.location_id,
    auth.role_id,
    documentId,
  ];
  const query = useQuery({
    queryKey: ['purchasing-state', ...scope],
    enabled: Boolean(modern && documentId),
    queryFn: () => purchasingRequest('state', { document_id: documentId }),
  });
  const catalogue = useReduxApiData({
    table: 'commons',
    uniqueKey: 'demand-catalogue',
    queryType: 'gets',
    mainParam: { grp: 51, is_active: 1 },
    enabled: modern,
  });
  const accounts = useReduxApiData({
    table: 'commons',
    uniqueKey: 'demand-accounts',
    queryType: 'gets',
    mainParam: { grp: 7, is_active: 1 },
    enabled: modern,
  });
  const mutation = useReduxApiData({
    table: 'requisitionitems',
    uniqueKey: 'demand-write',
    enabled: false,
  });
  const catalogueRows = rows(catalogue.data);
  const selected = catalogueRows.find(
    (item) => String(item.id) === String(form?.item_id),
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
  }
  function edit(line) {
    setError('');
    setForm({
      id: line?.id || undefined,
      item_id: String(line?.item_id || ''),
      account_id: String(line?.account_id || ''),
      quantity: line?.quantity || 1,
      special_instructions: line?.special_instructions || '',
    });
    requestAnimationFrame(() => {
      editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      editor.current?.querySelector('select')?.focus();
    });
  }
  async function save(event) {
    event.preventDefault();
    if (mutation.isLoadingUpdate) return;
    try {
      if (!selected) throw new Error('Choose an active catalogue item.');
      await mutation.loadUpdate({
        ...form,
        requisition_id: documentId,
        category_id: selected.parent_id,
        item_id: Number(form.item_id),
        account_id: Number(form.account_id),
        quantity: Number(form.quantity),
        unit_price: '0.00',
        total_price: '0.00',
        cat: 'insert',
      });
      setForm(null);
      setError('');
      await refresh();
    } catch (failure) {
      setError(failure.response?.data?.message || failure.message);
    }
  }
  if (parent.isPending)
    return (
      <p role="status" className="min-h-48 p-6">
        Loading requisition…
      </p>
    );
  if (parent.error) return <p role="alert">{parent.error.message}</p>;
  if (!modern) return <LegacyRequisitionItems />;
  return (
    <div className="space-y-4 text-gray-900 dark:text-white">
      <ParentDocumentContext context={parent} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Requisition items</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Describe what you need and how many. Prices are entered later on the
            Purchase Order.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={control}
            onClick={() =>
              navigate('/procurement/requisition', {
                state: { openApprovalId: documentId },
              })
            }
          >
            Review / submit for approval
          </button>
          {query.data?.can_edit && (
            <button
              type="button"
              className={control}
              onClick={() => edit(null)}
            >
              Add requested item
            </button>
          )}
        </div>
      </div>
      {query.isPending ? (
        <p role="status" className="min-h-48 p-5">
          Loading requested quantities…
        </p>
      ) : query.error ? (
        <p role="alert">{query.error.message}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {[
                  'Item / unit',
                  'Requested',
                  'Issued from stock',
                  'Outstanding',
                  'Status / action',
                ].map((label) => (
                  <th key={label} className="p-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(query.data?.items || []).map((line) => (
                <React.Fragment key={line.id}>
                  <tr className="border-t dark:border-gray-700">
                    <td className="p-3">
                      <p className="font-medium">
                        {line.item_name} · {line.unit || 'Service'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {line.account_name}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-xs">
                        {line.special_instructions}
                      </p>
                    </td>
                    <td className="p-3">{line.quantity}</td>
                    <td className="p-3">{line.issued_quantity || 0}</td>
                    <td className="p-3">
                      {Number(line.approval_status) === 2
                        ? 'Excluded'
                        : line.remaining_quantity}
                    </td>
                    <td className="p-3">
                      {Number(line.approval_status) === 2
                        ? 'Rejected'
                        : Number(line.resolved) === 1
                          ? 'Fulfilled'
                          : Number(line.approved) === 1
                            ? 'Approved · awaiting supply'
                            : 'Awaiting approval'}
                      {query.data?.can_edit && (
                        <button
                          type="button"
                          className="ml-3 min-h-11 text-brand-600 dark:text-brand-300"
                          onClick={() => edit(line)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 pb-3">
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
          {!query.data?.items?.length && (
            <p className="p-5 text-sm">No requested items yet.</p>
          )}
        </div>
      )}
      {form && (
        <form
          ref={editor}
          onSubmit={save}
          className="space-y-4 rounded-xl border border-brand-300 p-4 dark:border-brand-800"
        >
          <h2 className="font-semibold">
            {form.id ? 'Edit requested item' : 'Add requested item'}
          </h2>
          <fieldset disabled={mutation.isLoadingUpdate} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Item *
                <select
                  required
                  className={control}
                  value={form.item_id}
                  onChange={(event) =>
                    setForm({ ...form, item_id: event.target.value })
                  }
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
                  className={control}
                  value={form.account_id}
                  onChange={(event) =>
                    setForm({ ...form, account_id: event.target.value })
                  }
                >
                  <option value="">Choose account classification</option>
                  {rows(accounts.data).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Quantity * ({selected?.text_1 || 'saved unit'})
                <input
                  required
                  type="number"
                  min="1"
                  max="999999999"
                  step="1"
                  className={control}
                  value={form.quantity}
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value })
                  }
                />
              </label>
              <label className="text-sm">
                Specifications / purpose
                <textarea
                  className={`${control} py-2`}
                  value={form.special_instructions}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      special_instructions: event.target.value,
                    })
                  }
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Save the item first, then add its reference images under Images
              and documents by stage.
            </p>
            <div className="flex gap-3">
              <button
                type="submit"
                className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white"
              >
                {mutation.isLoadingUpdate ? 'Saving…' : 'Save requested item'}
              </button>
              <button
                type="button"
                className="min-h-11 px-3"
                onClick={() => setForm(null)}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      )}
      {!query.data?.can_edit && (
        <p className="text-xs text-gray-500">
          Approval has started or completed. Requested quantities are locked;
          stock issues record subsequent fulfilment.
        </p>
      )}
    </div>
  );
}
