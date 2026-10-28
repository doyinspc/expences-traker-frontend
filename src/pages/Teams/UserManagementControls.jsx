import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_PATH_SETTING, axiosConfig, axiosConfig1 } from '../../actions/common';
import useManagementAccess from '../../hooks/useManagementAccess';

export default function UserManagementControls({ users = [] }) {
  const { data: access } = useManagementAccess();
  const cache = useQueryClient();
  const [target, setTarget] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  if (!access?.is_super_admin) return null;
  const isSuper = (access.super_admin_ids || []).includes(Number(target));
  const field = 'min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white';
  const run = async (action) => {
    setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (e) { setError(e.response?.data?.message || e.message || 'The request failed.'); }
    finally { setBusy(false); }
  };
  const post = async (cat, values) => {
    const body = new FormData(); body.append('table', 'users'); body.append('cat', cat);
    Object.entries(values).forEach(([key, value]) => body.append(key, String(value)));
    const { data } = await axios.post(API_PATH_SETTING, body, axiosConfig1);
    if (data?.success === false || data?.status === 'error') throw new Error(data.message || 'The request failed.');
    return data.data;
  };
  const change = (e) => {
    e.preventDefault();
    run(async () => {
      await post('setSuperAdmin', { target_user_id: target, grant: isSuper ? 0 : 1, current_password: password });
      setPassword(''); setMessage('Super Admin access updated.');
      await cache.invalidateQueries({ queryKey: ['management-capabilities'] });
    });
  };
  return <details className="mb-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
    <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">Super Admin controls · Company-wide</summary>
    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Super Admins manage shared Settings and all users. Location permissions and approval roles stay separate.</p>
    <form onSubmit={change} className="mt-4 flex flex-wrap items-end gap-3">
      <label className="flex min-w-52 flex-1 flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">User
        <select required value={target} onChange={e => { setTarget(e.target.value); setPassword(''); }} className={field}>
          <option value="">Choose an active user</option>
          {users.filter(u => Number(u.is_active) === 1).map(u => <option key={u.id} value={u.id}>{[u.first_name, u.last_name].filter(Boolean).join(' ') || u.employee_id} · {u.email || u.employee_id}{access.super_admin_ids?.includes(Number(u.id)) ? ' · Super Admin' : ''}</option>)}
        </select>
      </label>
      <label className="flex flex-1 flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">Your current password
        <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={field} />
      </label>
      <button disabled={busy || !target} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white disabled:opacity-50">{isSuper ? 'Remove Super Admin' : 'Grant Super Admin'}</button>
    </form>
    <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-800">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Password-reset emails</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Send active users a private link valid for 60 minutes. Passwords change only when each user completes the reset; completed resets end their existing sessions.</p>
      {!preview ? <button type="button" disabled={busy} onClick={() => run(async () => {
        const { data } = await axios.get(API_PATH_SETTING, { ...axiosConfig, params: { table: 'users', cat: 'getResetPreview', data: '{}' } });
        if (data?.success === false || data?.status === 'error') throw new Error(data.message);
        setPreview(data.data); setConfirmed(false);
      })} className="mt-3 min-h-11 rounded-lg border border-gray-300 px-4 text-sm text-gray-800 dark:border-gray-700 dark:text-white">Review bulk reset</button> : <div className="mt-3 space-y-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">{preview.eligible} eligible users. {preview.skipped} inactive users or users without valid email will be skipped.</p>
        <label className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1" />I confirm sending password-reset links to all eligible users.</label>
        <div className="flex gap-3"><button type="button" disabled={busy || !confirmed || !preview.eligible} onClick={() => run(async () => {
          const r = await post('requestPasswordResets', { confirmation: 'SEND RESET LINKS' });
          setMessage(`${r.requested} reset invitations queued; ${r.delivery?.sent || 0} delivered now. ${r.already_requested} recent requests skipped. Remaining invitations use the email worker.`);
          setPreview(null); setConfirmed(false);
        })} className="min-h-11 rounded-lg bg-brand-600 px-4 text-sm text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send reset links'}</button><button type="button" disabled={busy} onClick={() => setPreview(null)} className="min-h-11 px-3 text-sm text-gray-600 dark:text-gray-300">Cancel</button></div>
      </div>}
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-green-700 dark:text-green-300">{message}</p>}
  </details>;
}
