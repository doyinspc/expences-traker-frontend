import { useState } from 'react';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig1 } from '../../actions/common';

export default function SelectedResetInvitations({ users, selectedIds, onClear, scopeKey }) {
  const [review, setReview] = useState(null), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [message, setMessage] = useState('');
  const selected = users.filter(u => selectedIds.includes(Number(u.id)));
  const send = async () => {
    if (busy || !review || review.scopeKey !== scopeKey) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const body = new FormData(); body.append('table', 'users'); body.append('cat', 'requestSelectedPasswordResets');
      body.append('user_ids', JSON.stringify(review.users.map(u => Number(u.id))));
      const { data } = await axios.post(API_PATH_SETTING, body, axiosConfig1);
      if (data?.success === false || data?.status === 'error') throw new Error(data.message || 'Reset invitations could not be requested.');
      const result = data.data, delivery = result.delivery || {};
      setMessage(`${result.requested} invitation(s) queued. ${delivery.sent || 0} submitted to the mail server; ${result.skipped || 0} inactive or invalid-email accounts skipped; ${result.already_requested || 0} recent duplicate(s) skipped. Any remaining invitations need the scheduled email worker. Inbox delivery must be confirmed by the recipient.`);
      setReview(null); onClear();
    } catch (e) { setError(e.response?.data?.message || e.message || 'Reset invitations could not be requested.'); }
    finally { setBusy(false); }
  };
  return <section aria-label="Selected staff password-reset emails" className="mb-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-gray-900 dark:text-white">Email password-reset links</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select one or more staff members in the table. Links go to their saved email addresses.</p></div>
      <button type="button" disabled={busy || !selected.length} onClick={() => { setReview({ users: selected, scopeKey }); setError(''); setMessage(''); }} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50">Review reset emails ({selected.length})</button></div>
    {review?.scopeKey === scopeKey && <div className="mt-4 space-y-3 border-t border-gray-200 pt-3 dark:border-gray-800"><p className="text-sm text-gray-700 dark:text-gray-200">Confirm these {review.users.length} recipient(s). Inactive accounts and invalid addresses are skipped. Existing passwords stay valid until each recipient uses their private, single-use link within 60 minutes. No password is emailed.</p>
      <ul className="max-h-48 overflow-auto text-sm text-gray-700 dark:text-gray-200">{review.users.map(u => <li key={u.id} className="break-words py-1">{[u.first_name, u.last_name].filter(Boolean).join(' ') || u.employee_id} · {u.email || 'No email saved'}{Number(u.is_active) !== 1 ? ' · Inactive (will be skipped)' : ''}</li>)}</ul>
      <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={send} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Requesting…' : 'Send selected reset links'}</button><button type="button" disabled={busy} onClick={() => setReview(null)} className="min-h-11 px-4 text-sm text-gray-700 dark:text-gray-200">Cancel reset emails</button></div></div>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
  </section>;
}
