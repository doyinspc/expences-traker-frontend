import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, History, CheckCircle2, Info } from 'lucide-react';
import { API_PATH_SETTING, axiosConfig, tokenHelpers, SERVER_URL } from '../../actions/common';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ApprovalActions from '../../components/approvals/ApprovalActions';
import StepsSidebar from '../../components/approvals/StepsSidebar';
import WorkflowDrawer from '../../components/approvals/WorkflowDrawer';
import ApprovalEmailReminder from '../../components/approvals/ApprovalEmailReminder';
import WorkflowStatusBadge from '../../components/approvals/WorkflowStatusBadge';
import { documentFlow } from '../../utils/functions/flowPresentation';
import { currentStep } from '../../utils/functions/workflowPresentation';
import { formatWorkflowDate, workflowProgress } from '../../utils/functions/workflowUx';

const date = value => formatWorkflowDate(value, true);
const amount = value => Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const card = 'min-w-0 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900';
const itemTitle = item => item.item_name || item.name || item.title || item.item_id || item.description || item.special_instructions || `Item ${item.id}`;
const account = item => item.account_name || (item.account_id ? `Account ${item.account_id}` : 'Not assigned');
const flags = item => [['Approved', Number(item.approved ?? item.is_approved) === 1 ? 'Yes' : 'No'], ['Fulfilled / Resolved', Number(item.resolved) === 1 ? 'Yes' : 'No']];
function ItemLinks({ item }) {
  return <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-600 dark:text-brand-300">{item.purchaseorder_id > 0 && <Link className="underline underline-offset-2" to={`/procurement/purchaseorder/${item.purchaseorder_id}`}>Procurement #{item.purchaseorder_id}</Link>}{item.sku_id > 0 && <Link className="underline underline-offset-2" to={`/procurement/stock/${item.sku_id}`}>Stock #{item.sku_id}</Link>}{item.doc_path && <a href={(SERVER_URL || API_PATH_SETTING.replace(/[^/]*$/, '')) + item.doc_path} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">View receipt <span className="sr-only">for {itemTitle(item)} (opens in a new tab)</span></a>}</div>;
}
function RequestedItems({ items, documentType }) {
  return <section className={`${card} overflow-hidden`} aria-labelledby="requested-items-heading"><div className="flex items-center gap-2 border-b border-gray-100 p-5 dark:border-gray-800"><FileText size={18} className="text-gray-400" aria-hidden="true" /><h2 id="requested-items-heading" className="font-semibold text-gray-900 dark:text-white">{documentFlow(documentType).items} <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">({items.length})</span></h2></div>
    <div className="hidden overflow-x-auto xl:block" role="region" aria-label="Requested item details" tabIndex={0}><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500 dark:text-gray-400 dark:bg-gray-800/50"><tr>{['Item / Description', 'Chart of account', 'Category', 'Quantity', 'Unit cost', 'Cost / Debit', 'Credit', 'Approved', 'Fulfilled / Resolved'].map(label => <th scope="col" key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{items.map(item => <tr key={item.id} className="text-gray-700 dark:text-gray-300"><td className="px-4 py-4 font-medium text-gray-900 dark:text-gray-100">{itemTitle(item)}<ItemLinks item={item} /></td><td className="px-4 py-4">{account(item)}</td><td className="px-4 py-4">{item.category_name || '—'}</td><td className="px-4 py-4 tabular-nums">{item.quantity ?? '—'}</td><td className="px-4 py-4 tabular-nums">{amount(item.unit_price)}</td><td className="px-4 py-4 tabular-nums">{amount(item.total_price ?? item.amount)}</td><td className="px-4 py-4 tabular-nums">{amount(item.credit_price)}</td>{flags(item).map(([label, value]) => <td key={label} className="px-4 py-4">{value}</td>)}</tr>)}</tbody></table></div>
    <div className="divide-y divide-gray-100 xl:hidden dark:divide-gray-800">{items.map(item => <article key={item.id} className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="min-w-0 font-medium text-gray-900 dark:text-white">{itemTitle(item)}</h3><span className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">{amount(item.total_price ?? item.amount)}</span></div><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Chart of account: {account(item)}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">{[['Category', item.category_name || '—'], ['Quantity', item.quantity ?? '—'], ['Unit cost', amount(item.unit_price)], ['Credit', amount(item.credit_price)], ...flags(item)].map(([label, value]) => <div key={label}><dt className="text-gray-500 dark:text-gray-400">{label}</dt><dd className="mt-1 text-gray-800 dark:text-gray-200">{value}</dd></div>)}</dl><ItemLinks item={item} /></article>)}</div>
    {!items.length && <p className="p-5 text-sm text-gray-500 dark:text-gray-400">No line items recorded for this document.</p>}
  </section>;
}
export default function ApprovalCenterDetails() {
  const { workflow_id } = useParams();
  const route = useLocation();
  const back = route.state?.from === '/procurement/controls' ? '/procurement/controls' : '/procurement/approvals';
  const backLabel = back.endsWith('controls') ? 'Approval Centre' : 'My Approvals';
  const auth = useSelector(state => state.authReducer || {});
  const client = useQueryClient();
  const [saved, setSaved] = useState('');
  const [failure, setFailure] = useState('');
  useEffect(() => { setSaved(''); setFailure(''); }, [workflow_id, auth.location_id, auth.role_id]);
  const query = useQuery({
    queryKey: ['approvalcenter', 'detail', workflow_id, tokenHelpers.getTenantDb(), tokenHelpers.getToken(), auth.location_id, auth.role_id],
    refetchInterval: 60000,
    queryFn: async () => { const { data } = await axios.get(API_PATH_SETTING, { ...axiosConfig, params: { table: 'approvalcenter', cat: 'getSingleApprovalItem', data: JSON.stringify({ id: workflow_id }) } }); if (data?.status === 'error') throw new Error(data.message); return data; },
  });
  const mutation = useMutation({
    mutationFn: async values => {
      const step = currentStep(query.data);
      const { data } = await axios.post(API_PATH_SETTING, { ...values, table: 'approvalcenter', cat: 'action_function', workflow_id, instance_step_id: step?.id, expected_version: query.data.action_version }, axiosConfig);
      if (data?.status === 'error') throw new Error(data.message);
      return data;
    },
    onMutate: () => { setSaved(''); setFailure(''); },
    onSuccess: async result => {
      setSaved('Your decision was saved. The request below shows its latest position.');
      if (Number(result.notifications?.failed) > 0) toast('Decision saved. Email delivery is queued for retry.', { icon: '⚠️' });
      await Promise.all([client.invalidateQueries({ queryKey: ['approvalcenter'] }), client.invalidateQueries({ queryKey: ['controlcenter'] }), client.invalidateQueries({ queryKey: ['requisitions'] })]);
    },
    onError: async error => { setFailure(error.response?.data?.message || error.message); await query.refetch(); },
  });
  if (query.isPending) return <p role="status" className="p-8 text-gray-500 dark:text-gray-400">Loading approval request…</p>;
  if (query.error) return <div role="alert" className={`${card} space-y-3 p-6 text-red-600 dark:text-red-300`}><h1 className="font-semibold">Request could not be loaded</h1><p>{query.error.response?.data?.message || query.error.message}</p><button type="button" onClick={() => query.refetch()} className="min-h-11 underline">Try again</button><Link className="ml-4 underline" to={back}>{backLabel}</Link></div>;
  const workflow = query.data || {}, document = workflow.document_data || {}, step = currentStep(workflow);
  const progress = workflowProgress(workflow);
  const closed = Number(workflow.is_completed) === 1 || Number(workflow.is_active) === 0;
  return <><PageBreadcrumb pageTitle="Approval request" hideTitle /><div className="space-y-5">
    <Link to={back} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-300"><ArrowLeft size={16} aria-hidden="true" />{backLabel}</Link>
    {saved && <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"><CheckCircle2 size={18} className="shrink-0" aria-hidden="true" />{saved}</p>}
    {failure && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{failure}</p>}
    <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
    <section className={`${card} p-5 sm:p-6`}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-medium text-gray-500 dark:text-gray-400">{workflow.document_number} · {workflow.document_name}</p><h1 className="mt-2 break-words text-xl font-semibold leading-7 text-gray-900 sm:text-2xl dark:text-white">{document.title || document.budget_name || workflow.document_name}</h1></div><WorkflowStatusBadge workflow={workflow} /></div>
      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 text-sm lg:grid-cols-4">{[['Requester', document.requester_name || document.created_by_name], ['Location', document.location_name], ['Current owner', closed ? 'Workflow closed' : workflow.current_role_name], ['Due', closed ? '—' : date(step?.due_date)], ['Amount', `${document.currency_code || ''} ${amount(document.amount ?? document.total_amount)}`], ['Budget', document.budget_name], ['Department', document.department_name], ['Submitted', date(workflow.submitted_at)]].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt><dd className={`mt-1 break-words font-medium ${label === 'Due' && workflow.is_overdue && !closed ? 'text-red-700 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'}`}>{value || '—'}</dd></div>)}</dl>
      {document.purpose && <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800"><p className="text-xs text-gray-500 dark:text-gray-400">Purpose</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">{document.purpose}</p></div>}
      {progress.total > 0 && <div className="mt-5 flex items-center gap-4"><div role="progressbar" aria-label="Approval progress" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100} className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-brand-500" style={{ width: `${progress.percent}%` }} /></div><p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{progress.completed} of {progress.total} steps complete</p></div>}
    </section>
    <WorkflowDrawer key={workflow.id} currentOwner={workflow.current_role_name} closed={closed}><StepsSidebar steps={workflow.steps || []} role_id={auth.role_id} activeStep={step} workflow={workflow} isWorkflowCompleted={closed} /></WorkflowDrawer>
      <RequestedItems items={workflow.document_items || []} documentType={workflow.document_type_id} />
        {<p className="flex gap-2 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"><Info size={18} className="mt-1 shrink-0" aria-hidden="true" />{documentFlow(workflow.document_type_id).description}</p>}
        <div id="decision-panel" className="min-w-0 space-y-3"><ApprovalActions key={`${workflow.id}-${workflow.action_version}-${auth.role_id}`} workflow={workflow} isLoading={mutation.isPending} onSubmit={values => mutation.mutateAsync(values)} /><ApprovalEmailReminder workflow={workflow} />{!closed && <p className="px-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{workflow.escalation_role_name ? `Escalation role: ${workflow.escalation_role_name}` : workflow.permissions?.can_approve ? 'No escalation role is configured. An administrator can set one in workflow settings.' : ''}</p>}</div>
      </div>
      <aside aria-label="Workflow stages and next approver" className="hidden min-w-0 lg:sticky lg:top-28 lg:block"><StepsSidebar steps={workflow.steps || []} role_id={auth.role_id} activeStep={step} workflow={workflow} isWorkflowCompleted={closed} /></aside>
    </div>
    <details className={`${card} group`} open><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-semibold text-gray-900 dark:text-white"><span className="flex items-center gap-2"><History size={18} className="text-gray-400" aria-hidden="true" />Approval history</span><span className="text-xs font-normal text-gray-500 dark:text-gray-400 group-open:hidden">Show steps</span></summary><ol className="space-y-3 px-5 pb-5">{(workflow.steps || []).map(item => <li key={item.id} className="rounded-lg border border-gray-100 p-4 text-sm dark:border-gray-800"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium text-gray-900 dark:text-white">{item.step_serial_number}. {item.step_name} · {item.role_name}</span><span className="text-xs text-gray-500 dark:text-gray-400">{Number(item.is_active) === 1 ? 'Approved' : !closed && Number(item.id) === Number(workflow.current_step_id) && Number(item.assigned_to_user_id) === 1 ? 'Current' : Number(item.action_id) === 2 ? 'Returned' : 'Waiting'}</span></div><p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{item.performed_by_name || 'No decision recorded'} · {date(item.completed_at)}</p>{item.comments && <p className="mt-2 whitespace-pre-wrap text-gray-600 dark:text-gray-300">{item.comments}</p>}{item.rejection_comments && <p className="mt-2 text-red-600 dark:text-red-300">Return reason: {item.rejection_comments}</p>}</li>)}</ol></details>
    {workflow.escalation_history?.length > 0 && <details className={`${card} group`}><summary className="cursor-pointer p-5 font-semibold text-gray-900 dark:text-white">Escalation history ({workflow.escalation_history.length})</summary><ol className="space-y-4 px-5 pb-5 text-sm text-gray-700 dark:text-gray-300">{workflow.escalation_history.map((event, index) => <li key={index}><strong>{event.state === 'pending' ? 'Raised' : event.state === 'resolved' ? 'Resolved' : 'Returned'}</strong> · {date(event.resolved_at || event.raised_at)}<p className="mt-1 whitespace-pre-wrap">{event.resolution || event.comments}</p></li>)}</ol></details>}
    {workflow.audit_history?.length > 0 && <details className={card}><summary className="cursor-pointer p-5 font-semibold text-gray-900 dark:text-white">Decision log ({workflow.audit_history.length})</summary><ol className="space-y-4 px-5 pb-5 text-sm text-gray-700 dark:text-gray-300">{workflow.audit_history.map(event => <li key={event.id} className="border-l-2 border-gray-200 pl-3 dark:border-gray-700"><p className="font-medium">{({ SUBMIT: 'Submitted', APPROVE_INSTANCE: 'Approved', REJECT_INSTANCE: 'Returned / Rejected', ESCALATE_INSTANCE: 'Escalated', RESOLVE_ESCALATION: 'Escalation resolved', RETURN_ESCALATION: 'Escalation returned', CANCEL_INSTANCE: 'Cancelled', RESET_TO_DRAFT: 'Reset to draft' })[event.action_name] || event.action_name}</p><p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{event.user_name || 'Recorded user'} · {event.role_name || '—'} · {date(event.created_at)}</p>{event.comments && <p className="mt-2 whitespace-pre-wrap">{event.comments}</p>}</li>)}</ol></details>}
  </div></>;
}
