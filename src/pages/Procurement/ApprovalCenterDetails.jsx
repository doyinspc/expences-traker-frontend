import { approvalItemLabel } from "../../utils/functions/approvalItemLabel";
import ItemBudgetComparison from "../../components/approvals/ItemBudgetComparison";
import ApprovalItemsTable from "../../components/approvals/ApprovalItemsTable";
import LegacyItemEvidence from "../../components/procurement/LegacyItemEvidence";
import ItemEvidencePanel from "../../components/procurement/ItemEvidencePanel";
import DemandReviewPanel from "../../components/approvals/DemandReviewPanel";
import {
  displayDocumentType,
  PROCUREMENT_DOCUMENT_LABEL,
} from "../../utils/functions/documentLabels";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, History, CheckCircle2, Info } from "lucide-react";
import {
  API_PATH_SETTING,
  axiosConfig,
  tokenHelpers,
  SERVER_URL,
} from "../../actions/common";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ItemRevisionPanel from "../../components/approvals/ItemRevisionPanel";
import CashMovementPanel from "../../components/approvals/CashMovementPanel";
import ApprovalActions from "../../components/approvals/ApprovalActions";
import StepsSidebar from "../../components/approvals/StepsSidebar";
import WorkflowDrawer from "../../components/approvals/WorkflowDrawer";
import ApprovalEmailReminder from "../../components/approvals/ApprovalEmailReminder";
import WorkflowStatusBadge from "../../components/approvals/WorkflowStatusBadge";
import { documentFlow } from "../../utils/functions/flowPresentation";
import { currentStep } from "../../utils/functions/workflowPresentation";
import {
  formatWorkflowDate,
  workflowProgress,
} from "../../utils/functions/workflowUx";

const receiptUrl = (path) => {
  const base = (SERVER_URL || API_PATH_SETTING.replace(/[^/]*$/, "")).replace(
    /\/?$/,
    "/",
  );
  try {
    const url = new URL(path, base);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
};
const date = (value) => formatWorkflowDate(value, true);
const amount = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const card =
  "min-w-0 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900";
const itemTitle = approvalItemLabel;
/**
 * Purpose: keep document references, receipts and item history beside the existing item row.
 *
 * Algorithm: render only applicable procurement/stock links, resolve an existing receipt
 * through the safe URL helper, expose upload input only when the parent supplied an
 * authorised upload callback, and append this item's expandable revision history.
 * The visibility of these links does not grant mutation rights; the API rechecks uploads.
 */
function ItemLinks({
  item,
  onUpload,
  uploading,
  revisions,
  documentId,
  stageEvidence,
  expectedVersion,
  onChanged,
  priceFree,
}) {
  return (
    <div className="space-y-4 text-xs text-gray-700 dark:text-gray-300">
      <div className="flex flex-wrap gap-3 text-brand-600 dark:text-brand-300">
        {item.purchaseorder_id > 0 && (
          <Link
            className="underline underline-offset-2"
            to={`/procurement/purchaseorder/${item.purchaseorder_id}`}
          >
            {PROCUREMENT_DOCUMENT_LABEL} #{item.purchaseorder_id}
          </Link>
        )}
        {item.sku_id > 0 && (
          <Link
            className="underline underline-offset-2"
            to={`/procurement/stock/${item.sku_id}`}
          >
            Stock #{item.sku_id}
          </Link>
        )}
      </div>
      {!stageEvidence && (
        <LegacyItemEvidence
          embedded
          item={item}
          fileUrl={item.doc_path ? receiptUrl(item.doc_path) : null}
          onUpload={onUpload}
          uploading={uploading}
        />
      )}
      {stageEvidence && (
        <ItemEvidencePanel
          embedded
          documentId={documentId}
          itemId={item.id}
          itemName={itemTitle(item)}
          expectedVersion={expectedVersion}
          onChanged={onChanged}
        />
      )}
      {!priceFree && <ItemPriceHistory item={item} revisions={revisions} />}
      {priceFree &&
        (revisions?.history || []).some(
          (event) => Number(event.item_id) === Number(item.id),
        ) && (
          <details>
            <summary className="min-h-10 cursor-pointer font-medium">
              Quantity / item history
            </summary>
            <ol className="space-y-3">
              {revisions.history
                .filter((event) => Number(event.item_id) === Number(item.id))
                .map((event) => (
                  <li key={event.revision}>
                    <p>
                      {event.actor_name} · {event.role_name} · {event.at}
                    </p>
                    <p>
                      Quantity: {event.before.quantity} → {event.after.quantity}
                    </p>
                    <p className="whitespace-pre-wrap">{event.reason}</p>
                  </li>
                ))}
            </ol>
          </details>
        )}
    </div>
  );
}
/**
 * Purpose: let a reviewer inspect the selected item's changes without leaving the compact table.
 *
 * Algorithm:
 * 1. Filter the supplied revision history by this item's ID; return null when none matches.
 * 2. Render a collapsed clock/history control containing only those matching events.
 * 3. For each event show actor, role/time, original and revised unit price or rejection/
 *    restoration, effective payable before/after values, and the saved reason.
 * 4. Render values as React text rather than injected HTML; preserve the recorded order.
 *
 * The history is evidence, not an editor. Opening it never changes an item or approval.
 * @returns {React.ReactNode} Per-item expandable history, or null without tracked changes.
 */
export function ItemPriceHistory({ item, revisions }) {
  const changes = (revisions?.history || []).filter(
    (event) => Number(event.item_id) === Number(item.id),
  );
  if (!changes.length) return null;
  return (
    <details className="w-full text-gray-700 dark:text-gray-300">
      <summary className="flex min-h-10 cursor-pointer items-center gap-1.5 text-brand-600 dark:text-brand-300">
        <History size={14} aria-hidden="true" />
        Price / item history ({changes.length})
        <span className="sr-only"> for {itemTitle(item)}</span>
      </summary>
      <ol className="space-y-3 border-l-2 border-gray-200 pl-3 dark:border-gray-700">
        {changes.map((event) => (
          <li key={event.revision} className="max-w-xl">
            <p className="font-medium">
              {event.at} · {event.actor_name} · {event.role_name}
            </p>
            <p className="mt-1">
              {["price", "terms"].includes(event.change)
                ? `Unit price: ${amount(event.before.unit_price)} → ${amount(event.after.unit_price)}`
                : event.change === "quantity"
                  ? "Quantity adjusted"
                  : event.change === "reject"
                    ? "Item rejected"
                    : "Item restored"}
            </p>
            <p className="mt-1">
              Payable:{" "}
              {amount(event.before.rejected ? 0 : event.before.total_price)} →{" "}
              {amount(event.after.rejected ? 0 : event.after.total_price)}
            </p>
            <p className="mt-1">
              Quantity:{" "}
              {event.before.procurement_quantity ??
                event.before.quantity ??
                "Not recorded"}{" "}
              →{" "}
              {event.after.procurement_quantity ??
                event.after.quantity ??
                "Not recorded"}
            </p>
            {event.account_change && (
              <p className="mt-1">
                Account: {event.account_change.before.name} →{" "}
                {event.account_change.after.name}
              </p>
            )}
            <p className="mt-1 whitespace-pre-wrap break-words">
              {event.reason}
            </p>
          </li>
        ))}
      </ol>
    </details>
  );
}
/**
 * Purpose: connect the compact table to this workflow's authorised item evidence.
 * Algorithm: forward the original rows and permitted editor callback, then mount receipt,
 * stage evidence and audit history only inside the selected row's full-width disclosure.
 * The table keeps pagination/search locally; saved quantities and totals stay API-owned.
 */
function RequestedItems({
  items,
  documentType,
  onUpload,
  uploading,
  revisions,
  documentId,
  stageEvidence,
  expectedVersion,
  onChanged,
  priceFree,
  onEditItem,
  budgetComparison,
  currency,
}) {
  return (
    <ApprovalItemsTable
      items={items}
      documentType={documentType}
      heading={documentFlow(documentType).items}
      priceFree={priceFree}
      onEditItem={onEditItem}
      renderDetails={(item) => (
        <>
          {!priceFree && (
            <ItemBudgetComparison
              comparison={budgetComparison}
              item={item}
              currency={currency}
            />
          )}
          <ItemLinks
            item={item}
            onUpload={onUpload}
            uploading={uploading}
            revisions={revisions}
            documentId={documentId}
            stageEvidence={stageEvidence}
            expectedVersion={expectedVersion}
            onChanged={onChanged}
            priceFree={priceFree}
          />
        </>
      )}
    />
  );
}
/**
 * Purpose: coordinate one approval detail page without replacing its original workflow layout.
 *
 * Data/action algorithm:
 * 1. Read the workflow route ID and authenticated location/role; keep return navigation
 *    consistent with My Approvals versus the oversight centre.
 * 2. Query authorised detail using tenant, session and selected context in the cache key,
 *    so switching location or role cannot reuse another context's reviewable response.
 * 3. Render the current owner, original stage sidebar/mobile drawer, item table and compact
 *    optional revision tools from server capabilities rather than deriving approval rights.
 * 4. Bind decision, receipt, cash and item-change writes to the detail's action_version.
 *    Decisions also include the current step ID; uploads send only the allowed receipt data.
 * 5. After a saved change, refresh dependent caches so totals, inbox owner, financial data
 *    and earlier-step reapproval state stay aligned. Explain queued email retries separately
 *    from the already committed business change.
 * 6. On failure, retain the error and refetch current detail; stale decisions are not silently
 *    replayed against a new role, location, price or financial balance.
 * 7. Preserve expanded histories and keep closed workflows read-only through server rights.
 *
 * This React coordinator sends proposals; the backend owns authorisation, exact-cents
 * calculation, locks, audit, workflow movement and cash/refund rules.
 */
export default function ApprovalCenterDetails() {
  const { workflow_id } = useParams();
  const route = useLocation();
  const navigate = useNavigate();
  const back =
    route.state?.from === "/procurement/controls"
      ? "/procurement/controls"
      : "/procurement/approvals";
  const backLabel = back.endsWith("controls")
    ? "Approval Centre"
    : "My Approvals";
  const auth = useSelector((state) => state.authReducer || state.auth || {});
  const client = useQueryClient();
  const [saved, setSaved] = useState("");
  const [failure, setFailure] = useState("");
  const [editRequest, setEditRequest] = useState(null);
  useEffect(() => {
    setSaved("");
    setFailure("");
    setEditRequest(null);
  }, [workflow_id, auth.location_id, auth.role_id]);
  const query = useQuery({
    queryKey: [
      "approvalcenter",
      "detail",
      workflow_id,
      tokenHelpers.getTenantDb(),
      tokenHelpers.getToken(),
      auth.location_id,
      auth.role_id,
    ],
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await axios.get(API_PATH_SETTING, {
        ...axiosConfig,
        params: {
          table: "approvalcenter",
          cat: "getSingleApprovalItem",
          data: JSON.stringify({ id: workflow_id }),
        },
      });
      if (data?.status === "error") throw new Error(data.message);
      return data;
    },
  });
  const mutation = useMutation({
    mutationFn: async (values) => {
      const step = currentStep(query.data);
      const { data } = await axios.post(
        API_PATH_SETTING,
        {
          ...values,
          table: "approvalcenter",
          cat: "action_function",
          workflow_id,
          instance_step_id: step?.id,
          expected_version: query.data.action_version,
        },
        axiosConfig,
      );
      if (data?.status === "error") throw new Error(data.message);
      return data;
    },
    onMutate: () => {
      setSaved("");
      setFailure("");
    },
    onSuccess: async (result) => {
      setSaved(
        "Your decision was saved. The request below shows its latest position.",
      );
      if (Number(result.notifications?.failed) > 0)
        toast("Decision saved. Email delivery is queued for retry.", {
          icon: "⚠️",
        });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["approvalcenter"] }),
        client.invalidateQueries({ queryKey: ["controlcenter"] }),
        client.invalidateQueries({ queryKey: ["requisitions"] }),
      ]);
    },
    onError: async (error) => {
      setFailure(error.response?.data?.message || error.message);
      await query.refetch();
    },
  });
  const receiptUpload = useMutation({
    mutationFn: async ({ item, file, expectedVersion }) => {
      const form = new FormData();
      for (const [key, value] of Object.entries({
        table: "approvalcenter",
        cat: "upload_item_receipt",
        workflow_id,
        item_id: item.id,
        expected_version: expectedVersion ?? query.data.action_version,
      }))
        form.append(key, String(value));
      form.append("file", file);
      const config = { ...axiosConfig, headers: { ...axiosConfig.headers } };
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
      const { data } = await axios.post(API_PATH_SETTING, form, config);
      if (data?.status === "error") throw new Error(data.message);
      return data;
    },
    onSuccess: async () => {
      setFailure("");
      setSaved("Receipt saved. Other reviewers can view it from this item.");
      await client.invalidateQueries({ queryKey: ["approvalcenter"] });
    },
    onError: async (error) => {
      setFailure(error.response?.data?.message || error.message);
      await query.refetch();
    },
  });
  const cashMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await axios.post(
        API_PATH_SETTING,
        {
          ...values,
          table: "approvalcenter",
          cat: "record_cash_movement",
          workflow_id,
          expected_version: query.data.action_version,
        },
        axiosConfig,
      );
      if (data?.status === "error") throw new Error(data.message);
      return data;
    },
    onSuccess: async (result) => {
      setFailure("");
      setSaved(
        "Cash movement saved. Spending, budget usage and history have been updated.",
      );
      if (Number(result.notifications?.failed) > 0)
        toast("Cash entry saved. Email delivery is queued for retry.");
      await client.invalidateQueries();
    },
    onError: async (error) => {
      setFailure(error.response?.data?.message || error.message);
      await query.refetch();
    },
  });
  // The version binds this change to the exact request the approver reviewed.
  // Refreshing all dependent queries keeps totals, inbox ownership and budget data aligned.
  const itemRevision = useMutation({
    mutationFn: async (values) => {
      const { data } = await axios.post(
        API_PATH_SETTING,
        {
          ...values,
          table: "approvalcenter",
          cat: "revise_approval_item",
          workflow_id,
          expected_version:
            values.expected_version ?? query.data.action_version,
        },
        axiosConfig,
      );
      if (data?.status === "error") throw new Error(data.message);
      return data;
    },
    onSuccess: async (result) => {
      setEditRequest(null);
      setFailure("");
      if (result.replaced_instance_id && result.data?.id) {
        toast.success("Approval restarted from the first step. The saved item details are retained.");
        navigate(`/procurement/approvals/${result.data.id}`, { replace: true, state: route.state });
      }
      setSaved(
        result.data?.item_revisions?.reapproval
          ? "Item change saved. The request has returned to earlier approvers; further payments are paused."
          : "Item change saved. Totals have been recalculated and notifications queued.",
      );
      if (Number(result.notifications?.failed) > 0)
        toast("Change saved. Email delivery is queued for retry.");
      await client.invalidateQueries();
    },
    onError: async (error) => {
      setFailure(error.response?.data?.message || error.message);
      await query.refetch();
    },
  });
  if (query.isPending)
    return (
      <p role="status" className="p-8 text-gray-500 dark:text-gray-400">
        Loading approval request…
      </p>
    );
  if (query.error)
    return (
      <div
        role="alert"
        className={`${card} space-y-3 p-6 text-red-600 dark:text-red-300`}
      >
        <h1 className="font-semibold">Request could not be loaded</h1>
        <p>{query.error.response?.data?.message || query.error.message}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="min-h-11 underline"
        >
          Try again
        </button>
        <Link className="ml-4 underline" to={back}>
          {backLabel}
        </Link>
      </div>
    );
  const workflow = query.data || {},
    document = workflow.document_data || {},
    step = currentStep(workflow);
  const progress = workflowProgress(workflow);
  const closed =
    Number(workflow.is_completed) === 1 || Number(workflow.is_active) === 0;
  return (
    <>
      <PageBreadcrumb pageTitle="Approval request" hideTitle />
      <div className="space-y-5">
        <Link
          to={back}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {backLabel}
        </Link>
        {saved && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle2 size={18} className="shrink-0" aria-hidden="true" />
            {saved}
          </p>
        )}
        {failure && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"
          >
            {failure}
          </p>
        )}
        {(workflow.previous_workflow_instance_id || workflow.replacement_workflow_instance_id) && (
          <Link className="text-sm font-medium text-brand-600 dark:text-brand-300" state={route.state}
            to={`/procurement/approvals/${workflow.replacement_workflow_instance_id || workflow.previous_workflow_instance_id}`}>
            {workflow.replacement_workflow_instance_id ? 'View current approval' : 'View previous approval history'}
          </Link>
        )}
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <section className={`${card} p-5 sm:p-6`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {workflow.document_number} ·{" "}
                    {displayDocumentType(
                      workflow.document_type_id,
                      workflow.document_name,
                    )}
                  </p>
                  <h1 className="mt-2 break-words text-xl font-semibold leading-7 text-gray-900 sm:text-2xl dark:text-white">
                    {document.title ||
                      document.budget_name ||
                      workflow.document_name}
                  </h1>
                </div>
                <WorkflowStatusBadge workflow={workflow} />
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 text-sm lg:grid-cols-4">
                {[
                  [
                    "Requester",
                    document.requester_name || document.created_by_name,
                  ],
                  ["Location", document.location_name],
                  [
                    "Current owner",
                    closed ? "Workflow closed" : workflow.current_role_name,
                  ],
                  ["Due", closed ? "—" : date(step?.due_date)],
                  ...(Number(workflow.document_type_id) === 1
                    ? []
                    : [
                        [
                          "Amount",
                          `${document.currency_code || ""} ${amount(document.amount ?? document.total_amount)}`,
                        ],
                      ]),
                  ...([2, 3, 9].includes(Number(workflow.document_type_id))
                    ? [
                        [
                          "Budget",
                          document.budget_name ||
                            (Number(workflow.document_type_id) === 9
                              ? "As assigned to source items"
                              : "Not linked"),
                        ],
                      ]
                    : []),
                  ["Department", document.department_name],
                  ["Submitted", date(workflow.submitted_at)],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-gray-500 dark:text-gray-400">
                      {label}
                    </dt>
                    <dd
                      className={`mt-1 break-words font-medium ${label === "Due" && workflow.is_overdue && !closed ? "text-red-700 dark:text-red-300" : "text-gray-800 dark:text-gray-200"}`}
                    >
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
              {document.purpose && (
                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Purpose
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {document.purpose}
                  </p>
                </div>
              )}
              {progress.total > 0 && (
                <div className="mt-5 flex items-center gap-4">
                  <div
                    role="progressbar"
                    aria-label="Approval progress"
                    aria-valuenow={progress.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                  >
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                    {progress.completed} of {progress.total} steps complete
                  </p>
                </div>
              )}
            </section>
            {workflow.finance?.disbursement && (
              <p
                role="status"
                className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
              >
                {closed
                  ? "Disbursed — workflow completed"
                  : Number(workflow.document_type_id) === 3
                    ? "Cash advance disbursed — reconciliation ongoing"
                    : "Disbursed — workflow ongoing"}{" "}
                ·{" "}
                {workflow.cash_movements?.net_paid ??
                  workflow.finance.disbursement.amount}{" "}
                net paid · First payment:{" "}
                {date(workflow.finance.disbursement.at)}. Already included in
                spending and budget usage; closure does not charge it again.
              </p>
            )}
            <WorkflowDrawer
              key={workflow.id}
              currentOwner={workflow.current_role_name}
              closed={closed}
            >
              <StepsSidebar
                steps={workflow.steps || []}
                role_id={auth.role_id}
                activeStep={step}
                workflow={workflow}
                isWorkflowCompleted={closed}
              />
            </WorkflowDrawer>
            <RequestedItems
              items={workflow.document_items || []}
              budgetComparison={workflow.budget_comparison}
              currency={document.currency_code || ""}
              documentType={workflow.document_type_id}
              revisions={workflow.item_revisions}
              onEditItem={
                workflow.permissions?.can_revise_items
                  ? (item) =>
                      setEditRequest({
                        itemId: item.id,
                        expectedVersion: workflow.action_version,
                      })
                  : undefined
              }
              documentId={workflow.document_id}
              stageEvidence={workflow.stage_evidence_enabled}
              expectedVersion={workflow.action_version}
              onChanged={() => query.refetch()}
              priceFree={Number(workflow.document_type_id) === 1}
              onUpload={
                !workflow.stage_evidence_enabled &&
                workflow.permissions?.can_upload_receipt
                  ? (item, file) => receiptUpload.mutateAsync({ item, file })
                  : undefined
              }
              uploading={receiptUpload.isPending}
            />
            {
              <p className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                <Info size={18} className="mt-1 shrink-0" aria-hidden="true" />
                {documentFlow(workflow.document_type_id).description}
              </p>
            }
            {Number(workflow.document_type_id) === 1 ? (
              <DemandReviewPanel
                onClose={() => setEditRequest(null)}
                editRequest={editRequest}
                renderEvidence={(
                  item,
                  { expectedVersion, onBusyChange, onVersionChange },
                ) =>
                  workflow.stage_evidence_enabled ? (
                    <ItemEvidencePanel
                      embedded
                      documentId={workflow.document_id}
                      itemId={item.id}
                      itemName={itemTitle(item)}
                      expectedVersion={expectedVersion}
                      onBusyChange={onBusyChange}
                      onChanged={async () => {
                        const fresh = await query.refetch();
                        if (fresh.error) throw fresh.error;
                        onVersionChange(fresh.data.action_version);
                      }}
                    />
                  ) : (
                    <LegacyItemEvidence
                      embedded
                      item={item}
                      fileUrl={item.doc_path ? receiptUrl(item.doc_path) : null}
                      onBusyChange={onBusyChange}
                      onUpload={
                        workflow.permissions?.can_upload_receipt
                          ? async (line, file) => {
                              await receiptUpload.mutateAsync({
                                item: line,
                                file,
                                expectedVersion,
                              });
                              const fresh = await query.refetch();
                              if (fresh.error) throw fresh.error;
                              onVersionChange(fresh.data.action_version);
                            }
                          : undefined
                      }
                    />
                  )
                }
                key={`demand-${workflow.id}-${auth.location_id}-${auth.role_id}`}
                workflow={workflow}
                isLoading={itemRevision.isPending}
                onSave={(values) => itemRevision.mutateAsync(values)}
              />
            ) : (
              <ItemRevisionPanel
                onClose={() => setEditRequest(null)}
                editRequest={editRequest}
                renderEvidence={(
                  item,
                  { expectedVersion, onBusyChange, onVersionChange },
                ) =>
                  workflow.stage_evidence_enabled ? (
                    <ItemEvidencePanel
                      embedded
                      documentId={workflow.document_id}
                      itemId={item.id}
                      itemName={itemTitle(item)}
                      expectedVersion={expectedVersion}
                      onBusyChange={onBusyChange}
                      onChanged={async () => {
                        const fresh = await query.refetch();
                        if (fresh.error) throw fresh.error;
                        onVersionChange(fresh.data.action_version);
                      }}
                    />
                  ) : (
                    <LegacyItemEvidence
                      embedded
                      item={item}
                      fileUrl={item.doc_path ? receiptUrl(item.doc_path) : null}
                      onBusyChange={onBusyChange}
                      onUpload={
                        workflow.permissions?.can_upload_receipt
                          ? async (line, file) => {
                              await receiptUpload.mutateAsync({
                                item: line,
                                file,
                                expectedVersion,
                              });
                              const fresh = await query.refetch();
                              if (fresh.error) throw fresh.error;
                              onVersionChange(fresh.data.action_version);
                            }
                          : undefined
                      }
                    />
                  )
                }
                key={`items-${workflow.id}-${auth.location_id}-${auth.role_id}`}
                workflow={workflow}
                isLoading={itemRevision.isPending}
                onSave={(values) => itemRevision.mutateAsync(values)}
              />
            )}
            <CashMovementPanel
              key={`cash-${workflow.id}-${workflow.action_version}`}
              workflow={workflow}
              isLoading={cashMutation.isPending}
              onSave={(values) => cashMutation.mutateAsync(values)}
            />
            <div id="decision-panel" className="min-w-0 space-y-3">
              <ApprovalActions
                key={`${workflow.id}-${workflow.action_version}-${auth.role_id}`}
                workflow={workflow}
                isLoading={mutation.isPending}
                onSubmit={(values) => mutation.mutateAsync(values)}
              />
              <ApprovalEmailReminder workflow={workflow} />
              {!closed && (
                <p className="px-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {workflow.escalation_role_name
                    ? `Escalation role: ${workflow.escalation_role_name}`
                    : workflow.permissions?.can_approve
                      ? "No escalation role is configured. An administrator can set one in workflow settings."
                      : ""}
                </p>
              )}
            </div>
          </div>
          <aside
            aria-label="Workflow stages and next approver"
            className="hidden min-w-0 lg:sticky lg:top-28 lg:block"
          >
            <StepsSidebar
              steps={workflow.steps || []}
              role_id={auth.role_id}
              activeStep={step}
              workflow={workflow}
              isWorkflowCompleted={closed}
            />
          </aside>
        </div>
        <details className={`${card} group`} open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-semibold text-gray-900 dark:text-white">
            <span className="flex items-center gap-2">
              <History size={18} className="text-gray-400" aria-hidden="true" />
              Approval history
            </span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 group-open:hidden">
              Show steps
            </span>
          </summary>
          <ol className="space-y-3 px-5 pb-5">
            {(workflow.steps || []).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-gray-100 p-4 text-sm dark:border-gray-800"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.step_serial_number}. {item.step_name} ·{" "}
                    {item.role_name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Number(item.is_active) === 1
                      ? "Approved"
                      : !closed &&
                          Number(item.id) ===
                            Number(workflow.current_step_id) &&
                          Number(item.assigned_to_user_id) === 1
                        ? "Current"
                        : Number(item.action_id) === 2
                          ? "Returned"
                          : "Waiting"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {item.performed_by_name || "No decision recorded"} ·{" "}
                  {date(item.completed_at)}
                </p>
                {item.comments && (
                  <p className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                    {item.comments}
                  </p>
                )}
                {item.rejection_comments && (
                  <p className="mt-2 text-red-600 dark:text-red-300">
                    Return reason: {item.rejection_comments}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </details>
        {workflow.escalation_history?.length > 0 && (
          <details className={`${card} group`}>
            <summary className="cursor-pointer p-5 font-semibold text-gray-900 dark:text-white">
              Escalation history ({workflow.escalation_history.length})
            </summary>
            <ol className="space-y-4 px-5 pb-5 text-sm text-gray-700 dark:text-gray-300">
              {workflow.escalation_history.map((event, index) => (
                <li key={index}>
                  <strong>
                    {event.state === "pending"
                      ? "Raised"
                      : event.state === "resolved"
                        ? "Resolved"
                        : "Returned"}
                  </strong>{" "}
                  · {date(event.resolved_at || event.raised_at)}
                  <p className="mt-1 whitespace-pre-wrap">
                    {event.resolution || event.comments}
                  </p>
                </li>
              ))}
            </ol>
          </details>
        )}
        {workflow.audit_history?.length > 0 && (
          <details className={card}>
            <summary className="cursor-pointer p-5 font-semibold text-gray-900 dark:text-white">
              Decision log ({workflow.audit_history.length})
            </summary>
            <ol className="space-y-4 px-5 pb-5 text-sm text-gray-700 dark:text-gray-300">
              {workflow.audit_history.map((event) => (
                <li
                  key={event.id}
                  className="border-l-2 border-gray-200 pl-3 dark:border-gray-700"
                >
                  <p className="font-medium">
                    {{
                      SUBMIT: "Submitted",
                      APPROVE_INSTANCE: "Approved",
                      REJECT_INSTANCE: "Returned / Rejected",
                      ESCALATE_INSTANCE: "Escalated",
                      RESOLVE_ESCALATION: "Escalation resolved",
                      RETURN_ESCALATION: "Escalation returned",
                      CANCEL_INSTANCE: "Cancelled",
                      RESET_TO_DRAFT: "Reset to draft",
                    }[event.action_name] || event.action_name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {event.user_name || "Recorded user"} ·{" "}
                    {event.role_name || "—"} · {date(event.created_at)}
                  </p>
                  {event.comments && (
                    <p className="mt-2 whitespace-pre-wrap">{event.comments}</p>
                  )}
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </>
  );
}
