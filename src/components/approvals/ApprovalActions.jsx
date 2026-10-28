import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle2, Info, LockKeyhole } from 'lucide-react';
import { API_PATH_SETTING, axiosConfig, tokenHelpers } from '../../actions/common';

const control = 'mt-1.5 block min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-brand-900';
const explanations = {
  approve_instance: 'Approve this step and move the request forward in its configured workflow.',
  reject_instance: 'Return the request to the previous approval step. Your reason and comments explain what needs attention.',
  escalate_instance: 'Send this step to its configured escalation role for review. The original approver resumes after resolution.',
  resolve_escalation: 'Record the resolution and return the request to the original approver. This does not approve the request.',
  return_escalation: 'Return the escalation to the original approver with instructions for clarification. This does not approve the request.',
  cancel_instance: 'Close this approval workflow as cancelled. Explain why it should no longer proceed.',
};

export default function ApprovalActions({ workflow, onSubmit, isLoading }) {
  const permissions = workflow.permissions || {};
  const [action, setAction] = useState('approve_instance');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const statusRef = useRef(null), reasonRef = useRef(null), commentsRef = useRef(null);
  const options = permissions.can_resolve ? [['resolve_escalation', 'Resolve and return to approver'], ['return_escalation', 'Return for clarification']] : [
    ...(permissions.can_approve ? [['approve_instance', 'Approve'], ['reject_instance', 'Return / Reject']] : []),
    ...(permissions.can_escalate ? [['escalate_instance', 'Escalate']] : []),
    ...(permissions.can_cancel ? [['cancel_instance', 'Cancel request']] : []),
  ];
  const selected = options.some(([value]) => value === action) ? action : options[0]?.[0];
  const group = selected === 'reject_instance' ? 18 : 17;
  const requiresReason = ['reject_instance', 'escalate_instance'].includes(selected);
  const reference = async grp => { const { data } = await axios.get(API_PATH_SETTING, { ...axiosConfig, params: { table: 'commons', cat: 'gets', data: JSON.stringify({ grp, is_active: 1 }) } }); if (data?.status === 'error') throw new Error(data.message); return Array.isArray(data) ? data : data?.data || []; };
  const statuses = useQuery({ queryKey: ['commons', 'workflow-statuses', tokenHelpers.getTenantDb()], queryFn: () => reference(11), enabled: options.length > 0 });
  const reasons = useQuery({ queryKey: ['commons', 'workflow-reasons', tokenHelpers.getTenantDb(), group], queryFn: () => reference(group), enabled: requiresReason });
  if (!options.length) {
    const closed = Number(workflow.is_completed) === 1 || Number(workflow.is_active) === 0;
    return <section aria-label="Decision availability" className="flex gap-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"><LockKeyhole size={20} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" /><div><h2 className="font-semibold text-gray-900 dark:text-white">{closed ? 'Workflow closed' : workflow.escalation?.state === 'pending' ? 'Awaiting escalation review' : 'View access'}</h2><p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{closed ? 'This workflow has no further decisions available.' : workflow.escalation?.state === 'pending' ? 'This request is with the escalation role for resolution.' : 'You can view this request. Actions are available only to the assigned role at this location.'}</p></div></section>;
  }
  const busy = saving || isLoading;
  const referenceError = statuses.error || (requiresReason && reasons.error);
  const submit = async event => {
    event.preventDefault(); if (busy) return; setError('');
    const next = {};
    if (!status) next.status = 'Choose a status for this decision.';
    if (requiresReason && !reason) next.reason = 'Choose a reason so the next reviewer has context.';
    if (selected !== 'approve_instance' && !comments.trim()) next.comments = 'Explain your decision in the comments.';
    setErrors(next);
    if (Object.keys(next).length) { (next.status ? statusRef : next.reason ? reasonRef : commentsRef).current?.focus(); return; }
    setSaving(true);
    try {
      await onSubmit({ action: selected, status_id: status, comments: comments.trim(), ...(selected === 'reject_instance' ? { rejection_reason_id: reason, rejection_comments: comments.trim() } : selected === 'escalate_instance' ? { escalation_reason_id: reason, escalation_comments: comments.trim() } : {}) });
      setStatus(''); setReason(''); setComments('');
    } catch (failure) { setError(failure.response?.data?.message || failure.message || 'The action could not be saved.'); }
    finally { setSaving(false); }
  };
  return <form noValidate onSubmit={submit} aria-busy={busy} className="rounded-xl border border-brand-200 bg-white p-5 dark:border-brand-900 dark:bg-gray-900">
    <div className="flex items-center gap-2"><CheckCircle2 size={20} className="text-brand-500" aria-hidden="true" /><h2 className="font-semibold text-gray-900 dark:text-white">{permissions.can_resolve ? 'Resolve escalation' : 'Your decision'}</h2></div>
    <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">Your decision is recorded with your name, role and location. Fields marked * are required.</p>
    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
    {referenceError && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">Reference options could not be loaded. <button type="button" className="min-h-11 underline" onClick={() => { statuses.refetch(); if (requiresReason) reasons.refetch(); }}>Try again</button></p>}
    {Object.values(errors).some(Boolean) && <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-300">Complete the highlighted fields before saving your decision.</p>}
    <fieldset disabled={busy} className="mt-4 space-y-4 disabled:opacity-70">
      <div className={`grid gap-4 ${requiresReason ? 'lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Action<select value={selected} onChange={event => { setAction(event.target.value); setReason(''); setErrors({}); setError(''); }} className={control}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Status *<select ref={statusRef} required value={status} onChange={event => { setStatus(event.target.value); setErrors(previous => ({ ...previous, status: '' })); }} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? 'decision-status-error' : undefined} className={control}><option value="">Select status</option>{(statuses.data || []).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select>{errors.status && <span id="decision-status-error" className="mt-1 block text-xs text-red-600 dark:text-red-300">{errors.status}</span>}</label>
        {requiresReason && <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Reason *<select ref={reasonRef} required value={reason} onChange={event => { setReason(event.target.value); setErrors(previous => ({ ...previous, reason: '' })); }} aria-invalid={Boolean(errors.reason)} aria-describedby={errors.reason ? 'decision-reason-error' : undefined} className={control}><option value="">Select reason</option>{(reasons.data || []).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select>{errors.reason && <span id="decision-reason-error" className="mt-1 block text-xs text-red-600 dark:text-red-300">{errors.reason}</span>}</label>}
      </div>
      <p className="flex gap-2 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600 dark:bg-gray-800/60 dark:text-gray-300"><Info size={17} className="mt-1 shrink-0" aria-hidden="true" />{explanations[selected]}</p>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Comments {selected !== 'approve_instance' ? '*' : '(optional)'}<textarea ref={commentsRef} required={selected !== 'approve_instance'} maxLength={5000} rows={3} value={comments} onChange={event => { setComments(event.target.value); setErrors(previous => ({ ...previous, comments: '' })); }} aria-invalid={Boolean(errors.comments)} aria-describedby={errors.comments ? 'decision-comments-error' : undefined} className={`${control} py-3`} placeholder="Give the next person enough information to act." />{errors.comments && <span id="decision-comments-error" className="mt-1 block text-xs text-red-600 dark:text-red-300">{errors.comments}</span>}</label>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><p className="text-xs text-gray-500 dark:text-gray-400">Review the request and its items before confirming.</p><button disabled={busy || statuses.isPending || (requiresReason && reasons.isPending) || Boolean(referenceError)} className={`min-h-11 w-full rounded-lg px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 sm:w-auto ${selected === 'cancel_instance' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'}`}>{busy ? 'Saving decision…' : options.find(([value]) => value === selected)?.[1]}</button></div>
    </fieldset>
  </form>;
}
