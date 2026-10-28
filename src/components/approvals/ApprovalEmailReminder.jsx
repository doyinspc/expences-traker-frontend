import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig } from '../../actions/common';

export default function ApprovalEmailReminder({ workflow }) {
  const [recipient, setRecipient] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const lock = useRef(false);
  useEffect(() => { setRecipient(''); setFeedback(null); }, [workflow.id, workflow.action_version]);
  if (!workflow.permissions?.can_resend || !workflow.resend_recipients?.length) return null;
  const submit = async event => {
    event.preventDefault(); if (lock.current || !recipient) return;
    lock.current = true; setBusy(true); setFeedback(null);
    try {
      const { data } = await axios.post(API_PATH_SETTING, { table: 'approvalcenter', cat: 'resend_approval_email', workflow_id: workflow.id, expected_version: workflow.action_version, recipient_id: Number(recipient) }, axiosConfig);
      if (data?.status === 'error') throw new Error(data.message);
      setFeedback({ message: Number(data.notifications?.failed) > 0 ? 'The reminder is queued. Email delivery will be retried.' : 'The reminder was sent to the selected manager.' });
    } catch (error) { setFeedback({ error: true, message: error.response?.data?.message || error.message || 'The reminder could not be sent.' }); }
    finally { lock.current = false; setBusy(false); }
  };
  return <form onSubmit={submit} aria-busy={busy} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
    <h2 className="font-semibold text-gray-900 dark:text-white">Send approval reminder</h2>
    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Choose a manager assigned to the current approval role. This sends a fresh email and keeps the workflow with its current owner.</p>
    <fieldset disabled={busy} className="mt-4 space-y-3 disabled:opacity-70">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Line manager *<select required value={recipient} onChange={event => setRecipient(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="">Select an eligible manager</option>{workflow.resend_recipients.map(user => <option key={user.id} value={user.id}>{user.name || user.email} · {user.email}</option>)}</select></label>
      <button type="submit" disabled={!recipient || busy} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Sending reminder…' : 'Send reminder email'}</button>
    </fieldset>
    <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">Reminders are limited to one every five minutes per request. Never forward a private approval link.</p>
    {feedback && <p role={feedback.error ? 'alert' : 'status'} className={`mt-3 text-sm ${feedback.error ? 'text-red-600 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{feedback.message}</p>}
  </form>;
}
