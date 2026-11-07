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
import RequisitionItemForm from './RequistiontemForm';

const rows = (value) =>
  Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const control =
  'mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900';

/**
 * Purpose: capture departmental demand in quantities, without asking staff for prices.
 * Algorithm: resolve the exact parent from the route; preserve the earlier requisition
 * layout through its price-free fallback, while cash advances retain their priced form.
 * Existing stored estimates are never erased on edit. For new requisitions load server-owned
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
    setForm(line || {});
    requestAnimationFrame(() => {
      editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      editor.current?.querySelector('select')?.focus();
    });
  }
  async function save(values) {
    if (mutation.isLoadingUpdate) return;
    try {
      await mutation.loadUpdate({
        ...values,
        ...(form.id ? { id: form.id } : {}),
        requisition_id: documentId,
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
                        {line.account_name} · {Number(line.is_type) === 1 ? 'CAPEX' : 'OPEX'}
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
        <div ref={editor}>
          <RequisitionItemForm
            key={form.id || 'new'}
            requisitionId={documentId}
            parent_row={parent.document}
            initialData={form}
            isEdit={Boolean(form.id)}
            priceFree
            accountOptions={rows(accounts.data)}
            accountsLoading={accounts.isPending || accounts.isLoading}
            accountsError={accounts.error}
            onRetryAccounts={() => accounts.refetch()}
            isLoading={mutation.isLoadingUpdate}
            onSave={save}
            onCancel={() => setForm(null)}
          />
        </div>
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
